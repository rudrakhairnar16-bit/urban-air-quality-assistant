import { useState } from 'react';
import { IconMapPin, IconWind, IconThermometer, IconChevronLeft } from './Icons';

export default function Header({ location, onLocationChange, onNavigateHome }) {
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
    } catch (err) {
      console.warn('Geocoding fallback:', err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <header className="linear-navbar">
      {/* Brand & Dynamic Status Capsule */}
      <div className="brand-badge">
        <div className="brand-logo-glow">
          <IconWind size={17} color="#07090e" />
        </div>
        <div>
          <div className="brand-title">
            AirQuality <span style={{ color: 'var(--accent-cyan)' }}>Assistant</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
            <span className="agent-dot-pulse" style={{ width: 6, height: 6 }} />
            <span style={{ fontSize: '0.62rem', color: 'var(--accent-emerald)', fontFamily: '-apple-system, monospace', fontWeight: 600 }}>
              SWARM ONLINE (6 AGENTS)
            </span>
          </div>
        </div>
      </div>

      {/* Nav Actions: Weather Capsule, PIN Input, and Home Toggle */}
      <div className="nav-actions">
        {/* Live Weather Capsule */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          background: 'rgba(255, 255, 255, 0.035)',
          padding: '0.35rem 0.75rem',
          borderRadius: 'var(--radius-capsule)',
          border: '1px solid var(--border-subtle)',
          fontVariantNumeric: 'tabular-nums'
        }}>
          <IconThermometer size={14} color="var(--accent-amber)" />
          <span>22°C • 58% RH • 2.1 m/s NW</span>
        </div>

        {/* PIN Tracking Capsule */}
        <form onSubmit={handleSearch} className="search-input-pill">
          <IconMapPin size={14} color="var(--accent-cyan)" />
          <input
            type="text"
            placeholder="PIN (110001)"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            maxLength={6}
          />
          <button
            type="submit"
            className="btn-linear btn-linear-secondary"
            disabled={searching}
            style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem', borderRadius: 'var(--radius-capsule)' }}
          >
            {searching ? '...' : 'Track'}
          </button>
        </form>

        {/* Return to Landing Page Switch */}
        {onNavigateHome && (
          <button
            type="button"
            onClick={onNavigateHome}
            className="btn-linear btn-linear-secondary"
            style={{
              padding: '0.35rem 0.85rem',
              fontSize: '0.75rem',
              borderRadius: 'var(--radius-capsule)',
              gap: '0.3rem',
              background: 'rgba(255, 255, 255, 0.03)'
            }}
          >
            <IconChevronLeft size={14} /> Landing
          </button>
        )}
      </div>
    </header>
  );
}
