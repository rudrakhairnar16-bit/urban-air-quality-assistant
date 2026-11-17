import { useState } from 'react';

const STEPS = [
  { id: 'location', title: '📍 Location', icon: '📍' },
  { id: 'building', title: '🏠 Building', icon: '🏠' },
  { id: 'profile', title: '👤 Profile', icon: '👤' },
  { id: 'schedule', title: '📅 Schedule', icon: '📅' }
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    location: { lat: 28.6139, lon: 77.2090, pincode: '110001' },
    building: { floor: 3, area: 80, window_bedroom: false, window_living: false, window_kitchen: true, exhaust_kitchen: true, exhaust_bathroom: true, purifier_cadr: 300, purifier_zone: 'bedroom', door_open: true, occupancy: 3, cookingFreq: 2, incense: false },
    profile: { userId: 'user_' + Math.random().toString(36).slice(2), hasChildren: false, priceSensitive: true, communityActive: false, canWfh: true },
    schedule: [{ zone: 'kitchen', activity: 'cooking', start_hour: 8, duration: 1 }, { zone: 'kitchen', activity: 'cooking', start_hour: 19, duration: 1.5 }]
  });

  const current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else onComplete(data);
  };

  const handleBack = () => step > 0 && setStep(step - 1);

  const updateField = (section, field, value) => {
    setData({ ...data, [section]: { ...data[section], [field]: value } });
  };

  return (
    <div className="app" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '500px', background: '#1e293b', borderRadius: '16px', padding: '2rem', border: '1px solid #334155' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            {STEPS.map((s, i) => (
              <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: i <= step ? '#22d3ee' : '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: i <= step ? '#0f172a' : '#94a3b8', zIndex: 1, transition: 'all 0.3s' }}>
                  {i <= step ? '✓' : s.icon}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.5rem', textAlign: 'center' }}>{s.title}</div>
                {i < STEPS.length - 1 && <div style={{ position: 'absolute', top: '18px', left: '50%', right: '50%', height: '2px', background: i < step ? '#22d3ee' : '#334155', zIndex: 0 }} />}
              </div>
            ))}
          </div>
          <div style={{ height: '4px', background: '#334155', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #22d3ee, #a855f7)', transition: 'width 0.3s' }} />
          </div>
        </div>

        <h2 style={{ marginBottom: '0.5rem' }}>{current.icon} {current.title}</h2>
        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>{step === 0 && 'Enter your PIN code for hyperlocal AQI'}{step === 1 && 'Describe your home for indoor modeling'}{step === 2 && 'Help us personalize your nudges'}{step === 3 && 'When do you cook? (Adds indoor PM2.5)'}</p>

        {step === 0 && (
          <div>
            <div className="form-group">
              <label>PIN Code</label>
              <input type="text" value={data.location.pincode} onChange={e => updateField('location', 'pincode', e.target.value)} placeholder="110001" maxLength={6} pattern="[0-9]*" />
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '1rem' }}>Or use current location: <button className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }} onClick={() => navigator.geolocation.getCurrentPosition(p => updateField('location', 'lat', p.coords.latitude) || updateField('location', 'lon', p.coords.longitude))}>📍 Auto-detect</button></p>
          </div>
        )}

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label>Floor</label><select value={data.building.floor} onChange={e => updateField('building', 'floor', parseInt(e.target.value))}>{[...Array(20)].map((_,i) => <option key={i+1} value={i+1}>{i+1}</option>)}</select></div>
              <div className="form-group"><label>Area (m²)</label><input type="number" value={data.building.area} onChange={e => updateField('building', 'area', parseInt(e.target.value))} min="20" max="500" /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label>Purifier CADR (m³/hr)</label><input type="number" value={data.building.purifier_cadr} onChange={e => updateField('building', 'purifier_cadr', parseInt(e.target.value) || 0)} min="0" max="1000" placeholder="0 = none" /></div>
              <div className="form-group"><label>Purifier Zone</label><select value={data.building.purifier_zone} onChange={e => updateField('building', 'purifier_zone', e.target.value)}><option value="bedroom">Bedroom</option><option value="living">Living</option></select></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label>Occupants</label><input type="number" value={data.building.occupancy} onChange={e => updateField('building', 'occupancy', parseInt(e.target.value))} min="1" max="10" /></div>
              <div className="form-group"><label>Cooking/day</label><input type="number" value={data.building.cookingFreq} onChange={e => updateField('building', 'cookingFreq', parseFloat(e.target.value))} min="0" max="5" step="0.5" /></div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {['window_bedroom', 'window_living', 'window_kitchen', 'exhaust_kitchen', 'exhaust_bathroom', 'door_open', 'incense'].map(f => (
                <label key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input type="checkbox" checked={data.building[f]} onChange={e => updateField('building', f, e.target.checked)} />
                  {f.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {['hasChildren', 'priceSensitive', 'communityActive', 'canWfh'].map(f => (
              <label key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '1rem', background: '#0f172a', borderRadius: '10px', border: '1px solid #334155', transition: 'border-color 0.2s' }}>
                <input type="checkbox" checked={data.profile[f]} onChange={e => updateField('profile', f, e.target.checked)} style={{ width: '20px', height: '20px', accentColor: '#22d3ee' }} />
                <div>
                  <div style={{ fontWeight: 500 }}>{f.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {f === 'hasChildren' && 'Health framing priority'}
                    {f === 'priceSensitive' && 'Financial framing priority'}
                    {f === 'communityActive' && 'Social proof framing'}
                    {f === 'canWfh' && 'Enables WFH suggestions'}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.schedule.map((s, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
                <select value={s.zone} onChange={e => { const ns = [...data.schedule]; ns[i] = {...ns[i], zone: e.target.value}; setData({...data, schedule: ns}); }}><option value="kitchen">Kitchen</option><option value="living">Living</option></select>
                <select value={s.activity} onChange={e => { const ns = [...data.schedule]; ns[i] = {...ns[i], activity: e.target.value}; setData({...data, schedule: ns}); }}><option value="cooking">Cooking</option><option value="incense">Incense</option></select>
                <input type="number" value={s.start_hour} onChange={e => { const ns = [...data.schedule]; ns[i] = {...ns[i], start_hour: parseInt(e.target.value)}; setData({...data, schedule: ns}); }} min="0" max="23" placeholder="Hour (0-23)" style={{ width: '80px' }} />
                <input type="number" value={s.duration} onChange={e => { const ns = [...data.schedule]; ns[i] = {...ns[i], duration: parseFloat(e.target.value)}; setData({...data, schedule: ns}); }} min="0.5" max="4" step="0.5" placeholder="Hrs" style={{ width: '70px' }} />
                <button className="btn btn-ghost" onClick={() => { const ns = data.schedule.filter((_,j) => j !== i); setData({...data, schedule: ns}); }} style={{ padding: '0.5rem' }}>✕</button>
              </div>
            ))}
            <button className="btn btn-secondary" onClick={() => { const ns = [...data.schedule, {zone: 'kitchen', activity: 'cooking', start_hour: 8, duration: 1}]; setData({...data, schedule: ns}); }}>+ Add Activity</button>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
          <button className="btn btn-secondary" onClick={handleBack} disabled={step === 0} style={{ opacity: step === 0 ? 0.5 : 1 }}>← Back</button>
          <button className="btn btn-primary" onClick={handleNext} style={{ minWidth: '120px' }}>{step === STEPS.length - 1 ? '🚀 Generate Routine' : 'Next →'}</button>
        </div>
      </div>
    </div>
  );
}