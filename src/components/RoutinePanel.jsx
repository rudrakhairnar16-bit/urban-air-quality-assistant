import { createNudgeEngine } from '../core/behavioral-engine.js';

export default function RoutinePanel({ routine, nudges, onLogActual }) {
  if (!routine?.length) return <div className="card loading"><div className="spinner"></div>Generating your routine...</div>;

  const categories = { transport: '🚌 Transport', home: '🏠 Home', action: '⚡ Action' };

  return (
    <div className="card">
      <h2>📋 Your Personalized Routine</h2>
      <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.875rem' }}>
        Based on your location, building, and lifestyle. Each action shows quantified impact.
      </p>
      <div className="routine-list">
        {Object.entries(categories).map(([cat, label]) => {
          const items = routine.filter(r => r.category === cat && r.relevant);
          if (!items.length) return null;
          return (
            <div key={cat} style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 600, color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{label}</div>
              {items.map(item => (
                <div key={item.id} className="routine-item">
                  <div className={`routine-icon ${item.category}`}>{item.icon}</div>
                  <div className="routine-content">
                    <div className="routine-title">{item.time} — {item.title}</div>
                    <div className="routine-desc">{item.description}</div>
                    <div className="routine-impact">
                      {item.impact?.pm25_ug && `↓ ${item.impact.pm25_ug} µg/m³ PM2.5`}
                      {item.impact?.co2_kg && ` • ↓ ${item.impact.co2_kg} kg CO₂/day`}
                      {item.impact?.cost_save && ` • ₹${item.impact.cost_save > 0 ? 'save' : 'cost'} ${Math.abs(item.impact.cost_save)}/mo`}
                    </div>
                  </div>
                  <button className="btn btn-ghost" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }} onClick={() => logCompletion(item.id)}>
                    Mark Done
                  </button>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {nudges?.length && (
        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #334155' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>🎯 AI Nudges (Learning)</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {nudges.slice(0, 3).map(n => (
              <button key={n.id} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
                {n.id.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#0f172a', borderRadius: '10px', border: '1px solid #334155' }}>
        <h4 style={{ marginBottom: '0.5rem' }}>📝 Log Actual Indoor Reading</h4>
        <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '0.75rem' }}>Have a monitor? Enter bedroom PM2.5 to improve your model.</p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input type="number" placeholder="PM2.5 (µg/m³)" min="5" max="500" style={{ flex: 1 }} onKeyDown={e => e.key === 'Enter' && logActual(e.target.value)} />
          <button className="btn btn-primary" onClick={() => { const v = prompt('Bedroom PM2.5:'); if (v) logActual(v); }}>Submit</button>
        </div>
      </div>
    </div>
  );

  function logCompletion(id) {
    const item = routine.find(r => r.id === id);
    if (item && nudges) {
      const nudge = nudges.find(n => n.id === item.title.toLowerCase().replace(' ', '_'));
      if (nudge) {
        const engine = createNudgeEngine();
        engine.recordResponse(nudge.id, true, { hour: new Date().getHours() });
      }
    }
    alert(`✅ Logged: ${item?.title}`);
  }

  function logActual(value) {
    const pm25 = parseInt(value);
    if (isNaN(pm25) || pm25 < 5 || pm25 > 500) return alert('Invalid value');
    onLogActual({ bedroom: pm25, timestamp: Date.now() });
    alert(`✅ Logged: ${pm25} µg/m³ — Model updated`);
  }
}