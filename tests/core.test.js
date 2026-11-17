import { describe, it, expect, vi, beforeEach } from 'vitest';
import { forecastAQI, aqiFromPm25, estimateIndoorPM25 } from '../src/core/aqi-forecast.js';
import { attributeSources, getSourceMitigation } from '../src/core/source-attribution.js';
import { simulateIndoor, optimizeVentilation, corsiRosenthalCADR } from '../src/core/indoor-physics.js';
import { simulateDispersion, simulateGrid, interventionScenario, neighborhoodImpact } from '../src/core/dispersion-sim.js';
import { createNudgeEngine } from '../src/core/behavioral-engine.js';

// Mock localStorage for Node.js tests
const localStorageMock = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, value) { this.store[key] = value.toString(); },
  removeItem(key) { delete this.store[key]; },
  clear() { this.store = {}; }
};
global.localStorage = localStorageMock;

describe('AQI Forecast Engine', () => {
  const mockHistory = Array.from({ length: 72 }, (_, i) => ({
    pm25: 80 + 20 * Math.sin((i - 6) * Math.PI / 12) + (Math.random() - 0.5) * 10,
    pm10: 120 + 30 * Math.sin((i - 6) * Math.PI / 12) + (Math.random() - 0.5) * 15,
    temp: 25 + 5 * Math.sin((i - 6) * Math.PI / 12),
    humidity: 60 + 10 * Math.cos((i - 6) * Math.PI / 12),
    wind_speed: 2 + Math.random() * 2,
    wind_dir: 180 + (Math.random() - 0.5) * 60,
    pressure: 1013 + (Math.random() - 0.5) * 8
  }));

  it('converts PM2.5 to AQI correctly', () => {
    expect(aqiFromPm25(10).label).toBe('Good');
    expect(aqiFromPm25(25).label).toBe('Moderate');
    expect(aqiFromPm25(50).label).toBe('Unhealthy');
    expect(aqiFromPm25(120).label).toBe('Very Unhealthy');
    expect(aqiFromPm25(200).label).toBe('Severe');
    expect(aqiFromPm25(350).label).toBe('Hazardous');
  });

  it('returns valid AQI numbers in range', () => {
    const result = aqiFromPm25(100);
    expect(result.aqi).toBeGreaterThanOrEqual(0);
    expect(result.aqi).toBeLessThanOrEqual(500);
    expect(result.label).toBeDefined();
    expect(result.color).toBeDefined();
  });

  it('forecasts 48 hours from 72-hour history', async () => {
    const forecast = await forecastAQI(mockHistory);
    expect(forecast).toHaveLength(48);
    forecast.forEach(f => {
      expect(f.pm25).toBeGreaterThan(0);
      expect(f.pm10).toBeGreaterThan(0);
      expect(f.aqi).toBeGreaterThan(0);
      expect(f.label).toBeDefined();
    });
  });

  it('throws on insufficient history', async () => {
    await expect(forecastAQI(mockHistory.slice(0, 10))).rejects.toThrow('Need 72 hours');
  });

  it('estimates indoor PM2.5 with building params', () => {
    const indoor = estimateIndoorPM25(150, {
      floor: 3, windowOpen: false, acType: 'split', age: 10,
      purifierCADR: 300, area: 30, occupancy: 3, cookingFreq: 2, incense: false
    });
    expect(indoor).toBeLessThan(150);
    expect(indoor).toBeGreaterThan(5);
  });

  it('estimates higher indoor without purifier', () => {
    const withPurifier = estimateIndoorPM25(150, { floor: 3, windowOpen: false, acType: 'split', age: 10, purifierCADR: 300, area: 30, occupancy: 3, cookingFreq: 2, incense: false });
    const withoutPurifier = estimateIndoorPM25(150, { floor: 3, windowOpen: false, acType: 'split', age: 10, purifierCADR: 0, area: 30, occupancy: 3, cookingFreq: 2, incense: false });
    expect(withoutPurifier).toBeGreaterThan(withPurifier);
  });
});

describe('Source Attribution Engine', () => {
  const mockInput = {
    pm25: 120, pm10: 180, temp: 25, humidity: 70,
    wind_speed: 3, wind_dir: 300, hour: 8, month: 11,
    ec: 14, oc: 42, so4: 18, no3: 12, nh4: 14,
    k: 6, cl: 4, ca: 10, fe: 5
  };

  it('returns all 6 sources with fractions summing to 100%', () => {
    const result = attributeSources(mockInput);
    const sources = Object.keys(result);
    expect(sources).toHaveLength(6);
    const total = Object.values(result).reduce((sum, s) => sum + s.fraction, 0);
    expect(total).toBeCloseTo(100, 0);
  });

  it('stubble higher in Nov with NW wind', () => {
    const novNW = attributeSources({ ...mockInput, month: 11, wind_dir: 300 });
    const marSE = attributeSources({ ...mockInput, month: 3, wind_dir: 135 });
    expect(novNW.stubble.fraction).toBeGreaterThan(marSE.stubble.fraction);
  });

  it('traffic higher at rush hour', () => {
    const rush = attributeSources({ ...mockInput, hour: 8 });
    const offpeak = attributeSources({ ...mockInput, hour: 14 });
    expect(rush.traffic.fraction).toBeGreaterThan(offpeak.traffic.fraction);
  });

  it('returns mitigations for each source', () => {
    const mitigations = getSourceMitigation('traffic', 40);
    expect(mitigations.length).toBeGreaterThan(0);
    mitigations.forEach(m => {
      expect(m.action).toBeDefined();
      expect(m.reduction).toBeGreaterThan(0);
      expect(m.reduction).toBeLessThanOrEqual(1);
      expect(['Low', 'Medium', 'High', 'Zero', 'Policy']).toContain(m.cost);
    });
  });
});

describe('Indoor Physics Engine', () => {
  const mockOutdoor = Array.from({ length: 24 }, (_, i) => ({
    pm25: 100 + 30 * Math.sin((i - 6) * Math.PI / 12),
    pm10: 150 + 40 * Math.sin((i - 6) * Math.PI / 12),
    co2: 420, voc: 10
  }));

  const mockBuilding = {
    floor: 3, area: 80, window_bedroom: false, window_living: false,
    window_kitchen: true, exhaust_kitchen: true, exhaust_bathroom: true,
    purifier_cadr: 300, purifier_zone: 'bedroom', door_open: true,
    occupancy: 3, cookingFreq: 2, incense: false
  };

  const mockSchedule = [
    { zone: 'kitchen', activity: 'cooking', start_hour: 8, duration: 1 },
    { zone: 'kitchen', activity: 'cooking', start_hour: 19, duration: 1.5 }
  ];

  it('simulates 24 hours for all 4 zones', () => {
    const result = simulateIndoor(mockOutdoor, mockBuilding, mockSchedule, 24);
    expect(result.zones).toHaveProperty('bedroom');
    expect(result.zones).toHaveProperty('living');
    expect(result.zones).toHaveProperty('kitchen');
    expect(result.zones).toHaveProperty('bathroom');
    expect(result.zones.bedroom.pm25).toHaveLength(24);
    expect(result.summary.bedroom.pm25_avg).toBeGreaterThan(0);
  });

  it('kitchen peaks during cooking hours', () => {
    const buildingNoPurifier = { ...mockBuilding, purifier_cadr: 0 };
    const result = simulateIndoor(mockOutdoor, buildingNoPurifier, mockSchedule, 24);
    // Kitchen PM2.5 at 8am (cooking) should be higher than living at same hour (no cooking source)
    const cookingHourKitchen = result.zones.kitchen.pm25[8];
    const cookingHourLiving = result.zones.living.pm25[8];
    expect(cookingHourKitchen).toBeGreaterThan(cookingHourLiving);
  });

  it('purifier reduces bedroom PM2.5', () => {
    const withPurifier = simulateIndoor(mockOutdoor, { ...mockBuilding, purifier_cadr: 300 }, mockSchedule, 24);
    const withoutPurifier = simulateIndoor(mockOutdoor, { ...mockBuilding, purifier_cadr: 0 }, mockSchedule, 24);
    expect(withPurifier.summary.bedroom.pm25_avg).toBeLessThan(withoutPurifier.summary.bedroom.pm25_avg);
  });

  it('finds optimal ventilation windows', () => {
    const ventilation = optimizeVentilation(mockOutdoor, mockBuilding);
    expect(ventilation.bedroom).toHaveProperty('start');
    expect(ventilation.bedroom).toHaveProperty('end');
    expect(ventilation.bedroom).toHaveProperty('avg_outdoor');
    expect(ventilation.bedroom.avg_outdoor).toBeLessThanOrEqual(130);
  });

  it('calculates Corsi-Rosenthal CADR', () => {
    const cadr = corsiRosenthalCADR('MERV-13', 1200);
    expect(cadr).toBeGreaterThan(1000);
    expect(cadr).toBeLessThan(3000);
  });
});

describe('Dispersion Simulator', () => {
  const sources = [
    { id: 'traffic_main', type: 'line', x: 0, y: 0, q: 50, length: 500, angle: 0, h: 3 },
    { id: 'industry_zone', type: 'point', x: 300, y: 200, q: 100, h: 30 },
    { id: 'area_dust', type: 'area', x: -100, y: -100, q: 200, area: 250000 }
  ];

  const meteo = { wind_speed: 3, wind_dir: 180, stability: 'C', temp: 25, humidity: 60 };

  it('simulates concentration at receptor', () => {
    const conc = simulateDispersion(sources, meteo, { x: 100, y: 0, z: 1.5 });
    expect(conc).toBeGreaterThan(0);
  });

  it('generates 10x10 grid', () => {
    const grid = simulateGrid(sources, meteo, { x: 0, y: 0 });
    expect(grid).toHaveLength(10);
    expect(grid[0]).toHaveLength(10);
    grid.forEach(row => row.forEach(v => expect(v).toBeGreaterThanOrEqual(0)));
  });

  it('applies intervention reductions', () => {
    const interventions = [{ source_id: 'traffic_main', reduction_factor: 0.3, description: 'Metro shift' }];
    const newSources = interventionScenario(sources, interventions);
    const traffic = newSources.find(s => s.id === 'traffic_main');
    expect(traffic.q).toBe(50 * 0.7);
  });

  it('calculates neighborhood impact', () => {
    const baseGrid = Array(10).fill().map(() => Array(10).fill(100));
    const intvGrid = Array(10).fill().map(() => Array(10).fill(85));
    const popGrid = Array(10).fill().map(() => Array(10).fill(50));
    const impact = neighborhoodImpact(baseGrid, intvGrid, popGrid);
    expect(impact.avg_reduction).toBeCloseTo(15, 0);
    expect(impact.people_benefited).toBeGreaterThan(0);
  });
});

describe('Behavioral Nudge Engine', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('creates engine with default interventions', () => {
    const engine = createNudgeEngine('test_user');
    const interventions = engine.selectInterventions({ hour: 8, aqi: 150, has_children: true, price_sensitive: true, community_active: false }, 3);
    expect(interventions).toHaveLength(3);
    interventions.forEach(i => {
      expect(i.id).toBeDefined();
      expect(i.category).toBeDefined();
      expect(i.framing).toBeDefined();
      expect(i.timing).toBeDefined();
      expect(i.impact).toBeDefined();
    });
  });

  it('prefers transport at morning rush', () => {
    const engine = createNudgeEngine('test_user2');
    const morning = engine.selectInterventions({ hour: 8, aqi: 150 }, 5);
    const transportCount = morning.filter(i => i.category === 'transport').length;
    expect(transportCount).toBeGreaterThan(0);
  });

  it('prefers low effort at high AQI', () => {
    const engine = createNudgeEngine('test_user3');
    const highAQI = engine.selectInterventions({ hour: 12, aqi: 300 }, 5);
    const lowEffort = highAQI.filter(i => i.effort === 'low').length;
    expect(lowEffort).toBeGreaterThan(0);
  });

  it('records responses and updates stats', () => {
    const engine = createNudgeEngine('test_user4');
    engine.selectInterventions({ hour: 8, aqi: 150 }, 3);
    engine.recordResponse('commute_metro', true, { hour: 8 });
    const stats = engine.getStats();
    const metroStat = stats.find(s => s.id === 'commute_metro');
    expect(metroStat.pulls).toBe(1);
    expect(metroStat.acceptance_rate).toBe(1);
  });

  it('tracks insights', () => {
    const engine = createNudgeEngine('test_user5');
    engine.selectInterventions({ hour: 8, aqi: 150 }, 3);
    engine.recordResponse('commute_metro', true, { hour: 8 });
    engine.recordResponse('commute_metro', true, { hour: 9 });
    const insights = engine.getInsights();
    expect(insights.total_interactions).toBe(2);
    expect(insights.avg_acceptance).toBe(1);
  });
});