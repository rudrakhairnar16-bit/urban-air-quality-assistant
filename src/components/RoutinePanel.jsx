import { useState } from 'react';
import { createNudgeEngine } from '../core/behavioral-engine.js';
import { IconActivity, IconCheck, IconClock, IconSliders } from './Icons';

function formatImpact(impact) {
  if (!impact) return null;
  if (typeof impact === 'string') return impact;
  if (typeof impact === 'object') {
    const parts = [];
    if (impact.pm25_ug) parts.push(`-${impact.pm25_ug} µg/m³`);
    if (impact.co2_kg) parts.push(`-${impact.co2_kg} kg CO₂`);
    if (impact.cost_monthly !== undefined && impact.cost_monthly !== 0) {
      parts.push(`${impact.cost_monthly > 0 ? '+' : ''}₹${impact.cost_monthly}/mo`);
    } else if (impact.cost_save !== undefined && impact.cost_save !== 0) {
      parts.push(`${impact.cost_save > 0 ? '+' : ''}₹${impact.cost_save}/mo`);
    }
    if (parts.length > 0) return parts.join(' • ');
  }
  return 'Active';
}

export default function RoutinePanel({ routine, nudges, onLogActual }) {
  const [completed, setCompleted] = useState(new Set());
  const [bedroomInput, setBedroomInput] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

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
      } catch (err) {
        console.warn('Nudge engine recording:', err);
      }
      showToast(`Logged: ${item.title}`);
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
    showToast(`Calibrated Sensor: ${val} µg/m³`);
  };

  const items = routine && routine.length > 0 ? routine : [
    { id: 'r1', title: 'Pre-Commute Bedroom Seal', time: '07:30', impact: '-14 µg/m³', framing: 'health' },
    { id: 'r2', title: 'Midday Solar Cross-Ventilation', time: '13:00', impact: '+35% Fresh Air', framing: 'simplicity' },
    { id: 'r3', title: 'Cooking Exhaust Isolation', time: '19:30', impact: '-45 µg/m³', framing: 'health' },
    { id: 'r4', title: 'Night HEPA Whisper Mode', time: '22:00', impact: 'WHO Tier 1 Safe', framing: 'financial' }
  ];

  return (
    <div className="bento-card">
      {/* Apple Health Header */}
      <div className="bento-card-header">
        <div className="bento-title-group">
          <div className="bento-icon-box">
            <IconActivity size={17} />
          </div>
          <div>
            <div className="bento-title">Adaptive Routine & Actions</div>
            <div className="bento-subtitle">Thompson Sampling Multi-Armed Bandit</div>
          </div>
        </div>

        {toastMessage && (
          <span style={{
            fontSize: '0.72rem',
            padding: '0.2rem 0.65rem',
            borderRadius: 'var(--radius-capsule)',
            background: 'rgba(16, 185, 129, 0.12)',
            color: 'var(--accent-emerald)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            fontFamily: '-apple-system, monospace'
          }}>
            {toastMessage}
          </span>
        )}
      </div>

      {/* Routine Action Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
        {items.map((item) => {
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
                border: `1px solid ${isDone ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-md)',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1 }}>
                <button
                  type="button"
                  onClick={() => toggleDone(item)}
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '6px',
                    border: isDone ? 'none' : '1px solid var(--border-subtle)',
                    background: isDone ? 'var(--accent-emerald)' : 'rgba(255, 255, 255, 0.04)',
                    color: '#07090e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  {isDone && <IconCheck size={14} color="#07090e" />}
                </button>

                <div>
                  <div style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: isDone ? 'var(--text-muted)' : 'var(--text-main)',
                    textDecoration: isDone ? 'line-through' : 'none'
                  }}>
                    {item.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <IconClock size={11} /> {item.time}
                    </span>
                    {item.framing && (
                      <span className="brand-tag" style={{ fontSize: '0.62rem', padding: '0.1rem 0.4rem' }}>
                        {item.framing.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {item.impact && (
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                  color: isDone ? 'var(--accent-emerald)' : 'var(--accent-cyan)',
                  background: isDone ? 'rgba(16, 185, 129, 0.1)' : 'rgba(34, 211, 238, 0.08)',
                  padding: '0.25rem 0.6rem',
                  borderRadius: 'var(--radius-capsule)',
                  border: `1px solid ${isDone ? 'rgba(16, 185, 129, 0.2)' : 'rgba(34, 211, 238, 0.2)'}`
                }}>
                  {formatImpact(item.impact)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Behavioral Nudges List */}
      {nudges && nudges.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
            Bayesian Thompson Bandit Recommendation
          </div>
          <div style={{
            padding: '0.85rem 1rem',
            background: 'rgba(34, 211, 238, 0.03)',
            border: '1px solid rgba(34, 211, 238, 0.18)',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
              {nudges[0].title || (nudges[0].id ? nudges[0].id.replace(/_/g, ' ').toUpperCase() : 'Adaptive Intervention')}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {typeof nudges[0].description === 'string' ? nudges[0].description : (nudges[0].action || `Framed for ${nudges[0].framing || 'compliance'} based on behavioral priors.`)}
            </div>
          </div>
        </div>
      )}

      {/* Physical Sensor Calibration Tool */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.5rem' }}>
          <IconSliders size={14} color="var(--accent-cyan)" />
          <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Calibrate Physical Monitor</span>
        </div>
        <form onSubmit={handleBedroomSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="number"
            placeholder="Actual Bedroom PM2.5 (e.g. 18)"
            value={bedroomInput}
            onChange={(e) => setBedroomInput(e.target.value)}
            min="5"
            max="500"
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              padding: '0.45rem 0.75rem',
              color: 'var(--text-main)',
              fontSize: '0.8rem',
              outline: 'none',
              fontVariantNumeric: 'tabular-nums'
            }}
          />
          <button type="submit" className="btn-linear btn-linear-primary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem' }}>
            Calibrate
          </button>
        </form>
      </div>
    </div>
  );
}
