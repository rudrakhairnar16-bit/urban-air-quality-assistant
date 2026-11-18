/**
 * Behavioral Nudge Engine — Learns user compliance, adapts framing/timing
 * Bandit algorithm (Thompson Sampling) for intervention selection
 * Context: hour, AQI, source profile, past acceptance, user persona
 * Persists to localStorage, no PII
 */

const INTERVENTION_TYPES = [
  { id: 'commute_metro', category: 'transport', base_accept: 0.35, effort: 'low' },
  { id: 'commute_carpool', category: 'transport', base_accept: 0.25, effort: 'medium' },
  { id: 'commute_wfh', category: 'transport', base_accept: 0.40, effort: 'low' },
  { id: 'cooking_induction', category: 'home', base_accept: 0.20, effort: 'high' },
  { id: 'cooking_vent', category: 'home', base_accept: 0.55, effort: 'low' },
  { id: 'purifier_on', category: 'home', base_accept: 0.65, effort: 'low' },
  { id: 'window_timing', category: 'home', base_accept: 0.45, effort: 'low' },
  { id: 'corsi_build', category: 'home', base_accept: 0.15, effort: 'high' },
  { id: 'waste_segregate', category: 'action', base_accept: 0.50, effort: 'low' },
  { id: 'report_burning', category: 'action', base_accept: 0.30, effort: 'low' }
];

const FRAMING_STYLES = [
  'health',      // "Protect your child's lungs"
  'financial',   // "Save ₹2,400/month on fuel"
  'social',      // "Your neighbors are doing it"
  'identity',    // "As someone who cares about community"
  'urgency',     // "AQI hitting 300 tomorrow"
  'simplicity'   // "Takes 30 seconds to set up"
];

class ThompsonBandit {
  constructor(options = []) {
    this.arms = options.map(o => ({
      ...o,
      alpha: 1 + (o.base_accept || 0.3) * 10,
      beta: 1 + (1 - (o.base_accept || 0.3)) * 10,
      pulls: 0,
      rewards: 0
    }));
  }

  sample() {
    return this.arms.map(a => ({
      ...a,
      sample: Math.random() * a.alpha / (a.alpha + a.beta) // simplified Beta sample
    })).sort((a, b) => b.sample - a.sample);
  }

  select(context) {
    const sampled = this.sample();
    // Contextual boost
    const hour = context.hour || new Date().getHours();
    const aqi = context.aqi || 100;
    return sampled.map(a => {
      let boost = 1;
      if (a.category === 'transport' && hour >= 7 && hour <= 10) boost *= 1.3;
      if (a.category === 'home' && hour >= 18 && hour <= 22) boost *= 1.2;
      if (aqi > 200 && a.effort === 'low') boost *= 1.4;
      return { ...a, score: a.sample * boost };
    }).sort((a, b) => b.score - a.score);
  }

  update(armId, reward, context) {
    const arm = this.arms.find(a => a.id === armId);
    if (!arm) return;
    arm.pulls++;
    arm.rewards += reward;
    const r = reward > 0 ? 1 : 0;
    arm.alpha += r;
    arm.beta += 1 - r;
    // Contextual decay for non-selected arms (optional)
  }

  getStats() {
    return this.arms.map(a => ({
      id: a.id,
      acceptance_rate: a.pulls > 0 ? a.rewards / a.pulls : a.base_accept,
      pulls: a.pulls,
      confidence: Math.min(1, a.pulls / 20)
    }));
  }
}

export function createNudgeEngine(userId = 'local') {
  const bandit = new ThompsonBandit(INTERVENTION_TYPES);
  const history = JSON.parse(localStorage.getItem(`nudge_${userId}`) || '[]');
  const preferences = JSON.parse(localStorage.getItem(`nudge_prefs_${userId}`) || '{}');

  // Replay history
  history.forEach(h => bandit.update(h.arm, h.reward, h.context));

  function selectInterventions(context, count = 3) {
    const ranked = bandit.select(context);
    const selected = ranked.slice(0, count);
    return selected.map(s => ({
      ...s,
      framing: selectFraming(s, context),
      timing: selectTiming(s, context),
      impact: estimateImpact(s, context)
    }));
  }

  function selectFraming(intervention, context) {
    const scores = FRAMING_STYLES.map(f => {
      let score = 1;
      if (f === 'health' && context.has_children) score *= 1.5;
      if (f === 'financial' && context.price_sensitive) score *= 1.4;
      if (f === 'social' && context.community_active) score *= 1.3;
      if (f === 'urgency' && context.aqi > 200) score *= 1.6;
      if (f === 'simplicity' && intervention.effort === 'high') score *= 0.7;
      return { framing: f, score: score * (preferences[f] || 1) };
    });
    return scores.sort((a,b) => b.score - a.score)[0].framing;
  }

  function selectTiming(intervention, context) {
    const hour = context.hour || new Date().getHours();
    if (intervention.category === 'transport') return hour < 9 ? 'now' : 'tonight';
    if (intervention.category === 'home') return hour < 18 ? 'this_evening' : 'tomorrow_morning';
    return 'today';
  }

  function estimateImpact(intervention, context) {
    const impacts = {
      commute_metro: { co2_kg: 2.3, pm25_ug: 15, cost_monthly: 2400 },
      commute_carpool: { co2_kg: 1.1, pm25_ug: 7, cost_monthly: 1200 },
      commute_wfh: { co2_kg: 3.8, pm25_ug: 25, cost_monthly: 0 },
      cooking_vent: { co2_kg: 0, pm25_ug: 40, cost_monthly: 0 },
      purifier_on: { co2_kg: 0, pm25_ug: 60, cost_monthly: -150 },
      window_timing: { co2_kg: 0, pm25_ug: 20, cost_monthly: 0 },
      corsi_build: { co2_kg: 0, pm25_ug: 80, cost_monthly: -250 },
      waste_segregate: { co2_kg: 0.5, pm25_ug: 5, cost_monthly: 0 },
      report_burning: { co2_kg: 0, pm25_ug: 10, cost_monthly: 0 }
    };
    return impacts[intervention.id] || { co2_kg: 0, pm25_ug: 0, cost_monthly: 0 };
  }

  function recordResponse(interventionId, accepted, context) {
    bandit.update(interventionId, accepted ? 1 : 0, context);
    history.push({ arm: interventionId, reward: accepted ? 1 : 0, context, ts: Date.now() });
    if (history.length > 500) history.shift();
    localStorage.setItem(`nudge_${userId}`, JSON.stringify(history));
  }

  function updatePreference(framing, accepted) {
    preferences[framing] = (preferences[framing] || 1) * (accepted ? 1.1 : 0.9);
    localStorage.setItem(`nudge_prefs_${userId}`, JSON.stringify(preferences));
  }

  function getInsights() {
    const stats = bandit.getStats().filter(s => s.pulls > 2);
    const top = stats.sort((a,b) => b.acceptance_rate - a.acceptance_rate)[0];
    const avoided = stats.filter(s => s.acceptance_rate < 0.15);
    return {
      best_category: top?.id,
      best_rate: top?.acceptance_rate,
      avoid: avoided.map(a => a.id),
      total_interactions: history.length,
      avg_acceptance: history.length ? history.reduce((a,b)=>a+b.reward,0)/history.length : 0
    };
  }

  return { selectInterventions, recordResponse, updatePreference, getInsights, getStats: () => bandit.getStats() };
}

export const BEHAVIORAL_CONFIG = { INTERVENTION_TYPES, FRAMING_STYLES };