/**
 * Antigravity Agent: Strategist
 * Role: Generates personalized routine + impact simulation from Analyst output
 * Trigger: After Analyst completes
 * Output: Actionable routine with quantified impact per action
 */

import { interventionScenario, neighborhoodImpact, simulateGrid } from '../core/dispersion-sim.js';
import { createNudgeEngine } from '../core/behavioral-engine.js';

export const strategistAgent = {
  name: 'Strategist',
  description: 'Generates personalized routine with quantified impact',
  schedule: 'on_demand',
  persistence: 'ephemeral',
  tools: ['localStorage', 'compute'],

  async execute(context) {
    const { analysis, building, profile, location } = context;
    const nudge = createNudgeEngine(profile.userId);

    const interventions = nudge.selectInterventions({
      hour: new Date().getHours(),
      aqi: analysis.forecast[0]?.aqi || 150,
      has_children: profile.hasChildren,
      price_sensitive: profile.priceSensitive,
      community_active: profile.communityActive
    }, 5);

    const routine = this.buildRoutine(interventions, analysis, building, profile);
    const neighborhood = this.simulateNeighborhoodImpact(analysis, interventions, location);
    const personalImpact = this.calculatePersonalImpact(routine, analysis, building);

    const result = {
      timestamp: Date.now(),
      routine,
      personalImpact,
      neighborhoodImpact: neighborhood,
      nudges: interventions,
      insights: nudge.getInsights()
    };

    localStorage.setItem('aq_strategy', JSON.stringify(result));
    return { success: true, strategy: result };
  },

  buildRoutine(interventions, analysis, building, profile) {
    const now = new Date();
    const hour = now.getHours();
    const routine = [];

    // Morning block (6-10)
    if (hour <= 10) {
      routine.push(...this.morningBlock(interventions, analysis, profile));
    }

    // Midday block (10-16)
    routine.push(...this.middayBlock(interventions, analysis, building));

    // Evening block (16-22)
    routine.push(...this.eveningBlock(interventions, analysis, building, profile));

    // Night block (22-6)
    routine.push(...this.nightBlock(interventions, analysis, building));

    return routine.filter(r => r.relevant).map((r, i) => ({ ...r, id: `routine_${i}` }));
  },

  morningBlock(interventions, analysis, profile) {
    const topSource = Object.keys(analysis.attribution)[0];
    const blocks = [];

    const commute = interventions.find(i => i.category === 'transport');
    if (commute) {
      blocks.push({
        time: '06:30–09:30',
        category: 'transport',
        title: this.formatAction(commute, 'commute'),
        description: this.describeCommute(commute, analysis),
        impact: commute.impact,
        framing: commute.framing,
        relevant: true,
        icon: '🚌'
      });
    }

    blocks.push({
      time: '07:00',
      category: 'home',
      title: 'Check forecast & plan ventilation',
      description: `Best window: ${analysis.ventilation.living.start}:00–${analysis.ventilation.living.end}:00 (outdoor avg ${analysis.ventilation.living.avg_outdoor} µg/m³)`,
      impact: { pm25_ug: 20 },
      framing: 'simplicity',
      relevant: true,
      icon: '🪟'
    });

    return blocks;
  },

  middayBlock(interventions, analysis, building) {
    const blocks = [];

    if (building.purifier_cadr) {
      blocks.push({
        time: '11:00–15:00',
        category: 'home',
        title: 'Run purifier on high (outdoor peak)',
        description: `Indoor PM2.5 projected ${analysis.indoor.summary.living.pm25_max} µg/m³ without purifier`,
        impact: { pm25_ug: 60 },
        framing: 'health',
        relevant: true,
        icon: '🌬️'
      });
    }

    const cooking = interventions.find(i => i.id === 'cooking_vent' || i.id === 'cooking_induction');
    if (cooking) {
      blocks.push({
        time: '13:00 & 19:00',
        category: 'home',
        title: this.formatAction(cooking, 'cooking'),
        description: cooking.id === 'cooking_vent'
          ? 'Exhaust fan ON + window open 15min during/after cooking'
          : 'Switch to induction for this meal',
        impact: cooking.impact,
        framing: cooking.framing,
        relevant: true,
        icon: '🍳'
      });
    }

    return blocks;
  },

  eveningBlock(interventions, analysis, building, profile) {
    const blocks = [];

    const wfh = interventions.find(i => i.id === 'commute_wfh');
    if (wfh) {
      blocks.push({
        time: '17:00',
        category: 'transport',
        title: 'Request WFH tomorrow (high AQI forecast)',
        description: `Tomorrow peak: ${analysis.forecast[12]?.aqi_category} (${analysis.forecast[12]?.pm25} µg/m³)`,
        impact: wfh.impact,
        framing: wfh.framing,
        relevant: profile.canWfh,
        icon: '🏠'
      });
    }

    const waste = interventions.find(i => i.id === 'waste_segregate');
    if (waste) {
      blocks.push({
        time: '20:00',
        category: 'action',
        title: 'Segregate waste + compost wet',
        description: 'Prevents open burning in your area — major PM2.5 source',
        impact: waste.impact,
        framing: waste.framing,
        relevant: true,
        icon: '♻️'
      });
    }

    return blocks;
  },

  nightBlock(interventions, analysis, building) {
    return [{
      time: '22:00',
      category: 'home',
      title: 'Bedroom purifier + window sealed',
      description: `Projected indoor: ${analysis.indoor.summary.bedroom.pm25_avg} µg/m³ (WHO target: 15)`,
      impact: { pm25_ug: 40 },
      framing: 'health',
      relevant: true,
      icon: '🛏️'
    }];
  },

  formatAction(intervention, context) {
    const labels = {
      commute_metro: 'Take Metro/Bus',
      commute_carpool: 'Carpool (3+)',
      commute_wfh: 'Work From Home',
      cooking_vent: 'Ventilate While Cooking',
      cooking_induction: 'Use Induction',
      purifier_on: 'Run Purifier',
      window_timing: 'Smart Ventilation',
      corsi_build: 'Build Corsi-Rosenthal',
      waste_segregate: 'Segregate Waste',
      report_burning: 'Report Burning'
    };
    return labels[intervention.id] || intervention.id;
  },

  describeCommute(intervention, analysis) {
    const trafficFrac = analysis.attribution.traffic?.fraction || 30;
    return `Traffic contributes ${trafficFrac}% of your PM2.5. ${intervention.framing === 'financial' ? 'Saves ₹2,400/mo' : 'Reduces exposure 70%'} vs driving.`;
  },

  simulateNeighborhoodImpact(analysis, interventions, location) {
    const baseSources = this.buildBaseSources(analysis, location);
    const interventionSources = interventionScenario(baseSources, interventions
      .filter(i => i.category === 'transport')
      .map(i => ({
        source_id: 'traffic_main',
        reduction_factor: (i.impact?.pm25_ug || 15) / 100,
        description: i.title || i.id
      })));

    const baseGrid = simulateGrid(baseSources, { wind_speed: 3, wind_dir: 180, stability: 'C' }, location);
    const intvGrid = simulateGrid(interventionSources, { wind_speed: 3, wind_dir: 180, stability: 'C' }, location);

    // Synthetic population grid
    const popGrid = Array(10).fill().map(() => Array(10).fill().map(() => Math.floor(Math.random() * 50) + 10));

    return neighborhoodImpact(baseGrid, intvGrid, popGrid);
  },

  buildBaseSources(analysis, location) {
    const trafficFrac = analysis.attribution.traffic?.fraction || 30;
    const industryFrac = analysis.attribution.industry?.fraction || 20;
    return [
      { id: 'traffic_main', type: 'line', x: 0, y: 0, q: trafficFrac * 2, length: 500, angle: 0, h: 3 },
      { id: 'industry_zone', type: 'point', x: 300, y: 200, q: industryFrac * 5, h: 30 },
      { id: 'area_dust', type: 'area', x: -100, y: -100, q: 50, area: 250000 }
    ];
  },

  calculatePersonalImpact(routine, analysis, building) {
    const total = routine.reduce((sum, r) => {
      if (!r.relevant || !r.impact) return sum;
      const cost = r.impact.cost_monthly !== undefined ? r.impact.cost_monthly : (r.impact.cost_save || 0);
      return {
        co2_kg: sum.co2_kg + (r.impact.co2_kg || 0),
        pm25_ug: sum.pm25_ug + (r.impact.pm25_ug || 0),
        cost_monthly: sum.cost_monthly + cost,
        cost_save: sum.cost_save + cost
      };
    }, { co2_kg: 0, pm25_ug: 0, cost_monthly: 0, cost_save: 0 });

    const indoorBaseline = analysis.indoor?.summary?.bedroom?.pm25_avg || 25;
    const indoorWithActions = Math.max(5, indoorBaseline - total.pm25_ug * 0.3);

    return {
      daily: total,
      weekly: {
        co2_kg: total.co2_kg * 7,
        pm25_ug: total.pm25_ug * 7,
        cost_monthly: total.cost_monthly * 7,
        cost_save: total.cost_save * 7
      },
      indoor_reduction: Math.round((indoorBaseline - indoorWithActions) / indoorBaseline * 100),
      indoor_final: indoorWithActions
    };
  }
};

export default strategistAgent;