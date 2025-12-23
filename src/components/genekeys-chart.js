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

// Sphere definitions with positions (viewBox: 0 0 400 480)
const SPHERES = {
  // Activation Sequence (Green) - outer diamond
  lifeWork: {
    x: 200, y: 55,
    radius: 32,
    sequence: 'activation',
    label: "Life's Work"
  },
  radiance: {
    x: 40, y: 245,
    radius: 36,
    sequence: 'activation',
    label: 'Radiance'
  },
  evolution: {
    x: 360, y: 245,
    radius: 36,
    sequence: 'activation',
    label: 'Evolution'
  },
  purpose: {
    x: 200, y: 435,
    radius: 32,
    sequence: 'activation',
    label: 'Purpose'
  },

  // Pearl Sequence (Blue) - upper inner
  pearl: {
    x: 120, y: 130,
    radius: 26,
    sequence: 'pearl',
    label: 'Pearl'
  },
  culture: {
    x: 280, y: 130,
    radius: 26,
    sequence: 'pearl',
    label: 'Culture'
  },
  core: {
    x: 115, y: 210,
    radius: 26,
    sequence: 'pearl',
    label: 'Core'
  },
  vocation: {
    x: 285, y: 210,
    radius: 26,
    sequence: 'pearl',
    label: 'Vocation'
  },
  sq: {
    x: 200, y: 265,
    radius: 26,
    sequence: 'pearl',
    label: 'SQ'
  },

  // Venus Sequence (Pink/Red) - lower inner
  iq: {
    x: 140, y: 320,
    radius: 26,
    sequence: 'venus',
    label: 'IQ'
  },
  eq: {
    x: 260, y: 320,
    radius: 26,
    sequence: 'venus',
    label: 'EQ'
  },
  attraction: {
    x: 200, y: 370,
    radius: 26,
    sequence: 'venus',
    label: 'Attraction'
  }
};

// Connection definitions
const CONNECTIONS = [
  // Activation Sequence - outer diamond (solid green)
  { from: 'lifeWork', to: 'radiance', sequence: 'activation', style: 'solid' },
  { from: 'lifeWork', to: 'evolution', sequence: 'activation', style: 'solid' },
  { from: 'radiance', to: 'purpose', sequence: 'activation', style: 'solid' },
  { from: 'evolution', to: 'purpose', sequence: 'activation', style: 'solid' },
  // Horizontal dashed line
  { from: 'radiance', to: 'evolution', sequence: 'activation', style: 'dashed' },

  // Pearl Sequence - upper connections (dashed blue)
  { from: 'lifeWork', to: 'pearl', sequence: 'pearl', style: 'solid' },
  { from: 'lifeWork', to: 'culture', sequence: 'pearl', style: 'solid' },
  { from: 'pearl', to: 'core', sequence: 'pearl', style: 'dashed' },
  { from: 'culture', to: 'vocation', sequence: 'pearl', style: 'dashed' },
  { from: 'core', to: 'vocation', sequence: 'pearl', style: 'solid' },
  { from: 'core', to: 'sq', sequence: 'pearl', style: 'dashed' },
  { from: 'vocation', to: 'sq', sequence: 'pearl', style: 'dashed' },

  // Venus Sequence - lower connections (solid red)
  { from: 'sq', to: 'iq', sequence: 'venus', style: 'dashed' },
  { from: 'sq', to: 'eq', sequence: 'venus', style: 'dashed' },
  { from: 'iq', to: 'eq', sequence: 'venus', style: 'solid' },
  { from: 'iq', to: 'attraction', sequence: 'venus', style: 'solid' },
  { from: 'eq', to: 'attraction', sequence: 'venus', style: 'solid' },
  { from: 'attraction', to: 'purpose', sequence: 'venus', style: 'solid' }
];

/**
 * Draw gradient definitions
 */
function addGradients(defs) {
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
 */
function drawSphere(svg, key, sphere, data) {
  const colors = COLORS[sphere.sequence];
  const gradId = `gk-grad-${sphere.sequence}`;

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
    stroke: colors.stroke,
    'stroke-width': '2.5'
  });
  g.appendChild(circle);

  // Key number with line (e.g., "64.3")
  const keyLine = data?.keyLine || `${data?.key || '?'}.${data?.line || '?'}`;
  const keyText = createSvgElement('text', {
    x: sphere.x,
    y: sphere.y + 2,
    'text-anchor': 'middle',
    'dominant-baseline': 'middle',
    'font-size': sphere.radius > 30 ? '18' : '14',
    'font-weight': '700',
    fill: colors.text,
    'font-family': 'system-ui, -apple-system, sans-serif'
  });
  keyText.textContent = keyLine;
  g.appendChild(keyText);

  // Label above or below sphere
  const isBottom = sphere.y > 350;
  const isOuter = key === 'radiance' || key === 'evolution';
  const labelY = isBottom ? sphere.y + sphere.radius + 16 : sphere.y - sphere.radius - 8;

  const label = createSvgElement('text', {
    x: sphere.x,
    y: labelY,
    'text-anchor': 'middle',
    'font-size': isOuter ? '11' : '10',
    'font-weight': '600',
    fill: colors.text,
    'font-family': 'system-ui, -apple-system, sans-serif'
  });
  label.textContent = sphere.label;
  g.appendChild(label);

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

  const width = 400;
  const height = 480;

  const svg = createSvgElement('svg', {
    viewBox: `0 0 ${width} ${height}`,
    class: 'genekeys-chart-svg',
    style: 'max-width: 420px; height: auto; display: block; margin: 0 auto 1rem;'
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

  // Outer decorative ring
  drawOuterRing(svg, 200, 245, 185);

  // Connections layer (behind spheres)
  const connectionsLayer = createSvgElement('g', { class: 'gk-connections' });
  svg.appendChild(connectionsLayer);

  CONNECTIONS.forEach(conn => drawConnection(connectionsLayer, conn, SPHERES));

  // Extract data from sequences
  const as = data.activationSequence || {};
  const vs = data.venusSequence || {};
  const ps = data.pearlSequence || {};

  const sphereData = {
    lifeWork: as.lifeWork,
    evolution: as.evolution,
    radiance: as.radiance,
    purpose: as.purpose,
    attraction: vs.attraction,
    iq: vs.iq,
    eq: vs.eq,
    sq: vs.sq,
    vocation: ps.vocation,
    culture: ps.culture,
    pearl: ps.pearl,
    core: ps.vocation ? { ...ps.vocation, sphere: 'Core' } : null
  };

  // Spheres layer
  const spheresLayer = createSvgElement('g', { class: 'gk-spheres' });
  svg.appendChild(spheresLayer);

  // Draw spheres in order (back to front)
  const drawOrder = ['sq', 'core', 'vocation', 'pearl', 'culture', 'iq', 'eq', 'attraction', 'radiance', 'evolution', 'lifeWork', 'purpose'];
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
