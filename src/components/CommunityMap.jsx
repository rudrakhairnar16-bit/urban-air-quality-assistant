import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';

export default function CommunityMap({ neighborhood, location }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) mapRef.current.leafletElement.invalidateSize();
  }, [neighborhood]);

  // Synthetic community data for demo
  const communityPoints = [
    { lat: 28.6139, lon: 77.2090, name: 'Your Location', indoor: 28, outdoor: 145, aqi: 152, you: true },
    { lat: 28.6200, lon: 77.2150, name: 'Sector 12', indoor: 35, outdoor: 160, aqi: 165 },
    { lat: 28.6050, lon: 77.2000, name: 'Sector 8', indoor: 42, outdoor: 180, aqi: 185 },
    { lat: 28.6250, lon: 77.2250, name: 'Sector 15', indoor: 31, outdoor: 155, aqi: 160 },
    { lat: 28.5950, lon: 77.1950, name: 'Sector 5', indoor: 48, outdoor: 200, aqi: 205 },
    { lat: 28.6300, lon: 77.2100, name: 'Sector 18', indoor: 25, outdoor: 140, aqi: 148 },
    { lat: 28.6000, lon: 77.2200, name: 'Sector 22', indoor: 38, outdoor: 170, aqi: 175 },
  ];

  function getColor(aqi) {
    if (aqi <= 50) return '#22c55e';
    if (aqi <= 100) return '#f59e0b';
    if (aqi <= 200) return '#ef4444';
    if (aqi <= 300) return '#a855f7';
    return '#7c2d12';
  }

  return (
    <div className="card">
      <h2>👥 Community Air Quality</h2>
      <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.875rem' }}>
        Anonymized indoor/outdoor readings from nearby contributors. Your data stays private.
      </p>

      <div className="map-container" style={{ marginBottom: '1rem' }}>
        <MapContainer center={[location.lat || 28.6139, location.lon || 77.2090]} zoom={12} scrollWheelZoom={false} ref={mapRef} style={{ width: '100%', height: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='© OpenStreetMap' />
          {communityPoints.map(p => (
            <CircleMarker
              key={p.name}
              center={[p.lat, p.lon]}
              radius={p.you ? 16 : 12}
              color={getColor(p.aqi)}
              fillColor={getColor(p.aqi)}
              fillOpacity={p.you ? 0.5 : 0.3}
              weight={p.you ? 3 : 2}
            >
              <Popup>
                <strong>{p.name}{p.you && ' (You)'}</strong><br/>
                Indoor: {p.indoor} µg/m³<br/>
                Outdoor: {p.outdoor} µg/m³<br/>
                AQI: {p.aqi}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem' }}>
        {communityPoints.map(p => (
          <div key={p.name} style={{ padding: '0.75rem', background: '#0f172a', borderRadius: '8px', border: `1px solid ${getColor(p.aqi)}40`, textAlign: 'center' }}>
            <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{p.name}{p.you && ' ★'}</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem' }}>
              <span style={{ color: '#22d3ee' }}>🏠 {p.indoor}</span>
              <span style={{ color: getColor(p.aqi) }}>🌫️ {p.outdoor}</span>
            </div>
          </div>
        ))}
      </div>

      {neighborhood && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#0f172a', borderRadius: '10px', border: '1px solid #334155' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>📊 If 30% Switch to Metro</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
            <div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22d3ee' }}>{neighborhood.avg_reduction?.toFixed(1) || 12.5}%</div><div className="impact-label">Avg PM2.5 Drop</div></div>
            <div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22d3ee' }}>{neighborhood.people_benefited?.toLocaleString() || 340}</div><div className="impact-label">People Helped</div></div>
            <div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22d3ee' }}>{neighborhood.total_population?.toLocaleString() || 2800}</div><div className="impact-label">In Radius</div></div>
          </div>
        </div>
      )}
    </div>
  );
}