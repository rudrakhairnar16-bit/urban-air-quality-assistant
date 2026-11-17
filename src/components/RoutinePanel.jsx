import { useState } from 'react';
import { createNudgeEngine } from '../core/behavioral-engine.js';
import { IconActivity, IconCheck, IconSparkles } from './Icons';

export default function RoutinePanel({ routine, nudges, onLogActual }) {
  const [completed, setCompleted] = useState(new Set());
  const [bedroomInput, setBedroomInput] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  if (!routine?.length) {
    return (
      <div className="bento-card" style={{ minHeight: '300px', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="spinner" />
          <div style={{ color: 'var(--text-muted)' }}>Synthesizing personalized routine...</div>
        </div>
      </div>
    );
  }

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleDone = (item) => {
    const isDone = completed.has(item.id);
    const next = new Set(completed);
    if (isDone) {
      next.delete(item.id);
    } else {
      next.add(item.id);
      try {
        const engine = createNudgeEngine();
        engine.recordResponse(item.title.toLowerCase().replace(/\s+/g, '_'), true, { hour: new Date().getHours() });
      } catch (e) {
        console.warn('Nudge engine recording:', e);
      }
      showToast(`Action logged: ${item.title}`);
    }
    setCompleted(next);
  };

  const handleBedroomSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(bedroomInput);
    if (isNaN(val) || val < 5 || val > 500) {
      showToast('Enter valid PM2.5 (5-500 µg/m³)');
      return;
    }
    onLogActual({ bedroom: val, timestamp: Date.now() });
    setBedroomInput('');
    showToast(`Logged ${val} µg/m³ — Model Updated`);
  };

  return (
    <div className="bento-card">
      <div className="bento-card-header">
        <div className="bento-title-group">
          <div className="bento-icon-box">
            <IconActivity size={18} />
          </div>
          <div>
            <div className="bento-title">Personalized Low-Emission Routine</div>
            <div className="bento-subtitle">Thompson Sampling Multi-Armed Bandit Optimized</div>
          </div>
        </div>
        {toastMessage && (
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '999px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            {toastMessage}
          </div>
        )}
      </div>

      {/* Routine Action Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {routine.map((item) => {
          const isDone = completed.has(item.id);
          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                background: isDone ? 'rgba(16, 185, 129, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                border: isDone ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1 }}>
                <button
                  type="button"
                  onClick={() => toggleDone(item)}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    border: isDone ? 'none' : '1px solid var(--border-subtle)',
                    background: isDone ? 'var(--accent-emerald)' : 'rgba(255, 255, 255, 0.04)',
                    color: '#07090e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  {isDone && <IconCheck size={14} color="#07090e" />}
                </button>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-dim)' }}>{item.time}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, textDecoration: isDone ? 'line-through' : 'none', color: isDone ? 'var(--text-muted)' : 'var(--text-main)' }}>
                      {item.title}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {item.description}
                  </div>
                </div>
              </div>

              {/* Quantified Impact Pill */}
              <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0, marginLeft: '0.75rem' }}>
                {item.impact?.pm25_ug && (
                  <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '999px', background: 'rgba(34, 211, 238, 0.08)', color: 'var(--accent-cyan)', border: '1px solid rgba(34, 211, 238, 0.2)' }}>
                    ↓ {item.impact.pm25_ug} µg/m³
                  </span>
                )}
                {item.impact?.co2_kg && (
                  <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '999px', background: 'rgba(16, 185, 129, 0.08)', color: 'var(--accent-emerald)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    ↓ {item.impact.co2_kg} kg CO₂
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Behavioral Nudge Tags */}
      {nudges?.length > 0 && (
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <IconSparkles size={14} color="var(--accent-purple)" />
            <span style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Adaptive Framing Nudges</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {nudges.slice(0, 4).map((n) => (
              <span
                key={n.id}
                style={{
                  fontSize: '0.7rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  background: 'rgba(168, 85, 247, 0.08)',
                  color: 'var(--accent-purple)',
                  border: '1px solid rgba(168, 85, 247, 0.2)',
                  fontFamily: 'monospace'
                }}
              >
                {n.id.replace(/_/g, ' ')} • {n.framing}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Inline Reading Logger */}
      <form onSubmit={handleBedroomSubmit} style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input
          type="number"
          placeholder="Bedroom PM2.5 Monitor (µg/m³)"
          value={bedroomInput}
          onChange={(e) => setBedroomInput(e.target.value)}
          min="5"
          max="500"
          style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.5rem 0.85rem',
            color: 'var(--text-main)',
            fontSize: '0.8rem',
            outline: 'none'
          }}
        />
        <button type="submit" className="btn-linear btn-linear-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
          Calibrate Model
        </button>
      </form>
    </div>
  );
}
