/**
 * Antigravity Agent: Nudge
 * Role: Background learning — tracks compliance, adapts framing/timing
 * Schedule: Daily at 6am + event-driven on user response
 * Persistence: Background (localStorage)
 */

import { createNudgeEngine } from '../core/behavioral-engine.js';

export const nudgeAgent = {
  name: 'Nudge',
  description: 'Learns user compliance, optimizes intervention delivery',
  schedule: '0 6 * * *',
  persistence: 'background',
  tools: ['localStorage', 'notify'],

  async execute(context) {
    const { userId, profile } = context;
    const nudge = createNudgeEngine(userId);

    const insights = nudge.getInsights();
    const todaysInterventions = nudge.selectInterventions({
      hour: 6,
      aqi: context.currentAQI || 100,
      has_children: profile.hasChildren,
      price_sensitive: profile.priceSensitive,
      community_active: profile.communityActive
    }, 3);

    const notifications = todaysInterventions.map(i => ({
      id: i.id,
      title: this.formatTitle(i),
      body: this.formatBody(i, insights),
      timing: i.timing,
      framing: i.framing,
      action_url: `/routine#${i.id}`
    }));

    localStorage.setItem(`nudge_daily_${userId}`, JSON.stringify({
      date: new Date().toISOString().split('T')[0],
      interventions: todaysInterventions,
      notifications,
      insights
    }));

    return { success: true, notifications, insights };
  },

  formatTitle(intervention) {
    const titles = {
      commute_metro: '🚌 Metro today? Save 2.3kg CO₂',
      commute_carpool: '🚗 Carpool saves ₹1,200/mo',
      commute_wfh: '🏠 WFH tomorrow — AQI 280 forecast',
      cooking_vent: '🍳 Exhaust fan ON while cooking',
      purifier_on: '🌬️ Purifier on high (peak hours)',
      window_timing: '🪟 Ventilate 11am–1pm (cleanest air)',
      corsi_build: '🔧 Build DIY purifier this weekend',
      waste_segregate: '♻️ Segregate waste — stop burning',
      report_burning: '📱 Report open burning nearby'
    };
    return titles[intervention.id] || intervention.id;
  },

  formatBody(intervention, insights) {
    const framings = {
      health: `Your ${insights.best_category?.split('_')[1] || 'family'} breathes ${intervention.impact.pm25_ug} µg/m³ less`,
      financial: `Saves ₹${Math.abs(intervention.impact.cost_save || 0)}/month`,
      social: `${Math.floor(Math.random() * 30) + 10} neighbors did this last week`,
      identity: 'You\'re the person who acts on air quality',
      urgency: `AQI hitting ${intervention.impact.pm25_ug > 30 ? '300' : '200'} — act now`,
      simplicity: 'Takes 30 seconds. One tap.'
    };
    return framings[intervention.framing] || framings.health;
  },

  async handleResponse(userId, interventionId, accepted, context) {
    const nudge = createNudgeEngine(userId);
    nudge.recordResponse(interventionId, accepted, context);
    nudge.updatePreference(context.framing, accepted);
    return { success: true };
  }
};

export default nudgeAgent;