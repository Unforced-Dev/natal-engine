# StarChart MCP Server

An MCP (Model Context Protocol) server that provides birth chart calculation tools for AI assistants like Claude.

## Features

Calculate cosmic profiles using three wisdom systems:
- **Western Astrology** - Sun, Moon, Rising, planets, aspects, elements
- **Human Design** - Type, Strategy, Authority, Profile, Gates, Channels
- **Gene Keys** - Activation, Venus, and Pearl sequences with shadow/gift/siddhi

## Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

```bash
cd mcp-server
npm install
```

## Usage with Claude Code

Add to your Claude Code settings (`~/.claude/settings.json`):

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

Then restart Claude Code. You can now ask Claude to calculate birth charts:

> "Calculate my birth chart for June 15, 1990 at 2:30 PM in New York City"

## Available Tools

### `calculate_starchart`
Complete cosmic profile with all three systems combined.

**Parameters:**
- `birth_date` (required): Date in YYYY-MM-DD format
- `birth_time`: Time in HH:MM format (24-hour), defaults to 12:00
- `latitude`: Birth location latitude
- `longitude`: Birth location longitude
- `timezone`: UTC offset (estimated from longitude if not provided)

### `calculate_astrology`
Western natal chart with planetary positions.

**Parameters:**
- `birth_date` (required): Date in YYYY-MM-DD format
- `birth_time`: Time in HH:MM format
- `latitude`: Birth location latitude
- `longitude`: Birth location longitude
- `timezone`: UTC offset

### `calculate_human_design`
Human Design chart with Type, Authority, Profile, Gates, and Channels.

**Parameters:**
- `birth_date` (required): Date in YYYY-MM-DD format
- `birth_time`: Time in HH:MM format
- `timezone`: UTC offset

### `calculate_gene_keys`
Gene Keys profile with all three sequences.

**Parameters:**
- `birth_date` (required): Date in YYYY-MM-DD format
- `birth_time`: Time in HH:MM format
- `timezone`: UTC offset

### `get_planetary_positions`
Raw astronomical data for all planets.

**Parameters:**
- `birth_date` (required): Date in YYYY-MM-DD format
- `birth_time`: Time in HH:MM format
- `latitude`: Birth location latitude
- `longitude`: Birth location longitude
- `timezone`: UTC offset

## Example Prompts

Once configured, try these with Claude:

- "What's my Human Design type if I was born on March 21, 1985 at 6:00 AM?"
- "Calculate Gene Keys for someone born December 25, 1992 in Los Angeles"
- "Show me the planetary positions for July 4, 1976 at noon in Philadelphia"
- "Create a complete StarChart for my birthday: August 15, 1988, 3:30 PM, London UK"

## Technical Details

- Uses [astronomy-engine](https://github.com/cosinekitty/astronomy) for VSOP87-level planetary calculations
- Accuracy: ±1 arcminute for planetary positions
- Based on Meeus Astronomical Algorithms

## License

MIT - see [LICENSE](../LICENSE)
