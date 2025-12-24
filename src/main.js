/**
 * NatalEngine Calculator - Main Entry Point
 */

import calculateAstrology from './calculators/astrology.js';
import calculateVedic from './calculators/vedic.js';
import calculateHumanDesign, { calculateGeneKeys } from './calculators/humandesign.js';
import { searchLocations, isDSTForDate } from './geocode.js';
import { renderAstrologyChart } from './components/astrology-chart.js';
import { renderBodygraph } from './components/bodygraph.js';
import { renderGeneKeysChart } from './components/genekeys-chart.js';
import { getProfiles, saveProfile, deleteProfile, getProfile } from './storage/profiles.js';
import { compareAstrology, compareHumanDesign, compareGeneKeys } from './calculators/compatibility/index.js';
import { renderSynastryChart } from './components/synastry-chart.js';
import { renderCompositeBodygraph } from './components/composite-bodygraph.js';

// Store calculated data for export
let calculatedData = {
  astrology: null,
  vedic: null,
  humandesign: null,
  genekeys: null,
  compatibility: null
};

// Current birth info for profile saving
let currentBirthInfo = null;

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

// Vedic symbols
const VEDIC_SYMBOLS = {
  sun: '☉', moon: '☾', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', rahu: '☊', ketu: '☋', ascendant: 'Asc'
};

// Render Vedic Astrology
function renderVedic(data) {
  const container = document.getElementById('vedic-result');

  // Moon Sign Summary (most important in Vedic)
  const moonSummary = `
    <div class="vedic-moon-summary">
      <div class="vedic-moon-sign">
        <div class="vedic-label">Moon Sign (Rashi)</div>
        <div class="vedic-sign">${data.positions.moon.rashi.symbol}</div>
        <div class="vedic-name">${data.positions.moon.rashi.name}</div>
        <div class="vedic-western">(${data.positions.moon.rashi.westernName})</div>
      </div>
      <div class="vedic-nakshatra">
        <div class="vedic-label">Nakshatra</div>
        <div class="vedic-name">${data.positions.moon.nakshatra.name}</div>
        <div class="vedic-detail">Pada ${data.positions.moon.nakshatra.pada} · Lord: ${data.positions.moon.nakshatra.lord}</div>
      </div>
      <div class="vedic-dasha">
        <div class="vedic-label">Maha Dasha</div>
        <div class="vedic-name">${data.dasha.birthLord}</div>
        <div class="vedic-detail">${data.dasha.current ? `Current: ${data.dasha.current.lord}` : ''}</div>
      </div>
    </div>
  `;

  // Ayanamsa info
  const ayanamsaHtml = `
    <div class="vedic-ayanamsa">
      <span class="label">Ayanamsa (${data.ayanamsa.system}):</span>
      <span class="value">${data.ayanamsa.formatted}</span>
    </div>
  `;

  // Planetary positions
  const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'rahu', 'ketu'];
  const planetRows = planets.map(p => {
    const pos = data.positions[p];
    if (!pos) return '';
    return `
      <div class="planet-row vedic">
        <span class="symbol">${VEDIC_SYMBOLS[p]}</span>
        <span class="name">${p.charAt(0).toUpperCase() + p.slice(1)}</span>
        <span class="sign">${pos.rashi.symbol} ${pos.rashi.name}</span>
        <span class="degree">${pos.degree}</span>
        <span class="nakshatra">${pos.nakshatra.name} (${pos.nakshatra.pada})</span>
      </div>
    `;
  }).join('');

  // Ascendant if available
  const ascHtml = data.positions.ascendant ? `
    <div class="planet-row vedic">
      <span class="symbol">Asc</span>
      <span class="name">Lagna</span>
      <span class="sign">${data.positions.ascendant.rashi.symbol} ${data.positions.ascendant.rashi.name}</span>
      <span class="degree">${data.positions.ascendant.degree}</span>
      <span class="nakshatra">${data.positions.ascendant.nakshatra.name} (${data.positions.ascendant.nakshatra.pada})</span>
    </div>
  ` : '';

  // Dasha timeline
  const dashaHtml = data.dasha.dashas.slice(0, 5).map((d, i) => {
    const startYear = d.startDate.getFullYear();
    const endYear = d.endDate.getFullYear();
    const isCurrent = data.dasha.current && d.lord === data.dasha.current.lord;
    return `
      <div class="dasha-item ${isCurrent ? 'current' : ''}">
        <span class="dasha-lord">${d.lord}</span>
        <span class="dasha-years">${startYear} - ${endYear}</span>
        <span class="dasha-duration">${d.isPartial ? d.years.toFixed(1) : d.years} years</span>
      </div>
    `;
  }).join('');

  // Houses if available
  let housesHtml = '';
  if (data.houses) {
    const houseRows = Object.entries(data.houses).slice(0, 12).map(([num, house]) => {
      const planetsList = house.planets.map(p => p.name).join(', ') || '—';
      return `
        <div class="house-row">
          <span class="house-num">${num}</span>
          <span class="house-sign">${house.sign.symbol} ${house.sign.name}</span>
          <span class="house-planets">${planetsList}</span>
        </div>
      `;
    }).join('');

    housesHtml = `
      <details class="collapsible">
        <summary>Houses (Whole Sign)</summary>
        <div class="collapsible-content">
          <div class="houses-grid">
            ${houseRows}
          </div>
        </div>
      </details>
    `;
  }

  container.innerHTML = `
    ${ayanamsaHtml}
    ${moonSummary}

    <div class="section-title">Planetary Positions (Sidereal)</div>
    <div class="planets-grid vedic">
      ${ascHtml}
      ${planetRows}
    </div>

    <details class="collapsible" open>
      <summary>Vimshottari Dasha Timeline</summary>
      <div class="collapsible-content">
        <div class="dasha-timeline">
          ${dashaHtml}
        </div>
        <div class="dasha-note">
          Birth Dasha: ${data.dasha.birthLord} · Cycle: 120 years
        </div>
      </div>
    </details>

    ${housesHtml}
  `;
}

// Render Gene Keys
function renderGeneKeys(data) {
  const container = document.getElementById('genekeys-result');

  const renderSphereCard = (sphereData, colorClass = '', labelOverride = '') => `
    <div class="gk-sphere-card ${colorClass}">
      <div class="gk-sphere-header">
        <span class="gk-sphere-key">${sphereData.keyLine}</span>
        <span class="gk-sphere-label">${labelOverride || sphereData.sphere}</span>
      </div>
      <div class="gk-sphere-spectrum">
        <div class="gk-spectrum-item shadow">
          <span class="label">Shadow</span>
          <span class="value">${sphereData.shadow}</span>
        </div>
        <div class="gk-spectrum-item gift">
          <span class="label">Gift</span>
          <span class="value">${sphereData.gift}</span>
        </div>
        <div class="gk-spectrum-item siddhi">
          <span class="label">Siddhi</span>
          <span class="value">${sphereData.siddhi}</span>
        </div>
      </div>
    </div>
  `;

  const as = data.activationSequence;
  const vs = data.venusSequence;
  const ps = data.pearlSequence;

  // Core is the same Gene Key as Vocation (Design Mars position)
  // Purpose is shared between Activation and Venus sequences
  // Life's Work is shared between Activation and Pearl (as Brand)

  container.innerHTML = `
    <div class="chart-wrapper"></div>

    <details class="collapsible gk-sequence-details activation" open>
      <summary>Activation Sequence (Green)</summary>
      <div class="collapsible-content">
        <div class="gk-sequence-grid">
          ${renderSphereCard(as.lifeWork, 'activation')}
          ${renderSphereCard(as.evolution, 'activation')}
          ${renderSphereCard(as.radiance, 'activation')}
          ${renderSphereCard(as.purpose, 'activation')}
        </div>
      </div>
    </details>

    <details class="collapsible gk-sequence-details venus">
      <summary>Venus Sequence (Red)</summary>
      <div class="collapsible-content">
        <div class="gk-sequence-grid">
          ${renderSphereCard(as.purpose, 'venus', 'Purpose (Entry)')}
          ${renderSphereCard(ps.vocation, 'venus', 'Core')}
          ${renderSphereCard(vs.sq, 'venus')}
          ${renderSphereCard(vs.iq, 'venus')}
          ${renderSphereCard(vs.eq, 'venus')}
          ${renderSphereCard(vs.attraction, 'venus')}
        </div>
      </div>
    </details>

    <details class="collapsible gk-sequence-details pearl">
      <summary>Pearl Sequence (Blue)</summary>
      <div class="collapsible-content">
        <div class="gk-sequence-grid">
          ${renderSphereCard(as.lifeWork, 'pearl', 'Brand')}
          ${renderSphereCard(ps.pearl, 'pearl')}
          ${renderSphereCard(ps.culture, 'pearl')}
          ${renderSphereCard(ps.vocation, 'pearl', 'Vocation')}
        </div>
      </div>
    </details>
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
    // Build full location name (city, region, country) - or use existing if loaded from URL
    if (selectedLocation.fromURL) {
      locationName = selectedLocation.name;
    } else {
      locationName = [selectedLocation.name, selectedLocation.region, selectedLocation.country]
        .filter(Boolean)
        .join(', ');
    }
  }

  // Calculate
  const astrology = calculateAstrology(
    birthDate,
    birthHour,
    timezone,
    location?.lat,
    location?.lon
  );

  const vedic = calculateVedic(
    birthDate,
    birthHour,
    timezone,
    location?.lat,
    location?.lon
  );

  const humanDesign = calculateHumanDesign(birthDate, birthHour, timezone);
  const geneKeys = calculateGeneKeys(humanDesign);

  // Store for export
  calculatedData = { astrology, vedic, humandesign: humanDesign, genekeys: geneKeys, compatibility: null };

  // Store birth info for profile saving
  currentBirthInfo = {
    date: birthDate,
    time: birthTime,
    location: location ? {
      lat: location.lat,
      lon: location.lon,
      timezone: timezone,
      name: locationName
    } : null
  };

  // Render
  renderAstrology(astrology);
  renderVedic(vedic);
  renderHumanDesign(humanDesign);
  renderGeneKeys(geneKeys);

  resultsSection.style.display = 'block';

  // Show save profile button
  const saveBtn = document.getElementById('save-profile-btn');
  if (saveBtn) saveBtn.style.display = 'inline-block';

  // Update URL with chart parameters (unless loading from URL)
  if (!skipURLUpdate && location) {
    updateURL(birthDate, birthTime, location.lat, location.lon, timezone, locationName);
  }

  // Dispatch event for compatibility preview update
  window.dispatchEvent(new CustomEvent('chartCalculated'));

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

  // Only show loading state for calculation panels, not compatibility
  ['astrology-result', 'vedic-result', 'humandesign-result', 'genekeys-result'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '<div class="loading">Calculating...</div>';
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
    ['astrology-result', 'vedic-result', 'humandesign-result', 'genekeys-result'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = `<div class="loading">Error: ${error.message}</div>`;
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
    const locationName = params.name || 'Custom Location';

    // Set selectedLocation so Calculate button works
    selectedLocation = {
      lat: lat,
      lon: lng,
      timezone: tz,
      isDST: false, // Can't know DST from URL, use raw timezone
      name: locationName,
      fromURL: true // Flag to indicate loaded from URL
    };

    selectedDiv.innerHTML = `
      <span>${locationName}</span>
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

    // Show loading state for calculation panels only
    ['astrology-result', 'vedic-result', 'humandesign-result', 'genekeys-result'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '<div class="loading">Calculating...</div>';
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
      ['astrology-result', 'vedic-result', 'humandesign-result', 'genekeys-result'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = `<div class="loading">Error: ${error.message}</div>`;
      });
    }
  }
}

// Profile Management
function initProfilePicker() {
  const profilePicker = document.getElementById('profile-picker');
  const profileSelect = document.getElementById('profile-select');
  const deleteBtn = document.getElementById('delete-profile-btn');
  const saveBtn = document.getElementById('save-profile-btn');
  const comparePersonA = document.getElementById('compare-person-a');
  const comparePersonB = document.getElementById('compare-person-b');

  // Update profile dropdowns
  function updateProfileDropdowns() {
    const profiles = getProfiles();

    // Update main profile picker
    profileSelect.innerHTML = '<option value="">-- Select a profile --</option>';
    profiles.forEach(p => {
      const option = document.createElement('option');
      option.value = p.id;
      option.textContent = `${p.name} (${p.birthDate})`;
      profileSelect.appendChild(option);
    });

    // Update comparison dropdowns
    if (comparePersonA) {
      const currentOption = comparePersonA.querySelector('option[value="current"]');
      comparePersonA.innerHTML = '';
      if (currentOption) comparePersonA.appendChild(currentOption);
      profiles.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = `${p.name} (${p.birthDate})`;
        comparePersonA.appendChild(option);
      });
    }

    if (comparePersonB) {
      comparePersonB.innerHTML = '<option value="">-- Select a saved profile --</option>';
      profiles.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = `${p.name} (${p.birthDate})`;
        comparePersonB.appendChild(option);
      });
    }

    // Show/hide profile picker based on whether profiles exist
    if (profiles.length > 0) {
      profilePicker.style.display = 'flex';
    }
  }

  // Load profile
  profileSelect.addEventListener('change', async () => {
    const profileId = profileSelect.value;
    if (!profileId) {
      deleteBtn.style.display = 'none';
      return;
    }

    deleteBtn.style.display = 'inline-block';
    const profile = getProfile(profileId);
    if (!profile) return;

    // Populate form
    document.getElementById('birth-date').value = profile.birthDate;
    document.getElementById('birth-time').value = profile.birthTime || '12:00';

    // If cached data exists, use it directly
    if (profile.cachedData) {
      calculatedData = {
        astrology: profile.cachedData.astrology,
        humandesign: profile.cachedData.humanDesign,
        genekeys: profile.cachedData.geneKeys,
        compatibility: null
      };

      renderAstrology(profile.cachedData.astrology);
      renderHumanDesign(profile.cachedData.humanDesign);
      renderGeneKeys(profile.cachedData.geneKeys);
      resultsSection.style.display = 'block';

      currentBirthInfo = {
        date: profile.birthDate,
        time: profile.birthTime,
        location: profile.location
      };
    } else if (profile.location) {
      // Calculate fresh
      selectedLocation = {
        lat: profile.location.lat,
        lon: profile.location.lon,
        timezone: profile.location.timezone || Math.round(profile.location.lon / 15),
        isDST: false,
        name: profile.location.name
      };

      await calculateNatalChart(profile.birthDate, profile.birthTime || '12:00', {
        lat: profile.location.lat,
        lon: profile.location.lon,
        tz: profile.location.timezone
      }, true);
    }
  });

  // Delete profile
  deleteBtn.addEventListener('click', () => {
    const profileId = profileSelect.value;
    if (!profileId) return;

    if (confirm('Delete this profile?')) {
      deleteProfile(profileId);
      updateProfileDropdowns();
      deleteBtn.style.display = 'none';
      profileSelect.value = '';
    }
  });

  // Inline save form elements
  const inlineSaveForm = document.getElementById('inline-save-form');
  const profileNameInput = document.getElementById('profile-name-input');
  const saveConfirmBtn = document.getElementById('save-confirm-btn');
  const saveCancelBtn = document.getElementById('save-cancel-btn');

  // Show inline save form
  saveBtn.addEventListener('click', () => {
    if (!currentBirthInfo || !calculatedData.astrology) {
      alert('Please calculate a chart first.');
      return;
    }

    // Show the inline form
    inlineSaveForm.style.display = 'flex';
    saveBtn.style.display = 'none';
    profileNameInput.value = '';
    profileNameInput.focus();
  });

  // Cancel save
  saveCancelBtn.addEventListener('click', () => {
    inlineSaveForm.style.display = 'none';
    saveBtn.style.display = 'inline-flex';
  });

  // Confirm save
  const doSaveProfile = () => {
    const name = profileNameInput.value.trim();
    if (!name) {
      profileNameInput.focus();
      return;
    }

    const profile = saveProfile({
      name,
      birthDate: currentBirthInfo.date,
      birthTime: currentBirthInfo.time,
      location: currentBirthInfo.location,
      cachedData: {
        astrology: calculatedData.astrology,
        humanDesign: calculatedData.humandesign,
        geneKeys: calculatedData.genekeys
      }
    });

    // Hide form and show button
    inlineSaveForm.style.display = 'none';
    saveBtn.style.display = 'inline-flex';

    // Show success feedback briefly
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<span class="save-icon">✓</span> Saved!';
    saveBtn.style.borderColor = 'var(--success)';
    saveBtn.style.color = 'var(--success)';

    setTimeout(() => {
      saveBtn.innerHTML = originalText;
      saveBtn.style.borderColor = '';
      saveBtn.style.color = '';
    }, 2000);

    updateProfileDropdowns();
  };

  saveConfirmBtn.addEventListener('click', doSaveProfile);

  // Enter key to save, Escape to cancel
  profileNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      doSaveProfile();
    } else if (e.key === 'Escape') {
      inlineSaveForm.style.display = 'none';
      saveBtn.style.display = 'inline-flex';
    }
  });

  // Initial load
  updateProfileDropdowns();

  // Return the update function for use elsewhere
  return { updateProfileDropdowns };
}

// Comparison functionality
function initComparison() {
  const compareBtn = document.getElementById('compare-btn');
  const compareBtnText = compareBtn?.querySelector('.compare-btn-text');
  const compareBtnLoading = compareBtn?.querySelector('.compare-btn-loading');
  const comparePersonA = document.getElementById('compare-person-a');
  const comparePersonB = document.getElementById('compare-person-b');
  const resultsDiv = document.getElementById('compatibility-results');
  const previewA = document.getElementById('preview-a');
  const previewB = document.getElementById('preview-b');
  const profileCardA = document.getElementById('profile-card-a');
  const profileCardB = document.getElementById('profile-card-b');
  const noProfilesHint = document.getElementById('no-profiles-hint');

  if (!compareBtn) return;

  // Update preview when selection changes
  const updatePreview = (selectEl, previewEl, cardEl) => {
    const value = selectEl.value;

    if (value === 'current') {
      if (calculatedData.astrology) {
        const sun = calculatedData.astrology.sun?.sign?.symbol || '';
        const moon = calculatedData.astrology.moon?.sign?.symbol || '';
        const type = calculatedData.humandesign?.type?.name || '';
        previewEl.innerHTML = `
          <div class="preview-signs">
            <span class="preview-sign" title="Sun">${sun}</span>
            <span class="preview-sign" title="Moon">${moon}</span>
          </div>
          <div>${type}</div>
        `;
        cardEl?.classList.add('has-selection');
      } else {
        previewEl.innerHTML = '<em>Calculate chart first</em>';
        cardEl?.classList.remove('has-selection');
      }
    } else if (value) {
      const profile = getProfile(value);
      if (profile?.cachedData) {
        const sun = profile.cachedData.astrology?.sun?.sign?.symbol || '';
        const moon = profile.cachedData.astrology?.moon?.sign?.symbol || '';
        const type = profile.cachedData.humanDesign?.type?.name || '';
        previewEl.innerHTML = `
          <div class="preview-signs">
            <span class="preview-sign" title="Sun">${sun}</span>
            <span class="preview-sign" title="Moon">${moon}</span>
          </div>
          <div>${type}</div>
        `;
        cardEl?.classList.add('has-selection');
      }
    } else {
      previewEl.innerHTML = '';
      cardEl?.classList.remove('has-selection');
    }
  };

  comparePersonA?.addEventListener('change', () => updatePreview(comparePersonA, previewA, profileCardA));
  comparePersonB?.addEventListener('change', () => updatePreview(comparePersonB, previewB, profileCardB));

  // Initial preview update
  setTimeout(() => {
    updatePreview(comparePersonA, previewA, profileCardA);

    // Show hint if no profiles
    const profiles = getProfiles();
    if (profiles.length === 0 && noProfilesHint) {
      noProfilesHint.style.display = 'block';
    }
  }, 100);

  // Update preview when chart is calculated
  window.addEventListener('chartCalculated', () => {
    updatePreview(comparePersonA, previewA, profileCardA);
  });

  compareBtn.addEventListener('click', async () => {
    const personAId = comparePersonA.value;
    const personBId = comparePersonB.value;

    if (!personBId) {
      // Highlight Person B card
      profileCardB?.classList.add('needs-selection');
      setTimeout(() => profileCardB?.classList.remove('needs-selection'), 1500);
      return;
    }

    // Get charts for both people
    let chartA, chartB;

    if (personAId === 'current') {
      if (!calculatedData.astrology) {
        alert('Please calculate a chart first (Person A is set to "Current Chart")');
        return;
      }
      chartA = {
        astrology: calculatedData.astrology,
        humanDesign: calculatedData.humandesign,
        geneKeys: calculatedData.genekeys
      };
    } else {
      const profileA = getProfile(personAId);
      if (!profileA?.cachedData) {
        alert('Profile A has no cached data. Please load and calculate it first.');
        return;
      }
      chartA = profileA.cachedData;
    }

    const profileB = getProfile(personBId);
    if (!profileB?.cachedData) {
      alert('Profile B has no cached data. Please load and calculate it first.');
      return;
    }
    chartB = profileB.cachedData;

    // Get selected systems
    const includeAstrology = document.getElementById('compare-astrology').checked;
    const includeHD = document.getElementById('compare-humandesign').checked;
    const includeGK = document.getElementById('compare-genekeys').checked;

    // Show loading state
    compareBtn.disabled = true;
    if (compareBtnText) compareBtnText.style.display = 'none';
    if (compareBtnLoading) compareBtnLoading.style.display = 'flex';

    try {
      const results = {};

      if (includeAstrology && chartA.astrology && chartB.astrology) {
        results.astrology = compareAstrology(chartA.astrology, chartB.astrology);
      }

      if (includeHD && chartA.humanDesign && chartB.humanDesign) {
        results.humanDesign = compareHumanDesign(chartA.humanDesign, chartB.humanDesign);
      }

      if (includeGK && chartA.geneKeys && chartB.geneKeys) {
        results.geneKeys = compareGeneKeys(chartA.geneKeys, chartB.geneKeys);
      }

      calculatedData.compatibility = results;
      renderCompatibilityResults(results, chartA, chartB);
      resultsDiv.style.display = 'block';
      document.querySelector('.compatibility-intro').style.display = 'none';

    } catch (error) {
      console.error('Comparison error:', error);
      alert('Error comparing charts: ' + error.message);
    } finally {
      compareBtn.disabled = false;
      if (compareBtnText) compareBtnText.style.display = '';
      if (compareBtnLoading) compareBtnLoading.style.display = 'none';
    }
  });
}

// Render compatibility results
function renderCompatibilityResults(results, chartA, chartB) {
  const container = document.getElementById('compatibility-results');

  let html = '';

  // Astrology results
  if (results.astrology) {
    const a = results.astrology;
    const scoreClass = a.overallScore >= 80 ? 'excellent' :
                       a.overallScore >= 65 ? 'good' :
                       a.overallScore >= 50 ? 'moderate' :
                       a.overallScore >= 35 ? 'mixed' : 'challenging';

    html += `
      <div class="compat-section">
        <div class="compat-section-title">
          <span class="compat-score ${scoreClass}">${a.overallScore}</span>
          <span>☉ Astrology Synastry</span>
        </div>

        <div class="synastry-chart-wrapper"></div>

        <div class="compat-summary">${a.summary}</div>

        <details class="collapsible" style="margin-top: 1rem;">
          <summary>Key Connections (${Object.values(a.keyConnections).filter(c => c).length})</summary>
          <div class="collapsible-content">
            ${Object.entries(a.keyConnections)
              .filter(([_, conn]) => conn)
              .map(([key, conn]) => `
                <div class="compat-connection">
                  <div class="compat-connection-title">
                    ${conn.symbolA || ''} ${conn.personA} ${conn.symbol} ${conn.personB} ${conn.symbolB || ''}
                    <span style="color: var(--text-muted); font-weight: normal;">(${conn.aspect}, ${conn.orb}° orb)</span>
                  </div>
                  <div class="compat-connection-desc">${conn.meaning}</div>
                </div>
              `).join('')}
          </div>
        </details>

        <details class="collapsible">
          <summary>All Synastry Aspects (${a.synastryAspects.length})</summary>
          <div class="collapsible-content">
            <div class="compat-aspects-grid">
              ${a.synastryAspects.slice(0, 20).map(asp => `
                <div class="compat-aspect ${asp.harmony > 0 ? 'harmonious' : asp.harmony < 0 ? 'challenging' : ''}">
                  <span>${asp.symbolA} ${asp.personA}</span>
                  <span>${asp.symbol}</span>
                  <span>${asp.personB} ${asp.symbolB}</span>
                  <span style="color: var(--text-muted);">${asp.orb}°</span>
                </div>
              `).join('')}
            </div>
          </div>
        </details>
      </div>
    `;
  }

  // Human Design results
  if (results.humanDesign) {
    const hd = results.humanDesign;

    html += `
      <div class="compat-section">
        <div class="compat-section-title">
          <span style="font-size: 1.5rem; margin-right: 0.5rem;">◎</span>
          Human Design Compatibility
        </div>

        <div class="composite-bodygraph-wrapper"></div>

        <div class="compat-summary">
          <strong>${hd.typeInteraction.typeA} + ${hd.typeInteraction.typeB}:</strong> ${hd.typeInteraction.dynamic}<br>
          <em>${hd.typeInteraction.gifts}</em>
        </div>

        <details class="collapsible" style="margin-top: 1rem;" open>
          <summary>Type & Authority Dynamics</summary>
          <div class="collapsible-content">
            <div class="compat-connection">
              <div class="compat-connection-title">Type Interaction</div>
              <div class="compat-connection-desc">
                <strong>Gifts:</strong> ${hd.typeInteraction.gifts}<br>
                <strong>Challenges:</strong> ${hd.typeInteraction.challenges}<br>
                <strong>Tips:</strong> ${hd.typeInteraction.tips}
              </div>
            </div>
            <div class="compat-connection">
              <div class="compat-connection-title">Authority Timing</div>
              <div class="compat-connection-desc">${hd.authorityDynamic.description}</div>
            </div>
            <div class="compat-connection">
              <div class="compat-connection-title">Profile Harmony</div>
              <div class="compat-connection-desc">${hd.profileHarmony.description}</div>
            </div>
          </div>
        </details>

        ${hd.electromagneticPairs.length > 0 ? `
          <details class="collapsible">
            <summary>Electromagnetic Connections (${hd.electromagneticPairs.length})</summary>
            <div class="collapsible-content">
              ${hd.electromagneticPairs.map(em => `
                <div class="compat-connection">
                  <div class="compat-connection-title">
                    Channel of ${em.channel} (${em.gateA}-${em.gateB})
                  </div>
                  <div class="compat-connection-desc">${em.attraction} — ${em.theme}</div>
                </div>
              `).join('')}
            </div>
          </details>
        ` : ''}

        ${hd.sharedGates.length > 0 ? `
          <details class="collapsible">
            <summary>Shared Gates (${hd.sharedGates.length})</summary>
            <div class="collapsible-content">
              <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                ${hd.sharedGates.map(g => `
                  <span class="gate-pill" title="${g.theme}">${g.gate} ${g.name}</span>
                `).join('')}
              </div>
            </div>
          </details>
        ` : ''}
      </div>
    `;
  }

  // Gene Keys results
  if (results.geneKeys) {
    const gk = results.geneKeys;

    html += `
      <div class="compat-section">
        <div class="compat-section-title">
          <span style="font-size: 1.5rem; margin-right: 0.5rem;">✦</span>
          Gene Keys Compatibility
        </div>

        <div class="compat-summary">${gk.summary}</div>

        ${gk.sharedKeys.length > 0 ? `
          <details class="collapsible" style="margin-top: 1rem;" open>
            <summary>Shared Gene Keys (${gk.sharedKeys.length})</summary>
            <div class="collapsible-content">
              ${gk.sharedKeys.map(k => `
                <div class="compat-connection">
                  <div class="compat-connection-title">Key ${k.key}: ${k.theme}</div>
                  <div class="compat-connection-desc">
                    ${k.resonance}<br>
                    <span style="color: var(--text-muted);">Shadow → Gift → Siddhi: ${k.shadow} → ${k.gift} → ${k.siddhi}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </details>
        ` : ''}

        ${gk.complementaryPairs.length > 0 ? `
          <details class="collapsible">
            <summary>Programming Partners (${gk.complementaryPairs.length})</summary>
            <div class="collapsible-content">
              ${gk.complementaryPairs.map(p => `
                <div class="compat-connection">
                  <div class="compat-connection-title">Key ${p.keyA} (${p.themeA}) ↔ Key ${p.keyB} (${p.themeB})</div>
                  <div class="compat-connection-desc">${p.growthPath}</div>
                </div>
              `).join('')}
            </div>
          </details>
        ` : ''}

        <details class="collapsible">
          <summary>Sequence Alignment</summary>
          <div class="collapsible-content">
            <div class="compat-connection">
              <div class="compat-connection-title">Activation Sequence</div>
              <div class="compat-connection-desc">${gk.activationAlignment.description}</div>
            </div>
            <div class="compat-connection">
              <div class="compat-connection-title">Venus Sequence</div>
              <div class="compat-connection-desc">${gk.venusAlignment.description}</div>
            </div>
            <div class="compat-connection">
              <div class="compat-connection-title">Pearl Sequence</div>
              <div class="compat-connection-desc">${gk.pearlAlignment.description}</div>
            </div>
          </div>
        </details>
      </div>
    `;
  }

  if (!html) {
    html = '<p style="text-align: center; color: var(--text-muted);">No comparison data available. Select systems to compare.</p>';
  }

  container.innerHTML = html;

  // Render visual charts after HTML is in place
  if (results.astrology && chartA?.astrology && chartB?.astrology) {
    const synastryWrapper = container.querySelector('.synastry-chart-wrapper');
    if (synastryWrapper) {
      renderSynastryChart(synastryWrapper, chartA.astrology, chartB.astrology, results.astrology.synastryAspects);
    }
  }

  if (results.humanDesign && chartA?.humanDesign && chartB?.humanDesign) {
    const compositeWrapper = container.querySelector('.composite-bodygraph-wrapper');
    if (compositeWrapper) {
      renderCompositeBodygraph(compositeWrapper, chartA.humanDesign, chartB.humanDesign, results.humanDesign.electromagneticPairs);
    }
  }
}

// Initialize
setupLocationAutocomplete();
initDarkMode();
initTabs();
const profileManager = initProfilePicker();
initComparison();
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
