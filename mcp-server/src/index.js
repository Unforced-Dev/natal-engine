#!/usr/bin/env node
/**
 * StarChart MCP Server
 *
 * Provides birth chart calculation tools for AI assistants via Model Context Protocol.
 *
 * Tools:
 * - calculate_starchart: Complete cosmic profile (all 3 systems)
 * - calculate_astrology: Western natal chart
 * - calculate_human_design: Human Design chart
 * - calculate_gene_keys: Gene Keys profile
 * - get_planetary_positions: Raw astronomical data
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Import calculators from parent directory
import calculateAstrology from '../../src/calculators/astrology.js';
import calculateHumanDesign, { calculateGeneKeys } from '../../src/calculators/humandesign.js';
import { calculateBirthPositions } from '../../src/calculators/astronomy.js';

// Tool definitions
const TOOLS = [
  {
    name: "calculate_starchart",
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
        latitude: {
          type: "number",
          description: "Birth location latitude in decimal degrees (e.g., 40.7128 for New York)"
        },
        longitude: {
          type: "number",
          description: "Birth location longitude in decimal degrees (e.g., -74.0060 for New York)"
        },
        timezone: {
          type: "number",
          description: "UTC timezone offset in hours (e.g., -5 for EST, -8 for PST). If not provided, estimated from longitude."
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

// Tool handlers
async function handleCalculateStarchart(args) {
  const birthHour = parseTime(args.birth_time);
  const timezone = args.timezone ?? estimateTimezone(args.longitude);

  const astrology = calculateAstrology(
    args.birth_date,
    birthHour,
    timezone,
    args.latitude,
    args.longitude
  );

  const humanDesign = calculateHumanDesign(args.birth_date, birthHour, timezone);
  const geneKeys = calculateGeneKeys(humanDesign);

  return {
    birth_info: {
      date: args.birth_date,
      time: args.birth_time || '12:00',
      latitude: args.latitude,
      longitude: args.longitude,
      timezone
    },
    astrology: {
      sun: astrology.sun,
      moon: astrology.moon,
      rising: astrology.rising,
      planets: astrology.planets,
      nodes: astrology.nodes,
      midheaven: astrology.midheaven,
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
  const timezone = args.timezone ?? estimateTimezone(args.longitude);

  return calculateAstrology(
    args.birth_date,
    birthHour,
    timezone,
    args.latitude,
    args.longitude
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

// Create and configure server
const server = new Server(
  {
    name: "starchart",
    version: "0.1.0"
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
      case "calculate_starchart":
        result = await handleCalculateStarchart(args);
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
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("StarChart MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
