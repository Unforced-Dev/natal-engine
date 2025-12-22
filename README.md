# NatalEngine

Birth chart calculation engine for Western Astrology, Human Design, and Gene Keys.

Returns clean, structured data for apps and AI integrations. No interpretation, just the facts.

## Install

```bash
npm install natalengine
```

## Quick Start

```javascript
import {
  calculateAstrology,
  calculateHumanDesign,
  calculateGeneKeys
} from 'natalengine';

// Western Astrology
const astro = calculateAstrology('1990-06-15', 14.5, -5, 40.7128, -74.0060);
console.log(astro.sun.sign.name);        // "Gemini"
console.log(astro.moon.sign.name);       // "Pisces"
console.log(astro.rising.sign.name);     // "Libra"
console.log(astro.planets.venus.degree); // "19°08'41\""

// Human Design
const hd = calculateHumanDesign('1990-06-15', 14.5, -5);
console.log(hd.type.name);               // "Manifestor"
console.log(hd.authority.name);          // "Emotional Authority"
console.log(hd.profile.numbers);         // "2/4"
console.log(hd.channels);                // [{ gates: [12, 22], name: "..." }]

// Gene Keys
const gk = calculateGeneKeys(hd);
console.log(gk.activationSequence.lifeWork.gift);  // "Discrimination"
console.log(gk.activationSequence.lifeWork.shadow); // "Vanity"
console.log(gk.activationSequence.lifeWork.siddhi); // "Purity"
```

## API

### calculateAstrology(birthDate, birthHour, timezone, latitude?, longitude?)

Returns Western natal chart data.

| Parameter | Type | Description |
|-----------|------|-------------|
| birthDate | string | `YYYY-MM-DD` format |
| birthHour | number | Decimal hours (14.5 = 2:30 PM) |
| timezone | number | UTC offset (-5 for EST) |
| latitude | number | Optional. Required for accurate Rising sign |
| longitude | number | Optional. Required for accurate Rising sign |

**Returns:**

```javascript
{
  sun: { sign, degree, longitude },
  moon: { sign, degree, longitude },
  rising: { sign, degree, longitude, accurate },
  planets: {
    mercury: { sign, degree, longitude },
    venus: { sign, degree, longitude },
    mars: { sign, degree, longitude },
    jupiter: { sign, degree, longitude },
    saturn: { sign, degree, longitude },
    uranus: { sign, degree, longitude },
    neptune: { sign, degree, longitude },
    pluto: { sign, degree, longitude }
  },
  nodes: {
    north: { sign, degree, longitude },
    south: { sign, degree, longitude }
  },
  midheaven: { sign, degree, longitude },
  aspects: [
    { planet1, planet2, aspect, orb, applying }
  ],
  balance: {
    elements: { fire, earth, air, water },
    modalities: { cardinal, fixed, mutable },
    dominantElement,
    dominantModality
  }
}
```

### calculateHumanDesign(birthDate, birthHour, timezone)

Returns Human Design chart data.

**Returns:**

```javascript
{
  type: { name, strategy, authority, notSelf, signature },
  authority: { name, description },
  profile: { numbers, name, theme },
  incarnationCross: { name, gates, theme },
  centers: {
    defined: [{ name, theme, biological }],
    undefined: [{ name, theme, biological }]
  },
  gates: {
    personality: { sun, earth, moon, northNode, southNode, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto },
    design: { sun, earth, moon, northNode, southNode, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto },
    all: [1, 2, 3, ...]
  },
  channels: [{ gates, name, centers }]
}
```

### calculateGeneKeys(humanDesignData)

Returns Gene Keys profile from Human Design data.

**Returns:**

```javascript
{
  activationSequence: {
    lifeWork: { key, line, shadow, gift, siddhi },
    evolution: { key, line, shadow, gift, siddhi },
    radiance: { key, line, shadow, gift, siddhi },
    purpose: { key, line, shadow, gift, siddhi }
  },
  venusSequence: {
    attraction: { key, line, shadow, gift, siddhi },
    iq: { key, line, shadow, gift, siddhi },
    eq: { key, line, shadow, gift, siddhi },
    sq: { key, line, shadow, gift, siddhi }
  },
  pearlSequence: {
    vocation: { key, line, shadow, gift, siddhi },
    culture: { key, line, shadow, gift, siddhi },
    pearl: { key, line, shadow, gift, siddhi }
  }
}
```

## MCP Server (AI Integration)

NatalEngine includes an MCP server for Claude and other AI assistants.

### Usage with Claude Code

Add to your Claude Code settings (`~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "natalengine": {
      "command": "npx",
      "args": ["natalengine-mcp"]
    }
  }
}
```

Then ask Claude:
> "Calculate my birth chart for June 15, 1990 at 2:30 PM in New York"

### Available Tools

| Tool | Description |
|------|-------------|
| `calculate_natal_chart` | Complete profile (all 3 systems) |
| `calculate_astrology` | Western natal chart |
| `calculate_human_design` | Human Design chart |
| `calculate_gene_keys` | Gene Keys profile |
| `get_planetary_positions` | Raw planetary longitudes |

## Accuracy

- Planetary positions: VSOP87 via [astronomy-engine](https://github.com/cosinekitty/astronomy)
- Accuracy: ±1 arcminute
- Ascendant: Calculated from local sidereal time
- Human Design: 88° solar arc for design calculation

## What's Included

| System | Data |
|--------|------|
| **Astrology** | Sun, Moon, Rising, all planets, nodes, midheaven, aspects, elements, modalities |
| **Human Design** | Type, Strategy, Authority, Profile, Centers, Gates (13 planets), Channels, Incarnation Cross |
| **Gene Keys** | Activation Sequence, Venus Sequence, Pearl Sequence with shadow/gift/siddhi |

## What's NOT Included

- Interpretations or readings
- Transit calculations
- Synastry/compatibility (coming soon)
- Progressed charts
- Solar returns

## License

MIT
