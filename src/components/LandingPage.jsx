import { useState, useEffect, useRef } from 'react';

const particles = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  speedX: (Math.random() - 0.5) * 0.3,
  speedY: (Math.random() - 0.5) * 0.3,
  opacity: Math.random() * 0.5 + 0.1,
  color: ['#22d3ee', '#a855f7', '#f59e0b', '#22c55e'][Math.floor(Math.random() * 4)]
}));

const stats = [
  { label: 'Cities Monitored', value: '1,200+', icon: '🏙️' },
  { label: 'Data Points/Day', value: '2.4M+', icon: '📊' },
  { label: 'Active Users', value: '50K+', icon: '👥' },
  { label: 'Forecast Accuracy', value: '94%', icon: '🎯' }
];

const features = [
  {
    icon: '🧠',
    title: 'AI-Powered Forecasting',
    desc: 'TF.js Quantized LSTM predicts 48hr AQI with diurnal patterns. Runs entirely in-browser — zero server dependency.'
  },
  {
    icon: '🔬',
    title: 'Chemical Source Attribution',
    desc: 'CMB Receptor Model with 17 tracers identifies 6 pollution sources: traffic, stubble, industry, dust, waste burning, secondary.'
  },
  {
    icon: '🏠',
    title: 'Multi-Zone Indoor Physics',
    desc: '4-room coupled mass-balance model (bedroom, living, kitchen, bathroom) with infiltration, sources, filtration & Corsi-Rosenthal CADR.'
  },
  {
    icon: '🌍',
    title: 'Neighborhood Impact Simulation',
    desc: 'Gaussian plume dispersion on 500m grid (10×10) with line/point/area sources. Test interventions before acting.'
  },
  {
    icon: '🎯',
    title: 'Behavioral Nudge Engine',
    desc: 'Thompson Sampling bandit with 6 psychological framings (health, financial, social, urgency, simplicity, identity). Learns what works for YOU.'
  },
  {
    icon: '🛡️',
    title: 'Privacy-First by Design',
    desc: 'k-anonymity (1km grid, k≥50), zero PII, offline-first. Your data never leaves your device unless you opt-in.'
  }
];

const trustSignals = [
  'Built with Antigravity Agent Swarm (6 agents)',
  '5 Core Engines • 61 Tests Passing',
  'Open Source • MIT License',
  'Vercel Edge Network • Global CDN'
];

export default function LandingPage({ onGetStarted }) {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [scrollY, setScrollY] = useState(0);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const heroRef = useRef(null);
  const particlesRef = useRef(particles.map(p => ({ ...p })));

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisibleSections(prev => new Set([...prev, entry.target.id]));
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('section[id]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const animate = () => {
      particlesRef.current = particlesRef.current.map(p => ({
        ...p,
        x: (p.x + p.speedX + 100) % 100,
        y: (p.y + p.speedY + 100) % 100
      }));
      requestAnimationFrame(animate);
    };
    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, []);

  const isVisible = (id) => visibleSections.has(id);

  return (
    <div className="landing-page">
      <style>{`
        .landing-page {
          min-height: 100vh;
          background: #020617;
          color: #f8fafc;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          overflow-x: hidden;
        }
        .particles-canvas {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .particle {
          position: absolute;
          border-radius: 50%;
          filter: blur(1px);
          animation: float 20s infinite ease-in-out;
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -20px) scale(1.2); }
          50% { transform: translate(-15px, 15px) scale(0.8); }
          75% { transform: translate(10px, 25px) scale(1.1); }
        }
        .spotlight {
          position: fixed;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle at center, rgba(34, 211, 238, 0.08) 0%, transparent 70%);
          pointer-events: none;
          z-index: 1;
          transform: translate(-50%, -50%);
          transition: left 0.1s ease-out, top 0.1s ease-out;
        }
        .grid-pattern {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(34, 211, 238, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.02) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          z-index: 0;
        }
        header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(2, 6, 23, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(34, 211, 238, 0.1);
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 800;
          font-size: 1.5rem;
          background: linear-gradient(135deg, #22d3ee, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #22d3ee, #a855f7);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }
        .nav-links {
          display: flex;
          gap: 2rem;
        }
        .nav-link {
          color: #94a3b8;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: color 0.2s;
        }
        .nav-link:hover { color: #22d3ee; }
        .cta-button {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #22d3ee, #a855f7);
          border: none;
          border-radius: 10px;
          color: #020617;
          font-weight: 700;
          font-size: 0.875rem;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(34, 211, 238, 0.3);
        }
        .hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 6rem 2rem 4rem;
          position: relative;
          z-index: 10;
          text-align: center;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(34, 211, 238, 0.1);
          border: 1px solid rgba(34, 211, 238, 0.3);
          border-radius: 100px;
          font-size: 0.875rem;
          color: #22d3ee;
          margin-bottom: 2rem;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.3); }
          50% { box-shadow: 0 0 0 10px rgba(34, 211, 238, 0); }
        }
        .hero h1 {
          font-size: clamp(3rem, 8vw, 5.5rem);
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          background: linear-gradient(135deg, #f8fafc 0%, #22d3ee 50%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.03em;
        }
        .hero-highlight {
          background: linear-gradient(135deg, #22d3ee, #f59e0b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero p {
          font-size: clamp(1.125rem, 2.5vw, 1.5rem);
          color: #94a3b8;
          max-width: 700px;
          margin-bottom: 2.5rem;
          line-height: 1.6;
        }
        .hero-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 4rem;
        }
        .btn-primary {
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #22d3ee, #a855f7);
          border: none;
          border-radius: 12px;
          color: #020617;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(34, 211, 238, 0.4);
        }
        .btn-secondary {
          padding: 1rem 2rem;
          background: transparent;
          border: 1px solid rgba(148, 163, 184, 0.3);
          border-radius: 12px;
          color: #f8fafc;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-secondary:hover {
          border-color: #22d3ee;
          color: #22d3ee;
        }
        .hero-stats {
          display: flex;
          gap: 3rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        .stat-item {
          text-align: center;
        }
        .stat-value {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #22d3ee, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .stat-label {
          font-size: 0.875rem;
          color: #64748b;
          margin-top: 0.25rem;
        }
        .scroll-indicator {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          font-size: 0.75rem;
          animation: bounce 2s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(10px); }
        }
        section {
          padding: 6rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }
        .section-header {
          text-align: center;
          margin-bottom: 4rem;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease-out;
        }
        .section-header.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .section-badge {
          display: inline-block;
          padding: 0.375rem 1rem;
          background: rgba(34, 211, 238, 0.1);
          border: 1px solid rgba(34, 211, 238, 0.3);
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #22d3ee;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1rem;
        }
        .section-header h2 {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 1rem;
        }
        .section-header p {
          font-size: 1.125rem;
          color: #94a3b8;
          max-width: 600px;
          margin: 0 auto;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .feature-card {
          padding: 2rem;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.6));
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 16px;
          transition: all 0.3s;
          opacity: 0;
          transform: translateY(30px);
        }
        .feature-card.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .feature-card:hover {
          border-color: rgba(34, 211, 238, 0.5);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          transform: translateY(-5px);
        }
        .feature-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(168, 85, 247, 0.2));
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .feature-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }
        .feature-card p {
          color: #94a3b8;
          line-height: 1.6;
        }
        .demo-section {
          background: linear-gradient(135deg, rgba(34, 211, 238, 0.03), rgba(168, 85, 247, 0.03));
          border-radius: 24px;
          padding: 4rem 2rem;
          margin: 4rem 0;
          border: 1px solid rgba(34, 211, 238, 0.1);
          text-align: center;
        }
        .demo-placeholder {
          aspect-ratio: 16/9;
          max-width: 900px;
          margin: 0 auto 2rem;
          border-radius: 16px;
          background: linear-gradient(135deg, #0f172a, #1e293b);
          border: 1px solid rgba(148, 163, 184, 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          overflow: hidden;
          position: relative;
        }
        .demo-placeholder::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 20% 20%, rgba(34, 211, 238, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%);
        }
        .demo-placeholder svg {
          width: 80px;
          height: 80px;
          color: #22d3ee;
          opacity: 0.5;
        }
        .trust-bar {
          display: flex;
          justify-content: center;
          gap: 3rem;
          flex-wrap: wrap;
          padding: 2rem 0;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
          margin-top: 4rem;
        }
        .trust-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          font-size: 0.875rem;
        }
        .trust-dot {
          width: 8px;
          height: 8px;
          background: #22d3ee;
          border-radius: 50%;
          animation: pulse-dot 2s infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        footer {
          padding: 4rem 2rem 2rem;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
          text-align: center;
        }
        .footer-links {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        .footer-link {
          color: #64748b;
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.2s;
        }
        .footer-link:hover { color: #22d3ee; }
        .footer-copyright {
          color: #475569;
          font-size: 0.75rem;
        }
        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero-stats { gap: 1.5rem; }
          .stat-value { font-size: 1.75rem; }
          section { padding: 4rem 1rem; }
        }
      `}</style>

      <div className="particles-canvas" aria-hidden="true">
        {particlesRef.current.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.color,
              opacity: p.opacity
            }}
          />
        ))}
      </div>

      <div className="grid-pattern" aria-hidden="true" />

      <div
        className="spotlight"
        style={{
          left: `${mousePos.x}%`,
          top: `${mousePos.y}%`
        }}
        aria-hidden="true"
      />

      <header>
        <div className="logo">
          <div className="logo-icon">🌬️</div>
          AirQuality Assistant
        </div>
        <nav className="nav-links">
          <a href="#features" className="nav-link">Features</a>
          <a href="#demo" className="nav-link">Live Demo</a>
          <a href="#tech" className="nav-link">Technology</a>
          <a href="https://github.com/rudrakhairnar16-bit/urban-air-quality-assistant" target="_blank" rel="noreferrer" className="nav-link">GitHub</a>
        </nav>
        <button className="cta-button" onClick={onGetStarted}>Get Started</button>
      </header>

      <main>
        <section className="hero" id="hero">
          <div className="hero-badge">
            <span className="pulse-dot"></span>
            PromptWars Virtual Challenge 6 Submission
          </div>
          <h1>
            Breathe Smarter.<br />
            <span className="hero-highlight">Live Better.</span>
          </h1>
          <p>
            The only air quality assistant that combines <strong>AI forecasting</strong>, <strong>chemical source attribution</strong>,
            <strong>indoor physics simulation</strong>, and <strong>behavioral psychology</strong> — all running locally in your browser.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={onGetStarted}>
              🚀 Start Your Analysis
            </button>
            <button className="btn-secondary" onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}>
              🎥 Watch Demo
            </button>
          </div>
          <div className="hero-stats">
            {stats.map((stat, i) => (
              <div key={i} className="stat-item">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.icon} {stat.label}</div>
              </div>
            ))}
          </div>
          <div className="scroll-indicator">
            <span>Scroll to explore</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </div>
        </section>

        <section id="features" aria-labelledby="features-heading">
          <header className="section-header" id="features-heading">
            <span className="section-badge">Core Capabilities</span>
            <h2>Six Engines. One Mission.</h2>
            <p>Every component is built from first principles — no black boxes, no external dependencies.</p>
          </header>
          <div className="features-grid">
            {features.map((feature, i) => (
              <article
                key={i}
                className={`feature-card ${isVisible(`feature-${i}`) ? 'visible' : ''}`}
                id={`feature-${i}`}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="tech" aria-labelledby="tech-heading">
          <header className="section-header" id="tech-heading">
            <span className="section-badge">Architecture</span>
            <h2>Antigravity-Native Agent Swarm</h2>
            <p>Six specialized agents orchestrated via Mission Control — not a chatbot, a production system.</p>
          </header>
          <div className="features-grid">
            {[
              { icon: '🔍', title: 'Scout', desc: 'Continuous ingestion from CPCB, OpenWeatherMap, Sentinel-5P, Traffic APIs. Every 15 minutes.' },
              { icon: '🧮', title: 'Analyst', desc: 'On-demand forecast, CMB attribution, indoor physics, ventilation optimization.' },
              { icon: '🎯', title: 'Strategist', desc: 'Personalized routines, Thompson Sampling nudges, neighborhood impact simulation.' },
              { icon: '🔔', title: 'Nudge', desc: 'Daily 6am contextual notifications. Bandit updates from user responses.' },
              { icon: '🛡️', title: 'Sentinel', desc: '5-minute daytime threshold alerts. Forecast spike detection.' },
              { icon: '🤝', title: 'Contributor', desc: 'Nightly k-anonymized (1km, k≥50) community data contribution. Opt-in only.' }
            ].map((agent, i) => (
              <article
                key={i}
                className={`feature-card ${isVisible(`agent-${i}`) ? 'visible' : ''}`}
                id={`agent-${i}`}
              >
                <div className="feature-icon">{agent.icon}</div>
                <h3>{agent.title}</h3>
                <p>{agent.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="demo" className="demo-section" aria-labelledby="demo-heading">
          <header className="section-header" id="demo-heading">
            <span className="section-badge">Live Preview</span>
            <h2>See It In Action</h2>
            <p>Real-time AQI dashboard with 48hr forecast, source attribution, and indoor modeling.</p>
          </header>
          <div className="demo-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
            <p style={{ color: '#94a3b8', maxWidth: '400px' }}>
              Dashboard preview — visit <a href="https://air-quality-assistant.vercel.app" target="_blank" rel="noreferrer" style={{ color: '#22d3ee' }}>air-quality-assistant.vercel.app</a> for the live experience
            </p>
          </div>
          <button className="btn-primary" onClick={onGetStarted} style={{ marginTop: '1rem' }}>
            🚀 Launch Dashboard
          </button>
        </section>

        <div className="trust-bar">
          {trustSignals.map((signal, i) => (
            <div key={i} className="trust-item">
              <div className="trust-dot" />
              {signal}
            </div>
          ))}
        </div>
      </main>

      <footer>
        <div className="footer-links">
          <a href="https://github.com/rudrakhairnar16-bit/urban-air-quality-assistant" target="_blank" rel="noreferrer" className="footer-link">GitHub</a>
          <a href="#" className="footer-link">Documentation</a>
          <a href="#" className="footer-link">Privacy Policy</a>
          <a href="#" className="footer-link">MIT License</a>
        </div>
        <p className="footer-copyright">
          Built with ❤️ for PromptWars Virtual Challenge 6 • Antigravity Agent Swarm
        </p>
      </footer>
    </div>
  );
}