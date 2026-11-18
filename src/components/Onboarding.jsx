import { useState } from 'react';
import {
  IconMapPin,
  IconHome,
  IconUser,
  IconCalendar,
  IconCheck,
  IconChevronRight,
  IconChevronLeft,
  IconShield
} from './Icons';

const STEPS = [
  { id: 'location', title: 'Location', desc: 'Hyperlocal Grid Centroid', icon: IconMapPin },
  { id: 'building', title: 'Residence', desc: '4-Zone Physical Model', icon: IconHome },
  { id: 'profile', title: 'Persona', desc: 'Psychological Framing', icon: IconUser },
  { id: 'schedule', title: 'Rhythm', desc: 'Diurnal Emission Peaks', icon: IconCalendar }
];

const DELHI_NCR_SECTORS = [
  { name: 'Connaught Place', pin: '110001', lat: 28.6315, lon: 77.2167 },
  { name: 'Anand Vihar', pin: '110092', lat: 28.6502, lon: 77.3150 },
  { name: 'Dwarka Sector 8', pin: '110075', lat: 28.5714, lon: 77.0689 },
  { name: 'Gurugram CyberHub', pin: '122002', lat: 28.4950, lon: 77.0895 },
  { name: 'Noida Sector 62', pin: '201309', lat: 28.6279, lon: 77.3621 }
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    location: { lat: 28.6139, lon: 77.2090, pincode: '110001' },
    building: {
      floor: 3,
      area: 80,
      window_bedroom: false,
      window_living: false,
      window_kitchen: true,
      exhaust_kitchen: true,
      exhaust_bathroom: true,
      purifier_cadr: 300,
      purifier_zone: 'bedroom',
      door_open: true,
      occupancy: 3,
      cookingFreq: 2,
      incense: false
    },
    profile: {
      userId: 'user_' + Math.random().toString(36).slice(2),
      hasChildren: false,
      priceSensitive: true,
      communityActive: false,
      canWfh: true
    },
    schedule: [
      { zone: 'kitchen', activity: 'cooking', start_hour: 8, duration: 1 },
      { zone: 'kitchen', activity: 'cooking', start_hour: 19, duration: 1.5 }
    ]
  });

  const progress = ((step + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else onComplete(data);
  };

  const handleBack = () => step > 0 && setStep(step - 1);

  const updateField = (section, field, value) => {
    setData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const selectPredefinedSector = (sec) => {
    setData((prev) => ({
      ...prev,
      location: { lat: sec.lat, lon: sec.lon, pincode: sec.pin }
    }));
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem 1.5rem',
      background: 'radial-gradient(circle at 50% 10%, rgba(34, 211, 238, 0.05) 0%, transparent 60%)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '580px',
        background: 'rgba(16, 22, 34, 0.78)',
        backdropFilter: 'blur(36px) saturate(190%)',
        WebkitBackdropFilter: 'blur(36px) saturate(190%)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 24px 64px rgba(0, 0, 0, 0.65)',
        padding: '2.25rem',
        position: 'relative'
      }}>
        {/* Apple Stepper Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            {STEPS.map((s, idx) => {
              const StepIcon = s.icon;
              const isPast = idx < step;
              const isCurrent = idx === step;
              return (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.4rem',
                    flex: 1,
                    position: 'relative'
                  }}
                >
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: isCurrent
                      ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))'
                      : isPast
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'rgba(255, 255, 255, 0.04)',
                    color: isCurrent ? '#07090e' : isPast ? 'var(--accent-emerald)' : 'var(--text-dim)',
                    border: `1px solid ${isCurrent ? 'var(--accent-cyan)' : isPast ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isCurrent ? '0 0 16px rgba(34, 211, 238, 0.4)' : 'none',
                    transition: 'all 0.25s ease'
                  }}>
                    {isPast ? <IconCheck size={18} /> : <StepIcon size={17} />}
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? 'var(--text-main)' : 'var(--text-dim)',
                    letterSpacing: '0.02em'
                  }}>
                    {s.title}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress Bar Track */}
          <div style={{ height: '3px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))',
              transition: 'width 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
            }} />
          </div>
        </div>

        {/* Step Context Title */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
            Step {step + 1} of {STEPS.length} • {STEPS[step].desc}
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-main)' }}>
            {step === 0 && 'Specify Hyperlocal Grid Centroid'}
            {step === 1 && 'Configure Residence Spatial Physics'}
            {step === 2 && 'Personalize Psychological Framing'}
            {step === 3 && 'Calibrate Diurnal Cooking Rhythm'}
          </h2>
        </div>

        {/* STEP 1: HYPERLOCAL LOCATION */}
        {step === 0 && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                Postal PIN Code (Hyperlocal Centroid)
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '0.75rem 1rem'
              }}>
                <IconMapPin size={18} color="var(--accent-cyan)" />
                <input
                  type="text"
                  value={data.location.pincode}
                  onChange={(e) => updateField('location', 'pincode', e.target.value)}
                  placeholder="e.g. 110001"
                  maxLength={6}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--text-main)',
                    fontSize: '1rem',
                    fontWeight: 600,
                    width: '100%',
                    fontVariantNumeric: 'tabular-nums'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.65rem' }}>
                Delhi-NCR Inversion Hotspots
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {DELHI_NCR_SECTORS.map((sec) => (
                  <button
                    key={sec.name}
                    type="button"
                    onClick={() => selectPredefinedSector(sec)}
                    style={{
                      padding: '0.45rem 0.85rem',
                      background: data.location.pincode === sec.pin ? 'rgba(34, 211, 238, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${data.location.pincode === sec.pin ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                      borderRadius: '999px',
                      color: data.location.pincode === sec.pin ? 'var(--accent-cyan)' : 'var(--text-muted)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {sec.name} ({sec.pin})
                  </button>
                ))}
              </div>
            </div>

            <div style={{
              padding: '0.85rem 1rem',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>GPS Satellite Triangulation</span>
              <button
                type="button"
                className="btn-linear btn-linear-secondary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                      updateField('location', 'lat', pos.coords.latitude);
                      updateField('location', 'lon', pos.coords.longitude);
                    });
                  }
                }}
              >
                Auto-Detect
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SPATIAL PHYSICS */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Sliders Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '0.85rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Floor Level</span>
                  <strong style={{ color: 'var(--accent-cyan)' }}>{data.building.floor}th Floor</strong>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={data.building.floor}
                  onChange={(e) => updateField('building', 'floor', parseInt(e.target.value))}
                  className="bento-slider"
                />
              </div>

              <div style={{ padding: '0.85rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Apartment Area</span>
                  <strong style={{ color: 'var(--text-main)' }}>{data.building.area} m²</strong>
                </div>
                <input
                  type="range"
                  min="30"
                  max="350"
                  step="5"
                  value={data.building.area}
                  onChange={(e) => updateField('building', 'area', parseInt(e.target.value))}
                  className="bento-slider"
                />
              </div>
            </div>

            {/* CADR Selector Chips */}
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                HEPA / DIY Box Filtration Capacity (CADR)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {[
                  { label: 'None', val: 0 },
                  { label: '150 m³/h', val: 150 },
                  { label: '300 m³/h', val: 300 },
                  { label: '450 m³/h', val: 450 }
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => updateField('building', 'purifier_cadr', item.val)}
                    style={{
                      padding: '0.6rem 0.4rem',
                      background: data.building.purifier_cadr === item.val ? 'rgba(34, 211, 238, 0.12)' : 'rgba(255, 255, 255, 0.025)',
                      border: `1px solid ${data.building.purifier_cadr === item.val ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                      borderRadius: 10,
                      color: data.building.purifier_cadr === item.val ? 'var(--accent-cyan)' : 'var(--text-muted)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Apple Home Style Switch Tiles */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              {[
                { field: 'exhaust_kitchen', label: 'Kitchen Exhaust' },
                { field: 'exhaust_bathroom', label: 'Bathroom Exhaust' },
                { field: 'window_bedroom', label: 'Bedroom Window' },
                { field: 'incense', label: 'Incense / Dhoop' }
              ].map(({ field, label }) => (
                <div
                  key={field}
                  style={{
                    padding: '0.75rem 0.85rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 10,
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>{label}</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={data.building[field]}
                      onChange={(e) => updateField('building', field, e.target.checked)}
                    />
                    <span className="slider-toggle" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: PERSONA FRAMING */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              {
                field: 'hasChildren',
                title: 'Family Sanctuary Protection',
                desc: 'Prioritizes pediatric exposure thresholds & WHO Tier 1 compliance (<15 µg/m³).'
              },
              {
                field: 'priceSensitive',
                title: 'Cost & Energy Optimization',
                desc: 'Focuses on minimizing electricity bills and maximizing transit modal savings (₹).'
              },
              {
                field: 'communityActive',
                title: 'Civic Mesh Leadership',
                desc: 'Contributes to federated neighborhood 1km k-anonymized dispersion modeling.'
              },
              {
                field: 'canWfh',
                title: 'Dynamic Remote Schedule',
                desc: 'Tailors midday solar ventilation slots during lower outdoor ambient concentrations.'
              }
            ].map(({ field, title, desc }) => {
              const active = data.profile[field];
              return (
                <div
                  key={field}
                  onClick={() => updateField('profile', field, !active)}
                  style={{
                    padding: '1rem',
                    background: active ? 'rgba(34, 211, 238, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${active ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                    borderRadius: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.85rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    border: `1.5px solid ${active ? 'var(--accent-cyan)' : 'var(--text-dim)'}`,
                    background: active ? 'var(--accent-cyan)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 2
                  }}>
                    {active && <IconCheck size={14} color="#07090e" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: active ? 'var(--text-main)' : 'var(--text-muted)' }}>
                      {title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.15rem' }}>
                      {desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* STEP 4: COOKING RHYTHM */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <IconShield size={16} color="var(--accent-rose)" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-rose)' }}>Indoor Emission Notice</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Unvented frying releases up to <strong>1,200 µg/h PM2.5</strong> into the kitchen, which rapidly migrates into living areas and bedrooms unless depressurized.
              </p>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Cooking Frequency</span>
                <strong style={{ color: 'var(--accent-cyan)' }}>{data.building.cookingFreq} meals/day</strong>
              </div>
              <input
                type="range"
                min="0"
                max="4"
                step="0.5"
                value={data.building.cookingFreq}
                onChange={(e) => updateField('building', 'cookingFreq', parseFloat(e.target.value))}
                className="bento-slider"
              />
            </div>

            <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Apartment Occupancy</span>
                <strong style={{ color: 'var(--text-main)' }}>{data.building.occupancy} Residents</strong>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                value={data.building.occupancy}
                onChange={(e) => updateField('building', 'occupancy', parseInt(e.target.value))}
                className="bento-slider"
              />
            </div>
          </div>
        )}

        {/* Apple Assistant Bottom Action Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '2rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          {step > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              className="btn-linear btn-linear-secondary"
              style={{ gap: '0.4rem', padding: '0.65rem 1.15rem' }}
            >
              <IconChevronLeft size={16} /> Back
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={handleNext}
            className="btn-linear btn-linear-primary"
            style={{ gap: '0.5rem', padding: '0.65rem 1.5rem', fontWeight: 700 }}
          >
            {step === STEPS.length - 1 ? 'Launch Assistant' : 'Continue'} <IconChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
