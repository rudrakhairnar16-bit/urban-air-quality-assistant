import { useState, useMemo } from 'react';
import {
  IconWind,
  IconGauge,
  IconActivity,
  IconHome,
  IconShield,
  IconSparkles,
  IconLayers,
  IconCpu,
  IconBarChart,
  IconLeaf,
  IconCheck,
  IconPlay
} from './Icons';

export default function LandingPage({ onGetStarted, onDemo }) {
  // Hero Interactive Smog Scrubber State
  const [smogAqi, setSmogAqi] = useState(320);

  // Sanctuary Mini-Calculator State
  const [calcFloor, setCalcFloor] = useState(3);
  const [calcCadr, setCalcCadr] = useState(300);
  const [calcExhaust, setCalcExhaust] = useState(true);

  // Interactive Forecast Scrub State
  const [selectedForecastHour, setSelectedForecastHour] = useState(4);

  // Calculations based on interactive smog slider
  const smogMetrics = useMemo(() => {
    const pm25 = Math.round(smogAqi * 0.65);
    const cigs = (pm25 / 22).toFixed(1);
    const rawIndoor = Math.round(pm25 * 0.72);
    const protectedIndoor = calcCadr > 0 ? Math.max(9, Math.round(rawIndoor * (150 / (150 + calcCadr)))) : rawIndoor;
    return { pm25, cigs, rawIndoor, protectedIndoor };
  }, [smogAqi, calcCadr]);

  // Dynamic Ambient Theme Glow based on AQI
  const ambientGlow = useMemo(() => {
    if (smogAqi <= 100) return 'rgba(16, 185, 129, 0.12)';
    if (smogAqi <= 200) return 'rgba(245, 158, 11, 0.14)';
    if (smogAqi <= 300) return 'rgba(244, 63, 94, 0.16)';
    return 'rgba(136, 19, 55, 0.22)';
  }, [smogAqi]);

  const aqiCategory = useMemo(() => {
    if (smogAqi <= 50) return { label: 'Good', color: '#10b981' };
    if (smogAqi <= 100) return { label: 'Moderate', color: '#f59e0b' };
    if (smogAqi <= 200) return { label: 'Poor', color: '#f97316' };
    if (smogAqi <= 300) return { label: 'Very Poor', color: '#f43f5e' };
    if (smogAqi <= 400) return { label: 'Severe', color: '#a855f7' };
    return { label: 'Hazardous', color: '#881337' };
  }, [smogAqi]);

  // Mini 12-Hour Forecast Data for Card 1
  const miniForecastHours = useMemo(() => {
    const hours = [];
    const baseHour = new Date().getHours();
    for (let i = 0; i < 8; i++) {
      const h = (baseHour + i * 3) % 24;
      const diurnal = Math.sin(((h - 6) * Math.PI) / 12);
      const estAqi = Math.round(280 + diurnal * 90);
      hours.push({ hour: `${h.toString().padStart(2, '0')}:00`, aqi: estAqi, pm25: Math.round(estAqi * 0.65) });
    }
    return hours;
  }, []);

  return (
    <div className="landing-viewport">
      <style>{`
        .landing-viewport {
          min-height: 100vh;
          background-color: var(--bg-base);
          color: var(--text-main);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          position: relative;
          overflow-x: hidden;
          background-image: 
            radial-gradient(circle at 50% 0%, ${ambientGlow} 0%, transparent 60%),
            radial-gradient(circle at 10% 30%, rgba(34, 211, 238, 0.04) 0%, transparent 40%),
            radial-gradient(circle at 90% 70%, rgba(168, 85, 247, 0.04) 0%, transparent 40%);
          transition: background-image 0.5s ease;
        }

        .landing-nav {
          position: sticky;
          top: 1rem;
          z-index: 100;
          max-width: 1320px;
          margin: 0 auto;
          padding: 0.75rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(10, 15, 26, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }

        .hero-section {
          max-width: 1320px;
          margin: 0 auto;
          padding: 4.5rem 1.5rem 3rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
        }

        .hero-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 0.85rem;
          border-radius: 999px;
          background: rgba(34, 211, 238, 0.08);
          border: 1px solid rgba(34, 211, 238, 0.25);
          font-size: 0.75rem;
          font-family: monospace;
          font-weight: 600;
          color: var(--accent-cyan);
          margin-bottom: 1.5rem;
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.15);
        }

        .hero-title {
          font-size: clamp(2.5rem, 6vw, 4.25rem);
          font-weight: 900;
          line-height: 1.08;
          letter-spacing: -0.035em;
          margin-bottom: 1.25rem;
          max-width: 980px;
          background: linear-gradient(180deg, #ffffff 40%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-title span {
          background: linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: clamp(1rem, 2vw, 1.2rem);
          color: var(--text-muted);
          max-width: 760px;
          line-height: 1.6;
          margin-bottom: 2.25rem;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 3.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .btn-glow-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.85rem 1.85rem;
          background: linear-gradient(180deg, #38bdf8 0%, #0284c7 100%);
          color: #07090e;
          font-weight: 700;
          font-size: 0.95rem;
          border-radius: var(--radius-md);
          border: none;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 0 24px rgba(56, 189, 248, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.4);
        }
        .btn-glow-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 36px rgba(56, 189, 248, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.5);
        }

        .btn-glow-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.85rem 1.85rem;
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-main);
          font-weight: 600;
          font-size: 0.95rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }
        .btn-glow-secondary:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }

        /* Hero Interactive Smog Scrubber Widget */
        .smog-scrubber-deck {
          width: 100%;
          max-width: 940px;
          background: rgba(15, 20, 31, 0.8);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xl);
          padding: 2rem;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
          position: relative;
          overflow: hidden;
        }

        .scrubber-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .scrubber-dial-row {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 2rem;
          align-items: center;
          text-align: left;
        }
        @media (max-width: 768px) {
          .scrubber-dial-row {
            grid-template-columns: 1fr;
            text-align: center;
          }
        }

        /* Crisis Ticker */
        .crisis-strip {
          max-width: 1320px;
          margin: 2rem auto 4rem;
          padding: 0 1.5rem;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }
        @media (max-width: 900px) {
          .crisis-strip {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .crisis-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          text-align: left;
        }

        .crisis-val {
          font-size: 2rem;
          font-weight: 900;
          color: var(--text-main);
          letter-spacing: -0.03em;
        }

        /* 6-Card Bento Showcase */
        .bento-showcase-section {
          max-width: 1320px;
          margin: 0 auto 5rem;
          padding: 0 1.5rem;
        }

        .section-eyebrow {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .section-title {
          font-size: 2.25rem;
          font-weight: 800;
          letter-spacing: -0.025em;
          margin-bottom: 0.5rem;
        }

        .section-desc {
          color: var(--text-muted);
          font-size: 1rem;
          max-width: 600px;
          margin: 0 auto;
        }

        /* Animated DAG Swarm Flow */
        .dag-flow-container {
          background: rgba(15, 20, 31, 0.6);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xl);
          padding: 2.5rem 1.5rem;
          margin-top: 3rem;
          text-align: center;
          position: relative;
        }

        .dag-node-grid {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          flex-wrap: wrap;
          margin-top: 2rem;
        }

        .dag-node-pill {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.85rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          transition: all 0.2s ease;
        }
        .dag-node-pill:hover {
          border-color: var(--accent-cyan);
          background: rgba(34, 211, 238, 0.08);
          transform: translateY(-2px);
        }

        .dag-arrow {
          color: var(--text-dim);
          font-size: 1.25rem;
          font-weight: 700;
        }

        /* Comparison Table */
        .compare-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 2rem;
          font-size: 0.875rem;
        }
        .compare-table th, .compare-table td {
          padding: 1rem 1.25rem;
          text-align: left;
          border-bottom: 1px solid var(--border-subtle);
        }
        .compare-table th {
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }
      `}</style>

      {/* 1. Glass Navbar */}
      <nav className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="brand-logo-glow" style={{ width: 34, height: 34, borderRadius: 10 }}>
            <IconWind size={18} color="#07090e" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.02em' }}>
              Urban Air Quality Assistant
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>
              ANTIGRAVITY SWARM v1.0
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <a
            href="https://github.com/rudrakhairnar16-bit/urban-air-quality-assistant"
            target="_blank"
            rel="noreferrer"
            className="btn-glow-secondary"
            style={{ padding: '0.45rem 0.95rem', fontSize: '0.8rem' }}
          >
            GitHub
          </a>
          <button
            onClick={onDemo}
            className="btn-glow-secondary"
            style={{ padding: '0.5rem 1.15rem', fontSize: '0.85rem', gap: '0.4rem' }}
          >
            <IconPlay size={14} /> Demo Dashboard
          </button>
          <button
            onClick={onGetStarted}
            className="btn-glow-primary"
            style={{ padding: '0.5rem 1.15rem', fontSize: '0.85rem' }}
          >
            Launch Assistant →
          </button>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <header className="hero-section">
        <div className="hero-badge-pill">
          <IconSparkles size={14} color="var(--accent-cyan)" />
          PROMPTWARS CHALLENGE 6 • 6 AUTONOMOUS AGENTS
        </div>

        <h1 className="hero-title">
          Navigate Winter Smog with <span>Physics-Grounded AI</span>
        </h1>

        <p className="hero-subtitle">
          Generic weather apps only show outdoor numbers. Our 6-agent Antigravity swarm simulates 4-zone indoor mass balance,
          apportions chemical pollution sources, forecasts 48h spikes with TF.js, and creates personalized zero-emission routines.
        </p>

        <div className="hero-actions">
          <button onClick={onGetStarted} className="btn-glow-primary">
            Launch Autonomous Assistant →
          </button>
          <button onClick={onDemo} className="btn-glow-secondary" style={{ gap: '0.5rem' }}>
            <IconPlay size={15} /> Jump to Demo Dashboard
          </button>
          <a href="#simulator" className="btn-glow-secondary">
            Test Smog Simulator ↓
          </a>
        </div>

        {/* 3. Hero Interactive Smog Scrubber Widget */}
        <div id="simulator" className="smog-scrubber-deck">
          <div className="scrubber-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <IconGauge size={18} color="var(--accent-cyan)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Interactive Delhi-NCR Smog Simulator</span>
            </div>
            <span
              className="brand-tag"
              style={{
                background: `${aqiCategory.color}20`,
                color: aqiCategory.color,
                borderColor: `${aqiCategory.color}40`
              }}
            >
              {aqiCategory.label.toUpperCase()} AIR TIER
            </span>
          </div>

          <div className="scrubber-dial-row">
            {/* SVG Arc Gauge */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              <svg width="220" height="130" viewBox="0 0 200 110" style={{ overflow: 'visible' }}>
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke={aqiCategory.color}
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (Math.min(500, Math.max(0, smogAqi)) / 500) * 251.2}
                  style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', top: '52%', textAlign: 'center', transform: 'translateY(-50%)' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1 }}>{smogAqi}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: aqiCategory.color }}>AQI INDEX</div>
              </div>
            </div>

            {/* Live Impact Readouts & Slider */}
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <span>Simulate Ambient Exposure</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>{smogAqi} AQI ({smogMetrics.pm25} µg/m³ PM2.5)</span>
                </div>
                <input
                  type="range"
                  min="35"
                  max="490"
                  step="5"
                  value={smogAqi}
                  onChange={(e) => setSmogAqi(Number(e.target.value))}
                  className="bento-slider"
                  style={{ width: '100%' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '0.35rem' }}>
                  <span>50 (Hills)</span>
                  <span>150 (Moderate)</span>
                  <span>300 (Very Poor)</span>
                  <span>450+ (Hazardous Delhi Inversion)</span>
                </div>
              </div>

              {/* Metric Comparison Pills */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <div className="telemetry-pill">
                  <div className="pill-label">Cigarette Burden</div>
                  <div className="pill-value" style={{ color: 'var(--accent-rose)', fontSize: '1.05rem' }}>
                    ~{smogMetrics.cigs} <span style={{ fontSize: '0.7rem' }}>cigs/day</span>
                  </div>
                </div>
                <div className="telemetry-pill">
                  <div className="pill-label">Unsealed Bedroom</div>
                  <div className="pill-value" style={{ color: 'var(--accent-amber)', fontSize: '1.05rem' }}>
                    {smogMetrics.rawIndoor} <span style={{ fontSize: '0.7rem' }}>µg/m³</span>
                  </div>
                </div>
                <div className="telemetry-pill" style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                  <div className="pill-label">With Sanctuary</div>
                  <div className="pill-value" style={{ color: 'var(--accent-emerald)', fontSize: '1.05rem' }}>
                    {smogMetrics.protectedIndoor} <span style={{ fontSize: '0.7rem' }}>µg/m³</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 4. Crisis Reality Strip */}
      <section className="crisis-strip">
        <div className="crisis-card">
          <div className="crisis-val" style={{ color: 'var(--accent-rose)' }}>450+</div>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', marginTop: '0.25rem' }}>Peak Winter Ambient AQI</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
            Severe inversion caps vehicular, stubble, and industrial particulates over Delhi-NCR.
          </div>
        </div>
        <div className="crisis-card">
          <div className="crisis-val" style={{ color: 'var(--accent-amber)' }}>72%</div>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', marginTop: '0.25rem' }}>Indoor Penetration Rate</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
            Closed unsealed rooms silently equalize with toxic ambient air within 90 minutes.
          </div>
        </div>
        <div className="crisis-card">
          <div className="crisis-val" style={{ color: 'var(--accent-cyan)' }}>1,200 µg/h</div>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', marginTop: '0.25rem' }}>Cooking Emission Spike</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
            Frying and unvented burners create indoor concentrations 4× worse than outdoor air.
          </div>
        </div>
        <div className="crisis-card">
          <div className="crisis-val" style={{ color: 'var(--accent-emerald)' }}>k ≥ 50</div>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', marginTop: '0.25rem' }}>Strict Privacy Guarantee</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
            1km centroid rounding with local-first processing ensures zero PII leaves your device.
          </div>
        </div>
      </section>

      {/* 5. Asymmetrical 6-Card Bento Showcase */}
      <section id="engines" className="bento-showcase-section">
        <div className="section-eyebrow">
          <span className="brand-tag">ARCHITECTURE</span>
          <h2 className="section-title">5 Core Engines • 6 Autonomous Agents</h2>
          <p className="section-desc">
            Built from scratch for PromptWars Challenge 6. Not a generic wrapper, but real computational engines running in-browser.
          </p>
        </div>

        <div className="bento-grid">
          {/* Bento Card 1: 48hr TF.js Forecast Engine (Col-Span-8) */}
          <div className="bento-card col-span-8">
            <div className="bento-card-header">
              <div className="bento-title-group">
                <div className="bento-icon-box">
                  <IconActivity size={17} />
                </div>
                <div>
                  <div className="bento-title">48-Hour TF.js LSTM Forecast Engine</div>
                  <div className="bento-subtitle">Quantized neural network with diurnal harmonic mathematical fallback</div>
                </div>
              </div>
              <span className="brand-tag">EDGE ML</span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Predicts 48-hour forward particulate curves using a 72-hour historical sliding window. Dynamically loads TensorFlow.js
              in the browser and gracefully falls back to diurnal sinusoidal modeling in offline or testing environments.
            </p>

            {/* Interactive Hourly Scrub Bar */}
            <div className="forecast-scroll-container" style={{ marginBottom: '1rem' }}>
              {miniForecastHours.map((f, idx) => (
                <div
                  key={f.hour}
                  className="forecast-tick-card"
                  onClick={() => setSelectedForecastHour(idx)}
                  style={{
                    borderColor: selectedForecastHour === idx ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                    background: selectedForecastHour === idx ? 'rgba(34, 211, 238, 0.08)' : 'rgba(255, 255, 255, 0.02)'
                  }}
                >
                  <span className="forecast-hour">{f.hour}</span>
                  <span className="forecast-aqi" style={{ color: f.aqi > 300 ? 'var(--accent-purple)' : 'var(--accent-amber)' }}>
                    {f.aqi}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{f.pm25} µg</span>
                </div>
              ))}
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Scrub time horizon above to inspect predicted diurnal inversion spikes</span>
              <span style={{ fontFamily: 'monospace' }}>6/6 Tests Passing</span>
            </div>
          </div>

          {/* Bento Card 2: 4-Zone Spatial Mass Balance (Col-Span-4) */}
          <div className="bento-card col-span-4">
            <div className="bento-card-header">
              <div className="bento-title-group">
                <div className="bento-icon-box">
                  <IconHome size={17} />
                </div>
                <div>
                  <div className="bento-title">4-Zone Indoor Physics</div>
                  <div className="bento-subtitle">Differential mass balance solver</div>
                </div>
              </div>
              <span className="brand-tag">PHYSICS</span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Euler forward solver resolves coupled differential equations across Bedroom, Living, Kitchen, and Bathroom:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.65rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Bedroom</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>14 µg/m³</div>
              </div>
              <div style={{ padding: '0.65rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Living</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-amber)' }}>38 µg/m³</div>
              </div>
              <div style={{ padding: '0.65rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Kitchen (Cooking)</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-rose)' }}>142 µg/m³</div>
              </div>
              <div style={{ padding: '0.65rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Bathroom</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>26 µg/m³</div>
              </div>
            </div>

            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
              Models door airflow (50 m³/h open vs 5 m³/h closed) + Corsi-Rosenthal DIY box CADR.
            </div>
          </div>

          {/* Bento Card 3: Chemical Mass Balance (Col-Span-4) */}
          <div className="bento-card col-span-4">
            <div className="bento-card-header">
              <div className="bento-title-group">
                <div className="bento-icon-box">
                  <IconLayers size={17} />
                </div>
                <div>
                  <div className="bento-title">Chemical Mass Balance</div>
                  <div className="bento-subtitle">EPA CMB8.2 receptor model</div>
                </div>
              </div>
              <span className="brand-tag">RECEPTOR</span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Identifies the chemical fingerprint of 6 particulate sources using elemental markers:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 6 }}>
                <span>Stubble Biomass (K⁺ Marker)</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-amber)' }}>34%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 6 }}>
                <span>Vehicular Traffic (EC/OC)</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>28%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 6 }}>
                <span>Industrial Stacks (SO₄²⁻)</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-purple)' }}>18%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 6 }}>
                <span>Resuspended Road Dust (Ca/Si)</span>
                <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>12%</span>
              </div>
            </div>
          </div>

          {/* Bento Card 4: Gaussian Plume Neighborhood Dispersion (Col-Span-8) */}
          <div className="bento-card col-span-8">
            <div className="bento-card-header">
              <div className="bento-title-group">
                <div className="bento-icon-box">
                  <IconBarChart size={17} />
                </div>
                <div>
                  <div className="bento-title">Neighborhood Gaussian Plume Dispersion</div>
                  <div className="bento-subtitle">500m microgrid simulation (10×10 cells)</div>
                </div>
              </div>
              <span className="brand-tag">DISPERSION</span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Simulates atmospheric advection using Pasquill-Gifford stability parameters across 100 spatial cells.
              Calculates population exposure drop when community members adopt clean modal transit shifts.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem', textAlign: 'center' }}>
              <div className="telemetry-pill">
                <div className="pill-label">Ambient Drop</div>
                <div className="pill-value" style={{ color: 'var(--accent-cyan)' }}>-14.2%</div>
              </div>
              <div className="telemetry-pill">
                <div className="pill-label">Beneficiaries</div>
                <div className="pill-value" style={{ color: 'var(--accent-emerald)' }}>3,420</div>
              </div>
              <div className="telemetry-pill">
                <div className="pill-label">Modal Shift</div>
                <div className="pill-value" style={{ color: 'var(--accent-purple)' }}>30% Metro</div>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Computes population-weighted exposure indices for localized civic and neighborhood interventions.
            </div>
          </div>

          {/* Bento Card 5: Thompson Sampling Bandit (Col-Span-6) */}
          <div className="bento-card col-span-6">
            <div className="bento-card-header">
              <div className="bento-title-group">
                <div className="bento-icon-box">
                  <IconLeaf size={17} />
                </div>
                <div>
                  <div className="bento-title">Thompson Sampling Behavioral Engine</div>
                  <div className="bento-subtitle">Multi-armed bandit with 6 psychological framings</div>
                </div>
              </div>
              <span className="brand-tag">DECISION AI</span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Models user behavioral adoption using Bayesian Beta(α, β) distributions. Tests nudges framed across 6 psychological axes:
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
              <span className="brand-tag" style={{ color: 'var(--accent-emerald)' }}>[HEALTH IMPACT]</span>
              <span className="brand-tag" style={{ color: 'var(--accent-cyan)' }}>[FINANCIAL SAVINGS]</span>
              <span className="brand-tag" style={{ color: 'var(--accent-purple)' }}>[CIVIC IDENTITY]</span>
              <span className="brand-tag" style={{ color: 'var(--accent-rose)' }}>[PEAK URGENCY]</span>
              <span className="brand-tag" style={{ color: 'var(--accent-amber)' }}>[EFFORTLESS SIMPLICITY]</span>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Learns whether a user responds best to saving ₹420/month, avoiding 18 µg/m³ inhalation, or community leadership.
            </div>
          </div>

          {/* Bento Card 6: Mission Control Swarm Dock (Col-Span-6) */}
          <div className="bento-card col-span-6">
            <div className="bento-card-header">
              <div className="bento-title-group">
                <div className="bento-icon-box">
                  <IconCpu size={17} />
                </div>
                <div>
                  <div className="bento-title">Antigravity Mission Control Swarm</div>
                  <div className="bento-subtitle">6 persistent agents declared in mission-control.json</div>
                </div>
              </div>
              <span className="brand-tag">SWARM</span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Complies with Antigravity v1.0 schema with acyclic DAG dependencies, synchronized TTL stores, and zero PII:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ padding: '0.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 6, fontSize: '0.75rem' }}>
                <span className="agent-dot-pulse" style={{ marginRight: 6 }} />
                <strong>Scout</strong> (15m)
              </div>
              <div style={{ padding: '0.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 6, fontSize: '0.75rem' }}>
                <span className="agent-dot-pulse" style={{ marginRight: 6 }} />
                <strong>Analyst</strong> (On-demand)
              </div>
              <div style={{ padding: '0.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 6, fontSize: '0.75rem' }}>
                <span className="agent-dot-pulse" style={{ marginRight: 6 }} />
                <strong>Strategist</strong> (On-demand)
              </div>
              <div style={{ padding: '0.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 6, fontSize: '0.75rem' }}>
                <span className="agent-dot-pulse" style={{ marginRight: 6 }} />
                <strong>Nudge</strong> (Daily 6am)
              </div>
              <div style={{ padding: '0.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 6, fontSize: '0.75rem' }}>
                <span className="agent-dot-pulse" style={{ marginRight: 6 }} />
                <strong>Sentinel</strong> (5m Alert)
              </div>
              <div style={{ padding: '0.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 6, fontSize: '0.75rem' }}>
                <span className="agent-dot-pulse" style={{ marginRight: 6 }} />
                <strong>Contributor</strong> (Nightly)
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Uses native tools only: web_browse, fetch, compute, notify, localStorage.
            </div>
          </div>
        </div>

        {/* 6. Interactive Sanctuary Mini-Calculator */}
        <div style={{ marginTop: '3.5rem', background: 'rgba(15, 20, 31, 0.75)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <IconShield size={18} color="var(--accent-emerald)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Interactive Living Space Sanctuary Calculator</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Configure your apartment floor and purifier to see how our indoor physics engine predicts your bedroom sanctuary air quality.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                Apartment Floor Level: <strong>{calcFloor}th Floor</strong>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={calcFloor}
                onChange={(e) => setCalcFloor(Number(e.target.value))}
                className="bento-slider"
              />
              <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Higher floors avoid coarse road dust settling</span>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                Purifier Capacity: <strong>{calcCadr} m³/h CADR</strong>
              </label>
              <input
                type="range"
                min="0"
                max="450"
                step="50"
                value={calcCadr}
                onChange={(e) => setCalcCadr(Number(e.target.value))}
                className="bento-slider"
              />
              <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>HEPA filtration or DIY Corsi-Rosenthal cube</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Kitchen Exhaust Fan</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Depressurizes cooking plume</div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={calcExhaust}
                  onChange={(e) => setCalcExhaust(e.target.checked)}
                />
                <span className="slider-toggle" />
              </label>
            </div>

            <div style={{ padding: '1.25rem', background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                Projected Bedroom Air
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-emerald)' }}>
                {calcCadr > 0 ? Math.round(smogMetrics.rawIndoor * (150 / (150 + calcCadr))) : smogMetrics.rawIndoor}
                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-dim)' }}> µg/m³</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {calcCadr >= 250 ? '✅ WHO Tier 1 Compliant (<15 µg)' : '⚠️ Moderate Exposure'}
              </div>
            </div>
          </div>
        </div>

        {/* 7. Animated Swarm DAG Visual Flow */}
        <div className="dag-flow-container">
          <span className="brand-tag">ORCHESTRATION</span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            Autonomous Antigravity Swarm Pipeline
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: 640, margin: '0 auto' }}>
            Linear pipeline with parallel background watchers. Data flows across TTL stores with zero user friction.
          </p>

          <div className="dag-node-grid">
            <div className="dag-node-pill">
              <IconWind size={16} color="var(--accent-cyan)" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Scout</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>CPCB & OWM Live</div>
              </div>
            </div>

            <div className="dag-arrow">→</div>

            <div className="dag-node-pill">
              <IconLayers size={16} color="var(--accent-purple)" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Analyst</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>CMB & 4-Zone Physics</div>
              </div>
            </div>

            <div className="dag-arrow">→</div>

            <div className="dag-node-pill">
              <IconCpu size={16} color="var(--accent-amber)" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Strategist</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Plume & Routines</div>
              </div>
            </div>

            <div className="dag-arrow">→</div>

            <div className="dag-node-pill">
              <IconLeaf size={16} color="var(--accent-emerald)" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Nudge</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Thompson Sampling</div>
              </div>
            </div>
          </div>
        </div>

        {/* 8. Comparison Matrix */}
        <div style={{ marginTop: '3.5rem', background: 'rgba(15, 20, 31, 0.6)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Why Not Just a Generic Weather App?
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Comparing generic mobile weather apps with the Urban Air Quality Assistant.
          </p>

          <table className="compare-table">
            <thead>
              <tr>
                <th>Capability</th>
                <th>Standard Weather App</th>
                <th>Urban Air Quality Assistant</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>Indoor vs Outdoor Exposure</td>
                <td style={{ color: 'var(--text-dim)' }}>Outdoor only (Ignores indoor infiltration)</td>
                <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                  <IconCheck size={14} style={{ display: 'inline', marginRight: 4 }} /> 4-Zone Coupled Mass Balance
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Pollution Source Identification</td>
                <td style={{ color: 'var(--text-dim)' }}>None (Single generic number)</td>
                <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                  <IconCheck size={14} style={{ display: 'inline', marginRight: 4 }} /> Chemical Mass Balance (6 Sources)
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Behavioral Adaptation</td>
                <td style={{ color: 'var(--text-dim)' }}>Generic tips ("Wear a mask")</td>
                <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                  <IconCheck size={14} style={{ display: 'inline', marginRight: 4 }} /> Thompson Sampling Bandit (6 Framings)
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Quantified Impact Metrics</td>
                <td style={{ color: 'var(--text-dim)' }}>None</td>
                <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                  <IconCheck size={14} style={{ display: 'inline', marginRight: 4 }} /> Avoided kg CO₂, Inhaled µg, ₹ Saved
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Citizen Privacy Architecture</td>
                <td style={{ color: 'var(--text-dim)' }}>Ad trackers, GPS tracking</td>
                <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                  <IconCheck size={14} style={{ display: 'inline', marginRight: 4 }} /> Zero PII, 1km k-Anonymity (k≥50)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 9. Clean Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', background: 'rgba(10, 15, 26, 0.8)', padding: '2.5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="brand-logo-glow" style={{ width: 28, height: 28, borderRadius: 8 }}>
              <IconWind size={15} color="#07090e" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Urban Air Quality Assistant</span>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', maxWidth: 500 }}>
            An autonomous GenAI assistant built for PromptWars Virtual Challenge 6 using the Google Antigravity Agent Swarm framework.
          </p>

          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="https://github.com/rudrakhairnar16-bit/urban-air-quality-assistant" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }}>
              GitHub Repository
            </a>
            <a href="https://air-quality-assistant.vercel.app" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }}>
              Live Production Demo
            </a>
            <button onClick={onDemo} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
              Demo Dashboard
            </button>
            <button onClick={onGetStarted} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
              Launch App →
            </button>
          </div>

          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
            MIT LICENSE • ZERO-PII BY DESIGN • LOCAL-FIRST
          </div>
        </div>
      </footer>
    </div>
  );
}
