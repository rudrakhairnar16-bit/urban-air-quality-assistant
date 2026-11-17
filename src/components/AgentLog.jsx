import { IconCpu } from './Icons';

export default function AgentLog() {
  const agents = [
    { name: 'Scout', schedule: '*/15m', role: 'Multi-source Ingestion (CPCB, OWM, S-5P)', status: 'Active', pulse: '#10b981' },
    { name: 'Analyst', schedule: 'On Demand', role: 'CMB Receptor Model & 4-Zone Physics', status: 'Ready', pulse: '#22d3ee' },
    { name: 'Strategist', schedule: 'On Demand', role: 'Thompson Sampling & Gaussian Dispersion', status: 'Ready', pulse: '#a855f7' },
    { name: 'Nudge', schedule: '06:00 Daily', role: 'Behavioral Context Bandit Learning', status: 'Armed', pulse: '#f59e0b' },
    { name: 'Sentinel', schedule: '*/5m (6-22h)', role: 'Threshold Alerts & Real-Time Monitor', status: 'Monitoring', pulse: '#10b981' },
    { name: 'Contributor', schedule: '03:00 Nightly', role: 'Zero-PII k-Anonymized Delta Sharing', status: 'Queued', pulse: '#38bdf8' }
  ];

  return (
    <div className="bento-card">
      <div className="bento-card-header">
        <div className="bento-title-group">
          <div className="bento-icon-box">
            <IconCpu size={18} />
          </div>
          <div>
            <div className="bento-title">Mission Control Swarm</div>
            <div className="bento-subtitle">6 Autonomous Antigravity Agents</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.08)', padding: '0.2rem 0.6rem', borderRadius: '999px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
          <span className="agent-dot-pulse" /> Swarm Synced
        </div>
      </div>

      <div className="mission-control-dock">
        {agents.map((agent) => (
          <div key={agent.name} className="agent-status-pill">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>{agent.name}</span>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: agent.pulse, boxShadow: `0 0 8px ${agent.pulse}` }} />
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>{agent.schedule}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.3', marginTop: '0.2rem' }}>{agent.role}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
