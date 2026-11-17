import { IconHome, IconWind, IconLayers } from './Icons';

export default function IndoorModel({ indoor, building, onBuildingChange }) {
  if (!indoor) {
    return (
      <div className="bento-card" style={{ minHeight: '300px', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="spinner" />
          <div style={{ color: 'var(--text-muted)' }}>Simulating multi-zone indoor mass balance...</div>
        </div>
      </div>
    );
  }

  const zones = ['bedroom', 'living', 'kitchen', 'bathroom'];

  const getCompliance = (pm25) => {
    if (pm25 <= 15) return { label: 'WHO Target', color: 'var(--accent-emerald)', bg: 'rgba(16, 185, 129, 0.1)' };
    if (pm25 <= 35) return { label: 'Moderate', color: 'var(--accent-amber)', bg: 'rgba(245, 158, 11, 0.1)' };
    return { label: 'Elevated Risk', color: 'var(--accent-rose)', bg: 'rgba(244, 63, 94, 0.1)' };
  };

  return (
    <div className="bento-card">
      <div className="bento-card-header">
        <div className="bento-title-group">
          <div className="bento-icon-box">
            <IconHome size={18} />
          </div>
          <div>
            <div className="bento-title">Spatial Indoor Physics Model</div>
            <div className="bento-subtitle">4-Zone Dynamic Mass Balance: Infiltration + Sources - CADR</div>
          </div>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', background: 'rgba(34, 211, 238, 0.08)', padding: '0.2rem 0.6rem', borderRadius: '999px', border: '1px solid rgba(34, 211, 238, 0.2)' }}>
          Floor {building.floor} • {building.area}m²
        </div>
      </div>

      {/* 4 Spatial Room Cards */}
      <div className="rooms-spatial-grid">
        {zones.map((zone) => {
          const d = indoor.summary[zone] || { pm25_avg: 25, pm25_min: 15, pm25_max: 35, co2_max: 600, voc_max: 50 };
          const compliance = getCompliance(d.pm25_avg);
          return (
            <div key={zone} className="room-bento-box" style={{ borderColor: building.purifier_zone === zone && building.purifier_cadr > 0 ? 'rgba(34, 211, 238, 0.35)' : 'var(--border-subtle)' }}>
              <div className="room-header">
                <span className="room-name">{zone}</span>
                <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: compliance.bg, color: compliance.color, fontWeight: 700 }}>
                  {compliance.label}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                <span className="room-pm25" style={{ color: compliance.color }}>{d.pm25_avg}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>µg/m³</span>
              </div>
              <div className="room-submetrics">
                <span>CO₂: {d.co2_max} ppm</span>
                <span>VOC: {d.voc_max} ppb</span>
                {building.purifier_zone === zone && building.purifier_cadr > 0 && (
                  <span style={{ color: 'var(--accent-cyan)' }}>• Purified</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Micro-Sliders */}
      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Building Floor</span>
            <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{building.floor}F</span>
          </div>
          <input
            type="range"
            min="1"
            max="25"
            value={building.floor}
            onChange={(e) => onBuildingChange({ ...building, floor: parseInt(e.target.value) })}
            className="bento-slider"
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Purifier CADR</span>
            <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{building.purifier_cadr} m³/h</span>
          </div>
          <input
            type="range"
            min="0"
            max="600"
            step="50"
            value={building.purifier_cadr}
            onChange={(e) => onBuildingChange({ ...building, purifier_cadr: parseInt(e.target.value) })}
            className="bento-slider"
          />
        </div>
      </div>

      {/* Ventilation Toggles */}
      <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <span className="switch">
            <input
              type="checkbox"
              checked={building.window_bedroom}
              onChange={(e) => onBuildingChange({ ...building, window_bedroom: e.target.checked })}
            />
            <span className="slider-toggle" />
          </span>
          Bedroom Window
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <span className="switch">
            <input
              type="checkbox"
              checked={building.exhaust_kitchen}
              onChange={(e) => onBuildingChange({ ...building, exhaust_kitchen: e.target.checked })}
            />
            <span className="slider-toggle" />
          </span>
          Kitchen Exhaust
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <span className="switch">
            <input
              type="checkbox"
              checked={building.door_open}
              onChange={(e) => onBuildingChange({ ...building, door_open: e.target.checked })}
            />
            <span className="slider-toggle" />
          </span>
          Internal Doors Open
        </label>
      </div>
    </div>
  );
}
