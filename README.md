# StarChart

**Discover your cosmic blueprint with astronomical precision.**

StarChart is an open-source calculator that combines three wisdom systems:
- **Western Astrology** - Natal chart with Sun, Moon, Rising, and all planets
- **Human Design** - Type, Strategy, Authority, Profile, Gates, and Channels
- **Gene Keys** - Activation, Venus, and Pearl sequences

## Live Demo

**[Try StarChart](https://unforced.github.io/starchart/)**

## Features

- High-precision planetary calculations using [astronomy-engine](https://github.com/cosinekitty/astronomy)
- VSOP87-level accuracy (±1 arcminute)
- Location-aware Rising sign and Midheaven
- Interactive SVG Human Design bodygraph
- Gene Keys Golden Path visualization
- Fully client-side - no data sent to servers
- MCP server for AI assistant integration

## Quick Start

### Web App

```bash
# Clone the repository
git clone https://github.com/unforced/starchart.git
cd starchart

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

## MCP Server (AI Integration)

Add StarChart to Claude Code or other MCP-compatible AI assistants.

### Installation

```bash
cd mcp-server
npm install
```

### Configure Claude Code

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "starchart": {
      "command": "node",
      "args": ["/path/to/starchart/mcp-server/src/index.js"]
    }
  }
}
```

Then ask Claude:
> "Calculate my birth chart for June 15, 1990 at 2:30 PM in New York"

See [MCP Server README](./mcp-server/README.md) for full documentation.

## Project Structure

```
starchart/
├── index.html              # Main web app
├── src/
│   ├── main.js             # App entry point
│   ├── styles.css          # Styling
│   └── calculators/
│       ├── astrology.js    # Western astrology
│       ├── humandesign.js  # Human Design + Gene Keys
│       └── astronomy.js    # Planetary calculations
├── mcp-server/             # MCP server for AI integration
│   ├── src/index.js        # Server entry
│   └── README.md           # MCP documentation
└── docs/                   # Additional documentation
```

## Calculator APIs

All calculators can be imported and used directly:

```javascript
import calculateAstrology from './src/calculators/astrology.js';
import calculateHumanDesign, { calculateGeneKeys } from './src/calculators/humandesign.js';

// Western Astrology
const astrology = calculateAstrology(
  '1990-06-15',  // birth date
  14.5,          // birth hour (2:30 PM)
  -5,            // timezone (EST)
  40.7128,       // latitude (NYC)
  -74.0060       // longitude (NYC)
);

console.log(astrology.bigThree); // "♊ Gemini Sun, ♓ Pisces Moon, ♏ Scorpio Rising"

// Human Design
const hd = calculateHumanDesign('1990-06-15', 14.5, -5);
console.log(hd.type.name);       // "Generator"
console.log(hd.authority.name);  // "Emotional Authority"

// Gene Keys
const gk = calculateGeneKeys(hd);
console.log(gk.activationSequence.lifeWork.gift); // "Imagination"
```

## Technical Details

### Astronomical Accuracy
- Uses VSOP87 planetary theory via astronomy-engine
- Planetary positions accurate to ±1 arcminute
- Ascendant calculated from local sidereal time
- Mean lunar nodes (true node calculation available)

### Human Design
- Design date calculated as 88° of solar arc before birth
- All 64 gates with I Ching correspondences
- 36 channels with center connections
- 9 centers with defined/undefined states

### Gene Keys
- Derived from Human Design gates
- 64 keys with shadow, gift, and siddhi
- Three sequences: Activation, Venus, Pearl

## Contributing

Contributions welcome! Please read the contributing guidelines before submitting PRs.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Credits

- Planetary calculations: [astronomy-engine](https://github.com/cosinekitty/astronomy)
- Algorithms: Jean Meeus, *Astronomical Algorithms*
- Geocoding: [OpenStreetMap Nominatim](https://nominatim.org/)

---

Built with love for seekers of cosmic wisdom.
