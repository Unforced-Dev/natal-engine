/**
 * Human Design Bodygraph - SVG Renderer
 * Using precise coordinates from hdkit open-source library
 * https://github.com/jdempcy/hdkit
 */

import {
  GATE_PATHS,
  CENTER_SHAPES,
  GATE_CIRCLE_POSITIONS,
  VIEWBOX
} from '../data/bodygraph-svg-data.js';

import { GATES, CHANNELS, CENTERS } from '../calculators/humandesign.js';

// Map gate numbers to their connected center
const GATE_TO_CENTER = {
  // Head
  64: 'Head', 61: 'Head', 63: 'Head',
  // Ajna
  47: 'Ajna', 24: 'Ajna', 4: 'Ajna', 17: 'Ajna', 43: 'Ajna', 11: 'Ajna',
  // Throat
  62: 'Throat', 23: 'Throat', 56: 'Throat', 16: 'Throat', 20: 'Throat', 31: 'Throat',
  8: 'Throat', 33: 'Throat', 35: 'Throat', 12: 'Throat', 45: 'Throat',
  // G Center
  7: 'G', 1: 'G', 13: 'G', 10: 'G', 25: 'G', 15: 'G', 46: 'G', 2: 'G',
  // Heart/Ego
  21: 'Ego', 51: 'Ego', 26: 'Ego', 40: 'Ego',
  // Spleen
  48: 'Spleen', 57: 'Spleen', 44: 'Spleen', 50: 'Spleen', 32: 'Spleen', 28: 'Spleen', 18: 'Spleen',
  // Solar Plexus
  36: 'SolarPlexus', 22: 'SolarPlexus', 37: 'SolarPlexus', 6: 'SolarPlexus',
  30: 'SolarPlexus', 55: 'SolarPlexus', 49: 'SolarPlexus',
  // Sacral
  34: 'Sacral', 5: 'Sacral', 14: 'Sacral', 29: 'Sacral', 59: 'Sacral',
  27: 'Sacral', 42: 'Sacral', 3: 'Sacral', 9: 'Sacral',
  // Root
  53: 'Root', 60: 'Root', 52: 'Root', 19: 'Root', 39: 'Root', 41: 'Root',
  58: 'Root', 38: 'Root', 54: 'Root'
};

// Center display names and descriptions
const CENTER_INFO = {
  Head: { name: 'Head', short: 'HD', theme: 'Inspiration & Questions', description: 'Mental pressure, inspiration, questions' },
  Ajna: { name: 'Ajna', short: 'AJ', theme: 'Conceptualization', description: 'Mental awareness, processing, opinions' },
  Throat: { name: 'Throat', short: 'TH', theme: 'Manifestation', description: 'Communication, expression, action' },
  G: { name: 'G Center', short: 'G', theme: 'Identity & Direction', description: 'Love, identity, direction in life' },
  Ego: { name: 'Heart', short: 'EG', theme: 'Willpower', description: 'Ego, willpower, material world' },
  Spleen: { name: 'Spleen', short: 'SN', theme: 'Intuition & Survival', description: 'Intuition, health, survival instincts' },
  SolarPlexus: { name: 'Solar Plexus', short: 'EM', theme: 'Emotions', description: 'Emotional wave, feelings, desires' },
  Sacral: { name: 'Sacral', short: 'SC', theme: 'Life Force', description: 'Vital energy, sexuality, work capacity' },
  Root: { name: 'Root', short: 'RT', theme: 'Pressure & Drive', description: 'Adrenaline, stress, drive to act' }
};

function createSvgElement(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
  return el;
}

/**
 * Draw a center using hdkit path data
 * Centers are colored based on how they're defined
 */
function drawCenter(svg, name, centerData, definitionType, centerInfo) {
  let fill, stroke, textFill;

  if (definitionType === 'design') {
    fill = '#ef4444';
    stroke = '#b91c1c';
    textFill = '#ffffff';
  } else if (definitionType === 'personality') {
    fill = '#374151';
    stroke = '#1f2937';
    textFill = '#ffffff';
  } else if (definitionType === 'both') {
    fill = '#92400e';
    stroke = '#78350f';
    textFill = '#ffffff';
  } else {
    fill = 'var(--bg-card, #ffffff)';
    stroke = '#9ca3af';
    textFill = '#6b7280';
  }

  const g = createSvgElement('g', {
    class: `center-group center-${name.toLowerCase()}`,
    style: 'cursor: pointer;'
  });

  const path = createSvgElement('path', {
    d: centerData.path,
    fill: fill,
    stroke: stroke,
    'stroke-width': '2.5'
  });
  g.appendChild(path);

  // Add center label
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

  // Rich tooltip
  const title = createSvgElement('title');
  const status = definitionType ? `Defined (${definitionType})` : 'Open/Undefined';
  title.textContent = `${info.name}\n${info.theme}\n${info.description}\nStatus: ${status}`;
  g.appendChild(title);

  svg.appendChild(g);
}

/**
 * Draw a gate path (channel segment)
 * Red = Design, Black = Personality
 */
function drawGatePath(svg, gateNum, activationType, isCompleteChannel = false) {
  const pathData = GATE_PATHS[gateNum];
  if (!pathData) return;

  let fill, opacity = '1';
  let strokeWidth = '0';
  let stroke = 'none';

  if (activationType === 'both') {
    const redPath = createSvgElement('path', {
      d: pathData,
      fill: '#ef4444',
      stroke: 'none'
    });
    svg.appendChild(redPath);
    fill = '#1f2937';
  } else if (activationType === 'design') {
    fill = '#ef4444';
  } else if (activationType === 'personality') {
    fill = '#1f2937';
  } else {
    fill = '#e5e7eb';
    opacity = '0.5';
  }

  // Highlight complete channels with a glow effect
  if (isCompleteChannel && activationType) {
    stroke = '#fbbf24';
    strokeWidth = '3';
    opacity = '1';
  }

  const path = createSvgElement('path', {
    d: pathData,
    fill: fill,
    stroke: stroke,
    'stroke-width': strokeWidth,
    opacity: opacity,
    class: `gate-path gate-${gateNum}${isCompleteChannel ? ' complete-channel' : ''}`
  });

  svg.appendChild(path);
}

/**
 * Draw gate number with rich tooltip
 */
function drawGateLabel(svg, gateNum, gateData, personalityGates, designGates) {
  const circlePos = GATE_CIRCLE_POSITIONS[gateNum];
  if (!circlePos) return;

  const hasP = personalityGates.has(gateNum);
  const hasD = designGates.has(gateNum);
  const isActivated = hasP || hasD;

  const g = createSvgElement('g', {
    class: `gate-label gate-label-${gateNum}`,
    style: 'cursor: pointer;'
  });

  // Always use circle center for text positioning
  const cx = circlePos.cx;
  const cy = circlePos.cy;

  if (isActivated) {
    // Activated gates get yellow/gold circles
    const circle = createSvgElement('circle', {
      cx: cx,
      cy: cy,
      r: circlePos.r,
      fill: '#fef3c7',
      stroke: '#d97706',
      'stroke-width': '2.5'
    });
    g.appendChild(circle);

    const text = createSvgElement('text', {
      x: cx,
      y: cy,
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      'font-size': '13',
      'font-weight': '700',
      fill: '#78350f',
      'font-family': 'system-ui, -apple-system, sans-serif'
    });
    text.textContent = gateNum;
    g.appendChild(text);
  } else {
    // Inactive gates - more visible text
    const text = createSvgElement('text', {
      x: cx,
      y: cy,
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

  // Rich tooltip with gate info
  const gateInfo = GATES[gateNum] || {};
  const title = createSvgElement('title');

  let activationInfo = '';
  if (hasP && hasD) {
    const pLine = personalityGates.get(gateNum)?.line;
    const dLine = designGates.get(gateNum)?.line;
    activationInfo = `\nPersonality: Line ${pLine || '?'}\nDesign: Line ${dLine || '?'}`;
  } else if (hasP) {
    const line = personalityGates.get(gateNum)?.line;
    activationInfo = `\nPersonality: Line ${line || '?'}`;
  } else if (hasD) {
    const line = designGates.get(gateNum)?.line;
    activationInfo = `\nDesign: Line ${line || '?'}`;
  }

  title.textContent = `Gate ${gateNum}: ${gateInfo.name || 'Unknown'}\nI Ching: ${gateInfo.iching || ''}\nTheme: ${gateInfo.theme || ''}${activationInfo}`;
  g.appendChild(title);

  svg.appendChild(g);
}

/**
 * Determine how a center is defined based on channels
 */
function getCenterDefinitionType(centerName, activeChannels, personalityGates, designGates) {
  let hasDesignDefinition = false;
  let hasPersonalityDefinition = false;

  for (const channel of activeChannels) {
    const [g1, g2] = channel.gates;
    const center1 = GATE_TO_CENTER[g1];
    const center2 = GATE_TO_CENTER[g2];

    if (center1 !== centerName && center2 !== centerName) continue;

    const g1HasDesign = designGates.has(g1);
    const g1HasPersonality = personalityGates.has(g1);
    const g2HasDesign = designGates.has(g2);
    const g2HasPersonality = personalityGates.has(g2);

    if (g1HasDesign || g2HasDesign) hasDesignDefinition = true;
    if (g1HasPersonality || g2HasPersonality) hasPersonalityDefinition = true;
  }

  if (hasDesignDefinition && hasPersonalityDefinition) return 'both';
  if (hasDesignDefinition) return 'design';
  if (hasPersonalityDefinition) return 'personality';
  return null;
}

/**
 * Get gates that are part of complete channels
 */
function getCompleteChannelGates(activeChannels) {
  const gates = new Set();
  activeChannels.forEach(channel => {
    channel.gates.forEach(g => gates.add(g));
  });
  return gates;
}

/**
 * Main render function
 */
export function renderBodygraph(container, data) {
  const existing = container.querySelector('.bodygraph-svg');
  if (existing) existing.remove();

  // Add padding to prevent edge cutoff
  const padding = 20;
  const svg = createSvgElement('svg', {
    viewBox: `${VIEWBOX.minX - padding} ${VIEWBOX.minY} ${VIEWBOX.width + padding * 2} ${VIEWBOX.height}`,
    class: 'bodygraph-svg',
    style: 'max-width: 420px; height: auto; display: block; margin: 0 auto 1rem;'
  });

  // Background
  const bg = createSvgElement('rect', {
    x: 0, y: 0,
    width: VIEWBOX.width,
    height: VIEWBOX.height,
    fill: 'transparent'
  });
  svg.appendChild(bg);

  // Build activation maps from data
  const personalityGates = new Map();
  const designGates = new Map();

  if (data.gates?.personality) {
    Object.values(data.gates.personality).forEach(g => {
      if (g?.gate) personalityGates.set(g.gate, g);
    });
  }
  if (data.gates?.design) {
    Object.values(data.gates.design).forEach(g => {
      if (g?.gate) designGates.set(g.gate, g);
    });
  }

  // Get active channels and complete channel gates
  const activeChannels = data.channels || [];
  const completeChannelGates = getCompleteChannelGates(activeChannels);

  // Create layer groups
  const gatePathsLayer = createSvgElement('g', { class: 'gate-paths-layer' });
  const centersLayer = createSvgElement('g', { class: 'centers-layer' });
  const gateLabelsLayer = createSvgElement('g', { class: 'gate-labels-layer' });

  svg.appendChild(gatePathsLayer);
  svg.appendChild(centersLayer);
  svg.appendChild(gateLabelsLayer);

  // Draw inactive gate paths first
  Object.keys(GATE_PATHS).forEach(gateNum => {
    const num = parseInt(gateNum);
    const hasP = personalityGates.has(num);
    const hasD = designGates.has(num);

    if (!hasP && !hasD) {
      drawGatePath(gatePathsLayer, num, null, false);
    }
  });

  // Draw active gate paths on top
  Object.keys(GATE_PATHS).forEach(gateNum => {
    const num = parseInt(gateNum);
    const hasP = personalityGates.has(num);
    const hasD = designGates.has(num);

    if (hasP || hasD) {
      let type = 'personality';
      if (hasP && hasD) type = 'both';
      else if (hasD) type = 'design';
      const isComplete = completeChannelGates.has(num);
      drawGatePath(gatePathsLayer, num, type, isComplete);
    }
  });

  // Draw centers with labels
  Object.entries(CENTER_SHAPES).forEach(([name, centerData]) => {
    const definitionType = getCenterDefinitionType(name, activeChannels, personalityGates, designGates);
    drawCenter(centersLayer, name, centerData, definitionType);
  });

  // Draw ALL gate labels with rich tooltips
  for (let gateNum = 1; gateNum <= 64; gateNum++) {
    const gateInfo = GATES[gateNum];
    drawGateLabel(gateLabelsLayer, gateNum, gateInfo, personalityGates, designGates);
  }

  // Legend
  const legendY = VIEWBOX.height - 50;
  const legend = createSvgElement('g', { transform: `translate(80, ${legendY})` });

  const legendBg = createSvgElement('rect', {
    x: -20, y: -10,
    width: 700, height: 50,
    fill: 'var(--bg-card, #ffffff)',
    rx: 8,
    opacity: '0.9'
  });
  legend.appendChild(legendBg);

  const items = [
    { type: 'channel', fill: '#1f2937', label: 'Personality (Conscious)' },
    { type: 'channel', fill: '#ef4444', label: 'Design (Unconscious)' },
    { type: 'gate', fill: '#fef3c7', stroke: '#d97706', label: 'Active Gate' }
  ];

  items.forEach((item, i) => {
    const x = i * 240;

    if (item.type === 'channel') {
      const bar = createSvgElement('rect', {
        x: x, y: 8,
        width: 30, height: 12,
        fill: item.fill,
        rx: 2
      });
      legend.appendChild(bar);
    } else {
      const circ = createSvgElement('circle', {
        cx: x + 15, cy: 14, r: 10,
        fill: item.fill,
        stroke: item.stroke,
        'stroke-width': '2'
      });
      legend.appendChild(circ);
    }

    const txt = createSvgElement('text', {
      x: x + 40, y: 18,
      'font-size': '14',
      'font-weight': '500',
      fill: 'var(--text-muted, #6b7280)',
      'font-family': 'system-ui, -apple-system, sans-serif'
    });
    txt.textContent = item.label;
    legend.appendChild(txt);
  });

  svg.appendChild(legend);
  container.insertBefore(svg, container.firstChild);
}

export default renderBodygraph;
