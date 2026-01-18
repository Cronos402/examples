/**
 * Example: Paid Weather API on Cronos
 *
 * This example demonstrates how to create a paid MCP server
 * that accepts USDC.e payments on Cronos blockchain.
 *
 * Features:
 * - Paid tool: Get weather for $0.01 per call (in USDC.e)
 * - Free tool: List supported cities
 * - Gasless payments via Cronos facilitator
 */

import { Hono } from "hono";
import { createMcpHandler, z, CRONOS_FACILITATOR_URL } from "cronos402";

const app = new Hono();

// Mock weather data
const weatherData: Record<string, { temp: number; condition: string }> = {
  "San Francisco": { temp: 18, condition: "Foggy" },
  "New York": { temp: 22, condition: "Sunny" },
  "London": { temp: 15, condition: "Rainy" },
  "Tokyo": { temp: 25, condition: "Clear" },
  "Sydney": { temp: 20, condition: "Partly Cloudy" },
};

// Create MCP handler with Cronos payment support
const handler = createMcpHandler(
  (server) => {
    // ✨ PAID TOOL: Get weather for a city ($0.01 per call)
    server.paidTool(
      "get_weather",
      "Get current weather for a city (Paid: $0.01 in USDC.e)",
      "$0.01", // Price in USD (will be converted to USDC.e)
      {
        city: z.string().describe("City name to get weather for"),
      },
      {}, // Annotations
      async ({ city }) => {
        const weather = weatherData[city];

        if (!weather) {
          return {
            content: [
              {
                type: "text",
                text: `Weather data not available for ${city}. Supported cities: ${Object.keys(weatherData).join(", ")}`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: `🌤️ Weather in ${city}:\n` +
                    `Temperature: ${weather.temp}°C\n` +
                    `Condition: ${weather.condition}`,
            },
          ],
        };
      }
    );

    // 🆓 FREE TOOL: List supported cities
    server.tool(
      "list_cities",
      "List all supported cities (Free)",
      {},
      async () => {
        const cities = Object.keys(weatherData);
        return {
          content: [
            {
              type: "text",
              text: `Supported cities:\n${cities.map((c) => `• ${c}`).join("\n")}`,
            },
          ],
        };
      }
    );
  },
  {
    // Cronos facilitator configuration (handles USDC.e gasless payments)
    facilitator: {
      url: CRONOS_FACILITATOR_URL, // https://facilitator.cronoslabs.org/v2/x402
    },
    // Payment recipient configuration
    recipient: {
      evm: {
        address: "0x7D71f82611BA86BC302A655EC3D2050E98BAf49C", // Test wallet address
        isTestnet: true, // Set to false for mainnet
      },
    },
  },
  {
    // Server metadata
    serverInfo: {
      name: "cronos-weather-api",
      version: "1.0.0",
    },
  }
);

// Mount the MCP handler
app.use("*", (c) => handler(c.req.raw));

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ status: "healthy", network: "cronos-testnet" });
});

// Export for deployment
export default app;

// For local development
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  console.log(`🚀 Cronos Weather API starting...`);
  console.log(`📡 Server: http://localhost:${port}`);
  console.log(`💰 Payment: USDC.e on Cronos Testnet`);
  console.log(`🔗 Facilitator: ${CRONOS_FACILITATOR_URL}`);

  Bun.serve({
    port,
    fetch: app.fetch,
  });
}
