import { IconCpu } from './Icons';

export default function AgentLog() {
  const agents = [
    { name: 'Scout', schedule: '*/15m cron', role: 'CPCB, OWM & Sentinel-5P Ingestion', type: 'background', pulse: '#10b981' },
    { name: 'Analyst', schedule: 'On-Demand', role: 'CMB Receptor Model & 4-Zone Physics', type: 'ephemeral', pulse: '#22d3ee' },
    { name: 'Strategist', schedule: 'On-Demand', role: 'Thompson Sampling & Gaussian Dispersion', type: 'ephemeral', pulse: '#a855f7' },
    { name: 'Nudge', schedule: '06:00 Daily', role: 'Behavioral Context Bandit Learning', type: 'background', pulse: '#f59e0b' },
    { name: 'Sentinel', schedule: '*/5m (6-22h)', role: 'Threshold Alerts & Real-Time Monitor', type: 'background', pulse: '#10b981' },
    { name: 'Contributor', schedule: '03:00 Nightly', role: 'Zero-PII k-Anonymized Mesh Sharing', type: 'background', pulse: '#38bdf8' }
  ];

  return (
    <div className="bento-card">
      <div className="bento-card-header">
        <div className="bento-title-group">
          <div className="bento-icon-box">
            <IconCpu size={17} />
          </div>
          <div>
            <div className="bento-title">Mission Control Swarm</div>
            <div className="bento-subtitle">6 Autonomous Antigravity Agents (Schema v1.0)</div>
          </div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.72rem',
          color: 'var(--accent-emerald)',
          background: 'rgba(16, 185, 129, 0.08)',
          padding: '0.2rem 0.6rem',
          borderRadius: 'var(--radius-capsule)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          fontFamily: '-apple-system, monospace'
        }}>
          <span className="agent-dot-pulse" /> SWARM SYNCED
        </div>
      </div>

      <div className="mission-control-dock">
        {agents.map((agent) => (
          <div key={agent.name} className="agent-status-pill">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-main)' }}>{agent.name}</span>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: agent.pulse, boxShadow: `0 0 8px ${agent.pulse}` }} />
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--accent-cyan)', fontFamily: '-apple-system, monospace' }}>
              {agent.schedule} • {agent.type}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: '1.3', marginTop: '0.2rem' }}>
              {agent.role}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '0.85rem',
        padding: '0.6rem 0.85rem',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.68rem',
        color: 'var(--text-dim)',
        fontFamily: '-apple-system, monospace'
      }}>
        <span>Stores: aq_latest (30m) • aq_analysis (1h) • aq_strategy (24h)</span>
        <span style={{ color: 'var(--accent-emerald)' }}>k-anon ≥ 50</span>
      </div>
    </div>
  );
}
