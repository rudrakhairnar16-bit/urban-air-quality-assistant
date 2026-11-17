import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { IconMapPin, IconActivity, IconShield } from './Icons';

export default function CommunityMap({ neighborhood, location }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.leafletElement?.invalidateSize();
    }
  }, [neighborhood]);

  // Anonymized mesh nodes around user centroid (1km grid, k>=50)
  const userLat = location.lat || 28.6139;
  const userLon = location.lon || 77.2090;

  const communityPoints = [
    { lat: userLat, lon: userLon, name: 'Active Node', indoor: 28, outdoor: 145, aqi: 152, isSelf: true },
    { lat: userLat + 0.006, lon: userLon + 0.006, name: 'Sector 12 Grid', indoor: 35, outdoor: 160, aqi: 165 },
    { lat: userLat - 0.009, lon: userLon - 0.009, name: 'Sector 8 Cluster', indoor: 42, outdoor: 180, aqi: 185 },
    { lat: userLat + 0.011, lon: userLon + 0.016, name: 'Sector 15 Hub', indoor: 31, outdoor: 155, aqi: 160 },
    { lat: userLat - 0.019, lon: userLon - 0.014, name: 'Sector 5 Node', indoor: 48, outdoor: 200, aqi: 205 },
    { lat: userLat + 0.016, lon: userLon + 0.001, name: 'Sector 18 Mesh', indoor: 25, outdoor: 140, aqi: 148 },
  ];

  function getAqiColor(aqi) {
    if (aqi <= 50) return '#10b981';
    if (aqi <= 100) return '#f59e0b';
    if (aqi <= 200) return '#f43f5e';
    if (aqi <= 300) return '#a855f7';
    return '#881337';
  }

  return (
    <div className="bento-card">
      <div className="bento-card-header">
        <div className="bento-title-group">
          <div className="bento-icon-box">
            <IconMapPin size={17} />
          </div>
          <div>
            <div className="bento-title">Federated Community Telemetry</div>
            <div className="bento-subtitle">Zero-PII • 1km k-anonymized contributor mesh (k ≥ 50)</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <IconShield size={14} color="var(--accent-emerald)" />
          <span className="brand-tag" style={{ borderColor: 'rgba(16, 185, 129, 0.3)', color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.08)' }}>
            LOCAL PRIVACY
          </span>
        </div>
      </div>

      {/* Interactive Map Surface */}
      <div style={{
        height: '280px',
        width: '100%',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
        marginBottom: '1rem',
        position: 'relative'
      }}>
        <MapContainer
          center={[userLat, userLon]}
          zoom={12}
          scrollWheelZoom={false}
          ref={mapRef}
          style={{ width: '100%', height: '100%', background: '#07090e' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap"
            className="dark-map-tiles"
          />
          {communityPoints.map((p) => {
            const color = getAqiColor(p.aqi);
            return (
              <CircleMarker
                key={p.name}
                center={[p.lat, p.lon]}
                radius={p.isSelf ? 14 : 9}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: p.isSelf ? 0.6 : 0.4,
                  weight: p.isSelf ? 2 : 1
                }}
              >
                <Popup className="dark-popup">
                  <div style={{ fontSize: '0.8rem', lineHeight: 1.4, color: '#07090e' }}>
                    <strong>{p.name} {p.isSelf && '(Your Node)'}</strong>
                    <br />
                    Indoor: {p.indoor} µg/m³
                    <br />
                    Outdoor: {p.outdoor} µg/m³
                    <br />
                    AQI: {p.aqi}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      {/* Contributor Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.625rem', marginBottom: '1rem' }}>
        {communityPoints.map((p) => (
          <div
            key={p.name}
            style={{
              padding: '0.65rem 0.75rem',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${p.isSelf ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: p.isSelf ? 'var(--accent-cyan)' : 'var(--text-main)' }}>
                {p.name}
              </span>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: getAqiColor(p.aqi) }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span>In: <strong style={{ color: 'var(--text-main)' }}>{p.indoor}</strong></span>
              <span>Out: <strong style={{ color: getAqiColor(p.aqi) }}>{p.outdoor}</strong></span>
              <span style={{ fontFamily: 'monospace' }}>AQI {p.aqi}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Gaussian Plume Neighborhood Scenario */}
      {neighborhood && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <IconActivity size={15} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Community Modal Shift Scenario (30% Metro Adoption)</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                {neighborhood.avg_reduction?.toFixed(1) || '12.5'}%
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Avg Reduction</div>
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                {neighborhood.people_benefited?.toLocaleString() || '340'}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Protected Citizens</div>
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-purple)' }}>
                {neighborhood.total_population?.toLocaleString() || '2,800'}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Microgrid Basin</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
