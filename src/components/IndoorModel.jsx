export default function IndoorModel({ indoor, building, onBuildingChange }) {
  if (!indoor) return <div className="card loading"><div className="spinner"></div>Modeling indoor air...</div>;

  const zones = ['bedroom', 'living', 'kitchen', 'bathroom'];
  const icons = { bedroom: '🛏️', living: '🛋️', kitchen: '🍳', bathroom: '🚿' };

  return (
    <div className="card">
      <h2>🏠 Indoor Air Model</h2>
      <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.875rem' }}>
        Physics-based simulation: infiltration + indoor sources - filtration. Adjust building below.
      </p>

      <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {zones.map(zone => {
          const d = indoor.summary[zone];
          const color = d.pm25_avg <= 15 ? '#22c55e' : d.pm25_avg <= 35 ? '#f59e0b' : d.pm25_avg <= 75 ? '#ef4444' : '#a855f7';
          return (
            <div key={zone} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#0f172a', borderRadius: '10px', border: `1px solid ${color}40` }}>
              <span style={{ fontSize: '1.5rem' }}>{icons[zone]}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{zone}</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color }}>{d.pm25_avg} µg/m³</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  <span>Range: {d.pm25_min}–{d.pm25_max}</span>
                  <span>CO₂: {d.co2_max} ppm</span>
                  <span>VOC: {d.voc_max} ppb</span>
                  <span>{`⚠️ ${d.exposure_hours}h >35 µg/m³`}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ borderTop: '1px solid #334155', paddingTop: '1rem' }}>
        <h4 style={{ marginBottom: '1rem' }}>🏗️ Building Configuration</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div className="form-group">
            <label>Floor</label>
            <select value={building.floor} onChange={e => onBuildingChange({...building, floor: parseInt(e.target.value)})}>
              {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Area (m²)</label>
            <input type="number" value={building.area} onChange={e => onBuildingChange({...building, area: parseInt(e.target.value)})} min="20" max="500" />
          </div>
          <div className="form-group">
            <label>Purifier CADR (m³/hr)</label>
            <input type="number" value={building.purifier_cadr || 0} onChange={e => onBuildingChange({...building, purifier_cadr: parseInt(e.target.value) || 0})} min="0" max="1000" placeholder="0 = none" />
          </div>
          <div className="form-group">
            <label>Purifier Zone</label>
            <select value={building.purifier_zone} onChange={e => onBuildingChange({...building, purifier_zone: e.target.value})}>
              {zones.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Occupants</label>
            <input type="number" value={building.occupancy} onChange={e => onBuildingChange({...building, occupancy: parseInt(e.target.value)})} min="1" max="10" />
          </div>
          <div className="form-group">
            <label>Cooking/day</label>
            <input type="number" value={building.cookingFreq} onChange={e => onBuildingChange({...building, cookingFreq: parseInt(e.target.value)})} min="0" max="5" step="0.5" />
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={building.window_bedroom} onChange={e => onBuildingChange({...building, window_bedroom: e.target.checked})} /> Bedroom Window
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={building.window_living} onChange={e => onBuildingChange({...building, window_living: e.target.checked})} /> Living Window
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={building.window_kitchen} onChange={e => onBuildingChange({...building, window_kitchen: e.target.checked})} /> Kitchen Window
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={building.exhaust_kitchen} onChange={e => onBuildingChange({...building, exhaust_kitchen: e.target.checked})} /> Kitchen Exhaust
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={building.exhaust_bathroom} onChange={e => onBuildingChange({...building, exhaust_bathroom: e.target.checked})} /> Bathroom Exhaust
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={building.door_open} onChange={e => onBuildingChange({...building, door_open: e.target.checked})} /> Internal Doors Open
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={building.incense} onChange={e => onBuildingChange({...building, incense: e.target.checked})} /> Incense/Agarbatti
          </label>
        </div>

        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => onBuildingChange({...building})}>🔄 Recalculate Model</button>
      </div>
    </div>
  );
}