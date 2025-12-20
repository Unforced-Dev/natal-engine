/**
 * BirthCode Calculator - Main Entry Point
 * Connects all calculators to the UI
 */

import calculateAstrology from './calculators/astrology.js';
import calculateHumanDesign, { calculateGeneKeys } from './calculators/humandesign.js';

// DOM Elements
const form = document.getElementById('birth-form');
const resultsSection = document.getElementById('results');

// Location state
let selectedLocation = null;

// Debounce helper
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Search locations using Nominatim
async function searchLocations(query) {
  if (!query || query.length < 2) return [];

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
      { headers: { 'User-Agent': 'BirthCode Calculator' } }
    );
    const data = await response.json();

    return data.map(item => ({
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      displayName: item.display_name,
      name: item.address?.city || item.address?.town || item.address?.village || item.name,
      region: item.address?.state || item.address?.region || '',
      country: item.address?.country || ''
    }));
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
}

// Format timezone from longitude
function getTimezoneFromLon(lon) {
  return Math.round(lon / 15);
}

// Location autocomplete setup
function setupLocationAutocomplete() {
  const input = document.getElementById('birth-city');
  const dropdown = document.getElementById('location-dropdown');
  const selectedDiv = document.getElementById('location-selected');

  let highlightedIndex = -1;

  const showDropdown = (html) => {
    dropdown.innerHTML = html;
    dropdown.classList.add('active');
  };

  const hideDropdown = () => {
    dropdown.classList.remove('active');
    highlightedIndex = -1;
  };

  const selectLocation = (location) => {
    selectedLocation = location;
    input.value = '';
    hideDropdown();

    // Show selected location
    const tz = getTimezoneFromLon(location.lon);
    const tzStr = tz >= 0 ? `UTC+${tz}` : `UTC${tz}`;
    selectedDiv.innerHTML = `
      <span>📍 ${location.name}${location.region ? ', ' + location.region : ''}, ${location.country}</span>
      <span class="location-coords">(${location.lat.toFixed(2)}°, ${location.lon.toFixed(2)}° · ${tzStr})</span>
      <button type="button" class="clear-location" title="Clear location">×</button>
    `;
    selectedDiv.classList.add('active');

    // Clear button handler
    selectedDiv.querySelector('.clear-location').addEventListener('click', () => {
      selectedLocation = null;
      selectedDiv.classList.remove('active');
      input.placeholder = 'Start typing a city...';
    });

    input.placeholder = 'Change location...';
  };

  // Debounced search
  const debouncedSearch = debounce(async (query) => {
    if (query.length < 2) {
      hideDropdown();
      return;
    }

    showDropdown('<div class="location-loading">Searching...</div>');

    const results = await searchLocations(query);

    if (results.length === 0) {
      showDropdown('<div class="location-no-results">No locations found. Try a different search.</div>');
      return;
    }

    const optionsHtml = results.map((loc, index) => `
      <div class="location-option" data-index="${index}">
        <div class="location-name">${loc.name || 'Unknown'}${loc.region ? ', ' + loc.region : ''}</div>
        <div class="location-details">${loc.country} · ${loc.lat.toFixed(2)}°, ${loc.lon.toFixed(2)}°</div>
      </div>
    `).join('');

    showDropdown(optionsHtml);

    // Add click handlers to options
    dropdown.querySelectorAll('.location-option').forEach((option, index) => {
      option.addEventListener('click', () => selectLocation(results[index]));
    });
  }, 300);

  // Input event
  input.addEventListener('input', (e) => {
    debouncedSearch(e.target.value);
  });

  // Keyboard navigation
  input.addEventListener('keydown', (e) => {
    const options = dropdown.querySelectorAll('.location-option');
    if (!options.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlightedIndex = Math.min(highlightedIndex + 1, options.length - 1);
      options.forEach((opt, i) => opt.classList.toggle('highlighted', i === highlightedIndex));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlightedIndex = Math.max(highlightedIndex - 1, 0);
      options.forEach((opt, i) => opt.classList.toggle('highlighted', i === highlightedIndex));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      options[highlightedIndex].click();
    } else if (e.key === 'Escape') {
      hideDropdown();
    }
  });

  // Hide dropdown on blur (with delay to allow clicks)
  input.addEventListener('blur', () => {
    setTimeout(hideDropdown, 200);
  });

  // Show dropdown on focus if there's text
  input.addEventListener('focus', () => {
    if (input.value.length >= 2) {
      debouncedSearch(input.value);
    }
  });
}

// Toggle coordinates visibility
window.toggleCoordinates = function() {
  const row = document.querySelector('.coordinates-row');
  const btn = document.querySelector('.toggle-coords');
  if (row.style.display === 'none') {
    row.style.display = 'flex';
    btn.textContent = 'Use city search instead';
  } else {
    row.style.display = 'none';
    btn.textContent = 'Enter coordinates manually';
  }
};

// Render functions for each system
function renderAstrology(data) {
  const container = document.getElementById('astrology-result');

  const risingBadge = data.rising.accurate
    ? '<span style="color: #22c55e; font-size: 0.7rem;"> ✓</span>'
    : '<span style="color: #fbbf24; font-size: 0.7rem;"> ⚠️</span>';

  // Planet symbols
  const symbols = {
    mercury: '☿', venus: '♀', mars: '♂', jupiter: '♃',
    saturn: '♄', uranus: '⛢', neptune: '♆', pluto: '♇'
  };

  // Build planets grid
  const planetsHtml = Object.entries(data.planets).map(([name, planet]) => `
    <div class="planet-item">
      <span class="planet-symbol">${symbols[name]}</span>
      <span class="planet-name">${name.charAt(0).toUpperCase() + name.slice(1)}</span>
      <span class="planet-sign">${planet.sign.symbol} ${planet.sign.name}</span>
      <span class="planet-degree">${planet.degree}</span>
    </div>
  `).join('');

  // Nodes
  const nodesHtml = `
    <div class="planet-item">
      <span class="planet-symbol">☊</span>
      <span class="planet-name">North Node</span>
      <span class="planet-sign">${data.nodes.north.sign.symbol} ${data.nodes.north.sign.name}</span>
      <span class="planet-degree">${data.nodes.north.degree}</span>
    </div>
    <div class="planet-item">
      <span class="planet-symbol">☋</span>
      <span class="planet-name">South Node</span>
      <span class="planet-sign">${data.nodes.south.sign.symbol} ${data.nodes.south.sign.name}</span>
      <span class="planet-degree">${data.nodes.south.degree}</span>
    </div>
  `;

  // Midheaven (if available)
  const mcHtml = data.midheaven ? `
    <div class="planet-item">
      <span class="planet-symbol">MC</span>
      <span class="planet-name">Midheaven</span>
      <span class="planet-sign">${data.midheaven.sign.symbol} ${data.midheaven.sign.name}</span>
      <span class="planet-degree">${data.midheaven.degree}</span>
    </div>
  ` : '';

  container.innerHTML = `
    <style>
      .big-three { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1rem; }
      .big-three-item { text-align: center; padding: 0.5rem; background: var(--surface); border-radius: 8px; }
      .big-three-label { font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; }
      .big-three-sign { font-size: 1.5rem; }
      .big-three-name { font-size: 0.85rem; font-weight: 500; }
      .big-three-degree { font-size: 0.7rem; color: var(--text-secondary); }
      .planets-section { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); }
      .planets-title { font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.5rem; text-transform: uppercase; }
      .planets-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.25rem; }
      .planet-item { display: grid; grid-template-columns: 1.2rem 4rem 4rem 1fr; gap: 0.25rem; font-size: 0.8rem; padding: 0.25rem 0; align-items: center; }
      .planet-symbol { color: var(--accent); }
      .planet-name { color: var(--text-secondary); }
      .planet-sign { font-weight: 500; }
      .planet-degree { font-size: 0.7rem; color: var(--text-secondary); }
      .nodes-section { margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--border); }
    </style>

    <div class="big-three">
      <div class="big-three-item">
        <div class="big-three-label">Sun</div>
        <div class="big-three-sign">${data.sun.sign.symbol}</div>
        <div class="big-three-name">${data.sun.sign.name}</div>
        <div class="big-three-degree">${data.sun.degree}</div>
      </div>
      <div class="big-three-item">
        <div class="big-three-label">Moon</div>
        <div class="big-three-sign">${data.moon.sign.symbol}</div>
        <div class="big-three-name">${data.moon.sign.name}</div>
        <div class="big-three-degree">${data.moon.degree}</div>
      </div>
      <div class="big-three-item">
        <div class="big-three-label">Rising ${risingBadge}</div>
        <div class="big-three-sign">${data.rising.sign.symbol}</div>
        <div class="big-three-name">${data.rising.sign.name}</div>
        <div class="big-three-degree">${data.rising.degree || ''}</div>
      </div>
    </div>

    <div class="result-item">
      <span class="result-label">Element</span>
      <span class="result-value">${data.sun.sign.element} - ${data.balance.dominantElement.traits}</span>
    </div>
    <div class="result-item">
      <span class="result-label">Modality</span>
      <span class="result-value">${data.sun.sign.modality} - ${data.balance.dominantModality.traits}</span>
    </div>

    <div class="planets-section">
      <div class="planets-title">Planetary Positions</div>
      <div class="planets-grid">
        ${planetsHtml}
      </div>
    </div>

    <div class="nodes-section">
      <div class="planets-title">Lunar Nodes ${mcHtml ? '& Angles' : ''}</div>
      <div class="planets-grid">
        ${nodesHtml}
        ${mcHtml}
      </div>
    </div>

    <div style="margin-top: 0.75rem; font-size: 0.65rem; color: #22c55e;">
      ✓ Calculated using Meeus Astronomical Algorithms
      ${data.hasLocation ? ' • Birth location included' : ''}
    </div>
  `;
}

function renderHumanDesign(data) {
  const container = document.getElementById('humandesign-result');

  // Helper to format gate.line
  const fmtGate = (g) => g ? `${g.gate}.${g.line}` : '?';

  // Get personality and design gates
  const pg = data.gates.personality;
  const dg = data.gates.design;

  // Build sets for quick lookup
  const definedCenterNames = new Set(data.centers.defined.map(c => c.name.toLowerCase().replace(' ', '')));
  const personalityGates = new Set();
  const designGates = new Set();

  // Collect all personality gates
  Object.values(pg).forEach(g => { if (g?.gate) personalityGates.add(g.gate); });
  // Collect all design gates
  Object.values(dg).forEach(g => { if (g?.gate) designGates.add(g.gate); });

  // Center SVG paths (approximate Human Design bodygraph layout)
  const centers = {
    head:   { path: 'M 155 55 L 180 20 L 205 55 Z', name: 'Head' },
    ajna:   { path: 'M 155 70 L 205 70 L 180 105 Z', name: 'Ajna' },
    throat: { path: 'M 155 120 L 205 120 L 205 165 L 155 165 Z', name: 'Throat' },
    g:      { path: 'M 180 185 L 215 220 L 180 255 L 145 220 Z', name: 'G' },
    heart:  { path: 'M 225 195 L 255 210 L 240 235 Z', name: 'Heart' },
    spleen: { path: 'M 70 235 L 130 235 L 100 305 Z', name: 'Spleen' },
    solar:  { path: 'M 230 235 L 290 235 L 260 305 Z', name: 'Solar Plexus' },
    sacral: { path: 'M 150 315 L 210 315 L 210 360 L 150 360 Z', name: 'Sacral' },
    root:   { path: 'M 145 385 L 215 385 L 215 430 L 145 430 Z', name: 'Root' }
  };

  // Channel connections (simplified - showing main channels)
  const channelPaths = [
    // Head to Ajna
    { gates: [64, 47], path: 'M 165 55 L 165 70' },
    { gates: [61, 24], path: 'M 180 55 L 180 70' },
    { gates: [63, 4], path: 'M 195 55 L 195 70' },
    // Ajna to Throat
    { gates: [17, 62], path: 'M 165 105 L 165 120' },
    { gates: [43, 23], path: 'M 180 105 L 180 120' },
    { gates: [11, 56], path: 'M 195 105 L 195 120' },
    // Throat to G
    { gates: [31, 7], path: 'M 160 165 L 155 185' },
    { gates: [8, 1], path: 'M 175 165 L 170 185' },
    { gates: [33, 13], path: 'M 190 165 L 195 185' },
    // G to Sacral
    { gates: [15, 5], path: 'M 180 255 L 180 315' },
    { gates: [2, 14], path: 'M 170 255 L 165 315' },
    { gates: [46, 29], path: 'M 190 255 L 195 315' },
    // Sacral to Root
    { gates: [3, 60], path: 'M 165 360 L 165 385' },
    { gates: [42, 53], path: 'M 180 360 L 180 385' },
    { gates: [9, 52], path: 'M 195 360 L 195 385' },
    // Spleen connections
    { gates: [57, 20], path: 'M 100 235 L 155 155' },
    { gates: [48, 16], path: 'M 110 250 L 155 145' },
    { gates: [50, 27], path: 'M 100 290 L 150 335' },
    { gates: [32, 54], path: 'M 85 295 L 145 400' },
    { gates: [28, 38], path: 'M 75 285 L 145 410' },
    { gates: [18, 58], path: 'M 90 300 L 145 420' },
    // Solar Plexus connections
    { gates: [6, 59], path: 'M 245 290 L 210 335' },
    { gates: [36, 35], path: 'M 260 250 L 205 155' },
    { gates: [22, 12], path: 'M 250 245 L 205 145' },
    { gates: [37, 40], path: 'M 245 260 L 245 220' },
    { gates: [55, 39], path: 'M 270 295 L 215 405' },
    { gates: [30, 41], path: 'M 260 300 L 210 395' },
    { gates: [49, 19], path: 'M 275 290 L 215 395' },
    // Heart connections
    { gates: [21, 45], path: 'M 235 200 L 205 155' },
    { gates: [26, 44], path: 'M 230 225 L 130 260' },
    { gates: [51, 25], path: 'M 225 210 L 200 200' },
    // G to Spleen
    { gates: [10, 57], path: 'M 150 230 L 120 250' },
    // Sacral to Throat (Manifesting Generator)
    { gates: [34, 20], path: 'M 180 315 L 180 165' },
  ];

  // Find active channels
  const activeChannelGates = new Set();
  data.channels.forEach(ch => {
    ch.gates.forEach(g => activeChannelGates.add(g));
  });

  // Render channel lines
  const renderChannels = () => {
    return channelPaths.map(ch => {
      const [g1, g2] = ch.gates;
      const g1Active = personalityGates.has(g1) || designGates.has(g1);
      const g2Active = personalityGates.has(g2) || designGates.has(g2);

      if (!g1Active && !g2Active) return ''; // Channel not active

      const g1Personality = personalityGates.has(g1);
      const g2Personality = personalityGates.has(g2);
      const g1Design = designGates.has(g1);
      const g2Design = designGates.has(g2);

      let strokeColor = 'rgba(100,100,120,0.3)';
      let strokeClass = '';

      if ((g1Personality || g2Personality) && (g1Design || g2Design)) {
        strokeClass = 'channel-both';
        strokeColor = '#888';
      } else if (g1Design || g2Design) {
        strokeClass = 'channel-design';
        strokeColor = '#ef4444';
      } else if (g1Personality || g2Personality) {
        strokeClass = 'channel-personality';
        strokeColor = '#1a1a25';
      }

      const isComplete = activeChannelGates.has(g1) && activeChannelGates.has(g2);
      const strokeWidth = isComplete ? 4 : 2;
      const opacity = isComplete ? 1 : 0.5;

      return `<path d="${ch.path}" stroke="${strokeColor}" stroke-width="${strokeWidth}" fill="none" opacity="${opacity}" class="channel ${strokeClass}"/>`;
    }).join('');
  };

  // Render centers
  const renderCenters = () => {
    return Object.entries(centers).map(([key, center]) => {
      const normalizedKey = key === 'solar' ? 'solarplexus' : key;
      const isDefined = definedCenterNames.has(normalizedKey) || definedCenterNames.has(key);
      const cssClass = isDefined ? 'center center-defined' : 'center center-undefined';
      return `<path d="${center.path}" class="${cssClass}" data-center="${key}"/>`;
    }).join('');
  };

  // Create gate pill
  const gatePill = (symbol, gateData, type) => {
    if (!gateData) return '';
    const cssClass = type === 'personality' ? 'hd-gate-pill personality' : 'hd-gate-pill design';
    return `<span class="${cssClass}">${symbol} ${gateData.gate}.${gateData.line}</span>`;
  };

  // Definition type
  const getDefinition = () => {
    const channelCount = data.channels.length;
    if (channelCount === 0) return 'None';
    if (channelCount === 1) return 'Single';
    if (channelCount <= 3) return 'Split';
    return 'Triple Split';
  };

  container.innerHTML = `
    <div class="bodygraph-container">
      <svg viewBox="0 0 360 450" class="bodygraph" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="striped-pattern" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="4" stroke="#1a1a25" stroke-width="2"/>
            <line x1="2" y1="0" x2="2" y2="4" stroke="#ef4444" stroke-width="2"/>
          </pattern>
        </defs>
        <g class="channels">${renderChannels()}</g>
        <g class="centers">${renderCenters()}</g>
      </svg>

      <div class="bodygraph-info">
        <div class="hd-type-badge">${data.type.name}</div>

        <div class="hd-info-grid">
          <div class="hd-info-item">
            <div class="hd-info-label">Strategy</div>
            <div class="hd-info-value">${data.type.strategy}</div>
          </div>
          <div class="hd-info-item">
            <div class="hd-info-label">Authority</div>
            <div class="hd-info-value">${data.authority.name}</div>
          </div>
          <div class="hd-info-item">
            <div class="hd-info-label">Profile</div>
            <div class="hd-info-value">${data.profile.numbers}</div>
          </div>
          <div class="hd-info-item">
            <div class="hd-info-label">Definition</div>
            <div class="hd-info-value">${getDefinition()}</div>
          </div>
        </div>

        <div class="hd-info-item" style="margin-top: 0.5rem;">
          <div class="hd-info-label">Incarnation Cross</div>
          <div class="hd-info-value" style="font-size: 0.8rem;">${data.incarnationCross.name}</div>
        </div>

        <div class="hd-gates-section">
          <div class="hd-info-label">Personality (Conscious)</div>
          <div class="hd-gates-row">
            ${gatePill('☉', pg?.sun, 'personality')}
            ${gatePill('⊕', pg?.earth, 'personality')}
            ${gatePill('☽', pg?.moon, 'personality')}
            ${gatePill('☿', pg?.mercury, 'personality')}
            ${gatePill('♀', pg?.venus, 'personality')}
            ${gatePill('♂', pg?.mars, 'personality')}
            ${gatePill('♃', pg?.jupiter, 'personality')}
          </div>
        </div>

        <div class="hd-gates-section">
          <div class="hd-info-label">Design (Unconscious)</div>
          <div class="hd-gates-row">
            ${gatePill('☉', dg?.sun, 'design')}
            ${gatePill('⊕', dg?.earth, 'design')}
            ${gatePill('☽', dg?.moon, 'design')}
            ${gatePill('☿', dg?.mercury, 'design')}
            ${gatePill('♀', dg?.venus, 'design')}
            ${gatePill('♂', dg?.mars, 'design')}
            ${gatePill('♃', dg?.jupiter, 'design')}
          </div>
        </div>

        ${data.channels.length > 0 ? `
          <div class="hd-gates-section">
            <div class="hd-info-label">Channels</div>
            <div style="font-size: 0.75rem; margin-top: 0.25rem;">
              ${data.channels.map(c => `<span style="margin-right: 0.5rem;">${c.gates.join('-')}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function renderGeneKeys(data) {
  const container = document.getElementById('genekeys-result');

  // Arrow SVG
  const arrow = `<svg class="gk-arrow" viewBox="0 0 20 14"><path d="M 0 7 L 14 7 M 10 3 L 14 7 L 10 11"/></svg>`;

  // Create sphere
  const sphere = (sphereData) => `
    <div class="gk-sphere">
      <div class="gk-sphere-circle">${sphereData.keyLine || sphereData.key}</div>
      <div class="gk-sphere-label">${sphereData.sphere}</div>
      <div class="gk-sphere-gift">${sphereData.gift}</div>
    </div>
  `;

  // Sequences
  const as = data.activationSequence;
  const vs = data.venusSequence;
  const ps = data.pearlSequence;

  container.innerHTML = `
    <div class="gene-keys-path">
      <div class="gk-sequence activation">
        <div class="gk-sequence-title">Activation Sequence</div>
        <div class="gk-spheres-row">
          ${sphere(as.lifeWork)}
          ${arrow}
          ${sphere(as.evolution)}
          ${arrow}
          ${sphere(as.radiance)}
          ${arrow}
          ${sphere(as.purpose)}
        </div>
      </div>

      <div class="gk-sequence venus">
        <div class="gk-sequence-title">Venus Sequence</div>
        <div class="gk-spheres-row">
          ${sphere(vs.attraction)}
          ${arrow}
          ${sphere(vs.iq)}
          ${arrow}
          ${sphere(vs.eq)}
          ${arrow}
          ${sphere(vs.sq)}
        </div>
      </div>

      <div class="gk-sequence pearl">
        <div class="gk-sequence-title">Pearl Sequence</div>
        <div class="gk-spheres-row">
          ${sphere(ps.vocation)}
          ${arrow}
          ${sphere(ps.culture)}
          ${arrow}
          ${sphere(ps.pearl)}
        </div>
      </div>

      <div class="gk-spectrum">
        <span class="shadow">${as.lifeWork.shadow}</span>
        <span class="arrow">→</span>
        <span class="gift">${as.lifeWork.gift}</span>
        <span class="arrow">→</span>
        <span class="siddhi">${as.lifeWork.siddhi}</span>
      </div>
    </div>
  `;
}

// Main calculation function
async function calculateBirthCode(birthDate, birthTime, manualCoords) {
  // Parse time
  const timeParts = birthTime.split(':');
  const birthHour = parseInt(timeParts[0], 10) + (parseInt(timeParts[1], 10) / 60);

  // Get location - prefer manual coords, then selectedLocation from autocomplete
  let location = null;
  if (manualCoords.lat && manualCoords.lon && !isNaN(manualCoords.lat)) {
    location = { lat: manualCoords.lat, lon: manualCoords.lon };
  } else if (selectedLocation) {
    location = { lat: selectedLocation.lat, lon: selectedLocation.lon };
  }

  // Estimate timezone from longitude (rough approximation)
  // Each 15° of longitude = 1 hour from UTC
  const timezone = location ? Math.round(location.lon / 15) : -8; // Default to PST

  // Calculate all systems
  const astrology = calculateAstrology(
    birthDate,
    birthHour,
    timezone,
    location?.lat,
    location?.lon
  );

  const humanDesign = calculateHumanDesign(birthDate, birthHour, timezone);
  const geneKeys = calculateGeneKeys(humanDesign);

  // Render all results
  renderAstrology(astrology);
  renderHumanDesign(humanDesign);
  renderGeneKeys(geneKeys);

  // Show results section
  resultsSection.style.display = 'block';
  resultsSection.scrollIntoView({ behavior: 'smooth' });

  // Log full data for debugging
  console.log('BirthCode Data:', {
    astrology,
    humanDesign,
    geneKeys
  });
}

// Store original results HTML for reset
let originalResultsHTML = '';

// Form submission handler
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const birthDate = document.getElementById('birth-date').value;
  const birthTime = document.getElementById('birth-time').value || '12:00';
  const latitude = document.getElementById('latitude').value;
  const longitude = document.getElementById('longitude').value;

  // Check if manual coordinates are provided
  const hasManualCoords = latitude && longitude && !isNaN(parseFloat(latitude));

  if (!birthDate) {
    alert('Please enter your birth date');
    return;
  }

  // Validate that a location is selected (either via autocomplete or manual coords)
  if (!selectedLocation && !hasManualCoords) {
    alert('Please select a birth location from the search results, or enter coordinates manually.');
    document.getElementById('birth-city').focus();
    return;
  }

  // Store original HTML on first run
  if (!originalResultsHTML) {
    originalResultsHTML = resultsSection.innerHTML;
  }

  // Reset to original structure and show
  resultsSection.innerHTML = originalResultsHTML;
  resultsSection.style.display = 'block';

  // Set loading state in each card
  document.querySelectorAll('.result-content').forEach(el => {
    el.innerHTML = '<div class="loading">Calculating...</div>';
  });

  try {
    await calculateBirthCode(
      birthDate,
      birthTime,
      { lat: parseFloat(latitude), lon: parseFloat(longitude) }
    );
  } catch (error) {
    console.error('Calculation error:', error);
    document.querySelectorAll('.result-content').forEach(el => {
      el.innerHTML = `<div class="loading">Error: ${error.message}</div>`;
    });
  }
});

// Initialize
setupLocationAutocomplete();
console.log('BirthCode Calculator loaded');
