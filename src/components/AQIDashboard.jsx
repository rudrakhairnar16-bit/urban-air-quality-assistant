import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const AQI_COLORS = {
  Good: '#22c55e', Moderate: '#f59e0b', Unhealthy: '#ef4444',
  'Very Unhealthy': '#a855f7', Severe: '#7c2d12', Hazardous: '#1f1f1f'
};

function aqiFromPm25(pm25) {
  if (pm25 <= 12) return { aqi: Math.round(50 * pm25 / 12), category: 'Good' };
  if (pm25 <= 35.4) return { aqi: Math.round(50 + 50 * (pm25 - 12) / 23.4), category: 'Moderate' };
  if (pm25 <= 55.4) return { aqi: Math.round(100 + 100 * (pm25 - 35.4) / 20), category: 'Unhealthy' };
  if (pm25 <= 150.4) return { aqi: Math.round(200 + 100 * (pm25 - 55.4) / 95), category: 'Very Unhealthy' };
  if (pm25 <= 250.4) return { aqi: Math.round(300 + 200 * (pm25 - 150.4) / 100), category: 'Severe' };
  return { aqi: Math.round(500 + 100 * (pm25 - 250.4) / 100), category: 'Hazardous' };
}

export default function AQIDashboard({ analysis, loading, error, onRefresh }) {
  const mapRef = useRef(null);
  const pm25 = analysis?.forecast?.[0]?.pm25 || 120;
  const { aqi, category } = aqiFromPm25(pm25);
  const forecast = analysis?.forecast || [];

  useEffect(() => {
    if (mapRef.current) mapRef.current.leafletElement.invalidateSize();
  }, [analysis]);

  if (loading) return <div className="card loading"><div className="spinner"></div>Analyzing air quality...</div>;
  if (error) return <div className="error">⚠️ {error} <button className="btn btn-ghost" onClick={onRefresh} style={{marginLeft:'1rem',padding:'0.25rem 0.75rem'}}>Retry</button></div>;

  return (
    <div className="card">
      <h2>📍 Live AQI Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <div style={{ fontSize: '3rem', fontWeight: 800, background: `linear-gradient(90deg, ${AQI_COLORS[category]}, #a855f7)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{aqi}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: AQI_COLORS[category], textTransform: 'capitalize' }}>{category}</div>
          <div style={{ color: '#94a3b8', marginTop: '0.25rem' }}>PM2.5: {pm25} µg/m³ • PM10: {analysis?.forecast?.[0]?.pm10 || 180} µg/m³</div>
        </div>
        <button className="btn btn-secondary" onClick={onRefresh} disabled={loading}>🔄 Refresh</button>
      </div>

      <div className="map-container" style={{ marginBottom: '1rem' }}>
        <MapContainer center={[28.6139, 77.2090]} zoom={11} scrollWheelZoom={false} ref={mapRef} style={{ width: '100%', height: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='© OpenStreetMap' />
          <CircleMarker center={[28.6139, 77.2090]} radius={20} color={AQI_COLORS[category]} fillColor={AQI_COLORS[category]} fillOpacity={0.3} weight={2}>
            <Popup>Your Location: {aqi} AQI ({category})</Popup>
          </CircleMarker>
        </MapContainer>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {forecast.slice(0, 12).map((f, i) => {
          const { aqi: faqi, category: fcat } = aqiFromPm25(f.pm25);
          const hour = (new Date().getHours() + i + 1) % 24;
          return (
            <div key={i} style={{ minWidth: '70px', textAlign: 'center', padding: '0.75rem', background: '#0f172a', borderRadius: '10px', border: `1px solid ${AQI_COLORS[fcat]}` }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{hour}:00</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: AQI_COLORS[fcat] }}>{faqi}</div>
              <div style={{ fontSize: '0.7rem', color: AQI_COLORS[fcat], textTransform: 'capitalize' }}>{fcat}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}