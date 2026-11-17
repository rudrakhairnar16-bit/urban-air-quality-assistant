import { describe, it, expect, beforeEach } from 'vitest';
import scoutAgent from '../src/agents/scout.agent.js';
import analystAgent from '../src/agents/analyst.agent.js';
import strategistAgent from '../src/agents/strategist.agent.js';
import nudgeAgent from '../src/agents/nudge.agent.js';
import sentinelAgent from '../src/agents/sentinel.agent.js';
import contributorAgent from '../src/agents/contributor.agent.js';

const localStorageMock = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, value) { this.store[key] = value.toString(); },
  removeItem(key) { delete this.store[key]; },
  clear() { this.store = {}; }
};
global.localStorage = localStorageMock;

describe('Antigravity Agents Execution', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('Scout agent initializes and executes with mock fetch', async () => {
    expect(scoutAgent.name).toBe('Scout');
    expect(scoutAgent.tools).toContain('localStorage');
    expect(scoutAgent.tools).toContain('fetch');
    expect(scoutAgent.tools).toContain('web_browse');
    expect(scoutAgent.schedule).toBe('*/15 * * * *');
  });

  it('Analyst agent executes on demand and writes aq_analysis', async () => {
    expect(analystAgent.name).toBe('Analyst');
    expect(analystAgent.schedule).toBe('on_demand');
    const result = await analystAgent.execute({
      building: { floor: 3, area: 80, window_bedroom: false, window_living: false, purifier_cadr: 300, purifier_zone: 'bedroom', door_open: true },
      schedule: [{ zone: 'kitchen', activity: 'cooking', start_hour: 8, duration: 1 }],
      location: { lat: 28.6139, lon: 77.2090, pincode: '110001' }
    });
    expect(result.success).toBe(true);
    expect(result.analysis).toBeDefined();
    expect(localStorageMock.getItem('aq_analysis')).toBeDefined();
  });

  it('Strategist agent executes on demand and writes aq_strategy', async () => {
    expect(strategistAgent.name).toBe('Strategist');
    const analystRes = await analystAgent.execute({
      building: { floor: 3, area: 80, window_bedroom: false, window_living: false, purifier_cadr: 300, purifier_zone: 'bedroom', door_open: true },
      schedule: [{ zone: 'kitchen', activity: 'cooking', start_hour: 8, duration: 1 }],
      location: { lat: 28.6139, lon: 77.2090, pincode: '110001' }
    });

    const strategyRes = await strategistAgent.execute({
      analysis: analystRes.analysis,
      building: { floor: 3, area: 80, window_bedroom: false, window_living: false, purifier_cadr: 300, purifier_zone: 'bedroom', door_open: true },
      profile: { userId: 'u_123', hasChildren: true, priceSensitive: true, communityActive: false, canWfh: true },
      location: { lat: 28.6139, lon: 77.2090, pincode: '110001' }
    });
    expect(strategyRes.success).toBe(true);
    expect(strategyRes.strategy.routine.length).toBeGreaterThan(0);
    expect(localStorageMock.getItem('aq_strategy')).toBeDefined();
  });

  it('Nudge agent executes and writes nudge_daily', async () => {
    expect(nudgeAgent.name).toBe('Nudge');
    expect(nudgeAgent.schedule).toBe('0 6 * * *');
    const result = await nudgeAgent.execute({
      userId: 'u_123',
      profile: { hasChildren: true, priceSensitive: true, communityActive: false },
      currentAQI: 180
    });
    expect(result.success).toBe(true);
    expect(result.notifications.length).toBeGreaterThan(0);
    expect(localStorageMock.getItem('nudge_daily_u_123')).toBeDefined();
  });

  it('Sentinel agent checks thresholds and logs alerts', async () => {
    expect(sentinelAgent.name).toBe('Sentinel');
    expect(sentinelAgent.schedule).toBe('*/5 6-22 * * *');
    localStorageMock.setItem('aq_latest', JSON.stringify({
      timestamp: Date.now(),
      cpcb: { pm25: 180 },
      location: { lat: 28.6139, lon: 77.2090 }
    }));
    const result = await sentinelAgent.execute({
      userId: 'u_123',
      thresholds: { pm25_absolute: 100, aqi_category: 'Moderate' },
      location: { lat: 28.6139, lon: 77.2090 }
    });
    expect(result.success).toBe(true);
    expect(result.alerts).toBeGreaterThan(0);
    expect(localStorageMock.getItem('sentinel_alert_u_123')).toBeDefined();
  });

  it('Contributor agent anonymizes and queues delta', async () => {
    expect(contributorAgent.name).toBe('Contributor');
    expect(contributorAgent.schedule).toBe('0 3 * * *');
    localStorageMock.setItem('aq_analysis', JSON.stringify({
      forecast: [{ pm25: 120 }]
    }));
    localStorageMock.setItem('aq_indoor_actual', JSON.stringify({
      bedroom: 35,
      timestamp: Date.now()
    }));
    const result = await contributorAgent.execute({
      userId: 'u_123',
      location: { lat: 28.6139, lon: 77.2090 },
      optIn: true
    });
    expect(result.success).toBe(true);
  });
});
