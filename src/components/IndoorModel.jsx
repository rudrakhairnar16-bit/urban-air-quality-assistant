import { useState, useMemo } from 'react';
import { IconHome } from './Icons';

const ZONES = ['bedroom', 'living', 'kitchen', 'bathroom'];

const ZONE_METRICS = {
  bedroom: { name: 'Bedroom (Sanctuary)', defaultPm25: 14, volume: '45 m³', target: 'WHO Tier 1 Safe' },
  living: { name: 'Living Room', defaultPm25: 38, volume: '80 m³', target: 'Moderate Exposure' },
  kitchen: { name: 'Kitchen (Cooking)', defaultPm25: 142, volume: '30 m³', target: 'Emission Source' },
  bathroom: { name: 'Bathroom', defaultPm25: 26, volume: '20 m³', target: 'Ventilated Zone' }
};

export default function IndoorModel({ indoor, building, onBuildingChange }) {
  const [sanctuaryActive, setSanctuaryActive] = useState(true);

  const zoneData = useMemo(() => {
    const data = {};
    ZONES.forEach((z) => {
      const pm25 = indoor?.summary?.[z]?.pm25_avg || indoor?.zones?.[z]?.pm25?.[0] || ZONE_METRICS[z].defaultPm25;
      const co2 = indoor?.summary?.[z]?.co2_max || (z === 'bedroom' ? 680 : 540);
      data[z] = { pm25, co2 };
    });
    return data;
  }, [indoor]);

  const toggleSanctuaryMode = () => {
    const nextState = !sanctuaryActive;
    setSanctuaryActive(nextState);
    if (onBuildingChange && building) {
      onBuildingChange({
        ...building,
        purifier_cadr: nextState ? 350 : 150,
        door_open: !nextState,
        exhaust_kitchen: nextState ? true : building.exhaust_kitchen
      });
    }
  };

  const updateBuilding = (field, val) => {
    if (onBuildingChange && building) {
      onBuildingChange({ ...building, [field]: val });
    }
  };

  return (
    <div className="bento-card">
      {/* Apple HomeKit Header */}
      <div className="bento-card-header">
        <div className="bento-title-group">
          <div className="bento-icon-box">
            <IconHome size={17} />
          </div>
          <div>
            <div className="bento-title">Spatial Residence Sanctuary</div>
            <div className="bento-subtitle">4-Zone Coupled Mass Balance Model</div>
          </div>
        </div>

        {/* Master Sanctuary Mode Switch */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          background: sanctuaryActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
          border: `1px solid ${sanctuaryActive ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
          padding: '0.35rem 0.75rem',
          borderRadius: 'var(--radius-capsule)',
          transition: 'all 0.2s ease'
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: sanctuaryActive ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
            Sanctuary Mode
          </span>
          <label className="switch" style={{ width: 32, height: 18 }}>
            <input type="checkbox" checked={sanctuaryActive} onChange={toggleSanctuaryMode} />
            <span className="slider-toggle" />
          </label>
        </div>
      </div>

      {/* 4 Apple Home Room Tiles */}
      <div className="rooms-spatial-grid" style={{ marginBottom: '1.25rem' }}>
        {ZONES.map((z) => {
          const info = ZONE_METRICS[z];
          const { pm25, co2 } = zoneData[z];
          const isSafe = pm25 <= 15;
          const isModerate = pm25 <= 35;
          const statusColor = isSafe ? 'var(--accent-emerald)' : isModerate ? 'var(--accent-amber)' : 'var(--accent-rose)';

          return (
            <div key={z} className="apple-room-tile">
              <div className="room-header">
                <span className="room-name">{info.name}</span>
                <span style={{
                  fontSize: '0.65rem',
                  padding: '0.15rem 0.45rem',
                  borderRadius: 'var(--radius-capsule)',
                  fontFamily: '-apple-system, monospace',
                  fontWeight: 600,
                  background: isSafe ? 'rgba(16, 185, 129, 0.12)' : isModerate ? 'rgba(245, 158, 11, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                  color: statusColor,
                  border: `1px solid ${statusColor}30`
                }}>
                  {isSafe ? 'WHO SAFE' : isModerate ? 'MODERATE' : 'ELEVATED'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginTop: '0.35rem' }}>
                <span className="room-pm25" style={{ color: statusColor }}>{pm25}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 500 }}>µg/m³</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                <span>Vol: {info.volume}</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>CO₂: {co2} ppm</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tactile Controls: CADR Slider and Micro-Toggles */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Filtration Capacity (CADR)</span>
          <strong style={{ color: 'var(--accent-cyan)', fontVariantNumeric: 'tabular-nums' }}>
            {building?.purifier_cadr || 300} m³/h
          </strong>
        </div>
        <input
          type="range"
          min="0"
          max="500"
          step="25"
          value={building?.purifier_cadr || 300}
          onChange={(e) => updateBuilding('purifier_cadr', parseInt(e.target.value))}
          className="bento-slider"
          style={{ marginBottom: '1rem' }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
            <span style={{ fontSize: '0.72rem' }}>Kitchen Exhaust</span>
            <label className="switch" style={{ width: 30, height: 16 }}>
              <input
                type="checkbox"
                checked={building?.exhaust_kitchen || false}
                onChange={(e) => updateBuilding('exhaust_kitchen', e.target.checked)}
              />
              <span className="slider-toggle" />
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
            <span style={{ fontSize: '0.72rem' }}>Bedroom Window</span>
            <label className="switch" style={{ width: 30, height: 16 }}>
              <input
                type="checkbox"
                checked={building?.window_bedroom || false}
                onChange={(e) => updateBuilding('window_bedroom', e.target.checked)}
              />
              <span className="slider-toggle" />
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
            <span style={{ fontSize: '0.72rem' }}>Door Airflow</span>
            <label className="switch" style={{ width: 30, height: 16 }}>
              <input
                type="checkbox"
                checked={building?.door_open || false}
                onChange={(e) => updateBuilding('door_open', e.target.checked)}
              />
              <span className="slider-toggle" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
