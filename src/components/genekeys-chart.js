/**
 * Gene Keys Hologenetic Profile - SVG Renderer
 * Renders the three sequences as a connected pathway
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

/**
 * Draw a sphere (circle with key number)
 */
function drawSphere(svg, x, y, keyNum, isActive = false) {
  const g = createSvgElement('g', { class: 'gk-sphere-node' });

  // Outer glow for active
  if (isActive) {
    const glow = createSvgElement('circle', {
      cx: x,
      cy: y,
      r: '14',
      fill: 'none',
      stroke: 'var(--genekeys, #10b981)',
      'stroke-width': '1',
      'stroke-opacity': '0.3'
    });
    g.appendChild(glow);
  }

  // Main circle
  const circle = createSvgElement('circle', {
    cx: x,
    cy: y,
    r: '10',
    fill: 'var(--bg-card, #fff)',
    stroke: 'var(--genekeys, #10b981)',
    'stroke-width': '1.5'
  });
  g.appendChild(circle);

  // Key number
  const text = createSvgElement('text', {
    x: x,
    y: y,
    'text-anchor': 'middle',
    'dominant-baseline': 'central',
    'font-size': '8',
    'font-weight': '600',
    fill: 'var(--genekeys, #10b981)',
    'font-family': 'SF Mono, Monaco, monospace'
  });
  text.textContent = keyNum;
  g.appendChild(text);

  svg.appendChild(g);
}

/**
 * Draw connection line between spheres
 */
function drawConnection(svg, x1, y1, x2, y2) {
  const line = createSvgElement('line', {
    x1, y1, x2, y2,
    stroke: 'var(--genekeys, #10b981)',
    'stroke-width': '1',
    'stroke-opacity': '0.4'
  });
  svg.appendChild(line);
}

/**
 * Draw sequence label
 */
function drawLabel(svg, x, y, text) {
  const label = createSvgElement('text', {
    x: x,
    y: y,
    'text-anchor': 'middle',
    'font-size': '6',
    fill: 'var(--text-muted, #a1a1aa)',
    'text-transform': 'uppercase',
    'letter-spacing': '0.5'
  });
  label.textContent = text;
  svg.appendChild(label);
}

/**
 * Main render function
 */
export function renderGeneKeysChart(container, data) {
  // Clear previous chart
  const existing = container.querySelector('.genekeys-chart-svg');
  if (existing) existing.remove();

  // Create SVG - horizontal layout
  const width = 220;
  const height = 120;

  const svg = createSvgElement('svg', {
    viewBox: `0 0 ${width} ${height}`,
    class: 'genekeys-chart-svg',
    style: 'max-width: 220px; height: auto; display: block; margin: 0 auto 0.75rem;'
  });

  // Extract key numbers from data
  const as = data.activationSequence;
  const vs = data.venusSequence;
  const ps = data.pearlSequence;

  // Row positions
  const row1Y = 25;   // Activation sequence
  const row2Y = 60;   // Venus sequence
  const row3Y = 95;   // Pearl sequence

  // Column positions (4 spheres per row for activation/venus, 3 for pearl)
  const cols4 = [35, 75, 115, 155];
  const cols3 = [55, 110, 165];

  // Draw connections first (background)
  const connectionsGroup = createSvgElement('g', { class: 'connections-layer' });
  svg.appendChild(connectionsGroup);

  // Activation sequence connections
  for (let i = 0; i < 3; i++) {
    drawConnection(connectionsGroup, cols4[i], row1Y, cols4[i + 1], row1Y);
  }

  // Venus sequence connections
  for (let i = 0; i < 3; i++) {
    drawConnection(connectionsGroup, cols4[i], row2Y, cols4[i + 1], row2Y);
  }

  // Pearl sequence connections
  for (let i = 0; i < 2; i++) {
    drawConnection(connectionsGroup, cols3[i], row3Y, cols3[i + 1], row3Y);
  }

  // Cross-sequence connections (vertical - showing the hologenetic path)
  // Life's Work to Attraction
  drawConnection(connectionsGroup, cols4[0], row1Y + 10, cols4[0], row2Y - 10);
  // Purpose to SQ
  drawConnection(connectionsGroup, cols4[3], row1Y + 10, cols4[3], row2Y - 10);
  // Attraction to Vocation
  drawConnection(connectionsGroup, cols4[0], row2Y + 10, cols3[0], row3Y - 10);
  // SQ to Pearl
  drawConnection(connectionsGroup, cols4[3], row2Y + 10, cols3[2], row3Y - 10);

  // Draw spheres
  const spheresGroup = createSvgElement('g', { class: 'spheres-layer' });
  svg.appendChild(spheresGroup);

  // Activation sequence spheres
  drawSphere(spheresGroup, cols4[0], row1Y, as?.lifeWork?.key || '?', true);
  drawSphere(spheresGroup, cols4[1], row1Y, as?.evolution?.key || '?');
  drawSphere(spheresGroup, cols4[2], row1Y, as?.radiance?.key || '?');
  drawSphere(spheresGroup, cols4[3], row1Y, as?.purpose?.key || '?', true);

  // Venus sequence spheres
  drawSphere(spheresGroup, cols4[0], row2Y, vs?.attraction?.key || '?');
  drawSphere(spheresGroup, cols4[1], row2Y, vs?.iq?.key || '?');
  drawSphere(spheresGroup, cols4[2], row2Y, vs?.eq?.key || '?');
  drawSphere(spheresGroup, cols4[3], row2Y, vs?.sq?.key || '?');

  // Pearl sequence spheres
  drawSphere(spheresGroup, cols3[0], row3Y, ps?.vocation?.key || '?');
  drawSphere(spheresGroup, cols3[1], row3Y, ps?.culture?.key || '?');
  drawSphere(spheresGroup, cols3[2], row3Y, ps?.pearl?.key || '?', true);

  // Draw labels
  const labelsGroup = createSvgElement('g', { class: 'labels-layer' });
  svg.appendChild(labelsGroup);

  drawLabel(labelsGroup, width / 2, row1Y - 12, 'Activation');
  drawLabel(labelsGroup, width / 2, row2Y - 12, 'Venus');
  drawLabel(labelsGroup, width / 2, row3Y - 12, 'Pearl');

  // Insert at beginning of container
  container.insertBefore(svg, container.firstChild);
}

export default renderGeneKeysChart;
