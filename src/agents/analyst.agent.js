/**
 * Antigravity Agent: Analyst
 * Role: Runs forecast, source attribution, indoor physics on demand
 * Trigger: User request or Scout data update
 * Output: Analysis package for Strategist
 */

import { forecastAQI, estimateIndoorPM25 } from '../core/aqi-forecast.js';
import { attributeSources, getSourceMitigation } from '../core/source-attribution.js';
import { simulateIndoor, optimizeVentilation } from '../core/indoor-physics.js';

export const analystAgent = {
  name: 'Analyst',
  description: 'Runs forecasting, attribution, indoor modeling on demand',
  schedule: 'on_demand',
  persistence: 'ephemeral',
  tools: ['localStorage', 'compute'],

  async execute(context) {
    const { building, schedule, location } = context;
    const history = this.prepareHistory(context.history);
    const latest = this.getLatest(context.history);

    const [forecast, attribution, indoor, ventilation] = await Promise.all([
      forecastAQI(history),
      attributeSources(this.prepareAttributionInput(latest)),
      simulateIndoor(this.prepareOutdoor(forecast), building, schedule),
      optimizeVentilation(this.prepareOutdoor(forecast), building)
    ]);

    const mitigations = {};
    Object.keys(attribution).forEach(src => {
      mitigations[src] = getSourceMitigation(src, attribution[src].fraction);
    });

    const analysis = {
      timestamp: Date.now(),
      forecast,
      attribution,
      indoor,
      ventilation,
      mitigations,
      location,
      confidence: this.calculateConfidence(history, latest)
    };

    localStorage.setItem('aq_analysis', JSON.stringify(analysis));
    return { success: true, analysis };
  },

  prepareHistory(rawHistory) {
    if (!rawHistory || rawHistory.length === 0) return this.generateSyntheticHistory();
    return rawHistory.slice(-72).map(h => ({
      pm25: h.cpcb?.pm25 || h.openweather?.list?.[0]?.components?.pm2_5 || 50,
      pm10: h.cpcb?.pm10 || h.openweather?.list?.[0]?.components?.pm10 || 80,
      temp: h.openweather?.main?.temp || 25,
      humidity: h.openweather?.main?.humidity || 60,
      wind_speed: h.openweather?.wind?.speed || 2,
      wind_dir: h.openweather?.wind?.deg || 180,
      pressure: h.openweather?.main?.pressure || 1013
    }));
  },

  generateSyntheticHistory() {
    const now = new Date();
    const history = [];
    for (let i = 71; i >= 0; i--) {
      const hour = (now.getHours() - i + 24) % 24;
      const base = 80 + 40 * Math.sin((hour - 6) * Math.PI / 12);
      history.push({
        pm25: Math.max(10, base + (Math.random() - 0.5) * 20),
        pm10: Math.max(15, base * 1.4 + (Math.random() - 0.5) * 30),
        temp: 22 + 5 * Math.sin((hour - 6) * Math.PI / 12),
        humidity: 50 + 20 * Math.cos((hour - 6) * Math.PI / 12),
        wind_speed: 1 + Math.random() * 3,
        wind_dir: 180 + (Math.random() - 0.5) * 90,
        pressure: 1013 + (Math.random() - 0.5) * 10
      });
    }
    return history;
  },

  getLatest(history) {
    const h = history[history.length - 1] || this.generateSyntheticHistory()[0];
    return {
      pm25: h.pm25, pm10: h.pm10, temp: h.temp, humidity: h.humidity,
      wind_speed: h.wind_speed, wind_dir: h.wind_dir,
      hour: new Date().getHours(), month: new Date().getMonth() + 1
    };
  },

  prepareAttributionInput(latest) {
    return {
      ...latest,
      ec: latest.pm25 * 0.12, oc: latest.pm25 * 0.35,
      so4: latest.pm25 * 0.15, no3: latest.pm25 * 0.1,
      nh4: latest.pm25 * 0.12, k: latest.pm25 * 0.05,
      cl: latest.pm25 * 0.03, ca: latest.pm25 * 0.08,
      fe: latest.pm25 * 0.04
    };
  },

  prepareOutdoor(forecast) {
    return forecast.map(f => ({
      pm25: f.pm25, pm10: f.pm10,
      co2: 420, voc: 10
    }));
  },

  calculateConfidence(history, latest) {
    let conf = 0.7;
    if (history.length >= 72) conf += 0.15;
    if (latest.cpcb) conf += 0.1;
    if (latest.sentinel5p) conf += 0.05;
    return Math.min(0.95, conf);
  }
};

export default analystAgent;