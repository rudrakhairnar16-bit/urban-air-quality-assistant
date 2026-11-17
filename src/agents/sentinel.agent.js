/**
 * Antigravity Agent: Sentinel
 * Role: Real-time alerts when AQI crosses personal thresholds
 * Schedule: Every 5 minutes during waking hours
 * Persistence: Background
 */

export const sentinelAgent = {
  name: 'Sentinel',
  description: 'Monitors AQI, triggers alerts at personal thresholds',
  schedule: '*/5 6-22 * * *',
  persistence: 'background',
  tools: ['localStorage', 'notify', 'web_browse'],

  async execute(context) {
    const { userId, thresholds, location } = context;
    const latest = this.getLatestData();

    if (!latest) return { success: false, reason: 'no_data' };

    const alerts = this.checkThresholds(latest, thresholds);
    const triggered = alerts.filter(a => a.triggered);

    if (triggered.length > 0) {
      await this.sendAlerts(userId, triggered, latest);
      this.logAlerts(userId, triggered, latest);
    }

    return { success: true, alerts: triggered.length, current: latest };
  },

  getLatestData() {
    const stored = localStorage.getItem('aq_latest');
    if (!stored) return null;
    const data = JSON.parse(stored);
    const age = Date.now() - data.timestamp;
    if (age > 30 * 60 * 1000) return null; // stale > 30min
    return data;
  },

  checkThresholds(data, thresholds) {
    const current = data.cpcb?.pm25 || data.openweather?.list?.[0]?.components?.pm2_5;
    if (!current) return [];

    const aqi = this.pm25ToAQI(current);
    return [
      { type: 'pm25_absolute', threshold: thresholds.pm25_absolute || 150, current, triggered: current > (thresholds.pm25_absolute || 150), message: `PM2.5 ${current} µg/m³ exceeds your ${thresholds.pm25_absolute || 150} µg/m³ limit` },
      { type: 'aqi_category', threshold: thresholds.aqi_category || 'Unhealthy', current: aqi.category, triggered: this.categoryIndex(aqi.category) >= this.categoryIndex(thresholds.aqi_category || 'Unhealthy'), message: `AQI now ${aqi.category} (${aqi.value})` },
      { type: 'indoor_projected', threshold: thresholds.indoor || 35, current: data.indoor_estimate || current * 0.3, triggered: (data.indoor_estimate || current * 0.3) > (thresholds.indoor || 35), message: `Indoor PM2.5 projected ${Math.round(data.indoor_estimate || current * 0.3)} µg/m³` },
      { type: 'forecast_spike', threshold: thresholds.forecast_spike || 50, current: data.forecast_spike || 0, triggered: (data.forecast_spike || 0) > (thresholds.forecast_spike || 50), message: `48hr forecast shows +${data.forecast_spike || 0} µg/m³ spike` }
    ];
  },

  pm25ToAQI(pm25) {
    if (pm25 <= 12) return { value: Math.round(50 * pm25 / 12), category: 'Good' };
    if (pm25 <= 35.4) return { value: Math.round(50 + 50 * (pm25 - 12) / 23.4), category: 'Moderate' };
    if (pm25 <= 55.4) return { value: Math.round(100 + 100 * (pm25 - 35.4) / 20), category: 'Unhealthy' };
    if (pm25 <= 150.4) return { value: Math.round(200 + 100 * (pm25 - 55.4) / 95), category: 'Very Unhealthy' };
    if (pm25 <= 250.4) return { value: Math.round(300 + 200 * (pm25 - 150.4) / 100), category: 'Severe' };
    return { value: Math.round(500 + 100 * (pm25 - 250.4) / 100), category: 'Hazardous' };
  },

  categoryIndex(cat) {
    const order = ['Good', 'Moderate', 'Unhealthy', 'Very Unhealthy', 'Severe', 'Hazardous'];
    return order.indexOf(cat);
  },

  async sendAlerts(userId, alerts, data) {
    const payload = {
      userId,
      alerts: alerts.map(a => ({ type: a.type, message: a.message, severity: this.severity(a.type) })),
      timestamp: Date.now(),
      current_aqi: this.pm25ToAQI(data.cpcb?.pm25 || data.openweather?.list?.[0]?.components?.pm2_5 || 100)
    };
    localStorage.setItem(`sentinel_alert_${userId}`, JSON.stringify(payload));
    // In production: send push notification via service worker
  },

  severity(type) {
    const map = { pm25_absolute: 'high', aqi_category: 'high', indoor_projected: 'medium', forecast_spike: 'medium' };
    return map[type] || 'low';
  },

  logAlerts(userId, alerts, data) {
    const log = JSON.parse(localStorage.getItem(`sentinel_log_${userId}`) || '[]');
    log.push({ timestamp: Date.now(), alerts, aqi: data.cpcb?.pm25 || 100 });
    if (log.length > 100) log.shift();
    localStorage.setItem(`sentinel_log_${userId}`, JSON.stringify(log));
  }
};

export default sentinelAgent;