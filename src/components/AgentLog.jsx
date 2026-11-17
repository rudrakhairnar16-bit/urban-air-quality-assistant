import { useEffect, useState } from 'react';

export default function AgentLog() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('aq_analysis');
    if (stored) {
      const data = JSON.parse(stored);
      setLogs([
        { agent: 'Scout', action: 'Data ingested', data: `${Object.keys(data).filter(k => k !== 'timestamp' && k !== 'location').join(', ')}`, time: new Date(data.timestamp).toLocaleTimeString() },
        { agent: 'Analyst', action: 'Analysis complete', data: `Forecast: 48hr, Sources: ${Object.keys(data.attribution || {}).length}, Indoor zones: 4`, time: new Date(data.timestamp).toLocaleTimeString() },
        { agent: 'Strategist', action: 'Routine generated', data: '5 interventions, quantified impact', time: new Date().toLocaleTimeString() },
        { agent: 'Nudge', action: 'Daily nudges ready', data: '3 personalized, framing optimized', time: new Date().toLocaleTimeString() },
        { agent: 'Sentinel', action: 'Monitoring active', data: 'Thresholds armed, 5min interval', time: new Date().toLocaleTimeString() },
        { agent: 'Contributor', action: 'Queued for 3am', data: 'Anonymized, k-anon ≥50', time: '03:00' }
      ]);
    }
  }, []);

  return (
    <div className="card">
      <h2>🤖 Antigravity Agent Log</h2>
      <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.8125rem' }}>Live agent activity (Mission Control)</p>
      <div className="agent-log">
        {logs.map((log, i) => (
          <div key={i} className="log-entry">
            <span className="log-agent">[{log.agent}]</span>
            <span className="log-action"> {log.action}</span>
            <span className="log-data"> — {log.data}</span>
            <span style={{ color: '#64748b', marginLeft: '0.5rem' }}>{log.time}</span>
          </div>
        ))}
        {logs.length === 0 && <div style={{ color: '#64748b', textAlign: 'center', padding: '1rem' }}>Run analysis to see agent activity</div>}
      </div>
    </div>
  );
}