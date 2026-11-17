import { describe, it, expect } from 'vitest';
import { aqiFromPm25 } from '../src/core/aqi-forecast.js';

describe('Import Test', () => {
  it('imports aqiFromPm25', () => {
    expect(aqiFromPm25(10).label).toBe('Good');
  });
});