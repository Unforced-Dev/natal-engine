/**
 * NatalEngine Calculator - Main Entry Point
 */

import calculateAstrology from './calculators/astrology.js';
import calculateHumanDesign, { calculateGeneKeys } from './calculators/humandesign.js';
import { searchLocations, isDSTForDate } from './geocode.js';
import { renderAstrologyChart } from './components/astrology-chart.js';
import { renderBodygraph } from './components/bodygraph.js';
import { renderGeneKeysChart } from './components/genekeys-chart.js';

// Store calculated data for export
let calculatedData = {
  astrology: null,
  humandesign: null,
  genekeys: null
};

// DOM Elements
const form = document.getElementById('birth-form');
const resultsSection = document.getElementById('results');

// URL Parameter Handling
function getURLParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    date: params.get('date'),
    time: params.get('time'),
    lat: params.get('lat'),
    lng: params.get('lng'),
    tz: params.get('tz'),
    name: params.get('name')
  };
}

function updateURL(date, time, lat, lng, tz, locationName) {
  const params = new URLSearchParams();
  params.set('date', date);
  params.set('time', time);
  params.set('lat', lat.toFixed(4));
  params.set('lng', lng.toFixed(4));
  params.set('tz', tz.toString());
  if (locationName) {
    params.set('name', locationName);
  }

  const newURL = `${window.location.pathname}?${params.toString()}`;
  window.history.pushState({ path: newURL }, '', newURL);
}

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
      selectedDiv.innerHTML = `
        <span>${location.name || 'Unknown'}${location.region ? ', ' + location.region : ''}${location.country ? ', ' + location.country : ''}</span>
        <span class="location-coords">(${location.lat.toFixed(2)}, ${location.lon.toFixed(2)} ${tzStr})</span>
        <button type="button" class="clear-location" title="Clear">×</button>
      `;

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

  // Aspects with harmony color coding
  const getAspectHarmony = (aspect) => {
    if (['trine', 'sextile'].includes(aspect)) return 'harmonious';
    if (['square', 'opposition'].includes(aspect)) return 'challenging';
    return 'neutral';
  };

  const aspectsHtml = data.aspects.slice(0, 12).map(a => `
    <div class="aspect-row ${getAspectHarmony(a.aspect)}">
      <span class="symbol">${a.planet1Symbol}</span>
      <span class="planet">${a.planet1}</span>
      <span class="aspect-type">${a.symbol}</span>
      <span class="planet">${a.planet2}</span>
      <span class="orb">${a.exactOrb}</span>
      <span class="nature">${a.aspect}</span>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="chart-wrapper"></div>

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

    <details class="collapsible">
      <summary>Aspects (${data.aspects.length} total)</summary>
      <div class="collapsible-content">
        <div class="aspects-grid">
          ${aspectsHtml}
        </div>
      </div>
    </details>
  `;

  // Render the visual chart
  const chartWrapper = container.querySelector('.chart-wrapper');
  renderAstrologyChart(chartWrapper, data);
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

  // Enhanced channels with names and themes
  const channelsHtml = data.channels.length > 0
    ? data.channels.map(c => `
        <div class="channel-item">
          <span class="channel-gates">${c.gates.join('-')}</span>
          <span class="channel-name">${c.name}</span>
          <span class="channel-theme">${c.theme}</span>
        </div>
      `).join('')
    : '<span style="color: var(--text-muted);">No complete channels</span>';

  // Defined centers with themes
  const definedCentersHtml = data.centers.defined.length > 0
    ? data.centers.defined.map(c => `<span class="center-tag" title="${c.theme}">${c.name}</span>`).join('')
    : '<span style="color: var(--text-muted);">None (Reflector)</span>';

  // Type description based on type
  const typeDescriptions = {
    'Generator': 'You have sustainable life force energy. Your strategy is to wait for things to come to you and respond with your gut. When you follow what lights you up, you find satisfaction.',
    'Manifesting Generator': 'You have powerful multi-passionate energy. Wait to respond, then inform others before acting. You can move quickly once you get a clear gut response.',
    'Projector': 'You are here to guide and manage others. Wait for recognition and invitation before sharing your insights. Success comes through being seen and valued.',
    'Manifestor': 'You are designed to initiate and impact. Inform others before you act to reduce resistance. Peace comes from following your urges while keeping others in the loop.',
    'Reflector': 'You are a mirror for the community. Wait a full lunar cycle (28 days) before making major decisions. Surprise and delight come from finding the right environment.'
  };

  // Authority description
  const authorityDescriptions = {
    'Emotional Authority': 'Ride your emotional wave before deciding. Never make important decisions in the moment—wait for clarity over time.',
    'Sacral Authority': 'Trust your gut responses. Listen for the "uh-huh" (yes) or "uh-uh" (no) sounds that arise spontaneously.',
    'Splenic Authority': 'Trust your instant intuitive knowing. Your body knows in the moment—don\'t second-guess that first hit.',
    'Ego/Heart Authority': 'Ask yourself "Do I really want this?" Your willpower knows what\'s right for you.',
    'Self-Projected Authority': 'Talk things out and hear your own voice. Your truth becomes clear when you speak it.',
    'Mental/Environment': 'Discuss decisions with trusted others. Notice how different environments affect your clarity.',
    'Lunar Authority': 'Wait through a full lunar cycle. Sample different perspectives over 28 days before deciding.'
  };

  const typeDesc = typeDescriptions[data.type.name] || data.type.description || '';
  const authDesc = authorityDescriptions[data.authority.name] || data.authority.description || '';

  container.innerHTML = `
    <div class="chart-wrapper"></div>

    <div class="hd-summary">
      <div class="hd-type-badge">
        <div class="type">${data.type.name}</div>
        <div class="strategy">Strategy: ${data.type.strategy}</div>
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

    <details class="collapsible" open>
      <summary>About Your Type & Authority</summary>
      <div class="collapsible-content">
        <div class="hd-description">
          <h4>${data.type.name}</h4>
          <p>${typeDesc}</p>
        </div>
        <div class="hd-description">
          <h4>${data.authority.name}</h4>
          <p>${authDesc}</p>
        </div>
        <div class="hd-description">
          <h4>Profile: ${data.profile.numbers} ${data.profile.name}</h4>
          <p>${data.profile.theme || 'Your unique way of interacting with the world.'}</p>
        </div>
      </div>
    </details>

    <div class="section-title">Defined Centers</div>
    <div class="centers-list">${definedCentersHtml}</div>

    <details class="collapsible">
      <summary>Channels (${data.channels.length})</summary>
      <div class="collapsible-content">
        <div class="channels-list">
          ${channelsHtml}
        </div>
      </div>
    </details>

    <details class="collapsible">
      <summary>Gates (All 13 Planets)</summary>
      <div class="collapsible-content">
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
      </div>
    </details>
  `;

  // Render the bodygraph
  const chartWrapper = container.querySelector('.chart-wrapper');
  renderBodygraph(chartWrapper, data);
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
    <div class="chart-wrapper"></div>

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

  // Render the visual chart
  const chartWrapper = container.querySelector('.chart-wrapper');
  renderGeneKeysChart(chartWrapper, data);
}

// Main calculation
async function calculateNatalChart(birthDate, birthTime, manualCoords, skipURLUpdate = false) {
  const timeParts = birthTime.split(':');
  const birthHour = parseInt(timeParts[0], 10) + (parseInt(timeParts[1], 10) / 60);

  let location = null;
  let timezone = 0;
  let locationName = null;

  if (manualCoords.lat && manualCoords.lon && !isNaN(manualCoords.lat)) {
    location = { lat: manualCoords.lat, lon: manualCoords.lon };
    timezone = manualCoords.tz !== undefined ? manualCoords.tz : Math.round(location.lon / 15);
    locationName = manualCoords.name || null;
  } else if (selectedLocation) {
    location = { lat: selectedLocation.lat, lon: selectedLocation.lon };
    // Use stored timezone with DST adjustment
    timezone = selectedLocation.timezone + (selectedLocation.isDST ? 1 : 0);
    locationName = selectedLocation.name;
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

  // Update URL with chart parameters (unless loading from URL)
  if (!skipURLUpdate && location) {
    updateURL(birthDate, birthTime, location.lat, location.lon, timezone, locationName);
  }

  if (!skipURLUpdate) {
    resultsSection.scrollIntoView({ behavior: 'smooth' });
  }

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

// Dark mode toggle
function initDarkMode() {
  const toggle = document.getElementById('dark-mode-toggle');
  const icon = toggle.querySelector('.theme-icon');

  // Icons: ☀ (light), ◐ (auto), ☾ (dark)
  const themes = ['auto', 'dark', 'light'];
  const icons = { auto: '◐', dark: '☾', light: '☀' };

  // Load saved preference
  const stored = localStorage.getItem('theme') || 'auto';
  if (stored !== 'auto') {
    document.documentElement.setAttribute('data-theme', stored);
  }
  icon.textContent = icons[stored];

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'auto';
    const currentIndex = themes.indexOf(current);
    const next = themes[(currentIndex + 1) % themes.length];

    if (next === 'auto') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.removeItem('theme');
    } else {
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    }

    icon.textContent = icons[next];
  });
}

// Tab navigation
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  // Load saved tab preference
  const savedTab = localStorage.getItem('activeTab') || 'astrology';

  tabBtns.forEach(btn => {
    // Set initial state
    if (btn.dataset.tab === savedTab) {
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
    } else {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    }

    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;

      // Update buttons
      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Update panels
      tabPanels.forEach(panel => {
        panel.classList.remove('active');
      });
      document.getElementById(`panel-${tab}`).classList.add('active');

      // Save preference
      localStorage.setItem('activeTab', tab);
    });
  });

  // Set initial panel state
  tabPanels.forEach(panel => {
    if (panel.id === `panel-${savedTab}`) {
      panel.classList.add('active');
    } else {
      panel.classList.remove('active');
    }
  });
}

// Initialize from URL parameters if present
async function initFromURL() {
  const params = getURLParams();

  if (params.date && params.lat && params.lng) {
    // Populate form fields
    document.getElementById('birth-date').value = params.date;
    document.getElementById('birth-time').value = params.time || '12:00';

    // Show location info
    const selectedDiv = document.getElementById('location-selected');
    const input = document.getElementById('birth-city');
    const lat = parseFloat(params.lat);
    const lng = parseFloat(params.lng);
    const tz = parseInt(params.tz) || Math.round(lng / 15);
    const tzStr = tz >= 0 ? `UTC+${tz}` : `UTC${tz}`;

    selectedDiv.innerHTML = `
      <span>${params.name || 'Custom Location'}</span>
      <span class="location-coords">(${lat.toFixed(2)}, ${lng.toFixed(2)} ${tzStr})</span>
      <button type="button" class="clear-location" title="Clear">×</button>
    `;
    selectedDiv.classList.add('active');
    input.placeholder = 'Change location...';

    selectedDiv.querySelector('.clear-location').addEventListener('click', () => {
      selectedLocation = null;
      selectedDiv.classList.remove('active');
      input.placeholder = 'Search city...';
      // Clear URL params
      window.history.pushState({}, '', window.location.pathname);
    });

    // Show loading state
    document.querySelectorAll('.result-content').forEach(el => {
      el.innerHTML = '<div class="loading">Calculating...</div>';
    });
    resultsSection.style.display = 'block';

    // Calculate with URL parameters (skip URL update since we're loading from URL)
    try {
      await calculateNatalChart(
        params.date,
        params.time || '12:00',
        { lat, lon: lng, tz, name: params.name },
        true // skipURLUpdate
      );
    } catch (error) {
      console.error('Error loading from URL:', error);
      document.querySelectorAll('.result-content').forEach(el => {
        el.innerHTML = `<div class="loading">Error: ${error.message}</div>`;
      });
    }
  }
}

// Initialize
setupLocationAutocomplete();
initDarkMode();
initTabs();
initFromURL();

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
