/**
 * Synastry Bi-Wheel Chart - SVG Renderer
 * Shows two charts overlaid: Person A on outer wheel, Person B on inner wheel
 * with synastry aspect lines between them
 */

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

const ASPECTS = {
  conjunction: { color: '#f59e0b', dash: '', width: 2 },
  sextile: { color: '#3b82f6', dash: '4,2', width: 1.5 },
  square: { color: '#ef4444', dash: '', width: 2 },
  trine: { color: '#3b82f6', dash: '', width: 2 },
  opposition: { color: '#ef4444', dash: '', width: 2 },
  quincunx: { color: '#22c55e', dash: '2,2', width: 1.5 }
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
  let tooltip = container.querySelector('.synastry-chart-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.className = 'synastry-chart-tooltip';
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
      max-width: 220px;
    `;
    container.style.position = 'relative';
    container.appendChild(tooltip);
  }
  return tooltip;
}

function showTooltip(tooltip, content, x, y) {
  tooltip.innerHTML = content;
  tooltip.style.left = `${x + 15}px`;
  tooltip.style.top = `${y - 10}px`;
  tooltip.style.opacity = '1';
}

function hideTooltip(tooltip) {
  tooltip.style.opacity = '0';
}

function drawZodiacRing(svg, cx, cy, outerR, innerR, ascendant) {
  const group = createSvgElement('g', { class: 'zodiac-ring' });

  const outerCircle = createSvgElement('circle', {
    cx, cy, r: outerR,
    fill: 'none',
    stroke: 'var(--border, #e4e4e7)',
    'stroke-width': '1'
  });
  group.appendChild(outerCircle);

  const innerCircle = createSvgElement('circle', {
    cx, cy, r: innerR,
    fill: 'none',
    stroke: 'var(--border, #e4e4e7)',
    'stroke-width': '1'
  });
  group.appendChild(innerCircle);

  ZODIAC.forEach((sign, i) => {
    const startLon = i * 30;
    const divStart = polarToCart(cx, cy, innerR, startLon, ascendant);
    const divEnd = polarToCart(cx, cy, outerR, startLon, ascendant);
    const divLine = createSvgElement('line', {
      x1: divStart.x, y1: divStart.y,
      x2: divEnd.x, y2: divEnd.y,
      stroke: 'var(--border, #e4e4e7)',
      'stroke-width': '1'
    });
    group.appendChild(divLine);

    const midLon = startLon + 15;
    const symbolR = (outerR + innerR) / 2;
    const symbolPos = polarToCart(cx, cy, symbolR, midLon, ascendant);

    const text = createSvgElement('text', {
      x: symbolPos.x,
      y: symbolPos.y,
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      'font-size': '11',
      fill: 'var(--text-secondary, #71717a)',
      class: 'zodiac-symbol'
    });
    text.textContent = sign.symbol;
    group.appendChild(text);
  });

  svg.appendChild(group);
}

function drawDivider(svg, cx, cy, radius) {
  const circle = createSvgElement('circle', {
    cx, cy, r: radius,
    fill: 'none',
    stroke: 'var(--border-strong, #a1a1aa)',
    'stroke-width': '2',
    'stroke-dasharray': '4,2'
  });
  svg.appendChild(circle);
}

function collectPlanets(data) {
  const positions = [];
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
  return positions.sort((a, b) => a.lon - b.lon);
}

function spreadPositions(positions, minGap = 8) {
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
  return displayPositions;
}

function drawPlanets(svg, cx, cy, planetR, tickR, positions, ascendant, tooltip, personLabel, ringColor) {
  const group = createSvgElement('g', { class: `planets-${personLabel.toLowerCase()}` });
  const displayPositions = spreadPositions(positions);

  displayPositions.forEach(planet => {
    const pos = polarToCart(cx, cy, planetR, planet.displayLon, ascendant);

    // Tick mark at actual position
    const tickOuter = polarToCart(cx, cy, tickR, planet.lon, ascendant);
    const tickInner = polarToCart(cx, cy, tickR - 6, planet.lon, ascendant);
    const tick = createSvgElement('line', {
      x1: tickOuter.x, y1: tickOuter.y,
      x2: tickInner.x, y2: tickInner.y,
      stroke: planet.color,
      'stroke-width': '2',
      'stroke-linecap': 'round'
    });
    group.appendChild(tick);

    // Background circle for planet
    const bgCircle = createSvgElement('circle', {
      cx: pos.x, cy: pos.y, r: 10,
      fill: ringColor,
      stroke: planet.color,
      'stroke-width': '1.5',
      opacity: '0.9'
    });
    group.appendChild(bgCircle);

    // Planet symbol
    const text = createSvgElement('text', {
      x: pos.x,
      y: pos.y,
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      'font-size': '11',
      fill: planet.color,
      'font-weight': '600',
      style: 'cursor: pointer;'
    });
    text.textContent = planet.symbol;

    const signPos = getSignPosition(planet.lon);
    const sign = ZODIAC[signPos.signIndex];
    const tooltipContent = `
      <div style="font-weight: 600; color: ${planet.color}; margin-bottom: 2px;">
        ${planet.symbol} ${planet.name} (${personLabel})
      </div>
      <div style="color: var(--text-secondary, #71717a);">
        ${sign.symbol} ${sign.name} ${formatDegree(planet.lon)}
      </div>
    `;

    text.addEventListener('mouseenter', (e) => {
      const containerRect = svg.parentElement.getBoundingClientRect();
      showTooltip(tooltip, tooltipContent, e.clientX - containerRect.left, e.clientY - containerRect.top);
    });
    text.addEventListener('mouseleave', () => hideTooltip(tooltip));

    group.appendChild(text);
  });

  svg.appendChild(group);
  return displayPositions;
}

function drawSynastryAspects(svg, cx, cy, aspectR, synastryAspects, positionsA, positionsB, ascendant, tooltip) {
  if (!synastryAspects || synastryAspects.length === 0) return;

  const group = createSvgElement('g', { class: 'synastry-aspects' });

  const lookupA = {};
  positionsA.forEach(p => {
    lookupA[p.key] = p.displayLon;
    lookupA[p.name.toLowerCase()] = p.displayLon;
  });

  const lookupB = {};
  positionsB.forEach(p => {
    lookupB[p.key] = p.displayLon;
    lookupB[p.name.toLowerCase()] = p.displayLon;
  });

  const sortedAspects = [...synastryAspects].sort((a, b) => {
    const orbA = parseFloat(a.orb) || 10;
    const orbB = parseFloat(b.orb) || 10;
    return orbB - orbA;
  });

  sortedAspects.slice(0, 15).forEach(aspect => {
    const p1Key = aspect.personA?.toLowerCase();
    const p2Key = aspect.personB?.toLowerCase();
    const aspectType = aspect.aspect?.toLowerCase();

    const lonA = lookupA[p1Key];
    const lonB = lookupB[p2Key];

    if (lonA === undefined || lonB === undefined) return;

    const style = ASPECTS[aspectType] || { color: '#9ca3af', dash: '2,2', width: 1 };
    const posA = polarToCart(cx, cy, aspectR + 25, lonA, ascendant);
    const posB = polarToCart(cx, cy, aspectR, lonB, ascendant);

    const line = createSvgElement('line', {
      x1: posA.x, y1: posA.y,
      x2: posB.x, y2: posB.y,
      stroke: style.color,
      'stroke-width': style.width,
      'stroke-dasharray': style.dash,
      'stroke-opacity': '0.6',
      'stroke-linecap': 'round',
      style: 'cursor: pointer; transition: stroke-opacity 0.15s;'
    });

    const tooltipContent = `
      <div style="font-weight: 600; margin-bottom: 2px;">
        ${aspect.personA} (A) ${aspect.symbol} ${aspect.personB} (B)
      </div>
      <div style="color: var(--text-secondary, #71717a);">
        ${aspect.aspect} · orb ${aspect.orb}°
      </div>
      ${aspect.meaning ? `<div style="margin-top: 4px; font-size: 11px;">${aspect.meaning}</div>` : ''}
    `;

    line.addEventListener('mouseenter', (e) => {
      line.setAttribute('stroke-opacity', '1');
      line.setAttribute('stroke-width', style.width + 1);
      const containerRect = svg.parentElement.getBoundingClientRect();
      showTooltip(tooltip, tooltipContent, e.clientX - containerRect.left, e.clientY - containerRect.top);
    });
    line.addEventListener('mouseleave', () => {
      line.setAttribute('stroke-opacity', '0.6');
      line.setAttribute('stroke-width', style.width);
      hideTooltip(tooltip);
    });

    group.appendChild(line);
  });

  svg.appendChild(group);
}

function drawLabels(svg, cx, cy, outerR) {
  const group = createSvgElement('g', { class: 'labels' });

  // Person A label (outer)
  const labelA = createSvgElement('text', {
    x: cx + outerR + 5,
    y: cy - outerR + 20,
    'font-size': '11',
    'font-weight': '600',
    fill: '#3b82f6'
  });
  labelA.textContent = 'A';
  group.appendChild(labelA);

  // Person B label (inner)
  const labelB = createSvgElement('text', {
    x: cx + 50,
    y: cy - 30,
    'font-size': '11',
    'font-weight': '600',
    fill: '#ec4899'
  });
  labelB.textContent = 'B';
  group.appendChild(labelB);

  svg.appendChild(group);
}

function drawCenter(svg, cx, cy) {
  const circle = createSvgElement('circle', {
    cx, cy, r: 3,
    fill: 'var(--text-muted, #a1a1aa)'
  });
  svg.appendChild(circle);
}

/**
 * Main render function for synastry bi-wheel
 */
export function renderSynastryChart(container, chartA, chartB, synastryAspects) {
  const existing = container.querySelector('.synastry-chart-svg');
  if (existing) existing.remove();

  const ascendant = chartA.rising?.longitude ?? 0;

  const size = 340;
  const cx = size / 2;
  const cy = size / 2;

  const svg = createSvgElement('svg', {
    viewBox: `0 0 ${size} ${size}`,
    class: 'synastry-chart-svg',
    style: 'max-width: 340px; height: auto; display: block; margin: 0 auto 1rem;'
  });

  // Radii
  const outerR = size / 2 - 8;
  const zodiacInnerR = outerR - 20;
  const dividerR = zodiacInnerR - 30;
  const planetAR = zodiacInnerR - 15;
  const planetBR = dividerR - 20;
  const aspectR = planetBR - 15;

  const tooltip = createTooltip(container);

  // Draw layers
  drawZodiacRing(svg, cx, cy, outerR, zodiacInnerR, ascendant);
  drawDivider(svg, cx, cy, dividerR);

  // Inner background
  const innerBg = createSvgElement('circle', {
    cx, cy, r: aspectR,
    fill: 'var(--bg-card, #fff)',
    stroke: 'var(--border, #e4e4e7)',
    'stroke-width': '1'
  });
  svg.appendChild(innerBg);

  // Collect planets
  const planetsA = collectPlanets(chartA);
  const planetsB = collectPlanets(chartB);

  // Draw synastry aspects first (behind planets)
  const positionsA = spreadPositions(planetsA);
  const positionsB = spreadPositions(planetsB);
  drawSynastryAspects(svg, cx, cy, aspectR, synastryAspects, positionsA, positionsB, ascendant, tooltip);

  // Draw planets
  drawPlanets(svg, cx, cy, planetAR, zodiacInnerR - 2, planetsA, ascendant, tooltip, 'A', 'rgba(59, 130, 246, 0.15)');
  drawPlanets(svg, cx, cy, planetBR, dividerR - 2, planetsB, ascendant, tooltip, 'B', 'rgba(236, 72, 153, 0.15)');

  drawLabels(svg, cx, cy, outerR);
  drawCenter(svg, cx, cy);

  container.insertBefore(svg, container.firstChild);
}

export default renderSynastryChart;
