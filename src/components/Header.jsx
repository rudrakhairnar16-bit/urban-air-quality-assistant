import { useState } from 'react';

export default function Header({ location, onLocationChange }) {
  const [pincode, setPincode] = useState(location.pincode || '');
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!pincode.trim()) return;
    setSearching(true);
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=India&format=json&limit=1`);
      const data = await resp.json();
      if (data[0]) {
        onLocationChange({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), pincode });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  const aqi = location.currentAQI;
  const aqiClass = aqi ? (aqi <= 50 ? 'aqi-good' : aqi <= 100 ? 'aqi-moderate' : aqi <= 200 ? 'aqi-unhealthy' : aqi <= 300 ? 'aqi-severe' : 'aqi-severe') : '';

  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h1>🌬️ Urban Air Quality Assistant</h1>
        {aqi && <span className={`aqi-badge ${aqiClass}`}>AQI {aqi}</span>}
      </div>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="PIN code (e.g., 110001)"
          value={pincode}
          onChange={e => setPincode(e.target.value)}
          style={{ width: '140px', padding: '0.5rem 0.75rem' }}
          maxLength={6}
        />
        <button type="submit" className="btn btn-primary" disabled={searching} style={{ padding: '0.5rem 1rem' }}>
          {searching ? '🔍' : 'Locate'}
        </button>
      </form>
    </header>
  );
}