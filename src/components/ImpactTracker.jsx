import { IconBarChart, IconLeaf, IconShield, IconActivity } from './Icons';

export default function ImpactTracker({ impact, neighborhood }) {
  if (!impact) {
    return (
      <div className="bento-card" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '260px' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Computing physics-grounded impact telemetry...</div>
      </div>
    );
  }

  const { daily, weekly, indoor_reduction, indoor_final } = impact;
  const isWhoCompliant = indoor_final <= 15;
  const isModerate = indoor_final <= 35;

  return (
    <div className="bento-card">
      <div className="bento-card-header">
        <div className="bento-title-group">
          <div className="bento-icon-box">
            <IconBarChart size={17} />
          </div>
          <div>
            <div className="bento-title">Quantified Impact Telemetry</div>
            <div className="bento-subtitle">Physics-derived personal exposure and atmospheric mitigation</div>
          </div>
        </div>
        <span className="brand-tag">REAL-TIME</span>
      </div>

      {/* Primary 4-Metric Bento Grid */}
      <div className="telemetry-pill-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div className="telemetry-pill">
          <div className="pill-label">Avoided CO₂</div>
          <div className="pill-value" style={{ color: 'var(--accent-cyan)' }}>{daily.co2_kg.toFixed(1)} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>kg/day</span></div>
        </div>
        <div className="telemetry-pill">
          <div className="pill-label">Filtered PM2.5</div>
          <div className="pill-value" style={{ color: 'var(--accent-emerald)' }}>{daily.pm25_ug} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>µg/m³</span></div>
        </div>
        <div className="telemetry-pill">
          <div className="pill-label">Est. Savings</div>
          <div className="pill-value" style={{ color: 'var(--accent-purple)' }}>{daily.cost_save > 0 ? '+' : ''}₹{daily.cost_save} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>/mo</span></div>
        </div>
        <div className="telemetry-pill">
          <div className="pill-label">Indoor Drop</div>
          <div className="pill-value" style={{ color: 'var(--text-main)' }}>{indoor_reduction}%</div>
        </div>
      </div>

      {/* Spatial Sanctuary / Bedroom Projection */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <IconShield size={16} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Bedroom Spatial Sanctuary</span>
          </div>
          <span style={{
            fontSize: '0.7rem',
            padding: '0.2rem 0.6rem',
            borderRadius: '999px',
            fontFamily: 'monospace',
            fontWeight: 600,
            background: isWhoCompliant ? 'rgba(16, 185, 129, 0.12)' : isModerate ? 'rgba(245, 158, 11, 0.12)' : 'rgba(244, 63, 94, 0.12)',
            color: isWhoCompliant ? 'var(--accent-emerald)' : isModerate ? 'var(--accent-amber)' : 'var(--accent-rose)',
            border: `1px solid ${isWhoCompliant ? 'rgba(16, 185, 129, 0.25)' : isModerate ? 'rgba(245, 158, 11, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`
          }}>
            {isWhoCompliant ? 'WHO Tier 1 Safe' : isModerate ? 'Moderate Air' : 'High Exposure'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Projected Inhalation Baseline</span>
          <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {indoor_final} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-dim)' }}>µg/m³</span>
          </span>
        </div>
      </div>

      {/* Weekly Aggregate Projection */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Weekly Cumulative Horizon
        </div>
        <div className="telemetry-pill-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
          <div className="telemetry-pill">
            <div className="pill-label">Weekly CO₂</div>
            <div className="pill-value">{weekly.co2_kg.toFixed(1)} <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>kg</span></div>
          </div>
          <div className="telemetry-pill">
            <div className="pill-label">Weekly PM2.5</div>
            <div className="pill-value">{weekly.pm25_ug} <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>µg</span></div>
          </div>
          <div className="telemetry-pill">
            <div className="pill-label">Transit & Power</div>
            <div className="pill-value">{weekly.cost_save > 0 ? '+' : ''}₹{weekly.cost_save}</div>
          </div>
          <div className="telemetry-pill">
            <div className="pill-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
              <IconLeaf size={11} color="var(--accent-emerald)" /> Tree Offset
            </div>
            <div className="pill-value">~{(weekly.co2_kg * 0.0005).toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Gaussian Plume Neighborhood Dispersion */}
      {neighborhood && (
        <div style={{
          background: 'rgba(34, 211, 238, 0.03)',
          border: '1px solid rgba(34, 211, 238, 0.15)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <IconActivity size={16} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Neighborhood Gaussian Plume Dispersion Model</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
            <div className="telemetry-pill">
              <div className="pill-label">Ambient Drop</div>
              <div className="pill-value" style={{ color: 'var(--accent-cyan)' }}>{neighborhood.avg_reduction.toFixed(1)}%</div>
            </div>
            <div className="telemetry-pill">
              <div className="pill-label">Beneficiaries</div>
              <div className="pill-value" style={{ color: 'var(--accent-purple)' }}>{neighborhood.people_benefited.toLocaleString()}</div>
            </div>
            <div className="telemetry-pill">
              <div className="pill-label">500m Population</div>
              <div className="pill-value">{neighborhood.total_population.toLocaleString()}</div>
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center' }}>
            Calculated on a 10×10 dispersion grid with 30% modal commuter transit shift.
          </div>
        </div>
      )}
    </div>
  );
}
