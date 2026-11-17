import { describe, it, expect } from 'vitest';

describe('Debug Imports', () => {
  it('imports source-attribution', async () => {
    const mod = await import('../src/core/source-attribution.js');
    expect(mod.attributeSources).toBeDefined();
  });

  it('imports indoor-physics', async () => {
    const mod = await import('../src/core/indoor-physics.js');
    expect(mod.simulateIndoor).toBeDefined();
  });

  it('imports dispersion-sim', async () => {
    const mod = await import('../src/core/dispersion-sim.js');
    expect(mod.simulateDispersion).toBeDefined();
  });

  it('imports behavioral-engine', async () => {
    const mod = await import('../src/core/behavioral-engine.js');
    expect(mod.createNudgeEngine).toBeDefined();
  });
});