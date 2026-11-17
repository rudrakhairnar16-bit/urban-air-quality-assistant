/**
 * Indoor Air Physics Engine — Multi-zone Building Model
 * Computes room-level PM2.5, CO2, VOCs from outdoor infiltration + indoor sources
 * Physics: Mass balance dC/dt = (Q_in * C_out - Q_out * C_in)/V + S_in - k_dep * C - k_filt * C
 * Zones: bedroom, living, kitchen, bathroom (coupled via door flows)
 */

const ZONES = ['bedroom', 'living', 'kitchen', 'bathroom'];
const VOLUMES = { bedroom: 35, living: 55, kitchen: 25, bathroom: 15 }; // m³

const DEPOSITION_RATES = { pm25: 0.3, pm10: 0.8, co2: 0, voc: 0.5 }; // /hr

const SOURCE_STRENGTHS = {
  cooking: { pm25: 1200, voc: 800, co2: 5000, duration: 0.75 }, // µg/hr, 45 min
  incense: { pm25: 800, voc: 400, duration: 0.5 },
  cleaning: { voc: 1200, duration: 0.5 },
  occupancy: { co2: 18000 }, // µg/hr per person (metabolic)
  smoking: { pm25: 15000, voc: 5000, duration: 0.2 },
  printer: { voc: 300, duration: 0.25 }
};

function airflow(zone, building, hour) {
  // m³/hr per zone
  const base = {
    bedroom: building.window_bedroom ? 120 : 15,
    living: building.window_living ? 180 : 20,
    kitchen: building.exhaust_kitchen ? 300 : (building.window_kitchen ? 100 : 15),
    bathroom: building.exhaust_bathroom ? 200 : 10
  };
  // Night reduction
  const night = hour >= 22 || hour <= 6 ? 0.4 : 1.0;
  // Stack effect (higher floor = more infiltration)
  const stack = 1 + (building.floor - 1) * 0.05;
  return base[zone] * night * stack;
}

function interzoneFlow(doorOpen) {
  return doorOpen ? 50 : 5; // m³/hr between adjacent zones
}

export function simulateIndoor(outdoor, building, schedule, hours = 24) {
  // outdoor: array of {pm25, pm10, co2, voc} per hour
  // building: { floor, area, window_*, exhaust_*, purifier_cadr, purifier_zone, door_open }
  // schedule: array of {zone, activity, start_hour, duration_hr}

  const state = {};
  ZONES.forEach(z => {
    state[z] = { pm25: outdoor[0].pm25 * 0.3, pm10: outdoor[0].pm10 * 0.3, co2: 450, voc: 50 };
  });

  const results = { zones: {}, summary: {} };
  ZONES.forEach(z => results.zones[z] = { pm25: [], pm10: [], co2: [], voc: [] });

  for (let h = 0; h < hours; h++) {
    const out = outdoor[h] || outdoor[outdoor.length - 1];
    const hour = (new Date().getHours() + h) % 24;

    // Source emissions this hour
    const sources = { pm25: {}, pm10: {}, co2: {}, voc: {} };
    ZONES.forEach(z => {
      sources.pm25[z] = 0; sources.pm10[z] = 0; sources.co2[z] = 0; sources.voc[z] = 0;
    });

    schedule.forEach(s => {
      if (h >= s.start_hour && h < s.start_hour + s.duration) {
        const src = SOURCE_STRENGTHS[s.activity];
        if (src) {
          if (src.pm25) sources.pm25[s.zone] += src.pm25;
          if (src.pm10) sources.pm10[s.zone] += src.pm10 || src.pm25 * 1.4;
          if (src.co2) sources.co2[s.zone] += src.co2;
          if (src.voc) sources.voc[s.zone] += src.voc;
        }
      }
    });

    // Occupancy CO2
    const occupancy = building.occupancy || 2;
    ZONES.forEach(z => {
      if (z === 'bedroom' && (hour >= 22 || hour <= 7)) sources.co2[z] += occupancy * 18000;
      if (z === 'living' && hour >= 7 && hour <= 22) sources.co2[z] += occupancy * 9000;
    });

    // Mass balance for each zone
    ZONES.forEach(z => {
      const V = VOLUMES[z] * (building.area / 120); // scale by apartment size
      const Q = airflow(z, building, hour);
      const k_dep = DEPOSITION_RATES.pm25;
      const k_filt = building.purifier_zone === z && building.purifier_cadr
        ? building.purifier_cadr / V : 0;

      // Infiltration
      const infil_pm25 = (Q / V) * (out.pm25 - state[z].pm25);
      const infil_pm10 = (Q / V) * (out.pm10 - state[z].pm10);
      const infil_co2 = (Q / V) * (out.co2 - state[z].co2);
      const infil_voc = (Q / V) * (out.voc - state[z].voc);

      // Interzone exchange (simplified: living <-> bedroom, living <-> kitchen)
      let inter_pm25 = 0, inter_pm10 = 0, inter_co2 = 0, inter_voc = 0;
      const neighbors = { bedroom: ['living'], living: ['bedroom', 'kitchen'], kitchen: ['living'], bathroom: [] };
      neighbors[z].forEach(nz => {
        const Qiz = interzoneFlow(building.door_open);
        inter_pm25 += (Qiz / V) * (state[nz].pm25 - state[z].pm25);
        inter_pm10 += (Qiz / V) * (state[nz].pm10 - state[z].pm10);
        inter_co2 += (Qiz / V) * (state[nz].co2 - state[z].co2);
        inter_voc += (Qiz / V) * (state[nz].voc - state[z].voc);
      });

      // Update concentrations (Euler forward, 1hr step)
      state[z].pm25 = Math.max(1, state[z].pm25 + infil_pm25 + inter_pm25 + sources.pm25[z]/V - (k_dep + k_filt) * state[z].pm25);
      state[z].pm10 = Math.max(1, state[z].pm10 + infil_pm10 + inter_pm10 + sources.pm10[z]/V - (DEPOSITION_RATES.pm10 + k_filt) * state[z].pm10);
      state[z].co2 = Math.max(400, state[z].co2 + infil_co2 + inter_co2 + sources.co2[z]/V);
      state[z].voc = Math.max(0, state[z].voc + infil_voc + inter_voc + sources.voc[z]/V - (DEPOSITION_RATES.voc + k_filt) * state[z].voc);

      results.zones[z].pm25.push(Math.round(state[z].pm25));
      results.zones[z].pm10.push(Math.round(state[z].pm10));
      results.zones[z].co2.push(Math.round(state[z].co2));
      results.zones[z].voc.push(Math.round(state[z].voc));
    });
  }

  // Summary stats
  ZONES.forEach(z => {
    const d = results.zones[z];
    results.summary[z] = {
      pm25_avg: Math.round(d.pm25.reduce((a,b)=>a+b,0)/d.pm25.length),
      pm25_max: Math.max(...d.pm25),
      pm25_min: Math.min(...d.pm25),
      co2_max: Math.max(...d.co2),
      voc_max: Math.max(...d.voc),
      exposure_hours: d.pm25.filter(v => v > 35).length // WHO interim target
    };
  });

  return results;
}

export function optimizeVentilation(outdoor, building) {
  // Find best 2-hour window to ventilate each zone
  const best = {};
  ZONES.forEach(z => {
    let minAvg = Infinity, bestStart = 11;
    for (let start = 6; start <= 20; start++) {
      const window = outdoor.slice(start, start + 2);
      if (window.length < 2) continue;
      const avg = window.reduce((a,b)=>a+b.pm25,0)/2;
      if (avg < minAvg) { minAvg = avg; bestStart = start; }
    }
    best[z] = { start: bestStart, end: bestStart + 2, avg_outdoor: Math.round(minAvg) };
  });
  return best;
}

export function corsiRosenthalCADR(filters, fan_cfm) {
  // 4x 20x20x2 MERV-13 + box fan
  // CADR = fan_cfm * efficiency * 0.9 (real-world derating)
  const eff = { 'MERV-11': 0.85, 'MERV-13': 0.92, 'MERV-14': 0.95 }[filters] || 0.92;
  return Math.round(fan_cfm * eff * 0.9 * 1.7); // convert CFM to m³/hr
}

export const INDOOR_PHYSICS_CONFIG = { ZONES, VOLUMES, DEPOSITION_RATES, SOURCE_STRENGTHS };