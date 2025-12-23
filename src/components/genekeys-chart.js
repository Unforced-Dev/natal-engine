/**
 * Gene Keys Hologenetic Profile - SVG Renderer
 * Diamond layout matching the official Gene Keys golden path diagram
 */

function createSvgElement(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
  return el;
}

// Color schemes for each sequence
const COLORS = {
  activation: { // Green - outer spheres
    fill: '#dcfce7',
    stroke: '#22c55e',
    text: '#15803d',
    line: '#22c55e'
  },
  venus: { // Pink/Red - relationship spheres
    fill: '#fecaca',
    stroke: '#ef4444',
    text: '#dc2626',
    line: '#b91c1c'
  },
  pearl: { // Blue - prosperity spheres
    fill: '#dbeafe',
    stroke: '#3b82f6',
    text: '#1d4ed8',
    line: '#3b82f6'
  }
};

// Sphere definitions with positions (viewBox: 0 0 500 620)
// Layout based on official Gene Keys hologenetic profile diamond
// Some spheres appear in multiple sequences and have dual colors
const SPHERES = {
  // Life's Work: Activation (green) + Brand/Pearl (blue) = dual color
  // Top of the diamond
  lifeWork: {
    x: 250, y: 55,
    radius: 40,
    sequence: 'activation',
    secondarySequence: 'pearl', // Also serves as Brand in Pearl sequence
    label: "Life's Work",
    labelPos: 'above'
  },
  // Radiance: Activation only (green)
  // Far left on horizontal axis
  radiance: {
    x: 60, y: 320,
    radius: 42,
    sequence: 'activation',
    label: 'Radiance',
    labelPos: 'left'
  },
  // Evolution: Activation only (green)
  // Far right on horizontal axis
  evolution: {
    x: 440, y: 320,
    radius: 42,
    sequence: 'activation',
    label: 'Evolution',
    labelPos: 'right'
  },
  // Purpose: Activation (green) + Venus (red) = dual color
  // Bottom of the diamond
  purpose: {
    x: 250, y: 565,
    radius: 40,
    sequence: 'activation',
    secondarySequence: 'venus', // Entry point into Venus sequence
    label: 'Purpose',
    labelPos: 'below'
  },

  // Pearl: Pearl only (blue)
  // Centered below Life's Work
  pearl: {
    x: 250, y: 150,
    radius: 32,
    sequence: 'pearl',
    label: 'Pearl',
    labelPos: 'above'
  },

  // Core/Vocation: Venus (red) + Pearl (blue) = dual color
  // Below Pearl, left side - same row as Culture
  core: {
    x: 175, y: 230,
    radius: 34,
    sequence: 'venus',
    secondarySequence: 'pearl', // Called "Vocation" in Pearl sequence
    label: 'Core',
    labelPos: 'left'
  },
  // Culture: Pearl only (blue)
  // Below Pearl, right side - same row as Core
  culture: {
    x: 325, y: 230,
    radius: 34,
    sequence: 'pearl',
    label: 'Culture',
    labelPos: 'right'
  },

  // SQ: Venus only (red)
  // Center on horizontal axis (same level as Radiance/Evolution)
  sq: {
    x: 250, y: 320,
    radius: 32,
    sequence: 'venus',
    label: 'SQ',
    labelPos: 'above'
  },
  // IQ: Venus only (red)
  // Below SQ, left side
  iq: {
    x: 190, y: 400,
    radius: 30,
    sequence: 'venus',
    label: 'IQ',
    labelPos: 'left'
  },
  // EQ: Venus only (red)
  // Below SQ, right side
  eq: {
    x: 310, y: 400,
    radius: 30,
    sequence: 'venus',
    label: 'EQ',
    labelPos: 'right'
  },
  // Attraction: Venus only (red)
  // Below IQ/EQ, centered
  attraction: {
    x: 250, y: 475,
    radius: 32,
    sequence: 'venus',
    label: 'Attraction',
    labelPos: 'below'
  }
};

// Connection definitions - matching official Gene Keys diagram
const CONNECTIONS = [
  // Activation Sequence - outer diamond (solid green)
  { from: 'lifeWork', to: 'radiance', sequence: 'activation', style: 'solid' },
  { from: 'lifeWork', to: 'evolution', sequence: 'activation', style: 'solid' },
  { from: 'radiance', to: 'purpose', sequence: 'activation', style: 'solid' },
  { from: 'evolution', to: 'purpose', sequence: 'activation', style: 'solid' },
  // Horizontal dashed line through middle (Radiance - SQ - Evolution)
  { from: 'radiance', to: 'evolution', sequence: 'activation', style: 'dashed' },

  // Pearl Sequence (blue) - inner triangle at top
  { from: 'lifeWork', to: 'pearl', sequence: 'pearl', style: 'solid' },
  { from: 'pearl', to: 'core', sequence: 'pearl', style: 'dashed' },
  { from: 'pearl', to: 'culture', sequence: 'pearl', style: 'dashed' },
  { from: 'core', to: 'culture', sequence: 'pearl', style: 'solid' },

  // Venus Sequence (red) - relationship pathway
  { from: 'core', to: 'sq', sequence: 'venus', style: 'solid' },
  { from: 'sq', to: 'iq', sequence: 'venus', style: 'solid' },
  { from: 'sq', to: 'eq', sequence: 'venus', style: 'solid' },
  { from: 'iq', to: 'eq', sequence: 'venus', style: 'solid' },
  { from: 'iq', to: 'attraction', sequence: 'venus', style: 'solid' },
  { from: 'eq', to: 'attraction', sequence: 'venus', style: 'solid' },
  { from: 'attraction', to: 'purpose', sequence: 'venus', style: 'solid' }
];

/**
 * Draw gradient definitions including dual-color gradients
 */
function addGradients(defs) {
  // Single-color gradients
  // Green gradient for activation spheres
  const greenGrad = createSvgElement('radialGradient', {
    id: 'gk-grad-activation',
    cx: '30%', cy: '30%', r: '70%'
  });
  greenGrad.appendChild(createSvgElement('stop', { offset: '0%', 'stop-color': '#bbf7d0' }));
  greenGrad.appendChild(createSvgElement('stop', { offset: '100%', 'stop-color': '#86efac' }));
  defs.appendChild(greenGrad);

  // Blue gradient for pearl spheres
  const blueGrad = createSvgElement('radialGradient', {
    id: 'gk-grad-pearl',
    cx: '30%', cy: '30%', r: '70%'
  });
  blueGrad.appendChild(createSvgElement('stop', { offset: '0%', 'stop-color': '#dbeafe' }));
  blueGrad.appendChild(createSvgElement('stop', { offset: '100%', 'stop-color': '#93c5fd' }));
  defs.appendChild(blueGrad);

  // Red gradient for venus spheres
  const redGrad = createSvgElement('radialGradient', {
    id: 'gk-grad-venus',
    cx: '30%', cy: '30%', r: '70%'
  });
  redGrad.appendChild(createSvgElement('stop', { offset: '0%', 'stop-color': '#fecaca' }));
  redGrad.appendChild(createSvgElement('stop', { offset: '100%', 'stop-color': '#fca5a5' }));
  defs.appendChild(redGrad);

  // Dual-color gradients for spheres in multiple sequences
  // Activation + Pearl (green + blue) - for Life's Work/Brand
  const greenBlueGrad = createSvgElement('linearGradient', {
    id: 'gk-grad-activation-pearl',
    x1: '0%', y1: '0%', x2: '100%', y2: '100%'
  });
  greenBlueGrad.appendChild(createSvgElement('stop', { offset: '0%', 'stop-color': '#86efac' }));
  greenBlueGrad.appendChild(createSvgElement('stop', { offset: '50%', 'stop-color': '#a7f3d0' }));
  greenBlueGrad.appendChild(createSvgElement('stop', { offset: '100%', 'stop-color': '#93c5fd' }));
  defs.appendChild(greenBlueGrad);

  // Activation + Venus (green + red) - for Purpose
  const greenRedGrad = createSvgElement('linearGradient', {
    id: 'gk-grad-activation-venus',
    x1: '0%', y1: '0%', x2: '100%', y2: '100%'
  });
  greenRedGrad.appendChild(createSvgElement('stop', { offset: '0%', 'stop-color': '#86efac' }));
  greenRedGrad.appendChild(createSvgElement('stop', { offset: '50%', 'stop-color': '#fde68a' }));
  greenRedGrad.appendChild(createSvgElement('stop', { offset: '100%', 'stop-color': '#fca5a5' }));
  defs.appendChild(greenRedGrad);

  // Venus + Pearl (red + blue) - for Core/Vocation
  const redBlueGrad = createSvgElement('linearGradient', {
    id: 'gk-grad-venus-pearl',
    x1: '0%', y1: '0%', x2: '100%', y2: '100%'
  });
  redBlueGrad.appendChild(createSvgElement('stop', { offset: '0%', 'stop-color': '#fca5a5' }));
  redBlueGrad.appendChild(createSvgElement('stop', { offset: '50%', 'stop-color': '#d8b4fe' }));
  redBlueGrad.appendChild(createSvgElement('stop', { offset: '100%', 'stop-color': '#93c5fd' }));
  defs.appendChild(redBlueGrad);
}

/**
 * Draw decorative outer ring with hexagram markers
 */
function drawOuterRing(svg, cx, cy, radius) {
  // Main dashed ring
  const ring = createSvgElement('circle', {
    cx, cy, r: radius,
    fill: 'none',
    stroke: 'var(--border, #e4e4e7)',
    'stroke-width': '1',
    'stroke-dasharray': '3,6',
    opacity: '0.5'
  });
  svg.appendChild(ring);

  // Hexagram markers around the ring
  const numMarkers = 64;
  for (let i = 0; i < numMarkers; i++) {
    const angle = (i / numMarkers) * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + (radius - 8) * Math.cos(angle);
    const y1 = cy + (radius - 8) * Math.sin(angle);
    const x2 = cx + (radius + 2) * Math.cos(angle);
    const y2 = cy + (radius + 2) * Math.sin(angle);

    // Only draw every other marker for subtlety
    if (i % 2 === 0) {
      const marker = createSvgElement('line', {
        x1, y1, x2, y2,
        stroke: 'var(--border, #d4d4d8)',
        'stroke-width': '1',
        opacity: '0.3'
      });
      svg.appendChild(marker);
    }
  }
}

/**
 * Draw connection line
 */
function drawConnection(svg, conn, spheres) {
  const from = spheres[conn.from];
  const to = spheres[conn.to];
  if (!from || !to) return;

  const colors = COLORS[conn.sequence];
  const isDashed = conn.style === 'dashed';

  const line = createSvgElement('line', {
    x1: from.x,
    y1: from.y,
    x2: to.x,
    y2: to.y,
    stroke: colors.line,
    'stroke-width': '2',
    'stroke-dasharray': isDashed ? '6,4' : 'none',
    'stroke-linecap': 'round',
    opacity: '0.7'
  });

  svg.appendChild(line);
}

/**
 * Draw a sphere with label
 * Supports dual-color gradients for spheres in multiple sequences
 */
function drawSphere(svg, key, sphere, data) {
  const colors = COLORS[sphere.sequence];

  // Determine gradient ID - use dual gradient if sphere is in multiple sequences
  let gradId;
  let strokeColor = colors.stroke;

  if (sphere.secondarySequence) {
    // Use dual-color gradient
    gradId = `gk-grad-${sphere.sequence}-${sphere.secondarySequence}`;
    // Use a neutral/mixed stroke color for dual spheres
    strokeColor = '#9ca3af';
  } else {
    gradId = `gk-grad-${sphere.sequence}`;
  }

  const g = createSvgElement('g', {
    class: `gk-sphere gk-sphere-${key}`,
    style: 'cursor: pointer;'
  });

  // Main circle with gradient
  const circle = createSvgElement('circle', {
    cx: sphere.x,
    cy: sphere.y,
    r: sphere.radius,
    fill: `url(#${gradId})`,
    stroke: strokeColor,
    'stroke-width': '2.5'
  });
  g.appendChild(circle);

  // Label inside circle (above the number)
  const labelFontSize = sphere.radius > 35 ? 10 : 8;
  const label = createSvgElement('text', {
    x: sphere.x,
    y: sphere.y - sphere.radius * 0.35,
    'text-anchor': 'middle',
    'dominant-baseline': 'middle',
    'font-size': labelFontSize,
    'font-weight': '600',
    fill: colors.text,
    'font-family': 'system-ui, -apple-system, sans-serif'
  });
  label.textContent = sphere.label;
  g.appendChild(label);

  // Key number with line (e.g., "64.3") below the label
  const keyLine = data?.keyLine || `${data?.key || '?'}.${data?.line || '?'}`;
  const keyText = createSvgElement('text', {
    x: sphere.x,
    y: sphere.y + sphere.radius * 0.25,
    'text-anchor': 'middle',
    'dominant-baseline': 'middle',
    'font-size': sphere.radius > 35 ? '16' : '13',
    'font-weight': '700',
    fill: colors.text,
    'font-family': 'system-ui, -apple-system, sans-serif'
  });
  keyText.textContent = keyLine;
  g.appendChild(keyText);

  // Tooltip
  const title = createSvgElement('title');
  title.textContent = `${sphere.label}: Gene Key ${data?.key || '?'}
Shadow: ${data?.shadow || '-'}
Gift: ${data?.gift || '-'}
Siddhi: ${data?.siddhi || '-'}`;
  g.appendChild(title);

  svg.appendChild(g);
}

/**
 * Main render function
 */
export function renderGeneKeysChart(container, data) {
  const existing = container.querySelector('.genekeys-chart-svg');
  if (existing) existing.remove();

  const width = 500;
  const height = 620;

  const svg = createSvgElement('svg', {
    viewBox: `0 0 ${width} ${height}`,
    class: 'genekeys-chart-svg',
    style: 'max-width: 500px; width: 100%; height: auto; display: block; margin: 0 auto 1rem;'
  });

  // Defs for gradients
  const defs = createSvgElement('defs');
  addGradients(defs);
  svg.appendChild(defs);

  // Background
  const bg = createSvgElement('rect', {
    x: 0, y: 0, width, height,
    fill: 'transparent'
  });
  svg.appendChild(bg);

  // Outer decorative ring - centered on SQ (middle of the chart)
  drawOuterRing(svg, 250, 310, 230);

  // Connections layer (behind spheres)
  const connectionsLayer = createSvgElement('g', { class: 'gk-connections' });
  svg.appendChild(connectionsLayer);

  CONNECTIONS.forEach(conn => drawConnection(connectionsLayer, conn, SPHERES));

  // Extract data from sequences
  const as = data.activationSequence || {};
  const vs = data.venusSequence || {};
  const ps = data.pearlSequence || {};

  // Sphere data mapping
  // Note: Core (Venus) and Vocation (Pearl) share the same Gene Key (design Mars)
  // They represent the same position viewed through different sequence lenses
  const sphereData = {
    // Activation Sequence (Green) - outer diamond
    lifeWork: as.lifeWork,
    evolution: as.evolution,
    radiance: as.radiance,
    purpose: as.purpose,
    // Venus Sequence (Red) - relationships
    attraction: vs.attraction,
    iq: vs.iq,
    eq: vs.eq,
    sq: vs.sq,
    // Core/Vocation - same sphere in both Venus (Core) and Pearl (Vocation) sequences
    // Uses Design Mars planetary position
    core: ps.vocation ? { ...ps.vocation, sphere: 'Core' } : null,
    // Pearl Sequence (Blue) - prosperity
    culture: ps.culture,
    pearl: ps.pearl
  };

  // Spheres layer
  const spheresLayer = createSvgElement('g', { class: 'gk-spheres' });
  svg.appendChild(spheresLayer);

  // Draw spheres in order (back to front)
  const drawOrder = ['sq', 'core', 'pearl', 'culture', 'iq', 'eq', 'attraction', 'radiance', 'evolution', 'lifeWork', 'purpose'];
  drawOrder.forEach(key => {
    const sphere = SPHERES[key];
    if (sphere) {
      drawSphere(spheresLayer, key, sphere, sphereData[key]);
    }
  });

  // Title
  const title = createSvgElement('text', {
    x: width / 2,
    y: height - 5,
    'text-anchor': 'middle',
    'font-size': '11',
    fill: 'var(--text-muted, #a1a1aa)',
    'font-family': 'system-ui, -apple-system, sans-serif'
  });
  title.textContent = 'Hologenetic Profile';
  svg.appendChild(title);

  container.insertBefore(svg, container.firstChild);
}

export default renderGeneKeysChart;
