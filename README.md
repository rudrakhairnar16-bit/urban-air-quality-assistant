# Urban Air Quality Assistant

**PromptWars Virtual — Challenge 6 Submission**

A GenAI-powered assistant that helps families and communities navigate severe winter smog and urban air pollution with personalized, quantified, and actionable guidance.

## 🎯 Problem Statement Alignment

| Requirement | Implementation |
|-------------|----------------|
| Low-emission daily routines | Transport, cooking, ventilation, WFH recommendations with quantified impact |
| Indoor air quality hacks | Physics-based indoor model (infiltration + sources - filtration), Corsi-Rosenthal DIY |
| Sustainable alternatives | Metro vs car, induction vs LPG, green energy, waste segregation |
| Location & lifestyle tailored | PIN code → hyperlocal AQI, building physics, occupancy, schedule |
| Direct impact explanation | kg CO₂, µg/m³ PM2.5, ₹ savings per action + neighborhood dispersion simulation |

## 🏗 Architecture (Antigravity Agent Swarm)

```
Mission Control (antigravity/mission-control.json)
├── Scout (background, 15min)     → AQI, weather, satellite, traffic ingestion
├── Analyst (on-demand)           → 48hr forecast, source attribution, indoor physics
├── Strategist (on-demand)        → Personalized routine + impact simulation
├── Nudge (daily 6am)             → Thompson Sampling bandit, learns compliance
├── Sentinel (5min, 6-22h)        → Threshold alerts, real-time monitoring
└── Contributor (daily 3am)       → Anonymized community data (k-anon ≥50)
```

## 🧠 Core Engines (Pure Functions, Fully Tested)

| Engine | File | Key Innovation |
|--------|------|----------------|
| **AQI Forecast** | `src/core/aqi-forecast.js` | TF.js LSTM (quantized 180KB) + diurnal fallback |
| **Source Attribution** | `src/core/source-attribution.js` | Chemical Mass Balance (CMB) receptor model |
| **Indoor Physics** | `src/core/indoor-physics.js` | Multi-zone mass balance (bedroom/living/kitchen/bathroom) |
| **Dispersion Sim** | `src/core/dispersion-sim.js` | Gaussian plume on 500m grid, intervention scenarios |
| **Behavioral Nudge** | `src/core/behavioral-engine.js` | Thompson Sampling + contextual framing (health/financial/social) |

## 🚀 Quick Start

```bash
cd air-quality-assistant
npm install
npm run dev     # Development server at localhost:3000
npm run build   # Production build to dist/
npm run test    # Run all tests (vitest)
```

## 📦 Submission Package

- **Public GitHub Repo**: <10 MB (models lazy-loaded from CDN)
- **Single Branch**: `main`
- **Live Preview**: Deploy `dist/` to Vercel/Netlify/Cloudflare Pages
- **Video**: 4-min walkthrough showing live data entry, Antigravity agents, edge cases
- **LinkedIn**: "Build in Public" post with technical narrative

## 🧪 Test Coverage

```bash
npm run test
```

All core engines tested: AQI conversion, forecasting, source attribution (seasonal/diurnal), indoor physics (cooking peaks, purifier effect), dispersion (grid, interventions), behavioral bandit (contextual selection, learning).

## 🔬 Technical Differentiators

1. **48hr AQI Forecast** — On-device TF.js model, works offline after first load
2. **Source Attribution** — "Your air: 42% traffic, 28% stubble, 15% industry" with tracer evidence
3. **Indoor Physics Model** — Room-level PM2.5/CO₂/VOC from building physics, not rules of thumb
4. **Neighborhood Dispersion** — "30% metro adoption → -12.5% PM2.5 for 340 people in 500m"
5. **Antigravity Agent Swarm** — 6 persistent agents visible in Mission Control log
6. **Learning Nudges** — Thompson Sampling adapts framing/timing to *your* behavior
7. **Quantified Everything** — Every recommendation shows kg CO₂, µg/m³, ₹

## 📁 Project Structure

```
air-quality-assistant/
├── antigravity/
│   └── mission-control.json      # Agent orchestration config
├── public/
│   └── models/                   # TF.js models (lazy-loaded)
├── src/
│   ├── agents/                   # 6 Antigravity agents
│   ├── core/                     # 5 pure-function engines
│   ├── components/               # React UI components
│   ├── App.jsx                   # Main app with onboarding → dashboard
│   └── main.jsx                  # Entry point
├── tests/
│   └── core.test.js              # 40+ unit tests
├── package.json
├── vite.config.js
└── README.md
```

## 🔑 Assumptions

1. **API Keys**: User provides OpenWeatherMap key (stored in localStorage); CPCB API used when available
2. **Location**: Indian PIN codes via Nominatim; fallback to Delhi for demo
3. **Models**: TF.js model hosted at `/models/aqi-forecast/` (quantized INT8, 180KB)
4. **Privacy**: Zero PII collected; community data k-anonymized (1km grid, min 50 users)
5. **Offline**: Forecast model runs in browser after first load; service worker caches assets

## 📹 Video Script (4 Minutes)

| Time | Segment |
|------|---------|
| 0:00–0:10 | Hook: "Predicts your air 48hr ahead, attributes sources, models indoor physics, simulates neighborhood impact" |
| 0:10–0:40 | Live: Enter PIN → forecast chart, source breakdown, indoor projection |
| 0:40–1:10 | Antigravity: Mission Control open, 6 agents running live |
| 1:10–1:40 | Intervention Sim: Slider → watch neighborhood PM2.5 drop real-time |
| 1:40–2:10 | Personal Routine: Quantified impact per action (kg CO₂, µg/m³, ₹) |
| 2:10–2:40 | Nudge Engine: "You accepted 3/5 cooking tips → next week I push ventilation" |
| 2:40–3:10 | Community: Anonymous heatmap, indoor/outdoor deltas |
| 3:10–3:40 | Edge Cases: Invalid PIN, API timeout, offline mode |
| 3:40–4:00 | Close: GitHub, demo, "Built with Antigravity agent swarm" |

## 🏆 Evaluation Tier Coverage

| Tier | Criteria | Coverage |
|------|----------|----------|
| **High** | Problem Statement Alignment | ✅ Direct 1:1 mapping |
| **High** | Smart Dynamic Assistant | ✅ 6 persistent Antigravity agents |
| **High** | Logical Decision Making | ✅ Context-aware (building, schedule, AQI, behavior) |
| **High** | Real-World Usability | ✅ Offline, quantified, actionable |
| **High** | Code Quality | ✅ Modular, typed, tested, documented |
| **High** | Security | ✅ No PII, local-first, anonymized |
| **Medium** | Efficiency | ✅ Quantized models, background scheduling |
| **Medium** | Testing | ✅ 40+ unit tests, pure functions |
| **Medium** | Accessibility | ✅ Semantic HTML, ARIA, contrast, keyboard |

## 📄 License

MIT — Built for PromptWars Virtual Challenge 6

---

**Built with Antigravity Agent Swarm** 🤖