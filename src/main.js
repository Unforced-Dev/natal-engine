/**
 * NatalEngine Calculator - Main Entry Point
 */

import calculateAstrology from './calculators/astrology.js';
import calculateHumanDesign, { calculateGeneKeys } from './calculators/humandesign.js';
import { searchLocations, isDSTForDate } from './geocode.js';

// Store calculated data for export
let calculatedData = {
  astrology: null,
  humandesign: null,
  genekeys: null
};

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
    // Auto-detect DST based on birth date
    const birthDateInput = document.getElementById('birth-date');
    let autoDST = false;

    if (birthDateInput.value) {
      const [year, month, day] = birthDateInput.value.split('-').map(Number);
      autoDST = isDSTForDate(location.country, location.region, year, month, day);
    }

    selectedLocation = {
      lat: location.lat,
      lon: location.lon,
      timezone: location.timezone,
      isDST: autoDST,
      country: location.country,
      region: location.region,
      name: location.name
    };
    input.value = '';
    hideDropdown();

    const updateLocationDisplay = () => {
      const effectiveTz = selectedLocation.timezone + (selectedLocation.isDST ? 1 : 0);
      const tzStr = effectiveTz >= 0 ? `UTC+${effectiveTz}` : `UTC${effectiveTz}`;
      const dstLabel = selectedLocation.isDST ? 'DST' : 'Std';
      selectedDiv.innerHTML = `
        <span>${location.name || 'Unknown'}${location.region ? ', ' + location.region : ''}${location.country ? ', ' + location.country : ''}</span>
        <span class="location-coords">(${location.lat.toFixed(2)}, ${location.lon.toFixed(2)} ${tzStr})</span>
        <button type="button" class="dst-toggle ${selectedLocation.isDST ? 'active' : ''}" title="Toggle Daylight Saving Time (auto-detected)">${dstLabel}</button>
        <button type="button" class="clear-location" title="Clear">×</button>
      `;

      selectedDiv.querySelector('.dst-toggle').addEventListener('click', () => {
        selectedLocation.isDST = !selectedLocation.isDST;
        selectedLocation.manualDST = true; // Mark as manually set
        updateLocationDisplay();
      });

      selectedDiv.querySelector('.clear-location').addEventListener('click', () => {
        selectedLocation = null;
        selectedDiv.classList.remove('active');
        input.placeholder = 'Search city...';
      });
    };

    updateLocationDisplay();
    selectedDiv.classList.add('active');
    input.placeholder = 'Change location...';

    // Store updateLocationDisplay for date change handler
    selectedLocation.updateDisplay = updateLocationDisplay;
  };

  const debouncedSearch = debounce(async (query) => {
    if (query.length < 2) {
      hideDropdown();
      return;
    }

    showDropdown('<div class="location-loading">Searching...</div>');

    const results = await searchLocations(query);

    if (results.length === 0) {
      showDropdown('<div class="location-no-results">No locations found</div>');
      return;
    }

    const optionsHtml = results.map((loc, index) => `
      <div class="location-option" data-index="${index}">
        <div class="location-name">${loc.name || 'Unknown'}${loc.region ? ', ' + loc.region : ''}</div>
        <div class="location-details">${loc.country} · ${loc.lat.toFixed(2)}, ${loc.lon.toFixed(2)}</div>
      </div>
    `).join('');

    showDropdown(optionsHtml);

    dropdown.querySelectorAll('.location-option').forEach((option, index) => {
      option.addEventListener('click', () => selectLocation(results[index]));
    });
  }, 300);

  input.addEventListener('input', (e) => debouncedSearch(e.target.value));

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

  input.addEventListener('blur', () => setTimeout(hideDropdown, 200));
  input.addEventListener('focus', () => {
    if (input.value.length >= 2) debouncedSearch(input.value);
  });
}

// Toggle coordinates visibility
window.toggleCoordinates = function() {
  const row = document.querySelector('.coordinates-row');
  const btn = document.querySelector('.toggle-coords');
  if (row.style.display === 'none') {
    row.style.display = 'flex';
    btn.textContent = 'Use city search';
  } else {
    row.style.display = 'none';
    btn.textContent = 'Enter coordinates manually';
  }
};

// Copy JSON to clipboard
window.copyJSON = function(type) {
  const data = calculatedData[type];
  if (data) {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    const btn = document.querySelector(`#${type}-card .export-btn`);
    const original = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = original, 1500);
  }
};

// Planet symbols
const SYMBOLS = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '⛢', neptune: '♆', pluto: '♇',
  northNode: '☊', southNode: '☋', earth: '⊕'
};

// Render Astrology
function renderAstrology(data) {
  const container = document.getElementById('astrology-result');

  // Big Three
  const bigThreeHtml = `
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
        <div class="big-three-label">Rising</div>
        <div class="big-three-sign">${data.rising.sign.symbol}</div>
        <div class="big-three-name">${data.rising.sign.name}</div>
        <div class="big-three-degree">${data.rising.degree || ''}</div>
      </div>
    </div>
  `;

  // Planets
  const planetRows = Object.entries(data.planets).map(([name, planet]) => `
    <div class="planet-row">
      <span class="symbol">${SYMBOLS[name]}</span>
      <span class="name">${name.charAt(0).toUpperCase() + name.slice(1)}</span>
      <span class="sign">${planet.sign.symbol} ${planet.sign.name}</span>
      <span class="degree">${planet.degree}</span>
    </div>
  `).join('');

  // Nodes
  const nodesHtml = `
    <div class="planet-row">
      <span class="symbol">☊</span>
      <span class="name">North Node</span>
      <span class="sign">${data.nodes.north.sign.symbol} ${data.nodes.north.sign.name}</span>
      <span class="degree">${data.nodes.north.degree}</span>
    </div>
    <div class="planet-row">
      <span class="symbol">☋</span>
      <span class="name">South Node</span>
      <span class="sign">${data.nodes.south.sign.symbol} ${data.nodes.south.sign.name}</span>
      <span class="degree">${data.nodes.south.degree}</span>
    </div>
  `;

  // Midheaven
  const mcHtml = data.midheaven ? `
    <div class="planet-row">
      <span class="symbol">MC</span>
      <span class="name">Midheaven</span>
      <span class="sign">${data.midheaven.sign.symbol} ${data.midheaven.sign.name}</span>
      <span class="degree">${data.midheaven.degree}</span>
    </div>
  ` : '';

  // Aspects (top 10)
  const aspectsHtml = data.aspects.slice(0, 12).map(a => `
    <div class="aspect-row">
      <span class="symbol">${a.planet1Symbol}</span>
      <span class="planet">${a.planet1}</span>
      <span class="aspect-type">${a.symbol}</span>
      <span class="planet">${a.planet2}</span>
      <span class="orb">${a.exactOrb}</span>
      <span class="nature">${a.aspect}</span>
    </div>
  `).join('');

  container.innerHTML = `
    ${bigThreeHtml}

    <div class="section-title">Planets</div>
    <div class="planets-grid">
      ${planetRows}
    </div>

    <div class="section-title">Nodes & Angles</div>
    <div class="planets-grid">
      ${nodesHtml}
      ${mcHtml}
    </div>

    <div class="section-title">Aspects (${data.aspects.length} total)</div>
    <div class="aspects-grid">
      ${aspectsHtml}
    </div>
  `;
}

// Render Human Design
function renderHumanDesign(data) {
  const container = document.getElementById('humandesign-result');

  const pg = data.gates.personality;
  const dg = data.gates.design;

  // All 13 planets
  const planets = ['sun', 'earth', 'moon', 'northNode', 'southNode', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

  const gatesTableRows = planets.map(p => {
    const pGate = pg[p];
    const dGate = dg[p];
    return `
      <tr>
        <td><span class="planet-symbol">${SYMBOLS[p] || p}</span></td>
        <td>${pGate ? `<span class="gate-pill personality">${pGate.gate}.${pGate.line}</span>` : '-'}</td>
        <td>${dGate ? `<span class="gate-pill design">${dGate.gate}.${dGate.line}</span>` : '-'}</td>
      </tr>
    `;
  }).join('');

  // Channels
  const channelsHtml = data.channels.length > 0
    ? data.channels.map(c => `<span style="margin-right: 0.75rem; font-family: 'SF Mono', monospace; font-size: 0.8rem;">${c.gates.join('-')}</span>`).join('')
    : '<span style="color: var(--text-muted);">None</span>';

  // Defined centers
  const definedCentersHtml = data.centers.defined.map(c => c.name).join(', ') || 'None';

  container.innerHTML = `
    <div class="hd-summary">
      <div class="hd-type-badge">
        <div class="type">${data.type.name}</div>
        <div class="strategy">${data.type.strategy}</div>
      </div>
      <div class="hd-summary-item">
        <div class="hd-summary-label">Authority</div>
        <div class="hd-summary-value">${data.authority.name}</div>
      </div>
      <div class="hd-summary-item">
        <div class="hd-summary-label">Profile</div>
        <div class="hd-summary-value">${data.profile.numbers} ${data.profile.name}</div>
      </div>
      <div class="hd-summary-item">
        <div class="hd-summary-label">Definition</div>
        <div class="hd-summary-value">${getDefinitionType(data.channels.length)}</div>
      </div>
      <div class="hd-summary-item">
        <div class="hd-summary-label">Incarnation Cross</div>
        <div class="hd-summary-value">${data.incarnationCross.name}</div>
      </div>
    </div>

    <div class="section-title">Defined Centers</div>
    <p style="font-size: 0.8rem; margin-bottom: 0.5rem;">${definedCentersHtml}</p>

    <div class="section-title">Gates (All 13 Planets)</div>
    <table class="gates-table">
      <thead>
        <tr>
          <th></th>
          <th>Personality</th>
          <th>Design</th>
        </tr>
      </thead>
      <tbody>
        ${gatesTableRows}
      </tbody>
    </table>

    <div class="section-title">Channels</div>
    <div style="margin-top: 0.25rem;">
      ${channelsHtml}
    </div>
  `;
}

function getDefinitionType(channelCount) {
  if (channelCount === 0) return 'None';
  if (channelCount === 1) return 'Single';
  if (channelCount <= 3) return 'Split';
  if (channelCount <= 5) return 'Triple Split';
  return 'Quad Split';
}

// Render Gene Keys
function renderGeneKeys(data) {
  const container = document.getElementById('genekeys-result');

  const arrow = `<svg class="gk-arrow" viewBox="0 0 20 14"><path d="M 0 7 L 14 7 M 10 3 L 14 7 L 10 11"/></svg>`;

  const renderSphere = (sphereData) => `
    <div class="gk-sphere">
      <div class="gk-sphere-key">${sphereData.keyLine}</div>
      <div class="gk-sphere-label">${sphereData.sphere}</div>
      <div class="gk-sphere-gift">${sphereData.gift}</div>
    </div>
  `;

  const renderSpectrum = (sphereData) => `
    <div class="gk-spectrum-row">
      <div class="gk-spectrum-item shadow">
        <div class="gk-spectrum-label">Shadow</div>
        <div class="gk-spectrum-value">${sphereData.shadow}</div>
      </div>
      <div class="gk-spectrum-item gift">
        <div class="gk-spectrum-label">Gift</div>
        <div class="gk-spectrum-value">${sphereData.gift}</div>
      </div>
      <div class="gk-spectrum-item siddhi">
        <div class="gk-spectrum-label">Siddhi</div>
        <div class="gk-spectrum-value">${sphereData.siddhi}</div>
      </div>
    </div>
  `;

  const as = data.activationSequence;
  const vs = data.venusSequence;
  const ps = data.pearlSequence;

  container.innerHTML = `
    <div class="gk-sequence">
      <div class="gk-sequence-title">Activation Sequence</div>
      <div class="gk-spheres-row">
        ${renderSphere(as.lifeWork)}
        ${arrow}
        ${renderSphere(as.evolution)}
        ${arrow}
        ${renderSphere(as.radiance)}
        ${arrow}
        ${renderSphere(as.purpose)}
      </div>
      ${renderSpectrum(as.lifeWork)}
    </div>

    <div class="gk-sequence">
      <div class="gk-sequence-title">Venus Sequence</div>
      <div class="gk-spheres-row">
        ${renderSphere(vs.attraction)}
        ${arrow}
        ${renderSphere(vs.iq)}
        ${arrow}
        ${renderSphere(vs.eq)}
        ${arrow}
        ${renderSphere(vs.sq)}
      </div>
    </div>

    <div class="gk-sequence">
      <div class="gk-sequence-title">Pearl Sequence</div>
      <div class="gk-spheres-row">
        ${renderSphere(ps.vocation)}
        ${arrow}
        ${renderSphere(ps.culture)}
        ${arrow}
        ${renderSphere(ps.pearl)}
      </div>
    </div>
  `;
}

// Main calculation
async function calculateNatalChart(birthDate, birthTime, manualCoords) {
  const timeParts = birthTime.split(':');
  const birthHour = parseInt(timeParts[0], 10) + (parseInt(timeParts[1], 10) / 60);

  let location = null;
  let timezone = 0;

  if (manualCoords.lat && manualCoords.lon && !isNaN(manualCoords.lat)) {
    location = { lat: manualCoords.lat, lon: manualCoords.lon };
    timezone = Math.round(location.lon / 15);
  } else if (selectedLocation) {
    location = { lat: selectedLocation.lat, lon: selectedLocation.lon };
    // Use stored timezone with DST adjustment
    timezone = selectedLocation.timezone + (selectedLocation.isDST ? 1 : 0);
  }

  // Calculate
  const astrology = calculateAstrology(
    birthDate,
    birthHour,
    timezone,
    location?.lat,
    location?.lon
  );

  const humanDesign = calculateHumanDesign(birthDate, birthHour, timezone);
  const geneKeys = calculateGeneKeys(humanDesign);

  // Store for export
  calculatedData = { astrology, humandesign: humanDesign, genekeys: geneKeys };

  // Render
  renderAstrology(astrology);
  renderHumanDesign(humanDesign);
  renderGeneKeys(geneKeys);

  resultsSection.style.display = 'block';
  resultsSection.scrollIntoView({ behavior: 'smooth' });

  console.log('NatalEngine Data:', calculatedData);
}

// Form handler
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const birthDate = document.getElementById('birth-date').value;
  const birthTime = document.getElementById('birth-time').value || '12:00';
  const latitude = document.getElementById('latitude').value;
  const longitude = document.getElementById('longitude').value;

  const hasManualCoords = latitude && longitude && !isNaN(parseFloat(latitude));

  if (!birthDate) {
    alert('Please enter birth date');
    return;
  }

  if (!selectedLocation && !hasManualCoords) {
    alert('Please select a birth location');
    document.getElementById('birth-city').focus();
    return;
  }

  document.querySelectorAll('.result-content').forEach(el => {
    el.innerHTML = '<div class="loading">Calculating...</div>';
  });
  resultsSection.style.display = 'block';

  try {
    await calculateNatalChart(
      birthDate,
      birthTime,
      { lat: parseFloat(latitude), lon: parseFloat(longitude) }
    );
  } catch (error) {
    console.error('Error:', error);
    document.querySelectorAll('.result-content').forEach(el => {
      el.innerHTML = `<div class="loading">Error: ${error.message}</div>`;
    });
  }
});

// Initialize
setupLocationAutocomplete();

// Auto-update DST when birth date changes
document.getElementById('birth-date').addEventListener('change', (e) => {
  if (selectedLocation && !selectedLocation.manualDST && e.target.value) {
    const [year, month, day] = e.target.value.split('-').map(Number);
    selectedLocation.isDST = isDSTForDate(
      selectedLocation.country,
      selectedLocation.region,
      year, month, day
    );
    if (selectedLocation.updateDisplay) {
      selectedLocation.updateDisplay();
    }
  }
});

console.log('NatalEngine loaded');
