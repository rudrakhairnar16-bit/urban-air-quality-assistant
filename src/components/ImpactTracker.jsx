export default function ImpactTracker({ impact, neighborhood }) {
  if (!impact) return <div className="card loading"><div className="spinner"></div>Calculating impact...</div>;

  const { daily, weekly, indoor_reduction, indoor_final } = impact;

  return (
    <div className="card">
      <h2>📊 Your Impact</h2>

      <div className="impact-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="impact-card">
          <div className="impact-value">{daily.co2_kg.toFixed(1)}</div>
          <div className="impact-label">kg CO₂ / day</div>
        </div>
        <div className="impact-card">
          <div className="impact-value">{daily.pm25_ug}</div>
          <div className="impact-label">µg/m³ PM2.5 reduced</div>
        </div>
        <div className="impact-card">
          <div className="impact-value">{daily.cost_save > 0 ? '+' : ''}{daily.cost_save}</div>
          <div className="impact-label">₹ / month</div>
        </div>
        <div className="impact-card">
          <div className="impact-value">{indoor_reduction}%</div>
          <div className="impact-label">Indoor reduction</div>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#0f172a', borderRadius: '10px', border: '1px solid #334155' }}>
        <h4 style={{ marginBottom: '0.5rem' }}>🏠 Bedroom Projection</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>With routine: <strong>{indoor_final} µg/m³</strong></span>
          <span style={{ color: indoor_final <= 15 ? '#22c55e' : indoor_final <= 35 ? '#f59e0b' : '#ef4444' }}>
            {indoor_final <= 15 ? '✅ WHO Target' : indoor_final <= 35 ? '⚠️ Above Target' : '🔴 Unhealthy'}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ marginBottom: '0.75rem' }}>📈 Weekly Projection</h4>
        <div className="impact-grid">
          <div className="impact-card">
            <div className="impact-value">{weekly.co2_kg.toFixed(1)}</div>
            <div className="impact-label">kg CO₂ / week</div>
          </div>
          <div className="impact-card">
            <div className="impact-value">{weekly.pm25_ug}</div>
            <div className="impact-label">µg/m³ PM2.5 / week</div>
          </div>
          <div className="impact-card">
            <div className="impact-value">{weekly.cost_save > 0 ? '+' : ''}{weekly.cost_save}</div>
            <div className="impact-label">₹ / week</div>
          </div>
          <div className="impact-card">
            <div className="impact-value">~{Math.round(weekly.co2_kg * 0.0005 * 100) / 100}</div>
            <div className="impact-label">Trees equivalent</div>
          </div>
        </div>
      </div>

      {neighborhood && (
        <div style={{ padding: '1rem', background: '#0f172a', borderRadius: '10px', border: '1px solid #334155' }}>
          <h4 style={{ marginBottom: '0.75rem' }}>👥 Neighborhood Impact (Simulation)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22d3ee' }}>{neighborhood.avg_reduction.toFixed(1)}%</div>
              <div className="impact-label">Avg PM2.5 reduction</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22d3ee' }}>{neighborhood.people_benefited.toLocaleString()}</div>
              <div className="impact-label">People benefited</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22d3ee' }}>{neighborhood.total_population.toLocaleString()}</div>
              <div className="impact-label">Population in 500m</div>
            </div>
          </div>
          <p style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: '#94a3b8' }}>
            Based on Gaussian plume dispersion model. If 30% of commuters switch to metro in your 500m radius.
          </p>
        </div>
      )}
    </div>
  );
}