/**
 * Composite Bodygraph - SVG Renderer
 * Shows two Human Design charts overlaid:
 * - Person A gates in blue
 * - Person B gates in pink
 * - Electromagnetic connections highlighted in gold
 */

import {
  GATE_PATHS,
  CENTER_SHAPES,
  GATE_CIRCLE_POSITIONS,
  VIEWBOX
} from '../data/bodygraph-svg-data.js';

import { GATES, CHANNELS } from '../calculators/humandesign.js';

const GATE_TO_CENTER = {
  64: 'Head', 61: 'Head', 63: 'Head',
  47: 'Ajna', 24: 'Ajna', 4: 'Ajna', 17: 'Ajna', 43: 'Ajna', 11: 'Ajna',
  62: 'Throat', 23: 'Throat', 56: 'Throat', 16: 'Throat', 20: 'Throat', 31: 'Throat',
  8: 'Throat', 33: 'Throat', 35: 'Throat', 12: 'Throat', 45: 'Throat',
  7: 'G', 1: 'G', 13: 'G', 10: 'G', 25: 'G', 15: 'G', 46: 'G', 2: 'G',
  21: 'Ego', 51: 'Ego', 26: 'Ego', 40: 'Ego',
  48: 'Spleen', 57: 'Spleen', 44: 'Spleen', 50: 'Spleen', 32: 'Spleen', 28: 'Spleen', 18: 'Spleen',
  36: 'SolarPlexus', 22: 'SolarPlexus', 37: 'SolarPlexus', 6: 'SolarPlexus',
  30: 'SolarPlexus', 55: 'SolarPlexus', 49: 'SolarPlexus',
  34: 'Sacral', 5: 'Sacral', 14: 'Sacral', 29: 'Sacral', 59: 'Sacral',
  27: 'Sacral', 42: 'Sacral', 3: 'Sacral', 9: 'Sacral',
  53: 'Root', 60: 'Root', 52: 'Root', 19: 'Root', 39: 'Root', 41: 'Root',
  58: 'Root', 38: 'Root', 54: 'Root'
};

const CENTER_INFO = {
  Head: { name: 'Head', short: 'HD' },
  Ajna: { name: 'Ajna', short: 'AJ' },
  Throat: { name: 'Throat', short: 'TH' },
  G: { name: 'G Center', short: 'G' },
  Ego: { name: 'Heart', short: 'EG' },
  Spleen: { name: 'Spleen', short: 'SN' },
  SolarPlexus: { name: 'Solar Plexus', short: 'EM' },
  Sacral: { name: 'Sacral', short: 'SC' },
  Root: { name: 'Root', short: 'RT' }
};

// Colors
const COLORS = {
  personA: '#3b82f6',       // Blue
  personALight: '#dbeafe',
  personB: '#ec4899',       // Pink
  personBLight: '#fce7f3',
  both: '#8b5cf6',          // Purple for shared
  bothLight: '#ede9fe',
  electromagnetic: '#f59e0b', // Gold for electromagnetic
  electromagneticLight: '#fef3c7',
  inactive: '#e5e7eb'
};

function createSvgElement(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
  return el;
}

function getAllGates(chartData) {
  const gates = new Set();
  if (chartData.gates?.personality) {
    Object.values(chartData.gates.personality).forEach(g => {
      if (g?.gate) gates.add(g.gate);
    });
  }
  if (chartData.gates?.design) {
    Object.values(chartData.gates.design).forEach(g => {
      if (g?.gate) gates.add(g.gate);
    });
  }
  return gates;
}

function findElectromagneticConnections(gatesA, gatesB) {
  const connections = [];

  Object.values(CHANNELS).forEach(channel => {
    const [g1, g2] = channel.gates;

    // A has g1, B has g2
    if (gatesA.has(g1) && !gatesA.has(g2) && gatesB.has(g2) && !gatesB.has(g1)) {
      connections.push({ gateA: g1, gateB: g2, channel });
    }
    // A has g2, B has g1
    if (gatesA.has(g2) && !gatesA.has(g1) && gatesB.has(g1) && !gatesB.has(g2)) {
      connections.push({ gateA: g2, gateB: g1, channel });
    }
  });

  return connections;
}

function getElectromagneticGates(connections) {
  const gates = new Set();
  connections.forEach(conn => {
    gates.add(conn.gateA);
    gates.add(conn.gateB);
  });
  return gates;
}

function drawCenter(svg, name, centerData, definitionInfo) {
  let fill, stroke, textFill;

  if (definitionInfo === 'both') {
    fill = COLORS.bothLight;
    stroke = COLORS.both;
    textFill = COLORS.both;
  } else if (definitionInfo === 'A') {
    fill = COLORS.personALight;
    stroke = COLORS.personA;
    textFill = COLORS.personA;
  } else if (definitionInfo === 'B') {
    fill = COLORS.personBLight;
    stroke = COLORS.personB;
    textFill = COLORS.personB;
  } else if (definitionInfo === 'electromagnetic') {
    fill = COLORS.electromagneticLight;
    stroke = COLORS.electromagnetic;
    textFill = COLORS.electromagnetic;
  } else {
    fill = 'var(--bg-card, #ffffff)';
    stroke = '#9ca3af';
    textFill = '#6b7280';
  }

  const g = createSvgElement('g', { class: `center-group center-${name.toLowerCase()}` });

  const path = createSvgElement('path', {
    d: centerData.path,
    fill: fill,
    stroke: stroke,
    'stroke-width': '2.5'
  });
  g.appendChild(path);

  const info = CENTER_INFO[name] || { name, short: name.slice(0, 2) };
  const cx = centerData.center?.x || 420;
  const cy = centerData.center?.y || 500;

  const label = createSvgElement('text', {
    x: cx,
    y: cy,
    'text-anchor': 'middle',
    'dominant-baseline': 'middle',
    'font-size': '18',
    'font-weight': '700',
    fill: textFill,
    'font-family': 'system-ui, -apple-system, sans-serif',
    'pointer-events': 'none'
  });
  label.textContent = info.short;
  g.appendChild(label);

  svg.appendChild(g);
}

function drawGatePath(svg, gateNum, activationType, isElectromagnetic = false) {
  const pathData = GATE_PATHS[gateNum];
  if (!pathData) return;

  let fill, stroke = 'none', strokeWidth = '0';

  if (isElectromagnetic) {
    fill = COLORS.electromagnetic;
    stroke = COLORS.electromagnetic;
    strokeWidth = '3';
  } else if (activationType === 'both') {
    fill = COLORS.both;
  } else if (activationType === 'A') {
    fill = COLORS.personA;
  } else if (activationType === 'B') {
    fill = COLORS.personB;
  } else {
    fill = COLORS.inactive;
  }

  const path = createSvgElement('path', {
    d: pathData,
    fill: fill,
    stroke: stroke,
    'stroke-width': strokeWidth,
    opacity: activationType ? '1' : '0.4',
    class: `gate-path gate-${gateNum}${isElectromagnetic ? ' electromagnetic' : ''}`
  });

  svg.appendChild(path);
}

function drawGateLabel(svg, gateNum, gatesA, gatesB, electromagneticGates) {
  const circlePos = GATE_CIRCLE_POSITIONS[gateNum];
  if (!circlePos) return;

  const hasA = gatesA.has(gateNum);
  const hasB = gatesB.has(gateNum);
  const isEM = electromagneticGates.has(gateNum);
  const isActivated = hasA || hasB;

  const g = createSvgElement('g', {
    class: `gate-label gate-label-${gateNum}`,
    style: 'cursor: pointer;'
  });

  const cx = circlePos.cx;
  const cy = circlePos.cy;

  if (isEM) {
    // Electromagnetic gates get gold highlight
    const circle = createSvgElement('circle', {
      cx: cx, cy: cy, r: circlePos.r,
      fill: COLORS.electromagneticLight,
      stroke: COLORS.electromagnetic,
      'stroke-width': '3'
    });
    g.appendChild(circle);

    const text = createSvgElement('text', {
      x: cx, y: cy,
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      'font-size': '13',
      'font-weight': '700',
      fill: '#78350f',
      'font-family': 'system-ui, -apple-system, sans-serif'
    });
    text.textContent = gateNum;
    g.appendChild(text);
  } else if (hasA && hasB) {
    // Both have this gate - purple
    const circle = createSvgElement('circle', {
      cx: cx, cy: cy, r: circlePos.r,
      fill: COLORS.bothLight,
      stroke: COLORS.both,
      'stroke-width': '2.5'
    });
    g.appendChild(circle);

    const text = createSvgElement('text', {
      x: cx, y: cy,
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      'font-size': '13',
      'font-weight': '700',
      fill: COLORS.both,
      'font-family': 'system-ui, -apple-system, sans-serif'
    });
    text.textContent = gateNum;
    g.appendChild(text);
  } else if (hasA) {
    // Only A has this gate - blue
    const circle = createSvgElement('circle', {
      cx: cx, cy: cy, r: circlePos.r,
      fill: COLORS.personALight,
      stroke: COLORS.personA,
      'stroke-width': '2.5'
    });
    g.appendChild(circle);

    const text = createSvgElement('text', {
      x: cx, y: cy,
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      'font-size': '13',
      'font-weight': '700',
      fill: COLORS.personA,
      'font-family': 'system-ui, -apple-system, sans-serif'
    });
    text.textContent = gateNum;
    g.appendChild(text);
  } else if (hasB) {
    // Only B has this gate - pink
    const circle = createSvgElement('circle', {
      cx: cx, cy: cy, r: circlePos.r,
      fill: COLORS.personBLight,
      stroke: COLORS.personB,
      'stroke-width': '2.5'
    });
    g.appendChild(circle);

    const text = createSvgElement('text', {
      x: cx, y: cy,
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      'font-size': '13',
      'font-weight': '700',
      fill: COLORS.personB,
      'font-family': 'system-ui, -apple-system, sans-serif'
    });
    text.textContent = gateNum;
    g.appendChild(text);
  } else {
    // Inactive gate
    const text = createSvgElement('text', {
      x: cx, y: cy,
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      'font-size': '11',
      'font-weight': '600',
      fill: '#9ca3af',
      'font-family': 'system-ui, -apple-system, sans-serif'
    });
    text.textContent = gateNum;
    g.appendChild(text);
  }

  // Tooltip
  const gateInfo = GATES[gateNum] || {};
  const title = createSvgElement('title');
  let personInfo = '';
  if (isEM) personInfo = '\nElectromagnetic Connection!';
  else if (hasA && hasB) personInfo = '\nShared by A & B';
  else if (hasA) personInfo = '\nPerson A only';
  else if (hasB) personInfo = '\nPerson B only';

  title.textContent = `Gate ${gateNum}: ${gateInfo.name || 'Unknown'}\nTheme: ${gateInfo.theme || ''}${personInfo}`;
  g.appendChild(title);

  svg.appendChild(g);
}

function getCenterDefinition(centerName, gatesA, gatesB, electromagneticGates, channelsA, channelsB, electromagneticConnections) {
  // Check if electromagnetic connection defines this center
  for (const conn of electromagneticConnections) {
    const [g1, g2] = conn.channel.gates;
    const c1 = GATE_TO_CENTER[g1];
    const c2 = GATE_TO_CENTER[g2];
    if (c1 === centerName || c2 === centerName) {
      return 'electromagnetic';
    }
  }

  // Check A's channels
  let definedByA = false;
  for (const channel of channelsA) {
    const [g1, g2] = channel.gates;
    const c1 = GATE_TO_CENTER[g1];
    const c2 = GATE_TO_CENTER[g2];
    if (c1 === centerName || c2 === centerName) {
      definedByA = true;
      break;
    }
  }

  // Check B's channels
  let definedByB = false;
  for (const channel of channelsB) {
    const [g1, g2] = channel.gates;
    const c1 = GATE_TO_CENTER[g1];
    const c2 = GATE_TO_CENTER[g2];
    if (c1 === centerName || c2 === centerName) {
      definedByB = true;
      break;
    }
  }

  if (definedByA && definedByB) return 'both';
  if (definedByA) return 'A';
  if (definedByB) return 'B';
  return null;
}

function drawLegend(svg) {
  const legendY = 1320;
  const legend = createSvgElement('g', { transform: `translate(40, ${legendY})` });

  const legendBg = createSvgElement('rect', {
    x: -20, y: -10,
    width: 780, height: 50,
    fill: 'var(--bg-card, #ffffff)',
    rx: 8,
    opacity: '0.95'
  });
  legend.appendChild(legendBg);

  const items = [
    { fill: COLORS.personA, label: 'Person A' },
    { fill: COLORS.personB, label: 'Person B' },
    { fill: COLORS.both, label: 'Shared' },
    { fill: COLORS.electromagnetic, stroke: COLORS.electromagnetic, label: 'Electromagnetic' }
  ];

  items.forEach((item, i) => {
    const x = i * 190;

    const bar = createSvgElement('rect', {
      x: x, y: 8,
      width: 25, height: 12,
      fill: item.fill,
      stroke: item.stroke || 'none',
      'stroke-width': item.stroke ? '2' : '0',
      rx: 2
    });
    legend.appendChild(bar);

    const txt = createSvgElement('text', {
      x: x + 35, y: 18,
      'font-size': '14',
      'font-weight': '500',
      fill: 'var(--text-muted, #6b7280)',
      'font-family': 'system-ui, -apple-system, sans-serif'
    });
    txt.textContent = item.label;
    legend.appendChild(txt);
  });

  svg.appendChild(legend);
}

/**
 * Main render function for composite bodygraph
 */
export function renderCompositeBodygraph(container, chartA, chartB, electromagneticPairs = []) {
  const existing = container.querySelector('.composite-bodygraph-svg');
  if (existing) existing.remove();

  const padding = 20;
  const svg = createSvgElement('svg', {
    viewBox: `${VIEWBOX.minX - padding} ${VIEWBOX.minY} ${VIEWBOX.width + padding * 2} ${VIEWBOX.height}`,
    class: 'composite-bodygraph-svg',
    style: 'max-width: 420px; height: auto; display: block; margin: 0 auto 1rem;'
  });

  // Get gates for both people
  const gatesA = getAllGates(chartA);
  const gatesB = getAllGates(chartB);

  // Find electromagnetic connections
  const electromagneticConnections = electromagneticPairs.length > 0
    ? electromagneticPairs.map(em => ({
        gateA: em.gateA,
        gateB: em.gateB,
        channel: { gates: [em.gateA, em.gateB], name: em.channel }
      }))
    : findElectromagneticConnections(gatesA, gatesB);

  const electromagneticGates = getElectromagneticGates(electromagneticConnections);

  // Get channels
  const channelsA = chartA.channels || [];
  const channelsB = chartB.channels || [];

  // Create layers
  const gatePathsLayer = createSvgElement('g', { class: 'gate-paths-layer' });
  const centersLayer = createSvgElement('g', { class: 'centers-layer' });
  const gateLabelsLayer = createSvgElement('g', { class: 'gate-labels-layer' });

  svg.appendChild(gatePathsLayer);
  svg.appendChild(centersLayer);
  svg.appendChild(gateLabelsLayer);

  // Draw inactive gate paths first
  Object.keys(GATE_PATHS).forEach(gateNum => {
    const num = parseInt(gateNum);
    const hasA = gatesA.has(num);
    const hasB = gatesB.has(num);

    if (!hasA && !hasB) {
      drawGatePath(gatePathsLayer, num, null, false);
    }
  });

  // Draw active gate paths
  Object.keys(GATE_PATHS).forEach(gateNum => {
    const num = parseInt(gateNum);
    const hasA = gatesA.has(num);
    const hasB = gatesB.has(num);
    const isEM = electromagneticGates.has(num);

    if (hasA || hasB) {
      let type = null;
      if (hasA && hasB) type = 'both';
      else if (hasA) type = 'A';
      else if (hasB) type = 'B';

      drawGatePath(gatePathsLayer, num, type, isEM);
    }
  });

  // Draw centers
  Object.entries(CENTER_SHAPES).forEach(([name, centerData]) => {
    const definitionType = getCenterDefinition(
      name, gatesA, gatesB, electromagneticGates,
      channelsA, channelsB, electromagneticConnections
    );
    drawCenter(centersLayer, name, centerData, definitionType);
  });

  // Draw gate labels
  for (let gateNum = 1; gateNum <= 64; gateNum++) {
    drawGateLabel(gateLabelsLayer, gateNum, gatesA, gatesB, electromagneticGates);
  }

  // Legend
  drawLegend(svg);

  container.insertBefore(svg, container.firstChild);
}

export default renderCompositeBodygraph;
