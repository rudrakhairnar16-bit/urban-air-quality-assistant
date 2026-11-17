import { useState } from 'react';
import { IconMapPin, IconWind, IconActivity } from './Icons';

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

  return (
    <header className="linear-navbar">
      <div className="brand-badge">
        <div className="brand-logo-glow">
          <IconWind size={18} color="#07090e" />
        </div>
        <div>
          <div className="brand-title">
            AirQuality <span style={{ color: 'var(--accent-cyan)' }}>Assistant</span>
            <span className="brand-tag">ANTIGRAVITY V1.0</span>
          </div>
        </div>
      </div>

      <div className="nav-actions">
        <form onSubmit={handleSearch} className="search-input-pill">
          <IconMapPin size={15} color="var(--accent-cyan)" />
          <input
            type="text"
            placeholder="PIN (110001)"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            maxLength={6}
          />
          <button type="submit" className="btn-linear btn-linear-secondary" disabled={searching} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', borderRadius: '999px' }}>
            {searching ? '...' : 'Track'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '0.35rem 0.75rem', borderRadius: '999px', border: '1px solid var(--border-subtle)' }}>
          <IconActivity size={13} color="var(--accent-emerald)" />
          <span>Delhi NCR</span>
        </div>
      </div>
    </header>
  );
}
