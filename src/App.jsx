import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import AQIDashboard from './components/AQIDashboard';
import RoutinePanel from './components/RoutinePanel';
import ImpactTracker from './components/ImpactTracker';
import IndoorModel from './components/IndoorModel';
import CommunityMap from './components/CommunityMap';
import AgentLog from './components/AgentLog';
import Onboarding from './components/Onboarding';
import { forecastAQI, estimateIndoorPM25 } from './core/aqi-forecast.js';
import { attributeSources } from './core/source-attribution.js';
import { simulateIndoor, optimizeVentilation } from './core/indoor-physics.js';
import { strategistAgent } from './agents/strategist.agent.js';

function App() {
  const [step, setStep] = useState('onboarding');
  const [location, setLocation] = useState({ lat: 28.6139, lon: 77.2090, pincode: '110001' });
  const [building, setBuilding] = useState({
    floor: 3, area: 80, window_bedroom: false, window_living: false,
    window_kitchen: true, exhaust_kitchen: true, exhaust_bathroom: true,
    purifier_cadr: 300, purifier_zone: 'bedroom', door_open: true,
    occupancy: 3, cookingFreq: 2, incense: false
  });
  const [profile, setProfile] = useState({
    userId: 'user_' + Math.random().toString(36).slice(2),
    hasChildren: false, priceSensitive: true, communityActive: false, canWfh: true
  });
  const [schedule, setSchedule] = useState([
    { zone: 'kitchen', activity: 'cooking', start_hour: 8, duration: 1 },
    { zone: 'kitchen', activity: 'cooking', start_hour: 19, duration: 1.5 }
  ]);
  const [analysis, setAnalysis] = useState(null);
  const [strategy, setStrategy] = useState(null);
  const [indoorActual, setIndoorActual] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('routine');

  const runAnalysis = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const history = generateSyntheticHistory();

      // Attempt live OpenWeather ingestion
      try {
        const key = import.meta.env.VITE_OWM_KEY || localStorage.getItem('owm_key') || 'afed74bce9e1c18e2f4bf7aba34ec695';
        const [airResp, weatherResp] = await Promise.allSettled([
          fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${location.lat}&lon=${location.lon}&appid=${key}`),
          fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${key}&units=metric`)
        ]);
        const airJson = airResp.status === 'fulfilled' && airResp.value.ok ? await airResp.value.json() : null;
        const weatherJson = weatherResp.status === 'fulfilled' && weatherResp.value.ok ? await weatherResp.value.json() : null;
        if (airJson?.list?.[0]?.components) {
          const comp = airJson.list[0].components;
          const liveLatest = history[history.length - 1];
          if (comp.pm2_5) liveLatest.pm25 = Math.round(comp.pm2_5);
          if (comp.pm10) liveLatest.pm10 = Math.round(comp.pm10);
          if (weatherJson?.main?.temp) liveLatest.temp = Math.round(weatherJson.main.temp);
          if (weatherJson?.main?.humidity) liveLatest.humidity = Math.round(weatherJson.main.humidity);
          if (weatherJson?.wind?.speed) liveLatest.wind_speed = Math.round(weatherJson.wind.speed * 10) / 10;
          if (weatherJson?.wind?.deg) liveLatest.wind_dir = weatherJson.wind.deg;
          if (weatherJson?.main?.pressure) liveLatest.pressure = weatherJson.main.pressure;
        }
      } catch (err) {
        console.warn('Live API fetch fallback to synthetic:', err);
      }

      const forecast = await forecastAQI(history);
      const latest = history[history.length - 1];
      const attribution = attributeSources({
        ...latest, hour: new Date().getHours(), month: new Date().getMonth() + 1,
        ec: latest.pm25 * 0.12, oc: latest.pm25 * 0.35, so4: latest.pm25 * 0.15,
        no3: latest.pm25 * 0.1, nh4: latest.pm25 * 0.12, k: latest.pm25 * 0.05,
        cl: latest.pm25 * 0.03, ca: latest.pm25 * 0.08, fe: latest.pm25 * 0.04
      });
      const outdoor = forecast.map(f => ({ pm25: f.pm25, pm10: f.pm10, co2: 420, voc: 10 }));
      const indoor = simulateIndoor(outdoor, building, schedule);
      const ventilation = optimizeVentilation(outdoor, building);

      const analysisResult = { forecast, attribution, indoor, ventilation, location, timestamp: Date.now() };
      setAnalysis(analysisResult);
      localStorage.setItem('aq_analysis', JSON.stringify(analysisResult));

      const strategyResult = await strategistAgent.execute({
        analysis: analysisResult, building, profile, location
      });
      setStrategy(strategyResult.strategy);
      localStorage.setItem('aq_strategy', JSON.stringify(strategyResult.strategy));

    } catch (e) {
      setError(e.message);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [building, schedule, profile, location]);

  useEffect(() => {
    if (step === 'dashboard') runAnalysis();
  }, [step, runAnalysis]);

  const handleOnboardingComplete = (data) => {
    setLocation(data.location);
    setBuilding(data.building);
    setProfile(data.profile);
    setSchedule(data.schedule);
    setStep('dashboard');
  };

  if (step === 'onboarding') {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="app">
      <Header location={location} onLocationChange={setLocation} />
      <main className="main">
        <aside>
          <AQIDashboard analysis={analysis} loading={loading} error={error} onRefresh={runAnalysis} />
          <IndoorModel indoor={analysis?.indoor} building={building} onBuildingChange={setBuilding} />
          <AgentLog />
        </aside>
        <section>
          <div className="tabs">
            <button className={`tab ${activeTab === 'routine' ? 'active' : ''}`} onClick={() => setActiveTab('routine')}>📋 Routine</button>
            <button className={`tab ${activeTab === 'impact' ? 'active' : ''}`} onClick={() => setActiveTab('impact')}>📊 Impact</button>
            <button className={`tab ${activeTab === 'community' ? 'active' : ''}`} onClick={() => setActiveTab('community')}>👥 Community</button>
            <button className={`tab ${activeTab === 'sources' ? 'active' : ''}`} onClick={() => setActiveTab('sources')}>🔬 Sources</button>
          </div>
          {activeTab === 'routine' && <RoutinePanel routine={strategy?.routine} nudges={strategy?.nudges} onLogActual={setIndoorActual} />}
          {activeTab === 'impact' && <ImpactTracker impact={strategy?.personalImpact} neighborhood={strategy?.neighborhoodImpact} />}
          {activeTab === 'community' && <CommunityMap neighborhood={strategy?.neighborhoodImpact} location={location} />}
          {activeTab === 'sources' && analysis && <SourceAttribution attribution={analysis.attribution} />}
        </section>
      </main>
      <footer className="footer">
        Built with <strong>Antigravity</strong> Agent Swarm • <a href="#" target="_blank">GitHub</a> • <a href="#" target="_blank">Demo</a>
      </footer>
    </div>
  );
}

function generateSyntheticHistory() {
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
}

function SourceAttribution({ attribution }) {
  return (
    <div className="card">
      <h2>🔬 Source Attribution</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {Object.entries(attribution).map(([source, data]) => (
          <div key={source} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: '#0f172a', borderRadius: '8px' }}>
            <span style={{ textTransform: 'capitalize' }}>{source.replace('_', ' ')}</span>
            <span style={{ fontWeight: 700, color: '#22d3ee' }}>{data.fraction}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;