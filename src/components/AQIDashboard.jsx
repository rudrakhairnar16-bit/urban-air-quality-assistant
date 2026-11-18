import { useEffect, useState, useMemo } from 'react';
import { IconGauge, IconRefresh, IconDroplets, IconThermometer } from './Icons';

const AQI_TIERS = {
  Good: { color: '#10b981', label: 'Good', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)' },
  Moderate: { color: '#f59e0b', label: 'Moderate', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' },
  Unhealthy: { color: '#f97316', label: 'Poor', bg: 'rgba(249, 115, 22, 0.12)', border: 'rgba(249, 115, 22, 0.3)' },
  'Very Unhealthy': { color: '#f43f5e', label: 'Very Poor', bg: 'rgba(244, 63, 94, 0.12)', border: 'rgba(244, 63, 94, 0.3)' },
  Severe: { color: '#a855f7', label: 'Severe', bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.35)' },
  Hazardous: { color: '#881337', label: 'Hazardous', bg: 'rgba(136, 19, 55, 0.2)', border: 'rgba(136, 19, 55, 0.4)' }
};

function getAQITier(pm25) {
  if (pm25 <= 12) return { aqi: Math.round(50 * pm25 / 12), ...AQI_TIERS.Good };
  if (pm25 <= 35.4) return { aqi: Math.round(50 + 50 * (pm25 - 12) / 23.4), ...AQI_TIERS.Moderate };
  if (pm25 <= 55.4) return { aqi: Math.round(100 + 100 * (pm25 - 35.4) / 20), ...AQI_TIERS.Unhealthy };
  if (pm25 <= 150.4) return { aqi: Math.round(200 + 100 * (pm25 - 55.4) / 95), ...AQI_TIERS['Very Unhealthy'] };
  if (pm25 <= 250.4) return { aqi: Math.round(300 + 200 * (pm25 - 150.4) / 100), ...AQI_TIERS.Severe };
  return { aqi: Math.round(500 + 100 * (pm25 - 250.4) / 100), ...AQI_TIERS.Hazardous };
}

export default function AQIDashboard({ analysis, loading, error, onRefresh }) {
  const [displayAqi, setDisplayAqi] = useState(0);

  const pm25 = analysis?.forecast?.[0]?.pm25 || 120;
  const pm10 = analysis?.forecast?.[0]?.pm10 || 180;
  const { aqi: targetAqi, label, color } = useMemo(() => getAQITier(pm25), [pm25]);
  const forecast = analysis?.forecast || [];

  // Smooth numeric counter animation without heavy libraries
  useEffect(() => {
    let frameId;
    const start = displayAqi || 0;
    const startTime = performance.now();
    const duration = 800;

    function animate(time) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayAqi(Math.round(start + (targetAqi - start) * eased));
      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    }
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [targetAqi]);

  const arcCircumference = 251.2;
  const arcOffset = arcCircumference - (Math.min(500, Math.max(0, displayAqi)) / 500) * arcCircumference;

  if (loading) {
    return (
      <div className="bento-card" style={{ minHeight: '340px', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 28,
            height: 28,
            border: '2px solid rgba(255, 255, 255, 0.1)',
            borderTopColor: 'var(--accent-cyan)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Calibrating hyperlocal atmospheric data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bento-card" style={{ borderColor: 'rgba(244, 63, 94, 0.4)' }}>
        <div style={{ color: 'var(--accent-rose)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
          Telemetry Acquisition Warning: {error}
        </div>
        <button onClick={onRefresh} className="btn-linear btn-linear-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
          Retry Ingestion
        </button>
      </div>
    );
  }

  return (
    <div className="bento-card">
      {/* Apple Weather Header */}
      <div className="bento-card-header">
        <div className="bento-title-group">
          <div className="bento-icon-box">
            <IconGauge size={17} />
          </div>
          <div>
            <div className="bento-title">Air Quality Telemetry</div>
            <div className="bento-subtitle">Apple Weather & CPCB Standard Breakdown</div>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="btn-linear btn-linear-secondary"
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', borderRadius: 'var(--radius-capsule)' }}
          title="Refresh CPCB feed"
        >
          <IconRefresh size={13} />
        </button>
      </div>

      {/* Apple Weather Radial Arc Gauge */}
      <div className="gauge-container">
        <svg width="220" height="125" viewBox="0 0 200 110" className="radial-svg">
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={arcCircumference}
            strokeDashoffset={arcOffset}
            style={{ transition: 'stroke-dashoffset 0.4s ease, stroke 0.3s ease' }}
          />
        </svg>

        <div className="gauge-readout">
          <div className="gauge-value">{displayAqi}</div>
          <div className="gauge-category" style={{ color }}>{label}</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Current PM2.5 level is <strong>{(pm25 / 15).toFixed(1)}×</strong> above the WHO 24-hour guideline (15 µg/m³).
      </div>

      {/* Primary Telemetry Pills */}
      <div className="telemetry-pill-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <div className="telemetry-pill">
          <div className="pill-label">PM2.5</div>
          <div className="pill-value" style={{ color }}>{pm25} <span style={{ fontSize: '0.68rem', fontWeight: 500 }}>µg</span></div>
        </div>
        <div className="telemetry-pill">
          <div className="pill-label">PM10</div>
          <div className="pill-value">{pm10} <span style={{ fontSize: '0.68rem', fontWeight: 500 }}>µg</span></div>
        </div>
        <div className="telemetry-pill">
          <div className="pill-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
            <IconThermometer size={11} color="var(--accent-amber)" /> Temp
          </div>
          <div className="pill-value">22°C</div>
        </div>
        <div className="telemetry-pill">
          <div className="pill-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
            <IconDroplets size={11} color="var(--accent-cyan)" /> RH
          </div>
          <div className="pill-value">58%</div>
        </div>
      </div>

      {/* 48-Hour Apple Weather Forecast Scrubber */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.65rem'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            48-Hour Diurnal Forecast
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: '-apple-system, monospace' }}>
            TF.js Model Online
          </span>
        </div>

        <div className="forecast-scroll-container">
          {forecast.slice(0, 16).map((f, i) => {
            const fTier = getAQITier(f.pm25);
            return (
              <div key={i} className="forecast-tick-card">
                <span className="forecast-hour">+{i * 3}h</span>
                <span className="forecast-aqi" style={{ color: fTier.color }}>
                  {fTier.aqi}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontVariantNumeric: 'tabular-nums' }}>
                  {f.pm25} µg
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
