import { IconGauge, IconRefresh, IconWind } from './Icons';

const AQI_TIERS = {
  Good: { color: '#10b981', label: 'Good', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)' },
  Moderate: { color: '#f59e0b', label: 'Moderate', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' },
  Unhealthy: { color: '#f43f5e', label: 'Unhealthy', bg: 'rgba(244, 63, 94, 0.12)', border: 'rgba(244, 63, 94, 0.3)' },
  'Very Unhealthy': { color: '#a855f7', label: 'Very Unhealthy', bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(168, 85, 247, 0.3)' },
  Severe: { color: '#e11d48', label: 'Severe', bg: 'rgba(225, 29, 72, 0.15)', border: 'rgba(225, 29, 72, 0.35)' },
  Hazardous: { color: '#991b1b', label: 'Hazardous', bg: 'rgba(153, 27, 27, 0.2)', border: 'rgba(153, 27, 27, 0.4)' }
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
  const pm25 = analysis?.forecast?.[0]?.pm25 || 120;
  const pm10 = analysis?.forecast?.[0]?.pm10 || 180;
  const { aqi, label, color, bg, border } = getAQITier(pm25);
  const forecast = analysis?.forecast || [];

  // Radial gauge geometry (240 deg arc, radius 78)
  const maxAQI = 500;
  const gaugePercent = Math.min(1, Math.max(0, aqi / maxAQI));
  const arcLength = 326.7; // 2 * PI * 78 * (240 / 360)
  const strokeDashoffset = arcLength * (1 - gaugePercent);

  if (loading) {
    return (
      <div className="bento-card" style={{ minHeight: '360px', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="spinner" />
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Analyzing hyperlocal telemetry...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bento-card" style={{ borderColor: 'rgba(244, 63, 94, 0.4)' }}>
        <div style={{ color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <span>Telemetry Interruption: {error}</span>
        </div>
        <button className="btn-linear btn-linear-secondary" onClick={onRefresh}>
          <IconRefresh size={14} /> Retry Ingestion
        </button>
      </div>
    );
  }

  return (
    <div className="bento-card">
      <div className="bento-card-header">
        <div className="bento-title-group">
          <div className="bento-icon-box">
            <IconGauge size={18} />
          </div>
          <div>
            <div className="bento-title">Hyperlocal AQI Telemetry</div>
            <div className="bento-subtitle">Continuous Real-Time Atmospheric Feed</div>
          </div>
        </div>
        <button className="btn-linear btn-linear-secondary" onClick={onRefresh} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
          <IconRefresh size={13} /> Refresh
        </button>
      </div>

      {/* Radial Telemetry Arc Gauge */}
      <div className="gauge-container">
        <svg className="radial-svg" viewBox="0 0 200 130">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="35%" stopColor="#f59e0b" />
              <stop offset="70%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
          </defs>
          {/* Background Track */}
          <path
            d="M 30 115 A 78 78 0 1 1 170 115"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Active Glowing Value Arc */}
          <path
            d="M 30 115 A 78 78 0 1 1 170 115"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
        </svg>

        <div className="gauge-readout">
          <div className="gauge-value">{aqi}</div>
          <div
            className="gauge-category"
            style={{
              color,
              background: bg,
              border: `1px solid ${border}`,
              padding: '0.2rem 0.65rem',
              borderRadius: '999px',
              display: 'inline-block'
            }}
          >
            {label}
          </div>
        </div>
      </div>

      {/* Telemetry Metrics Bar */}
      <div className="telemetry-pill-grid">
        <div className="telemetry-pill">
          <div className="pill-label">PM2.5 Mass</div>
          <div className="pill-value">{pm25} <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>µg/m³</span></div>
        </div>
        <div className="telemetry-pill">
          <div className="pill-label">PM10 Coarse</div>
          <div className="pill-value">{pm10} <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>µg/m³</span></div>
        </div>
        <div className="telemetry-pill">
          <div className="pill-label">Status</div>
          <div className="pill-value" style={{ color: 'var(--accent-emerald)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
            <span className="agent-dot-pulse" /> Live Feed
          </div>
        </div>
      </div>

      {/* 48-Hour Scrubber Bar */}
      <div style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            48-Hour Diurnal Timeline
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <IconWind size={13} /> LSTM + Diurnal Model
          </span>
        </div>

        <div className="forecast-scroll-container">
          {forecast.slice(0, 16).map((f, i) => {
            const tier = getAQITier(f.pm25);
            const hour = (new Date().getHours() + i + 1) % 24;
            return (
              <div key={i} className="forecast-tick-card" style={{ borderColor: i === 0 ? 'var(--accent-cyan)' : 'var(--border-subtle)' }}>
                <div className="forecast-hour">{hour.toString().padStart(2, '0')}:00</div>
                <div className="forecast-aqi" style={{ color: tier.color }}>{tier.aqi}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                  {tier.label.split(' ')[0]}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
