/**
 * AQI Forecasting Engine — TF.js Quantized Model
 * Predicts 48hr PM2.5/PM10/AQI from historical + meteorological inputs
 * Model: 3-layer LSTM, INT8 quantized, ~180KB gzipped
 * Input: 72hr history (PM2.5, PM10, temp, humidity, wind_speed, wind_dir, pressure)
 * Output: 48hr forecast (PM2.5, PM10, AQI category)
 */

const MODEL_URL = '/models/aqi-forecast/model.json';

// Dynamic import for browser-only TF.js
let tf = null;
async function getTF() {
  if (tf) return tf;
  if (typeof window !== 'undefined') {
    tf = await import('@tensorflow/tfjs');
  }
  return tf;
}
const INPUT_WINDOW = 72;  // hours
const OUTPUT_HORIZON = 48; // hours
const FEATURES = ['pm25', 'pm10', 'temp', 'humidity', 'wind_speed', 'wind_dir', 'pressure'];
const N_FEATURES = FEATURES.length;

let model = null;
let scaler = null;
let isLoading = false;

const AQI_BREAKPOINTS = [
  { max: 50, label: 'Good', color: '#22c55e' },
  { max: 100, label: 'Moderate', color: '#f59e0b' },
  { max: 200, label: 'Unhealthy', color: '#ef4444' },
  { max: 300, label: 'Very Unhealthy', color: '#a855f7' },
  { max: 500, label: 'Severe', color: '#7c2d12' },
  { max: Infinity, label: 'Hazardous', color: '#1f1f1f' }
];

export function aqiFromPm25(pm25) {
  if (pm25 <= 12) return { aqi: Math.round(50 * pm25 / 12), ...AQI_BREAKPOINTS[0] };
  if (pm25 <= 35.4) return { aqi: Math.round(50 + 50 * (pm25 - 12) / 23.4), ...AQI_BREAKPOINTS[1] };
  if (pm25 <= 55.4) return { aqi: Math.round(100 + 100 * (pm25 - 35.4) / 20), ...AQI_BREAKPOINTS[2] };
  if (pm25 <= 150.4) return { aqi: Math.round(200 + 100 * (pm25 - 55.4) / 95), ...AQI_BREAKPOINTS[3] };
  if (pm25 <= 250.4) return { aqi: Math.round(300 + 200 * (pm25 - 150.4) / 100), ...AQI_BREAKPOINTS[4] };
  return { aqi: Math.round(500 + 100 * (pm25 - 250.4) / 100), ...AQI_BREAKPOINTS[5] };
}

function normalize(data, mean, std) {
  return data.map((row, i) => row.map((v, j) => (v - mean[j]) / (std[j] || 1)));
}

function denormalize(data, mean, std) {
  return data.map((row, i) => row.map((v, j) => v * (std[j] || 1) + mean[j]));
}

async function loadModel() {
  if (model || isLoading) return model;
  isLoading = true;
  try {
    const tfModule = await getTF();
    if (!tfModule) throw new Error('TF.js not available (Node.js)');
    model = await tfModule.loadGraphModel(MODEL_URL);
    const scalerResp = await fetch('/models/aqi-forecast/scaler.json');
    scaler = await scalerResp.json();
    await model.predict(tfModule.zeros([1, INPUT_WINDOW, N_FEATURES])).data(); // warmup
    console.log('[Antigravity:AQI-Forecast] Model loaded & warmed up');
    return model;
  } catch (e) {
    console.warn('[Antigravity:AQI-Forecast] Model load failed, using fallback:', e.message);
    model = null;
    return null;
  } finally {
    isLoading = false;
  }
}

function fallbackForecast(history) {
  // Simple persistence + diurnal pattern fallback
  const last = history[history.length - 1];
  const pm25 = last[0];
  const forecasts = [];
  for (let h = 1; h <= OUTPUT_HORIZON; h++) {
    const hour = (new Date().getHours() + h) % 24;
    const diurnal = 1 + 0.3 * Math.sin((hour - 6) * Math.PI / 12); // peak 6am/6pm
    const noise = 1 + (Math.random() - 0.5) * 0.1;
    const pred = Math.max(5, pm25 * diurnal * noise * Math.exp(-h * 0.01));
    forecasts.push({ pm25: pred, pm10: pred * 1.4, ...aqiFromPm25(pred) });
  }
  return forecasts;
}

export async function forecastAQI(history) {
  // history: array of 72 hourly readings {pm25, pm10, temp, humidity, wind_speed, wind_dir, pressure}
  if (history.length < INPUT_WINDOW) {
    throw new Error(`Need ${INPUT_WINDOW} hours of history, got ${history.length}`);
  }

  const input = history.slice(-INPUT_WINDOW).map(h => FEATURES.map(f => h[f]));

  await loadModel();

  if (!model || !scaler) {
    return fallbackForecast(input);
  }

  const tfModule = await getTF();
  if (!tfModule) return fallbackForecast(input);

  const normalized = normalize(input, scaler.mean, scaler.std);
  const tensor = tfModule.tensor3d([normalized], [1, INPUT_WINDOW, N_FEATURES]);
  const pred = await model.predict(tensor).data();
  tensor.dispose();

  const forecastNorm = Array.from(pred);
  const forecast = [];
  for (let i = 0; i < OUTPUT_HORIZON; i++) {
    const pm25 = forecastNorm[i * 2];
    const pm10 = forecastNorm[i * 2 + 1];
    forecast.push({ pm25, pm10, ...aqiFromPm25(pm25) });
  }
  return forecast;
}

export function getAQICategory(pm25) {
  return aqiFromPm25(pm25);
}

export function estimateIndoorPM25(outdoorPM25, building) {
  // building: { floor, windowOpen, acType, age, purifierCADR, occupancy, cookingFreq }
  const penetration = {
    windowOpen: building.windowOpen ? 0.8 : 0.15,
    floor: Math.max(0.3, 1 - building.floor * 0.08), // higher floor = less penetration
    acType: building.acType === 'central' ? 0.4 : building.acType === 'split' ? 0.6 : 1.0,
    age: building.age > 20 ? 1.2 : building.age > 10 ? 1.1 : 1.0
  };
  let indoor = outdoorPM25;
  for (const f of Object.values(penetration)) indoor *= f;

  // Indoor sources
  indoor += building.cookingFreq * 25; // µg/m³ per cooking event
  indoor += building.occupancy * 2;    // µg/m³ per person
  if (building.incense) indoor += 40;

  // Purifier removal
  if (building.purifierCADR) {
    const roomVol = (building.area || 30) * 2.7; // m³
    const ach = building.purifierCADR / roomVol; // air changes/hr
    indoor *= Math.exp(-ach * 0.5); // 30-min equilibrium
  }

  return Math.max(5, Math.round(indoor));
}

export const AQI_FORECAST_CONFIG = {
  INPUT_WINDOW,
  OUTPUT_HORIZON,
  FEATURES,
  MODEL_URL
};