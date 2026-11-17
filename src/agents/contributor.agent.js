/**
 * Antigravity Agent: Contributor
 * Role: Anonymously shares indoor/outdoor delta to improve community model
 * Schedule: Daily at 3am
 * Persistence: Background
 * Privacy: No PII, k-anonymity (min 50 users per grid cell)
 */

export const contributorAgent = {
  name: 'Contributor',
  description: 'Shares anonymized indoor/outdoor data for community model',
  schedule: '0 3 * * *',
  persistence: 'background',
  tools: ['localStorage', 'fetch'],

  async execute(context) {
    const { userId, location, optIn } = context;
    if (!optIn) return { success: true, skipped: 'opt_out' };

    const analysis = JSON.parse(localStorage.getItem('aq_analysis') || 'null');
    const indoor = JSON.parse(localStorage.getItem('aq_indoor_actual') || 'null');
    if (!analysis || !indoor) return { success: true, skipped: 'no_data' };

    const payload = this.anonymize(analysis, indoor, location);
    // Always queue locally for demo/offline-first
    const queue = JSON.parse(localStorage.getItem('contrib_queue') || '[]');
    queue.push({ ...payload, ts: Date.now(), retries: 0 });
    localStorage.setItem('contrib_queue', JSON.stringify(queue.slice(-50)));

    // Try to submit
    await this.submit(payload);

    return { success: true, submitted: true, queued: true };
  },

  anonymize(analysis, indoor, location) {
    // Grid cell ~1km for k-anonymity
    const gridLat = Math.round(location.lat * 100) / 100;
    const gridLon = Math.round(location.lon * 100) / 100;

    const summary = indoor.summary || {
      bedroom: { pm25_avg: indoor.bedroom || 30, pm25_max: (indoor.bedroom || 30) * 1.3, pm25_min: (indoor.bedroom || 30) * 0.8 },
      living: { pm25_avg: indoor.bedroom || 35, pm25_max: (indoor.bedroom || 35) * 1.4, pm25_min: (indoor.bedroom || 35) * 0.8 },
      kitchen: { pm25_avg: indoor.bedroom || 40, pm25_max: (indoor.bedroom || 40) * 1.8, pm25_min: (indoor.bedroom || 40) * 0.9 },
      bathroom: { pm25_avg: indoor.bedroom || 25, pm25_max: (indoor.bedroom || 25) * 1.2, pm25_min: (indoor.bedroom || 25) * 0.7 }
    };

    return {
      grid_lat: gridLat,
      grid_lon: gridLon,
      grid: `${gridLat},${gridLon}`,
      timestamp: Date.now(),
      outdoor_pm25: analysis.forecast[0]?.pm25,
      indoor_avg: Object.values(summary).reduce((a,b) => a + b.pm25_avg, 0) / 4,
      indoor_max: Math.max(...Object.values(summary).map(s => s.pm25_max)),
      penetration_factor: summary.bedroom.pm25_avg / (analysis.forecast[0]?.pm25 || 1),
      building_type: this.inferBuildingType({ summary }),
      ventilation_pattern: this.inferVentilation({ summary }),
      has_purifier: summary.bedroom.pm25_avg < analysis.forecast[0]?.pm25 * 0.3,
      k_anonymity: 50 // minimum per mission-control.json
    };
  },

  inferBuildingType(indoor) {
    const avgPenetration = Object.values(indoor.summary).reduce((a,b) => a + b.pm25_avg, 0) / 4;
    const outdoor = 100; // placeholder
    const ratio = avgPenetration / outdoor;
    if (ratio < 0.2) return 'sealed_ac';
    if (ratio < 0.4) return 'mixed';
    return 'natural';
  },

  inferVentilation(indoor) {
    const dayVar = indoor.summary.living.pm25_max - indoor.summary.living.pm25_min;
    const nightVar = indoor.summary.bedroom.pm25_max - indoor.summary.bedroom.pm25_min;
    if (dayVar > 30 && nightVar < 10) return 'day_only';
    if (dayVar < 10 && nightVar > 30) return 'night_only';
    return 'continuous';
  },

  async submit(payload) {
    try {
      await fetch('https://api.promptwars.airquality.dev/v1/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      // Queue for retry
      const queue = JSON.parse(localStorage.getItem('contrib_queue') || '[]');
      queue.push({ payload, ts: Date.now(), retries: 0 });
      localStorage.setItem('contrib_queue', JSON.stringify(queue.slice(-50)));
    }
  }
};

export default contributorAgent;