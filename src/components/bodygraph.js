/**
 * Human Design Bodygraph - SVG Renderer
 * Renders the 9-center bodygraph with channels
 */

// Center definitions with positions and shapes - scaled for compact display
const CENTERS = {
  head: { x: 75, y: 15, shape: 'triangle', label: 'Head' },
  ajna: { x: 75, y: 42, shape: 'triangle', label: 'Ajna' },
  throat: { x: 75, y: 72, shape: 'square', label: 'Throat' },
  g: { x: 75, y: 108, shape: 'diamond', label: 'G' },
  heart: { x: 42, y: 95, shape: 'triangle-right', label: 'Heart' },
  sacral: { x: 75, y: 148, shape: 'square', label: 'Sacral' },
  spleen: { x: 32, y: 132, shape: 'triangle-right', label: 'Spleen' },
  solarplexus: { x: 118, y: 132, shape: 'triangle-left', label: 'Solar Plexus' },
  root: { x: 75, y: 183, shape: 'square', label: 'Root' }
};

// Channel definitions: which gates connect which centers
const CHANNELS = {
  '64-47': { from: 'head', to: 'ajna' },
  '61-24': { from: 'head', to: 'ajna' },
  '63-4': { from: 'head', to: 'ajna' },
  '17-62': { from: 'ajna', to: 'throat' },
  '43-23': { from: 'ajna', to: 'throat' },
  '11-56': { from: 'ajna', to: 'throat' },
  '16-48': { from: 'throat', to: 'spleen' },
  '20-57': { from: 'throat', to: 'spleen' },
  '20-34': { from: 'throat', to: 'sacral' },
  '20-10': { from: 'throat', to: 'g' },
  '31-7': { from: 'throat', to: 'g' },
  '8-1': { from: 'throat', to: 'g' },
  '33-13': { from: 'throat', to: 'g' },
  '35-36': { from: 'throat', to: 'solarplexus' },
  '12-22': { from: 'throat', to: 'solarplexus' },
  '45-21': { from: 'throat', to: 'heart' },
  '26-44': { from: 'heart', to: 'spleen' },
  '51-25': { from: 'heart', to: 'g' },
  '40-37': { from: 'heart', to: 'solarplexus' },
  '10-34': { from: 'g', to: 'sacral' },
  '15-5': { from: 'g', to: 'sacral' },
  '2-14': { from: 'g', to: 'sacral' },
  '46-29': { from: 'g', to: 'sacral' },
  '57-34': { from: 'spleen', to: 'sacral' },
  '50-27': { from: 'spleen', to: 'sacral' },
  '32-54': { from: 'spleen', to: 'root' },
  '28-38': { from: 'spleen', to: 'root' },
  '18-58': { from: 'spleen', to: 'root' },
  '6-59': { from: 'sacral', to: 'solarplexus' },
  '42-53': { from: 'sacral', to: 'root' },
  '3-60': { from: 'sacral', to: 'root' },
  '9-52': { from: 'sacral', to: 'root' },
  '19-49': { from: 'root', to: 'solarplexus' },
  '39-55': { from: 'root', to: 'solarplexus' },
  '41-30': { from: 'root', to: 'solarplexus' }
};

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
 * Draw a center shape
 */
function drawCenter(svg, center, isDefined) {
  const { x, y, shape } = center;
  const size = 16;
  const fill = isDefined ? 'var(--bg-subtle, #f4f4f5)' : 'var(--bg-card, #fff)';
  const stroke = isDefined ? 'var(--humandesign, #3b82f6)' : 'var(--border-strong, #d4d4d8)';
  const strokeWidth = isDefined ? '1.5' : '1';

  let element;

  switch (shape) {
    case 'triangle':
      const triPoints = `${x},${y - size/2} ${x - size/2},${y + size/2} ${x + size/2},${y + size/2}`;
      element = createSvgElement('polygon', { points: triPoints });
      break;

    case 'triangle-right':
      const triRPoints = `${x - size/2},${y - size/2} ${x - size/2},${y + size/2} ${x + size/2},${y}`;
      element = createSvgElement('polygon', { points: triRPoints });
      break;

    case 'triangle-left':
      const triLPoints = `${x + size/2},${y - size/2} ${x + size/2},${y + size/2} ${x - size/2},${y}`;
      element = createSvgElement('polygon', { points: triLPoints });
      break;

    case 'square':
      element = createSvgElement('rect', {
        x: x - size/2,
        y: y - size/2,
        width: size,
        height: size,
        rx: '3'
      });
      break;

    case 'diamond':
      const diaPoints = `${x},${y - size/2} ${x + size/2},${y} ${x},${y + size/2} ${x - size/2},${y}`;
      element = createSvgElement('polygon', { points: diaPoints });
      break;

    default:
      element = createSvgElement('circle', { cx: x, cy: y, r: size/2 });
  }

  element.setAttribute('fill', fill);
  element.setAttribute('stroke', stroke);
  element.setAttribute('stroke-width', strokeWidth);
  element.setAttribute('class', `center ${isDefined ? 'center-defined' : 'center-undefined'}`);

  svg.appendChild(element);
}

/**
 * Draw a channel line between two centers
 */
function drawChannel(svg, fromCenter, toCenter, isActive) {
  const from = CENTERS[fromCenter];
  const to = CENTERS[toCenter];

  if (!from || !to) return;

  const line = createSvgElement('line', {
    x1: from.x,
    y1: from.y,
    x2: to.x,
    y2: to.y,
    stroke: isActive ? 'var(--humandesign, #3b82f6)' : 'var(--border, #e4e4e7)',
    'stroke-width': isActive ? '2' : '1',
    'stroke-opacity': isActive ? '0.8' : '0.25',
    class: `channel ${isActive ? 'channel-active' : ''}`
  });

  svg.appendChild(line);
}

/**
 * Main render function
 */
export function renderBodygraph(container, data) {
  // Clear previous chart
  const existing = container.querySelector('.bodygraph-svg');
  if (existing) existing.remove();

  // Create SVG - compact size
  const width = 150;
  const height = 200;

  const svg = createSvgElement('svg', {
    viewBox: `0 0 ${width} ${height}`,
    class: 'bodygraph-svg',
    style: 'max-width: 150px; height: auto; display: block; margin: 0 auto 0.75rem;'
  });

  // Get defined centers and active channels from data
  const definedCenterNames = new Set(
    (data.centers?.defined || []).map(c => c.name.toLowerCase().replace(/\s+/g, ''))
  );

  // Get active channels
  const activeChannels = new Set();
  if (data.channels) {
    data.channels.forEach(channel => {
      if (channel.gates) {
        const key = channel.gates.sort((a, b) => a - b).join('-');
        activeChannels.add(key);
        activeChannels.add(channel.gates.sort((a, b) => b - a).join('-'));
      }
    });
  }

  // Draw channels first (behind centers)
  const channelsGroup = createSvgElement('g', { class: 'channels-layer' });
  svg.appendChild(channelsGroup);

  Object.entries(CHANNELS).forEach(([gates, { from, to }]) => {
    const isActive = activeChannels.has(gates);
    drawChannel(channelsGroup, from, to, isActive);
  });

  // Draw centers
  const centersGroup = createSvgElement('g', { class: 'centers-layer' });
  svg.appendChild(centersGroup);

  Object.entries(CENTERS).forEach(([name, center]) => {
    const isDefined = definedCenterNames.has(name) ||
                      definedCenterNames.has(center.label.toLowerCase().replace(/\s+/g, ''));
  drawCenter(centersGroup, center, isDefined);
  });

  // Insert at beginning of container
  container.insertBefore(svg, container.firstChild);
}

export default renderBodygraph;
