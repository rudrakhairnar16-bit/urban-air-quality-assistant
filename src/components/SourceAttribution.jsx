import { IconLayers } from './Icons';

export default function SourceAttribution({ attribution }) {
  const sourceColors = {
    traffic: '#22d3ee',
    stubble_burning: '#f59e0b',
    industry: '#a855f7',
    road_dust: '#94a3b8',
    waste_burning: '#f43f5e',
    secondary_aerosols: '#10b981'
  };

  const tracerHints = {
    traffic: 'EC/OC ratio ~0.35, high elemental carbon from diesel/petrol fleet',
    stubble_burning: 'Potassium (K+) marker >0.2, levoglucosan agricultural biomass',
    industry: 'High sulfate (SO4²⁻) & heavy metals (Fe, Zn) from point stacks',
    road_dust: 'Crustal calcium (Ca) & silicon elements resuspended by tires',
    waste_burning: 'Chloride (Cl⁻) spikes & low-temperature municipal combustion',
    secondary_aerosols: 'Nitrate (NO3⁻) & Ammonium (NH4⁺) gas-to-particle conversion'
  };

  const entries = attribution ? Object.entries(attribution) : [
    { source: 'stubble_burning', fraction: 34 },
    { source: 'traffic', fraction: 28 },
    { source: 'industry', fraction: 18 },
    { source: 'road_dust', fraction: 12 },
    { source: 'secondary_aerosols', fraction: 5 },
    { source: 'waste_burning', fraction: 3 }
  ].map(e => [e.source, { fraction: e.fraction }]);

  return (
    <div className="bento-card">
      <div className="bento-card-header">
        <div className="bento-title-group">
          <div className="bento-icon-box">
            <IconLayers size={17} />
          </div>
          <div>
            <div className="bento-title">Chemical Mass Balance (CMB 8.2)</div>
            <div className="bento-subtitle">Receptor Model Apportionment across 6 Particulate Categories</div>
          </div>
        </div>
        <span className="brand-tag">IIT-K / CPCB PROFILES</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {entries.map(([source, data]) => {
          const color = sourceColors[source] || 'var(--accent-cyan)';
          const label = source.replace(/_/g, ' ');
          const frac = data?.fraction || 0;

          return (
            <div
              key={source}
              style={{
                padding: '0.85rem 1rem',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'capitalize', color: 'var(--text-main)' }}>
                  {label}
                </span>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>
                  {frac}%
                </span>
              </div>

              <div className="source-bar-track">
                <div
                  className="source-bar-fill"
                  style={{ width: `${Math.min(100, Math.max(0, frac))}%`, background: color }}
                />
              </div>

              <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '0.35rem' }}>
                {tracerHints[source] || 'Elemental receptor tracer mass balance'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

