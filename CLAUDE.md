# CLAUDE.md - NatalEngine Project Guide

## Project Overview

NatalEngine is a birth chart calculation engine for Western Astrology, Vedic (Jyotish) Astrology, Human Design, and Gene Keys. It provides clean, structured data output for apps and AI integrations - no interpretations, just the facts.

## Key Commands

```bash
# Development
npm run dev          # Start Vite dev server (usually localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm test             # Run tests (node --test tests/)

# MCP Server
npm run mcp          # Start MCP server directly
```

## Architecture

```
src/
├── index.js              # Main exports (calculateAstrology, calculateVedic, calculateHumanDesign, calculateGeneKeys)
├── main.js               # Browser UI entry point
├── styles.css            # UI styles with dark mode support
├── geocode.js            # Location autocomplete & timezone detection
├── calculators/
│   ├── astrology.js      # Western natal chart calculations
│   ├── vedic.js          # Vedic (Jyotish) astrology with Lahiri ayanamsa
│   ├── humandesign.js    # Human Design chart calculations
│   └── astronomy.js      # Planetary position calculations (VSOP87)
├── components/
│   ├── astrology-chart.js  # SVG zodiac wheel renderer
│   ├── bodygraph.js        # SVG Human Design bodygraph renderer
│   └── genekeys-chart.js   # SVG Gene Keys hologenetic profile renderer
├── data/                 # Static data files (zodiac signs, gates, channels, etc.)
├── lib/                  # Utility functions
└── mcp/
    └── index.js          # MCP server for Claude/AI integration
```

## Core Calculators

### Astrology (`src/calculators/astrology.js`)
- Uses astronomy-engine for planetary positions (±1 arcminute accuracy)
- Calculates: Sun, Moon, Rising, all planets, nodes, midheaven, aspects
- Returns element/modality balance

### Vedic (`src/calculators/vedic.js`)
- Sidereal zodiac using Lahiri (Chitrapaksha) ayanamsa
- All 27 Nakshatras with padas and ruling lords
- Vimshottari Dasha system (120-year planetary periods)
- Whole sign houses (Rashi-based)
- Calculates: Rashis, Nakshatras, Dasha timeline

### Human Design (`src/calculators/humandesign.js`)
- Calculates both Personality (birth) and Design (88° before) positions
- Determines: Type, Strategy, Authority, Profile, Centers, Gates, Channels
- Gate calculation from planetary positions mapped to I Ching hexagrams

### Gene Keys (`src/calculators/genekeys.js`)
- Derives from Human Design gate data
- Three sequences: Activation, Venus, Pearl
- Each key has shadow, gift, and siddhi expressions

## UI Components

The browser interface (`index.html` + `main.js`) features:
- **Tab navigation**: Astrology | Vedic | Human Design | Gene Keys | Compatibility
- **Interactive SVG charts** with tooltips
- **Location autocomplete** with automatic timezone detection
- **Dark mode** toggle (system/dark/light)
- **Collapsible sections** for detailed data

### Chart Components

**Astrology Chart** (`astrology-chart.js`):
- 12 zodiac signs on outer ring with symbols
- House numbers 1-12 inside wheel
- ASC/MC axis markers
- Planet positions with colored markers
- Aspect lines (red=hard, blue=soft) in center
- Interactive tooltips on planets and aspects

**Bodygraph** (`bodygraph.js`):
- 9 centers (defined=filled, undefined=hollow)
- Channels connecting gates
- Center shapes match Human Design convention

**Gene Keys Chart** (`genekeys-chart.js`):
- Diamond layout matching official Gene Keys hologenetic profile
- 11 spheres: Activation (green), Venus (red), Pearl (blue) sequences
- Dual-color gradients for shared spheres (Purpose, Core/Vocation, Brand/Life's Work)
- Labels and key numbers rendered inside each sphere
- Interactive tooltips with shadow/gift/siddhi

## MCP Server

The project includes an MCP server for AI integration:

```bash
# Add to Claude Code settings (~/.claude/settings.json):
{
  "mcpServers": {
    "natalengine": {
      "command": "npx",
      "args": ["natalengine-mcp"]
    }
  }
}
```

Tools: `calculate_natal_chart`, `calculate_astrology`, `calculate_vedic`, `calculate_human_design`, `calculate_gene_keys`, `get_planetary_positions`

## Development Notes

- **Module type**: ESM (`"type": "module"`)
- **No external chart libraries**: All SVG charts are vanilla JS
- **CSS custom properties**: Used for theming (dark mode)
- **astronomy-engine**: Core dependency for planetary calculations

## Common Tasks

### Adding a new planet/point
1. Add to `PLANETS` object in `astrology-chart.js`
2. Update calculator in `astrology.js`
3. Add to data display in `main.js`

### Modifying chart appearance
- Chart styles are inline in the component files
- Use CSS variables (e.g., `var(--astrology, #f59e0b)`) for colors
- Charts use `viewBox` for responsive scaling

### Updating Human Design data
- Gate/channel definitions in `src/data/`
- Type/authority mappings in `humandesign.js`
