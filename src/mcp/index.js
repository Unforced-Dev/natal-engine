#!/usr/bin/env node
/**
 * NatalEngine MCP Server
 *
 * Provides birth chart calculation tools for AI assistants via Model Context Protocol.
 *
 * Chart Calculation Tools:
 * - calculate_natal_chart: Complete cosmic profile (all 3 systems)
 * - calculate_astrology: Western natal chart
 * - calculate_human_design: Human Design chart
 * - calculate_gene_keys: Gene Keys profile
 * - get_planetary_positions: Raw astronomical data
 *
 * Compatibility Comparison Tools:
 * - compare_charts: Full compatibility across all systems
 * - compare_astrology: Synastry aspects and element harmony
 * - compare_human_design: Type dynamics, electromagnetic connections
 * - compare_gene_keys: Shared keys and programming partners
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Import calculators from main library
import {
  calculateAstrology,
  calculateHumanDesign,
  calculateGeneKeys,
  calculateBirthPositions,
  compareAstrology,
  compareHumanDesign,
  compareGeneKeys
} from '../index.js';

// Import geocoding
import { parseLocation } from '../geocode.js';

// Tool definitions
const TOOLS = [
  {
    name: "calculate_natal_chart",
    description: "Calculate a complete cosmic profile including Western Astrology, Human Design, and Gene Keys. Returns comprehensive birth chart data from all three wisdom systems.",
    inputSchema: {
      type: "object",
      properties: {
        birth_date: {
          type: "string",
          description: "Birth date in YYYY-MM-DD format (e.g., '1990-06-15')"
        },
        birth_time: {
          type: "string",
          description: "Birth time in HH:MM format, 24-hour (e.g., '14:30' for 2:30 PM). Defaults to '12:00' if not provided."
        },
        location: {
          type: "string",
          description: "Birth location as city/place name (e.g., 'New York City', 'Vida, OR', 'London, UK'). Will be geocoded to coordinates."
        },
        latitude: {
          type: "number",
          description: "Birth location latitude in decimal degrees. Use this OR location, not both."
        },
        longitude: {
          type: "number",
          description: "Birth location longitude in decimal degrees. Use this OR location, not both."
        },
        timezone: {
          type: "number",
          description: "UTC timezone offset in hours. If not provided, estimated from location."
        }
      },
      required: ["birth_date"]
    }
  },
  {
    name: "calculate_astrology",
    description: "Calculate Western natal astrology chart including Sun, Moon, Rising signs, all planetary positions, aspects, elements, and modalities.",
    inputSchema: {
      type: "object",
      properties: {
        birth_date: {
          type: "string",
          description: "Birth date in YYYY-MM-DD format"
        },
        birth_time: {
          type: "string",
          description: "Birth time in HH:MM format, 24-hour. Defaults to '12:00'."
        },
        location: {
          type: "string",
          description: "Birth location as city/place name (e.g., 'New York City', 'Vida, OR')"
        },
        latitude: {
          type: "number",
          description: "Birth location latitude in decimal degrees"
        },
        longitude: {
          type: "number",
          description: "Birth location longitude in decimal degrees"
        },
        timezone: {
          type: "number",
          description: "UTC timezone offset in hours"
        }
      },
      required: ["birth_date"]
    }
  },
  {
    name: "calculate_human_design",
    description: "Calculate Human Design chart including Type, Strategy, Authority, Profile, defined/undefined Centers, Gates, Channels, and Incarnation Cross.",
    inputSchema: {
      type: "object",
      properties: {
        birth_date: {
          type: "string",
          description: "Birth date in YYYY-MM-DD format"
        },
        birth_time: {
          type: "string",
          description: "Birth time in HH:MM format, 24-hour. Defaults to '12:00'."
        },
        timezone: {
          type: "number",
          description: "UTC timezone offset in hours"
        }
      },
      required: ["birth_date"]
    }
  },
  {
    name: "calculate_gene_keys",
    description: "Calculate Gene Keys profile including the Activation Sequence (Life's Work, Evolution, Radiance, Purpose), Venus Sequence (Attraction, IQ, EQ, SQ), and Pearl Sequence (Vocation, Culture, Pearl). Returns shadow, gift, and siddhi for each key.",
    inputSchema: {
      type: "object",
      properties: {
        birth_date: {
          type: "string",
          description: "Birth date in YYYY-MM-DD format"
        },
        birth_time: {
          type: "string",
          description: "Birth time in HH:MM format, 24-hour. Defaults to '12:00'."
        },
        timezone: {
          type: "number",
          description: "UTC timezone offset in hours"
        }
      },
      required: ["birth_date"]
    }
  },
  {
    name: "get_planetary_positions",
    description: "Get raw astronomical planetary positions for a given birth time and location. Returns ecliptic longitudes for Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, and Lunar Nodes.",
    inputSchema: {
      type: "object",
      properties: {
        birth_date: {
          type: "string",
          description: "Birth date in YYYY-MM-DD format"
        },
        birth_time: {
          type: "string",
          description: "Birth time in HH:MM format, 24-hour. Defaults to '12:00'."
        },
        latitude: {
          type: "number",
          description: "Birth location latitude in decimal degrees"
        },
        longitude: {
          type: "number",
          description: "Birth location longitude in decimal degrees"
        },
        timezone: {
          type: "number",
          description: "UTC timezone offset in hours"
        }
      },
      required: ["birth_date"]
    }
  },
  // Compatibility/Comparison Tools
  {
    name: "compare_charts",
    description: "Compare two birth charts for compatibility across all three systems (Astrology, Human Design, Gene Keys). Returns synastry aspects, electromagnetic connections, shared Gene Keys, and compatibility analysis.",
    inputSchema: {
      type: "object",
      properties: {
        person_a: {
          type: "object",
          description: "First person's birth data",
          properties: {
            name: { type: "string", description: "Person's name (optional)" },
            birth_date: { type: "string", description: "Birth date in YYYY-MM-DD format" },
            birth_time: { type: "string", description: "Birth time in HH:MM format, 24-hour" },
            location: { type: "string", description: "Birth location as city/place name" },
            timezone: { type: "number", description: "UTC timezone offset in hours" }
          },
          required: ["birth_date"]
        },
        person_b: {
          type: "object",
          description: "Second person's birth data",
          properties: {
            name: { type: "string", description: "Person's name (optional)" },
            birth_date: { type: "string", description: "Birth date in YYYY-MM-DD format" },
            birth_time: { type: "string", description: "Birth time in HH:MM format, 24-hour" },
            location: { type: "string", description: "Birth location as city/place name" },
            timezone: { type: "number", description: "UTC timezone offset in hours" }
          },
          required: ["birth_date"]
        },
        systems: {
          type: "array",
          items: { type: "string", enum: ["astrology", "humandesign", "genekeys"] },
          description: "Which systems to include in comparison. Defaults to all three."
        }
      },
      required: ["person_a", "person_b"]
    }
  },
  {
    name: "compare_astrology",
    description: "Calculate astrological synastry between two birth charts. Returns cross-chart aspects, element harmony, key connections (Sun-Moon, Venus-Mars), and overall compatibility score.",
    inputSchema: {
      type: "object",
      properties: {
        person_a: {
          type: "object",
          properties: {
            birth_date: { type: "string", description: "Birth date in YYYY-MM-DD format" },
            birth_time: { type: "string", description: "Birth time in HH:MM format" },
            location: { type: "string", description: "Birth location" },
            timezone: { type: "number" }
          },
          required: ["birth_date"]
        },
        person_b: {
          type: "object",
          properties: {
            birth_date: { type: "string", description: "Birth date in YYYY-MM-DD format" },
            birth_time: { type: "string", description: "Birth time in HH:MM format" },
            location: { type: "string", description: "Birth location" },
            timezone: { type: "number" }
          },
          required: ["birth_date"]
        }
      },
      required: ["person_a", "person_b"]
    }
  },
  {
    name: "compare_human_design",
    description: "Calculate Human Design compatibility between two charts. Returns type interaction dynamics, electromagnetic pairs (channel completions), shared gates/channels, and center conditioning analysis.",
    inputSchema: {
      type: "object",
      properties: {
        person_a: {
          type: "object",
          properties: {
            birth_date: { type: "string", description: "Birth date in YYYY-MM-DD format" },
            birth_time: { type: "string", description: "Birth time in HH:MM format" },
            timezone: { type: "number" }
          },
          required: ["birth_date"]
        },
        person_b: {
          type: "object",
          properties: {
            birth_date: { type: "string", description: "Birth date in YYYY-MM-DD format" },
            birth_time: { type: "string", description: "Birth time in HH:MM format" },
            timezone: { type: "number" }
          },
          required: ["birth_date"]
        }
      },
      required: ["person_a", "person_b"]
    }
  },
  {
    name: "compare_gene_keys",
    description: "Calculate Gene Keys compatibility between two profiles. Returns shared keys, programming partner pairs, sequence alignment, and emotional/vocational synergy analysis.",
    inputSchema: {
      type: "object",
      properties: {
        person_a: {
          type: "object",
          properties: {
            birth_date: { type: "string", description: "Birth date in YYYY-MM-DD format" },
            birth_time: { type: "string", description: "Birth time in HH:MM format" },
            timezone: { type: "number" }
          },
          required: ["birth_date"]
        },
        person_b: {
          type: "object",
          properties: {
            birth_date: { type: "string", description: "Birth date in YYYY-MM-DD format" },
            birth_time: { type: "string", description: "Birth time in HH:MM format" },
            timezone: { type: "number" }
          },
          required: ["birth_date"]
        }
      },
      required: ["person_a", "person_b"]
    }
  }
];

// Parse birth time to decimal hour
function parseTime(timeStr) {
  if (!timeStr) return 12;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + (minutes || 0) / 60;
}

// Parse birth date to components
function parseDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return { year, month, day };
}

// Estimate timezone from longitude if not provided
function estimateTimezone(longitude) {
  if (longitude === undefined || longitude === null) return 0;
  return Math.round(longitude / 15);
}

// Resolve location from args (supports both location string and lat/lon)
async function resolveLocation(args) {
  // If location string provided, geocode it
  if (args.location) {
    const geo = await parseLocation(args.location);
    if (geo) {
      return {
        latitude: geo.lat,
        longitude: geo.lon,
        timezone: args.timezone ?? geo.timezone,
        locationName: args.location
      };
    }
  }

  // Fall back to explicit coordinates
  if (args.latitude !== undefined && args.longitude !== undefined) {
    return {
      latitude: args.latitude,
      longitude: args.longitude,
      timezone: args.timezone ?? estimateTimezone(args.longitude),
      locationName: `${args.latitude}, ${args.longitude}`
    };
  }

  // No location
  return {
    latitude: null,
    longitude: null,
    timezone: args.timezone ?? 0,
    locationName: null
  };
}

// Tool handlers
async function handleCalculateNatalChart(args) {
  const birthHour = parseTime(args.birth_time);
  const loc = await resolveLocation(args);

  const astrology = calculateAstrology(
    args.birth_date,
    birthHour,
    loc.timezone,
    loc.latitude,
    loc.longitude
  );

  const humanDesign = calculateHumanDesign(args.birth_date, birthHour, loc.timezone);
  const geneKeys = calculateGeneKeys(humanDesign);

  return {
    birth_info: {
      date: args.birth_date,
      time: args.birth_time || '12:00',
      location: loc.locationName,
      latitude: loc.latitude,
      longitude: loc.longitude,
      timezone: loc.timezone
    },
    astrology: {
      sun: astrology.sun,
      moon: astrology.moon,
      rising: astrology.rising,
      planets: astrology.planets,
      nodes: astrology.nodes,
      midheaven: astrology.midheaven,
      aspects: astrology.aspects,
      balance: astrology.balance,
      bigThree: astrology.bigThree
    },
    human_design: {
      type: humanDesign.type,
      authority: humanDesign.authority,
      profile: humanDesign.profile,
      incarnation_cross: humanDesign.incarnationCross,
      centers: humanDesign.centers,
      channels: humanDesign.channels,
      gates: humanDesign.gates
    },
    gene_keys: {
      activation_sequence: geneKeys.activationSequence,
      venus_sequence: geneKeys.venusSequence,
      pearl_sequence: geneKeys.pearlSequence,
      prime_gifts: geneKeys.primeGifts
    }
  };
}

async function handleCalculateAstrology(args) {
  const birthHour = parseTime(args.birth_time);
  const loc = await resolveLocation(args);

  return calculateAstrology(
    args.birth_date,
    birthHour,
    loc.timezone,
    loc.latitude,
    loc.longitude
  );
}

async function handleCalculateHumanDesign(args) {
  const birthHour = parseTime(args.birth_time);
  const timezone = args.timezone ?? 0;

  return calculateHumanDesign(args.birth_date, birthHour, timezone);
}

async function handleCalculateGeneKeys(args) {
  const birthHour = parseTime(args.birth_time);
  const timezone = args.timezone ?? 0;

  const humanDesign = calculateHumanDesign(args.birth_date, birthHour, timezone);
  return calculateGeneKeys(humanDesign);
}

async function handleGetPlanetaryPositions(args) {
  const { year, month, day } = parseDate(args.birth_date);
  const birthHour = parseTime(args.birth_time);
  const timezone = args.timezone ?? estimateTimezone(args.longitude);

  return calculateBirthPositions(
    year,
    month,
    day,
    birthHour,
    timezone,
    args.latitude,
    args.longitude
  );
}

// Helper to calculate all charts for a person
async function calculateAllCharts(personArgs) {
  const birthHour = parseTime(personArgs.birth_time);
  const loc = await resolveLocation(personArgs);

  const astrology = calculateAstrology(
    personArgs.birth_date,
    birthHour,
    loc.timezone,
    loc.latitude,
    loc.longitude
  );

  const humanDesign = calculateHumanDesign(personArgs.birth_date, birthHour, loc.timezone);
  const geneKeys = calculateGeneKeys(humanDesign);

  return { astrology, humanDesign, geneKeys, name: personArgs.name };
}

async function handleCompareCharts(args) {
  const systems = args.systems || ['astrology', 'humandesign', 'genekeys'];

  const personA = await calculateAllCharts(args.person_a);
  const personB = await calculateAllCharts(args.person_b);

  const result = {
    person_a: {
      name: personA.name || 'Person A',
      birth_date: args.person_a.birth_date,
      birth_time: args.person_a.birth_time || '12:00'
    },
    person_b: {
      name: personB.name || 'Person B',
      birth_date: args.person_b.birth_date,
      birth_time: args.person_b.birth_time || '12:00'
    },
    comparisons: {}
  };

  if (systems.includes('astrology')) {
    result.comparisons.astrology = compareAstrology(personA.astrology, personB.astrology);
  }

  if (systems.includes('humandesign')) {
    result.comparisons.humanDesign = compareHumanDesign(personA.humanDesign, personB.humanDesign);
  }

  if (systems.includes('genekeys')) {
    result.comparisons.geneKeys = compareGeneKeys(personA.geneKeys, personB.geneKeys);
  }

  return result;
}

async function handleCompareAstrology(args) {
  const personA = await calculateAllCharts(args.person_a);
  const personB = await calculateAllCharts(args.person_b);

  return compareAstrology(personA.astrology, personB.astrology);
}

async function handleCompareHumanDesign(args) {
  const personA = await calculateAllCharts(args.person_a);
  const personB = await calculateAllCharts(args.person_b);

  return compareHumanDesign(personA.humanDesign, personB.humanDesign);
}

async function handleCompareGeneKeys(args) {
  const personA = await calculateAllCharts(args.person_a);
  const personB = await calculateAllCharts(args.person_b);

  return compareGeneKeys(personA.geneKeys, personB.geneKeys);
}

// Create and configure server
const server = new Server(
  {
    name: "natalengine",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Register tool list handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Register tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case "calculate_natal_chart":
        result = await handleCalculateNatalChart(args);
        break;
      case "calculate_astrology":
        result = await handleCalculateAstrology(args);
        break;
      case "calculate_human_design":
        result = await handleCalculateHumanDesign(args);
        break;
      case "calculate_gene_keys":
        result = await handleCalculateGeneKeys(args);
        break;
      case "get_planetary_positions":
        result = await handleGetPlanetaryPositions(args);
        break;
      case "compare_charts":
        result = await handleCompareCharts(args);
        break;
      case "compare_astrology":
        result = await handleCompareAstrology(args);
        break;
      case "compare_human_design":
        result = await handleCompareHumanDesign(args);
        break;
      case "compare_gene_keys":
        result = await handleCompareGeneKeys(args);
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    }
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("NatalEngine MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
