/**
 * Astrology Chart Wheel - SVG Renderer
 * Professional natal chart with houses, accurate positions, and interactivity
 */

// Zodiac signs
const ZODIAC = [
  { name: 'Aries', symbol: '♈' },
  { name: 'Taurus', symbol: '♉' },
  { name: 'Gemini', symbol: '♊' },
  { name: 'Cancer', symbol: '♋' },
  { name: 'Leo', symbol: '♌' },
  { name: 'Virgo', symbol: '♍' },
  { name: 'Libra', symbol: '♎' },
  { name: 'Scorpio', symbol: '♏' },
  { name: 'Sagittarius', symbol: '♐' },
  { name: 'Capricorn', symbol: '♑' },
  { name: 'Aquarius', symbol: '♒' },
  { name: 'Pisces', symbol: '♓' }
];

// Planet display info
const PLANETS = {
  sun: { symbol: '☉', name: 'Sun', color: '#f59e0b' },
  moon: { symbol: '☽', name: 'Moon', color: '#64748b' },
  mercury: { symbol: '☿', name: 'Mercury', color: '#8b5cf6' },
  venus: { symbol: '♀', name: 'Venus', color: '#ec4899' },
  mars: { symbol: '♂', name: 'Mars', color: '#ef4444' },
  jupiter: { symbol: '♃', name: 'Jupiter', color: '#3b82f6' },
  saturn: { symbol: '♄', name: 'Saturn', color: '#6b7280' },
  uranus: { symbol: '♅', name: 'Uranus', color: '#06b6d4' },
  neptune: { symbol: '♆', name: 'Neptune', color: '#8b5cf6' },
  pluto: { symbol: '♇', name: 'Pluto', color: '#78716c' }
};

// Aspect colors and styles
const ASPECTS = {
  conjunction: { color: '#f59e0b', dash: '', width: 1.5 },
  sextile: { color: '#3b82f6', dash: '4,2', width: 1 },
  square: { color: '#ef4444', dash: '', width: 1.5 },
  trine: { color: '#3b82f6', dash: '', width: 1.5 },
  opposition: { color: '#ef4444', dash: '', width: 1.5 },
  quincunx: { color: '#22c55e', dash: '2,2', width: 1 }
};

function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

function polarToCart(cx, cy, radius, longitude, ascendant) {
  const angle = 180 - (longitude - ascendant);
  const rad = degToRad(angle);
  return {
    x: cx + radius * Math.cos(rad),
    y: cy - radius * Math.sin(rad)
  };
}

function getSignPosition(longitude) {
  const normalized = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const degree = normalized % 30;
  return { signIndex, degree, longitude: normalized };
}

function formatDegree(longitude) {
  const pos = getSignPosition(longitude);
  const deg = Math.floor(pos.degree);
  const min = Math.floor((pos.degree - deg) * 60);
  return `${deg}°${min.toString().padStart(2, '0')}'`;
}

function createSvgElement(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value !== undefined && value !== null) {
      el.setAttribute(key, value);
    }
  }
  return el;
}

function createTooltip(container) {
  let tooltip = container.querySelector('.chart-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.className = 'chart-tooltip';
    tooltip.style.cssText = `
      position: absolute;
      background: var(--bg-card, #fff);
      border: 1px solid var(--border, #e4e4e7);
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 12px;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s;
      z-index: 100;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      max-width: 200px;
    `;
    container.style.position = 'relative';
    container.appendChild(tooltip);
  }
  return tooltip;
}

function showTooltip(tooltip, content, x, y, containerRect) {
  tooltip.innerHTML = content;
  // Position tooltip, keeping it within bounds
  let left = x + 15;
  let top = y - 10;
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
  tooltip.style.opacity = '1';
}

function hideTooltip(tooltip) {
  tooltip.style.opacity = '0';
}

/**
 * Draw the outer ring with zodiac symbols - clean and elegant
 */
function drawZodiacRing(svg, cx, cy, outerR, innerR, ascendant) {
  const group = createSvgElement('g', { class: 'zodiac-ring' });

  // Outer circle
  const outerCircle = createSvgElement('circle', {
    cx, cy, r: outerR,
    fill: 'none',
    stroke: 'var(--border, #e4e4e7)',
    'stroke-width': '1'
  });
  group.appendChild(outerCircle);

  // Inner circle of zodiac ring
  const innerCircle = createSvgElement('circle', {
    cx, cy, r: innerR,
    fill: 'none',
    stroke: 'var(--border, #e4e4e7)',
    'stroke-width': '1'
  });
  group.appendChild(innerCircle);

  // Draw sign divisions and symbols
  ZODIAC.forEach((sign, i) => {
    const startLon = i * 30;
    const endLon = (i + 1) * 30;

    // Division line between signs
    const divStart = polarToCart(cx, cy, innerR, startLon, ascendant);
    const divEnd = polarToCart(cx, cy, outerR, startLon, ascendant);
    const divLine = createSvgElement('line', {
      x1: divStart.x, y1: divStart.y,
      x2: divEnd.x, y2: divEnd.y,
      stroke: 'var(--border, #e4e4e7)',
      'stroke-width': '1'
    });
    group.appendChild(divLine);

    // Sign symbol at center of segment
    const midLon = startLon + 15;
    const symbolR = (outerR + innerR) / 2;
    const symbolPos = polarToCart(cx, cy, symbolR, midLon, ascendant);

    const text = createSvgElement('text', {
      x: symbolPos.x,
      y: symbolPos.y,
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      'font-size': '12',
      fill: 'var(--text-secondary, #71717a)',
      class: 'zodiac-symbol'
    });
    text.textContent = sign.symbol;
    group.appendChild(text);
  });

  // Add degree tick marks (every 5 degrees)
  for (let deg = 0; deg < 360; deg += 5) {
    const isMainTick = deg % 30 === 0; // Sign boundary
    const isMidTick = deg % 10 === 0;  // 10-degree mark

    if (!isMainTick) { // Don't double up on sign boundaries
      const tickOuter = polarToCart(cx, cy, outerR, deg, ascendant);
      const tickLength = isMidTick ? 4 : 2;
      const tickInner = polarToCart(cx, cy, outerR - tickLength, deg, ascendant);

      const tick = createSvgElement('line', {
        x1: tickOuter.x, y1: tickOuter.y,
        x2: tickInner.x, y2: tickInner.y,
        stroke: 'var(--border-strong, #d4d4d8)',
        'stroke-width': isMidTick ? '0.75' : '0.5'
      });
      group.appendChild(tick);
    }
  }

  svg.appendChild(group);
}

/**
 * Draw house divisions
 */
function drawHouses(svg, cx, cy, outerR, innerR, ascendant) {
  const group = createSvgElement('g', { class: 'houses' });

  // Inner house circle
  const houseCircle = createSvgElement('circle', {
    cx, cy, r: innerR,
    fill: 'var(--bg-card, #fff)',
    stroke: 'var(--border, #e4e4e7)',
    'stroke-width': '1'
  });
  group.appendChild(houseCircle);

  // Draw house cusps
  for (let i = 0; i < 12; i++) {
    const houseCusp = (ascendant + i * 30) % 360;
    const isAngular = i === 0 || i === 3 || i === 6 || i === 9;

    const start = polarToCart(cx, cy, innerR, houseCusp, ascendant);
    const end = polarToCart(cx, cy, outerR, houseCusp, ascendant);

    // House cusp line
    const line = createSvgElement('line', {
      x1: start.x, y1: start.y,
      x2: end.x, y2: end.y,
      stroke: isAngular ? 'var(--text-muted, #a1a1aa)' : 'var(--border, #e4e4e7)',
      'stroke-width': isAngular ? '1' : '0.5',
      'stroke-dasharray': isAngular ? '' : '2,2'
    });
    group.appendChild(line);

    // House number (positioned in middle of house)
    const midHouse = (houseCusp + 15) % 360;
    const numR = innerR + 15;
    const numPos = polarToCart(cx, cy, numR, midHouse, ascendant);

    const houseNum = createSvgElement('text', {
      x: numPos.x,
      y: numPos.y,
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      'font-size': '9',
      fill: 'var(--text-muted, #a1a1aa)',
      'font-weight': '400'
    });
    houseNum.textContent = (i + 1).toString();
    group.appendChild(houseNum);
  }

  svg.appendChild(group);
}

/**
 * Draw ASC/MC axes
 */
function drawAxes(svg, cx, cy, innerR, outerR, ascendant, mcLongitude) {
  const group = createSvgElement('g', { class: 'axes' });

  // ASC-DSC line
  const ascPos = polarToCart(cx, cy, outerR + 5, ascendant, ascendant);
  const dscPos = polarToCart(cx, cy, outerR + 5, (ascendant + 180) % 360, ascendant);

  // ASC arrow/marker
  const ascMarker = createSvgElement('path', {
    d: `M ${ascPos.x} ${ascPos.y} l 8 -4 l 0 8 z`,
    fill: 'var(--text, #18181b)'
  });
  group.appendChild(ascMarker);

  // ASC label
  const ascLabel = createSvgElement('text', {
    x: ascPos.x - 18,
    y: ascPos.y,
    'text-anchor': 'middle',
    'dominant-baseline': 'central',
    'font-size': '10',
    'font-weight': '600',
    fill: 'var(--text, #18181b)'
  });
  ascLabel.textContent = 'AC';
  group.appendChild(ascLabel);

  // MC marker and label
  if (mcLongitude !== undefined) {
    const mcPos = polarToCart(cx, cy, outerR + 5, mcLongitude, ascendant);

    const mcLabel = createSvgElement('text', {
      x: mcPos.x,
      y: mcPos.y - 10,
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      'font-size': '9',
      'font-weight': '500',
      fill: 'var(--text-secondary, #71717a)'
    });
    mcLabel.textContent = 'MC';
    group.appendChild(mcLabel);
  }

  svg.appendChild(group);
}

/**
 * Draw planets
 */
function drawPlanets(svg, cx, cy, planetR, data, ascendant, tooltip) {
  const group = createSvgElement('g', { class: 'planets' });

  const positions = [];

  // Collect planets
  if (data.sun?.longitude !== undefined) {
    positions.push({ key: 'sun', ...PLANETS.sun, lon: data.sun.longitude });
  }
  if (data.moon?.longitude !== undefined) {
    positions.push({ key: 'moon', ...PLANETS.moon, lon: data.moon.longitude });
  }
  if (data.planets) {
    Object.entries(data.planets).forEach(([key, planet]) => {
      if (planet?.longitude !== undefined && PLANETS[key]) {
        positions.push({ key, ...PLANETS[key], lon: planet.longitude });
      }
    });
  }

  positions.sort((a, b) => a.lon - b.lon);

  // Collision detection
  const minGap = 10;
  const displayPositions = [];

  positions.forEach((planet) => {
    let displayLon = planet.lon;

    for (const other of displayPositions) {
      let diff = Math.abs(displayLon - other.displayLon);
      if (diff > 180) diff = 360 - diff;
      if (diff < minGap) {
        displayLon = (other.displayLon + minGap) % 360;
      }
    }

    displayPositions.push({ ...planet, displayLon });
  });

  // Draw planets
  displayPositions.forEach(planet => {
    const pos = polarToCart(cx, cy, planetR, planet.displayLon, ascendant);

    // Pointer line from actual position if displaced
    const displacement = Math.abs(planet.displayLon - planet.lon);
    if (displacement > 2 && displacement < 358) {
      const actualPos = polarToCart(cx, cy, planetR + 20, planet.lon, ascendant);
      const midPos = polarToCart(cx, cy, planetR + 10, planet.lon, ascendant);

      const pointer = createSvgElement('path', {
        d: `M ${actualPos.x} ${actualPos.y} L ${midPos.x} ${midPos.y} L ${pos.x} ${pos.y}`,
        fill: 'none',
        stroke: planet.color,
        'stroke-width': '0.5',
        'stroke-opacity': '0.5'
      });
      group.appendChild(pointer);
    }

    // Tick mark at actual position
    const tickOuter = polarToCart(cx, cy, planetR + 22, planet.lon, ascendant);
    const tickInner = polarToCart(cx, cy, planetR + 15, planet.lon, ascendant);
    const tick = createSvgElement('line', {
      x1: tickOuter.x, y1: tickOuter.y,
      x2: tickInner.x, y2: tickInner.y,
      stroke: planet.color,
      'stroke-width': '2',
      'stroke-linecap': 'round'
    });
    group.appendChild(tick);

    // Planet symbol
    const text = createSvgElement('text', {
      x: pos.x,
      y: pos.y,
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      'font-size': '13',
      fill: planet.color,
      'font-weight': '500',
      style: 'cursor: pointer;'
    });
    text.textContent = planet.symbol;

    // Tooltip
    const signPos = getSignPosition(planet.lon);
    const sign = ZODIAC[signPos.signIndex];
    const tooltipContent = `
      <div style="font-weight: 600; color: ${planet.color}; margin-bottom: 2px;">
        ${planet.symbol} ${planet.name}
      </div>
      <div style="color: var(--text-secondary, #71717a);">
        ${sign.symbol} ${sign.name} ${formatDegree(planet.lon)}
      </div>
    `;

    text.addEventListener('mouseenter', (e) => {
      const rect = e.target.getBoundingClientRect();
      const containerRect = svg.parentElement.getBoundingClientRect();
      showTooltip(tooltip, tooltipContent, e.clientX - containerRect.left, e.clientY - containerRect.top);
    });
    text.addEventListener('mouseleave', () => hideTooltip(tooltip));

    group.appendChild(text);
  });

  svg.appendChild(group);
  return displayPositions;
}

/**
 * Draw aspect lines
 */
function drawAspects(svg, cx, cy, aspectR, aspects, positions, ascendant, tooltip) {
  if (!aspects || aspects.length === 0) return;

  const group = createSvgElement('g', { class: 'aspects' });

  const posLookup = {};
  positions.forEach(p => {
    posLookup[p.key] = p.displayLon;
    posLookup[p.name.toLowerCase()] = p.displayLon;
  });

  // Sort aspects by orb (tighter aspects on top)
  const sortedAspects = [...aspects].sort((a, b) => {
    const orbA = parseFloat(a.exactOrb) || 10;
    const orbB = parseFloat(b.exactOrb) || 10;
    return orbB - orbA; // Larger orbs first (drawn first, appear behind)
  });

  sortedAspects.forEach(aspect => {
    const p1 = aspect.planet1?.toLowerCase();
    const p2 = aspect.planet2?.toLowerCase();
    const aspectType = aspect.aspect?.toLowerCase();

    if (posLookup[p1] === undefined || posLookup[p2] === undefined) return;

    const style = ASPECTS[aspectType] || { color: '#9ca3af', dash: '2,2', width: 1 };
    const pos1 = polarToCart(cx, cy, aspectR, posLookup[p1], ascendant);
    const pos2 = polarToCart(cx, cy, aspectR, posLookup[p2], ascendant);

    const line = createSvgElement('line', {
      x1: pos1.x, y1: pos1.y,
      x2: pos2.x, y2: pos2.y,
      stroke: style.color,
      'stroke-width': style.width,
      'stroke-dasharray': style.dash,
      'stroke-opacity': '0.5',
      'stroke-linecap': 'round',
      style: 'cursor: pointer; transition: stroke-opacity 0.15s;'
    });

    const tooltipContent = `
      <div style="font-weight: 600; margin-bottom: 2px;">
        ${aspect.planet1} ${aspect.symbol} ${aspect.planet2}
      </div>
      <div style="color: var(--text-secondary, #71717a);">
        ${aspect.aspect} · orb ${aspect.exactOrb}
      </div>
    `;

    line.addEventListener('mouseenter', (e) => {
      line.setAttribute('stroke-opacity', '1');
      line.setAttribute('stroke-width', style.width + 0.5);
      const containerRect = svg.parentElement.getBoundingClientRect();
      showTooltip(tooltip, tooltipContent, e.clientX - containerRect.left, e.clientY - containerRect.top);
    });
    line.addEventListener('mouseleave', () => {
      line.setAttribute('stroke-opacity', '0.5');
      line.setAttribute('stroke-width', style.width);
      hideTooltip(tooltip);
    });

    group.appendChild(line);
  });

  svg.appendChild(group);
}

/**
 * Draw center point
 */
function drawCenter(svg, cx, cy) {
  const circle = createSvgElement('circle', {
    cx, cy, r: 2,
    fill: 'var(--text-muted, #a1a1aa)'
  });
  svg.appendChild(circle);
}

/**
 * Main render function
 */
export function renderAstrologyChart(container, data) {
  const existing = container.querySelector('.astrology-chart-svg');
  if (existing) existing.remove();

  const ascendant = data.rising?.longitude ?? 0;
  const mcLongitude = data.midheaven?.longitude;

  const size = 300;
  const cx = size / 2;
  const cy = size / 2;

  const svg = createSvgElement('svg', {
    viewBox: `0 0 ${size} ${size}`,
    class: 'astrology-chart-svg',
    style: 'max-width: 300px; height: auto; display: block; margin: 0 auto;'
  });

  // Radii
  const outerR = size / 2 - 8;
  const zodiacInnerR = outerR - 22;
  const houseInnerR = zodiacInnerR - 35;
  const planetR = houseInnerR - 25;
  const aspectR = planetR - 10;

  const tooltip = createTooltip(container);

  // Draw layers
  drawHouses(svg, cx, cy, zodiacInnerR, houseInnerR, ascendant);
  drawZodiacRing(svg, cx, cy, outerR, zodiacInnerR, ascendant);
  drawAxes(svg, cx, cy, zodiacInnerR, outerR, ascendant, mcLongitude);
  const positions = drawPlanets(svg, cx, cy, planetR, data, ascendant, tooltip);
  drawAspects(svg, cx, cy, aspectR, data.aspects, positions, ascendant, tooltip);
  drawCenter(svg, cx, cy);

  container.insertBefore(svg, container.firstChild);
}

export default renderAstrologyChart;
