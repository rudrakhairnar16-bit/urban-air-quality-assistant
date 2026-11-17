/**
 * Antigravity Integration Tests — Agent Contracts & Data Flow
 * Validates mission-control.json ↔ agent I/O contracts
 * Run: npx vitest run tests/integration.antigravity.test.js
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import { scoutAgent } from '../src/agents/scout.agent.js';
import { analystAgent } from '../src/agents/analyst.agent.js';
import { strategistAgent } from '../src/agents/strategist.agent.js';
import { nudgeAgent } from '../src/agents/nudge.agent.js';
import { sentinelAgent } from '../src/agents/sentinel.agent.js';
import { contributorAgent } from '../src/agents/contributor.agent.js';

const localStorageMock = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, value) { this.store[key] = value.toString(); },
  removeItem(key) { delete this.store[key]; },
  clear() { this.store = {}; }
};
global.localStorage = localStorageMock;

// Load mission-control.json for contract validation
const missionControl = JSON.parse(
  readFileSync(resolve('antigravity/mission-control.json'), 'utf-8')
);

describe('Antigravity Integration — Mission Control Contracts', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T08:00:00Z'));
  });

  describe('Schema Validation', () => {
    it('mission-control.json has valid v1.0 structure', () => {
      expect(missionControl.version).toBe('1.0');
      expect(missionControl.project).toBe('urban-air-quality-assistant');
      expect(missionControl.agents).toHaveLength(6);
      expect(missionControl.orchestration).toBeDefined();
      expect(missionControl.data_stores).toBeDefined();
      expect(missionControl.configuration).toBeDefined();
    });

    it('all 6 agents have required fields', () => {
      const required = ['id', 'file', 'schedule', 'persistence', 'dependencies', 'outputs', 'triggers'];
      missionControl.agents.forEach(agent => {
        required.forEach(field => expect(agent).toHaveProperty(field));
      });
    });

    it('agent IDs match expected set (sorted)', () => {
      const expectedIds = ['analyst', 'contributor', 'nudge', 'scout', 'sentinel', 'strategist'].sort();
      const actualIds = missionControl.agents.map(a => a.id).sort();
      expect(actualIds).toEqual(expectedIds);
    });
  });

  describe('Orchestration DAG', () => {
    it('linear pipeline: scout → analyst → strategist → nudge', () => {
      const flow = missionControl.orchestration.flow;
      expect(flow).toContain('scout -> analyst -> strategist');
      expect(flow).toContain('strategist -> nudge');
    });

    it('parallel watchers: scout → sentinel, analyst → contributor', () => {
      const flow = missionControl.orchestration.flow;
      expect(flow).toContain('scout -> sentinel');
      expect(flow).toContain('analyst -> contributor');
    });

    it('parallel group declared', () => {
      expect(missionControl.orchestration.parallel).toEqual(
        expect.arrayContaining(['nudge', 'sentinel', 'contributor'])
      );
    });

    it('no circular dependencies', () => {
      const graph = {};
      missionControl.agents.forEach(a => { graph[a.id] = a.dependencies; });

      function hasCycle(node, visited = new Set(), stack = new Set()) {
        visited.add(node);
        stack.add(node);
        for (const dep of graph[node] || []) {
          if (!visited.has(dep)) {
            if (hasCycle(dep, visited, stack)) return true;
          } else if (stack.has(dep)) return true;
        }
        stack.delete(node);
        return false;
      }

      for (const agent of missionControl.agents) {
        expect(hasCycle(agent.id)).toBe(false);
      }
    });
  });

  describe('Data Store Contracts', () => {
    it('5 data stores with correct TTLs', () => {
      const stores = missionControl.data_stores;
      expect(stores.aq_latest.ttl).toBe(1800000); // 30min
      expect(stores.aq_history.max_entries).toBe(200);
      expect(stores.aq_analysis.ttl).toBe(3600000); // 1hr
      expect(stores.aq_strategy.ttl).toBe(86400000); // 24hr
      expect(stores.aq_indoor_actual.ttl).toBe(86400000);
    });

    it('each store has declared source agent', () => {
      const sources = Object.values(missionControl.data_stores).map(s => s.source);
      expect(sources).toContain('scout');
      expect(sources).toContain('analyst');
      expect(sources).toContain('strategist');
      expect(sources).toContain('user_input');
    });
  });

  describe('Privacy Configuration', () => {
    it('k-anonymity: 1km grid, k≥50', () => {
      const privacy = missionControl.configuration.privacy;
      expect(privacy.anon_grid_km).toBe(1);
      expect(privacy.min_k).toBe(50);
      expect(privacy.pii_fields).toEqual([]);
    });

    it('API keys from env, not hardcoded', () => {
      const keys = missionControl.configuration.api_keys;
      expect(keys.openweather).toMatch(/^env:/);
      expect(keys.cpcb).toMatch(/^env:/);
    });
  });
});

describe('Antigravity Integration — Agent I/O Contracts', () => {
  beforeEach(() => {
    localStorageMock.clear();
    global.fetch = vi.fn((url) => {
      if (url.includes('api.cpcb.gov.in')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ pm25: 100, pm10: 150, stations: [{ id: 'delhi_1', pm25: 100 }] })
        });
      }
      if (url.includes('openweathermap.org')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ list: [{ main: { aqi: 3 }, components: { pm2_5: 100, pm10: 150 } }] })
        });
      }
      if (url.includes('gibs.earthdata.nasa.gov')) {
        return Promise.resolve({ ok: false });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({})
      });
    });
  });

  describe('Scout Agent', () => {
    it('declares correct tools: web_browse, fetch, localStorage', () => {
      expect(scoutAgent.tools).toEqual(expect.arrayContaining(['web_browse', 'fetch', 'localStorage']));
    });

    it('outputs aq_latest and aq_history', async () => {
      const result = await scoutAgent.execute({ location: { lat: 28.6, lon: 77.2, pincode: '110001' } });
      expect(result.success).toBe(true);

      const latest = JSON.parse(localStorageMock.getItem('aq_latest'));
      expect(latest).toHaveProperty('cpcb');
      expect(latest).toHaveProperty('openweather');
      expect(latest).toHaveProperty('location');

      const history = JSON.parse(localStorageMock.getItem('aq_history'));
      expect(Array.isArray(history)).toBe(true);
    });

    it('schedule matches mission-control: */15 * * * *', () => {
      const mcAgent = missionControl.agents.find(a => a.id === 'scout');
      expect(scoutAgent.schedule).toBe(mcAgent.schedule);
    });
  });

  describe('Analyst Agent', () => {
    it('declares correct tools: compute, localStorage', () => {
      expect(analystAgent.tools).toEqual(expect.arrayContaining(['compute', 'localStorage']));
    });

    it('reads aq_history, building, schedule, location', async () => {
      // Pre-populate 72h synthetic history (Scout only stores 1 entry per run)
      const syntheticHistory = [];
      const now = new Date();
      for (let i = 71; i >= 0; i--) {
        const hour = (now.getHours() - i + 24) % 24;
        const base = 80 + 40 * Math.sin((hour - 6) * Math.PI / 12);
        syntheticHistory.push({
          pm25: Math.max(10, base + (Math.random() - 0.5) * 20),
          pm10: Math.max(15, base * 1.4 + (Math.random() - 0.5) * 30),
          temp: 22 + 5 * Math.sin((hour - 6) * Math.PI / 12),
          humidity: 50 + 20 * Math.cos((hour - 6) * Math.PI / 12),
          wind_speed: 1 + Math.random() * 3,
          wind_dir: 180 + (Math.random() - 0.5) * 90,
          pressure: 1013 + (Math.random() - 0.5) * 10
        });
      }
      localStorageMock.setItem('aq_history', JSON.stringify(syntheticHistory));

      const result = await analystAgent.execute({
        location: { lat: 28.6, lon: 77.2, pincode: '110001' },
        building: { floor: 3, area: 80, purifier_cadr: 300 },
        schedule: [{ zone: 'kitchen', activity: 'cooking', start_hour: 8, duration: 1 }]
      });

      expect(result.success).toBe(true);

      const analysis = JSON.parse(localStorageMock.getItem('aq_analysis'));
      expect(analysis).toHaveProperty('forecast');
      expect(analysis).toHaveProperty('attribution');
      expect(analysis).toHaveProperty('indoor');
      expect(analysis).toHaveProperty('ventilation');
    });

    it('schedule: on_demand, persistence: ephemeral', () => {
      const mcAgent = missionControl.agents.find(a => a.id === 'analyst');
      expect(analystAgent.schedule).toBe(mcAgent.schedule);
      expect(analystAgent.persistence).toBe(mcAgent.persistence);
    });
  });

  describe('Strategist Agent', () => {
    it('declares correct tools: compute, localStorage', () => {
      expect(strategistAgent.tools).toEqual(expect.arrayContaining(['compute', 'localStorage']));
    });

    it('reads aq_analysis, building, profile, location', async () => {
      // Pre-populate 72h synthetic history for Analyst
      const syntheticHistory = [];
      const now = new Date();
      for (let i = 71; i >= 0; i--) {
        const hour = (now.getHours() - i + 24) % 24;
        const base = 80 + 40 * Math.sin((hour - 6) * Math.PI / 12);
        syntheticHistory.push({
          pm25: Math.max(10, base + (Math.random() - 0.5) * 20),
          pm10: Math.max(15, base * 1.4 + (Math.random() - 0.5) * 30),
          temp: 22 + 5 * Math.sin((hour - 6) * Math.PI / 12),
          humidity: 50 + 20 * Math.cos((hour - 6) * Math.PI / 12),
          wind_speed: 1 + Math.random() * 3,
          wind_dir: 180 + (Math.random() - 0.5) * 90,
          pressure: 1013 + (Math.random() - 0.5) * 10
        });
      }
      localStorageMock.setItem('aq_history', JSON.stringify(syntheticHistory));

      await analystAgent.execute({
        location: { lat: 28.6, lon: 77.2, pincode: '110001' },
        building: { floor: 3, area: 80 },
        schedule: []
      });

      const analysis = JSON.parse(localStorageMock.getItem('aq_analysis'));

      const result = await strategistAgent.execute({
        analysis,
        building: { floor: 3, area: 80, purifier_cadr: 300 },
        profile: { userId: 'test', hasChildren: true, priceSensitive: true, communityActive: false, canWfh: true },
        location: { lat: 28.6, lon: 77.2, pincode: '110001' }
      });

      expect(result.success).toBe(true);

      const strategy = JSON.parse(localStorageMock.getItem('aq_strategy'));
      expect(strategy).toHaveProperty('routine');
      expect(strategy).toHaveProperty('personalImpact');
      expect(strategy).toHaveProperty('neighborhoodImpact');
      expect(strategy).toHaveProperty('nudges');
      expect(strategy).toHaveProperty('insights');
    });
  });

  describe('Nudge Agent', () => {
    it('declares correct tools: notify, localStorage', () => {
      expect(nudgeAgent.tools).toEqual(expect.arrayContaining(['notify', 'localStorage']));
    });

    it('outputs nudge_daily with notifications and insights', async () => {
      const result = await nudgeAgent.execute({
        userId: 'test_user',
        profile: { hasChildren: true, priceSensitive: true, communityActive: false },
        currentAQI: 180
      });

      expect(result.success).toBe(true);
      expect(result.notifications).toBeDefined();
      expect(result.notifications.length).toBe(3);
      expect(result.insights).toBeDefined();

      const daily = JSON.parse(localStorageMock.getItem('nudge_daily_test_user'));
      expect(daily).toHaveProperty('interventions');
      expect(daily).toHaveProperty('notifications');
      expect(daily).toHaveProperty('insights');
    });

    it('schedule: 0 6 * * * (daily 6am)', () => {
      const mcAgent = missionControl.agents.find(a => a.id === 'nudge');
      expect(nudgeAgent.schedule).toBe(mcAgent.schedule);
    });
  });

  describe('Sentinel Agent', () => {
    it('declares correct tools: web_browse, notify, localStorage', () => {
      expect(sentinelAgent.tools).toEqual(expect.arrayContaining(['web_browse', 'notify', 'localStorage']));
    });

    it('outputs alerts count and current data', async () => {
      await scoutAgent.execute({ location: { lat: 28.6, lon: 77.2, pincode: '110001' } });

      const result = await sentinelAgent.execute({
        userId: 'test_user',
        thresholds: { aqi: 200, pm25: 100 },
        location: { lat: 28.6, lon: 77.2, pincode: '110001' }
      });

      expect(result.success).toBe(true);
      expect(typeof result.alerts).toBe('number');
      expect(result.current).toBeDefined();

      const log = JSON.parse(localStorageMock.getItem('sentinel_log_test_user'));
      expect(Array.isArray(log)).toBe(true);
    });

    it('schedule: */5 6-22 * * * (5min daytime)', () => {
      const mcAgent = missionControl.agents.find(a => a.id === 'sentinel');
      expect(sentinelAgent.schedule).toBe(mcAgent.schedule);
    });
  });

  describe('Contributor Agent', () => {
    it('declares correct tools: fetch, localStorage', () => {
      expect(contributorAgent.tools).toEqual(expect.arrayContaining(['fetch', 'localStorage']));
    });

    it('outputs contrib_queue with k-anonymity when optIn', async () => {
      // Pre-populate 72h synthetic history for Analyst
      const syntheticHistory = [];
      const now = new Date();
      for (let i = 71; i >= 0; i--) {
        const hour = (now.getHours() - i + 24) % 24;
        const base = 80 + 40 * Math.sin((hour - 6) * Math.PI / 12);
        syntheticHistory.push({
          pm25: Math.max(10, base + (Math.random() - 0.5) * 20),
          pm10: Math.max(15, base * 1.4 + (Math.random() - 0.5) * 30),
          temp: 22 + 5 * Math.sin((hour - 6) * Math.PI / 12),
          humidity: 50 + 20 * Math.cos((hour - 6) * Math.PI / 12),
          wind_speed: 1 + Math.random() * 3,
          wind_dir: 180 + (Math.random() - 0.5) * 90,
          pressure: 1013 + (Math.random() - 0.5) * 10
        });
      }
      localStorageMock.setItem('aq_history', JSON.stringify(syntheticHistory));

      await analystAgent.execute({
        location: { lat: 28.6139, lon: 77.2090, pincode: '110001' },
        building: { floor: 3, area: 80 },
        schedule: []
      });

      // Set indoor actual
      localStorageMock.setItem('aq_indoor_actual', JSON.stringify({
        bedroom: 25, living: 30, kitchen: 45, bathroom: 20
      }));

      const result = await contributorAgent.execute({
        userId: 'test_user',
        location: { lat: 28.6139, lon: 77.2090, pincode: '110001' },
        optIn: true
      });

      expect(result.success).toBe(true);

      const queue = JSON.parse(localStorageMock.getItem('contrib_queue'));
      expect(queue.length).toBeGreaterThan(0);

      const entry = queue[0];
      expect(entry.grid_lat).toBe(28.61);
      expect(entry.grid_lon).toBe(77.21);
      expect(entry.k_anonymity).toBeGreaterThanOrEqual(50);
      expect(entry.userId).toBeUndefined();
    });

    it('respects optOut', async () => {
      const result = await contributorAgent.execute({
        userId: 'test_user',
        location: { lat: 28.6139, lon: 77.2090, pincode: '110001' },
        optIn: false
      });

      expect(result.success).toBe(true);
      expect(result.skipped).toBe('opt_out');
    });

    it('schedule: 0 3 * * * (nightly 3am)', () => {
      const mcAgent = missionControl.agents.find(a => a.id === 'contributor');
      expect(contributorAgent.schedule).toBe(mcAgent.schedule);
    });
  });
});

describe('Antigravity Integration — Native Tool Usage', () => {
  it('all agents use only: web_browse, fetch, compute, notify, localStorage', () => {
    const allowedTools = ['web_browse', 'fetch', 'compute', 'notify', 'localStorage'];
    const allAgents = [scoutAgent, analystAgent, strategistAgent, nudgeAgent, sentinelAgent, contributorAgent];

    allAgents.forEach(agent => {
      const tools = agent.tools || [];
      tools.forEach(tool => {
        expect(allowedTools).toContain(tool);
      });
    });
  });

  it('no agent uses non-native tools (axios, puppeteer, etc.)', () => {
    const forbiddenTools = ['axios', 'puppeteer', 'playwright', 'node-fetch', 'cheerio', 'request'];
    const allAgents = [scoutAgent, analystAgent, strategistAgent, nudgeAgent, sentinelAgent, contributorAgent];

    allAgents.forEach(agent => {
      const tools = agent.tools || [];
      forbiddenTools.forEach(forbidden => {
        expect(tools).not.toContain(forbidden);
      });
    });
  });
});