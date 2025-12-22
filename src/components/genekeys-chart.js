/**
 * Gene Keys Hologenetic Profile - SVG Renderer
 * Renders the circular hologenetic profile with all 11 spheres
 */

/**
 * Create SVG element with namespace
 */
function createSvgElement(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
  return el;
}

// Sphere colors based on sequence/type
const SPHERE_COLORS = {
  // Activation Sequence (outer journey) - green tones
  lifeWork: { fill: '#dcfce7', stroke: '#22c55e', text: '#15803d' },
  evolution: { fill: '#dcfce7', stroke: '#22c55e', text: '#15803d' },
  radiance: { fill: '#fecaca', stroke: '#ef4444', text: '#dc2626' },
  purpose: { fill: '#fecaca', stroke: '#ef4444', text: '#dc2626' },
  // Venus Sequence (relationships) - pink/red tones
  attraction: { fill: '#fecaca', stroke: '#ef4444', text: '#dc2626' },
  iq: { fill: '#dbeafe', stroke: '#3b82f6', text: '#1d4ed8' },
  eq: { fill: '#fecaca', stroke: '#ef4444', text: '#dc2626' },
  sq: { fill: '#dbeafe', stroke: '#3b82f6', text: '#1d4ed8' },
  // Pearl Sequence (prosperity) - blue tones
  vocation: { fill: '#dbeafe', stroke: '#3b82f6', text: '#1d4ed8' },
  culture: { fill: '#dbeafe', stroke: '#3b82f6', text: '#1d4ed8' },
  pearl: { fill: '#dbeafe', stroke: '#3b82f6', text: '#1d4ed8' },
  // Core (center) - blue
  core: { fill: '#dbeafe', stroke: '#3b82f6', text: '#1d4ed8' }
};

// Sphere positions in the hologenetic profile layout
// Based on the official Gene Keys golden path diagram
// Center is at (200, 200), radius varies by sphere
const SPHERE_POSITIONS = {
  // Top - Life's Work
  lifeWork: { x: 200, y: 45, labelPos: 'above' },

  // Upper area - Pearl sequence continuation
  pearl: { x: 130, y: 90, labelPos: 'left' },
  culture: { x: 270, y: 90, labelPos: 'right' },

  // Middle-upper - Core and connections
  core: { x: 130, y: 150, labelPos: 'left' },
  sq: { x: 200, y: 170, labelPos: 'below' },
  vocation: { x: 270, y: 150, labelPos: 'right' },

  // Outer sides - Radiance and Evolution
  radiance: { x: 50, y: 180, labelPos: 'left' },
  evolution: { x: 350, y: 180, labelPos: 'right' },

  // Lower-middle - IQ and EQ
  iq: { x: 115, y: 235, labelPos: 'left' },
  eq: { x: 285, y: 235, labelPos: 'right' },

  // Bottom - Attraction
  attraction: { x: 200, y: 295, labelPos: 'below' },

  // Very bottom - Purpose
  purpose: { x: 200, y: 365, labelPos: 'below' }
};

// Connection paths between spheres
const CONNECTIONS = [
  // Activation Sequence pathway (green/solid)
  { from: 'lifeWork', to: 'evolution', style: 'activation' },
  { from: 'lifeWork', to: 'radiance', style: 'activation' },
  { from: 'radiance', to: 'purpose', style: 'activation' },
  { from: 'evolution', to: 'purpose', style: 'activation' },

  // Venus Sequence (dashed blue)
  { from: 'attraction', to: 'iq', style: 'venus' },
  { from: 'attraction', to: 'eq', style: 'venus' },
  { from: 'iq', to: 'sq', style: 'venus' },
  { from: 'eq', to: 'sq', style: 'venus' },

  // Pearl Sequence (dashed blue)
  { from: 'sq', to: 'core', style: 'pearl' },
  { from: 'sq', to: 'vocation', style: 'pearl' },
  { from: 'core', to: 'pearl', style: 'pearl' },
  { from: 'vocation', to: 'culture', style: 'pearl' },
  { from: 'pearl', to: 'lifeWork', style: 'pearl' },
  { from: 'culture', to: 'lifeWork', style: 'pearl' }
];

/**
 * Draw a sphere with label and key number
 */
function drawSphere(svg, sphereKey, sphereData, colors) {
  const pos = SPHERE_POSITIONS[sphereKey];
  if (!pos) return;

  const g = createSvgElement('g', {
    class: `gk-sphere gk-sphere-${sphereKey}`,
    style: 'cursor: pointer;'
  });

  const radius = 24;

  // Main circle with fill
  const circle = createSvgElement('circle', {
    cx: pos.x,
    cy: pos.y,
    r: radius,
    fill: colors.fill,
    stroke: colors.stroke,
    'stroke-width': '2'
  });
  g.appendChild(circle);

  // Key number (larger, prominent)
  const keyText = createSvgElement('text', {
    x: pos.x,
    y: pos.y + 2,
    'text-anchor': 'middle',
    'dominant-baseline': 'middle',
    'font-size': '14',
    'font-weight': '700',
    fill: colors.text,
    'font-family': 'system-ui, -apple-system, sans-serif'
  });
  keyText.textContent = sphereData?.keyLine || '?';
  g.appendChild(keyText);

  // Sphere label (name)
  const labelY = pos.labelPos === 'above' ? pos.y - radius - 8 :
                 pos.labelPos === 'below' ? pos.y + radius + 14 :
                 pos.y - radius - 8;
  const labelX = pos.labelPos === 'left' ? pos.x - 5 :
                 pos.labelPos === 'right' ? pos.x + 5 :
                 pos.x;
  const anchor = pos.labelPos === 'left' ? 'end' :
                 pos.labelPos === 'right' ? 'start' : 'middle';

  const label = createSvgElement('text', {
    x: labelX,
    y: labelY,
    'text-anchor': anchor,
    'font-size': '9',
    'font-weight': '600',
    fill: 'var(--text-muted, #71717a)',
    'font-family': 'system-ui, -apple-system, sans-serif',
    'text-transform': 'capitalize'
  });
  label.textContent = sphereData?.sphere || sphereKey;
  g.appendChild(label);

  // Tooltip on hover
  const title = createSvgElement('title');
  title.textContent = `${sphereData?.sphere || sphereKey}: Gene Key ${sphereData?.key || '?'}
Shadow: ${sphereData?.shadow || '-'}
Gift: ${sphereData?.gift || '-'}
Siddhi: ${sphereData?.siddhi || '-'}`;
  g.appendChild(title);

  svg.appendChild(g);
}

/**
 * Draw connection line between spheres
 */
function drawConnection(svg, conn) {
  const from = SPHERE_POSITIONS[conn.from];
  const to = SPHERE_POSITIONS[conn.to];
  if (!from || !to) return;

  // Line styles based on connection type
  let stroke, strokeDash, strokeWidth;
  switch (conn.style) {
    case 'activation':
      stroke = '#22c55e';
      strokeDash = 'none';
      strokeWidth = '1.5';
      break;
    case 'venus':
      stroke = '#ef4444';
      strokeDash = '4,3';
      strokeWidth = '1.5';
      break;
    case 'pearl':
      stroke = '#3b82f6';
      strokeDash = '4,3';
      strokeWidth = '1.5';
      break;
    default:
      stroke = '#a1a1aa';
      strokeDash = 'none';
      strokeWidth = '1';
  }

  const line = createSvgElement('line', {
    x1: from.x,
    y1: from.y,
    x2: to.x,
    y2: to.y,
    stroke: stroke,
    'stroke-width': strokeWidth,
    'stroke-dasharray': strokeDash,
    'stroke-opacity': '0.6'
  });

  svg.appendChild(line);
}

/**
 * Draw the outer ring with I Ching hexagram markers (simplified)
 */
function drawOuterRing(svg, cx, cy, radius) {
  // Outer decorative ring
  const ring = createSvgElement('circle', {
    cx: cx,
    cy: cy,
    r: radius,
    fill: 'none',
    stroke: 'var(--border, #e4e4e7)',
    'stroke-width': '1',
    'stroke-dasharray': '2,4'
  });
  svg.appendChild(ring);
}

/**
 * Main render function
 */
export function renderGeneKeysChart(container, data) {
  // Clear previous chart
  const existing = container.querySelector('.genekeys-chart-svg');
  if (existing) existing.remove();

  // Create SVG
  const width = 400;
  const height = 420;

  const svg = createSvgElement('svg', {
    viewBox: `0 0 ${width} ${height}`,
    class: 'genekeys-chart-svg',
    style: 'max-width: 400px; height: auto; display: block; margin: 0 auto 1rem;'
  });

  // Background
  const bg = createSvgElement('rect', {
    x: 0,
    y: 0,
    width: width,
    height: height,
    fill: 'transparent'
  });
  svg.appendChild(bg);

  // Draw outer decorative ring
  drawOuterRing(svg, 200, 200, 175);

  // Draw connections first (behind spheres)
  const connectionsGroup = createSvgElement('g', { class: 'connections-layer' });
  svg.appendChild(connectionsGroup);

  CONNECTIONS.forEach(conn => drawConnection(connectionsGroup, conn));

  // Extract sphere data from sequences
  const as = data.activationSequence || {};
  const vs = data.venusSequence || {};
  const ps = data.pearlSequence || {};

  // Map sphere keys to their data
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
    // Core uses Mars Design (same as vocation in some interpretations)
    core: ps.vocation ? { ...ps.vocation, sphere: 'Core' } : { sphere: 'Core', key: '?' }
  };

  // Draw spheres
  const spheresGroup = createSvgElement('g', { class: 'spheres-layer' });
  svg.appendChild(spheresGroup);

  Object.entries(SPHERE_POSITIONS).forEach(([key]) => {
    const colors = SPHERE_COLORS[key] || SPHERE_COLORS.core;
    drawSphere(spheresGroup, key, sphereData[key], colors);
  });

  // Title
  const title = createSvgElement('text', {
    x: width / 2,
    y: height - 8,
    'text-anchor': 'middle',
    'font-size': '10',
    fill: 'var(--text-muted, #a1a1aa)',
    'font-family': 'system-ui, -apple-system, sans-serif'
  });
  title.textContent = 'Hologenetic Profile';
  svg.appendChild(title);

  // Insert at beginning of container
  container.insertBefore(svg, container.firstChild);
}

export default renderGeneKeysChart;
