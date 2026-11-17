/**
 * Neighborhood Dispersion Simulator — Gaussian Plume (Simplified)
 * Models PM2.5 concentration at receptor from area sources
 * Grid: 500m x 500m, 50m resolution = 10x10 cells
 * Sources: traffic lines, industry points, area (stubble/dust)
 * Runs in <100ms on client
 */

const GRID_SIZE = 10; // 10x10 = 500m at 50m resolution
const CELL_M = 50;
const DOMAIN_M = GRID_SIZE * CELL_M;

const STABILITY_CLASS = {
  A: { sy: 0.22, sz: 0.20 }, // very unstable
  B: { sy: 0.16, sz: 0.12 },
  C: { sy: 0.11, sz: 0.08 }, // neutral
  D: { sy: 0.08, sz: 0.06 },
  E: { sy: 0.06, sz: 0.03 }, // stable
  F: { sy: 0.04, sz: 0.016 }
};

function stabilityClass(windSpeed, solarRadiation, cloudCover) {
  if (windSpeed < 2) return solarRadiation > 600 ? 'A' : cloudCover > 0.5 ? 'E' : 'F';
  if (windSpeed < 3) return solarRadiation > 600 ? 'A-B' : 'B';
  if (windSpeed < 5) return solarRadiation > 600 ? 'B' : 'C';
  return 'C-D';
}

function dispersionParams(x, stability) {
  const c = STABILITY_CLASS[stability] || STABILITY_CLASS.C;
  const sy = c.sy * x * Math.pow(1 + 0.0001 * x, -0.5);
  const sz = c.sz * x * Math.pow(1 + 0.0001 * x, -0.5);
  return { sy: Math.max(1, sy), sz: Math.max(1, sz) };
}

function gaussianPlume(Q, u, x, y, z, H, stability) {
  if (x <= 0) return 0;
  const { sy, sz } = dispersionParams(x, stability);
  const exp_y = Math.exp(-(y * y) / (2 * sy * sy));
  const exp_z = Math.exp(-(z - H) * (z - H) / (2 * sz * sz)) + Math.exp(-(z + H) * (z + H) / (2 * sz * sz));
  return (Q / (2 * Math.PI * u * sy * sz)) * exp_y * exp_z;
}

function lineSource(Q_per_m, u, x, y, z, H, length, angle, stability) {
  // Integrate along line (trapezoidal, 10 segments)
  let sum = 0;
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const lx = t * length * Math.cos(angle);
    const ly = t * length * Math.sin(angle);
    const dx = x - lx;
    const dy = y - ly;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const bearing = Math.atan2(dy, dx);
    sum += gaussianPlume(Q_per_m * length / 10, u, dist, 0, z, H, stability);
  }
  return sum / 11;
}

export function simulateDispersion(sources, meteo, receptor) {
  // sources: array of {type: 'line'|'point'|'area', x, y, q, h?, length?, angle?}
  // meteo: {wind_speed, wind_dir, stability, temp, humidity}
  // receptor: {x, y, z}
  // returns µg/m³ at receptor

  const u = Math.max(0.5, meteo.wind_speed);
  const windRad = (meteo.wind_dir * Math.PI) / 180;
  const stability = meteo.stability || stabilityClass(u, meteo.solar_rad || 300, meteo.cloud_cover || 0.3);

  // Rotate coordinates so wind is along +x
  const cosW = Math.cos(-windRad);
  const sinW = Math.sin(-windRad);

  let total = 0;
  for (const s of sources) {
    const dx = s.x - receptor.x;
    const dy = s.y - receptor.y;
    const rx = dx * cosW - dy * sinW; // downwind distance
    const ry = dx * sinW + dy * cosW; // crosswind distance

    if (s.type === 'point') {
      total += gaussianPlume(s.q, u, rx, ry, receptor.z, s.h || 10, stability);
    } else if (s.type === 'line') {
      total += lineSource(s.q, u, rx, ry, receptor.z, s.h || 3, s.length, s.angle, stability);
    } else if (s.type === 'area') {
      // Area as grid of point sources
      const nx = Math.ceil(Math.sqrt(s.area / 10000));
      const ny = nx;
      const dx_cell = Math.sqrt(s.area) / nx;
      for (let ix = 0; ix < nx; ix++) {
        for (let iy = 0; iy < ny; iy++) {
          const px = s.x + (ix - nx / 2) * dx_cell;
          const py = s.y + (iy - ny / 2) * dx_cell;
          const pdx = px - receptor.x;
          const pdy = py - receptor.y;
          const prx = pdx * cosW - pdy * sinW;
          const pry = pdx * sinW + pdy * cosW;
          total += gaussianPlume(s.q / (nx * ny), u, prx, pry, receptor.z, 1, stability);
        }
      }
    }
  }
  return Math.max(0, total);
}

export function simulateGrid(sources, meteo, center) {
  // Returns 10x10 grid of concentrations centered at center
  const grid = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    const row = [];
    for (let j = 0; j < GRID_SIZE; j++) {
      const x = center.x + (j - GRID_SIZE / 2) * CELL_M;
      const y = center.y + (i - GRID_SIZE / 2) * CELL_M;
      row.push(simulateDispersion(sources, meteo, { x, y, z: 1.5 }));
    }
    grid.push(row);
  }
  return grid;
}

export function interventionScenario(baseSources, interventions) {
  // interventions: array of {source_id, reduction_factor, description}
  const newSources = baseSources.map(s => {
    const intv = interventions.find(i => i.source_id === s.id);
    if (intv) return { ...s, q: s.q * (1 - intv.reduction_factor), intervention: intv.description };
    return s;
  });
  return newSources;
}

export function neighborhoodImpact(baseGrid, interventionGrid, populationGrid) {
  // populationGrid: 10x10 people per cell
  let totalExposure = 0, reducedExposure = 0, peopleAffected = 0;
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      const pop = populationGrid[i][j] || 0;
      const base = baseGrid[i][j];
      const intv = interventionGrid[i][j];
      totalExposure += base * pop;
      reducedExposure += intv * pop;
      if (base - intv > 1 && pop > 0) peopleAffected += pop;
    }
  }
  return {
    avg_reduction: totalExposure > 0 ? (totalExposure - reducedExposure) / totalExposure * 100 : 0,
    people_benefited: peopleAffected,
    total_population: populationGrid.flat().reduce((a, b) => a + b, 0)
  };
}

export const DISPERSION_CONFIG = { GRID_SIZE, CELL_M, DOMAIN_M };