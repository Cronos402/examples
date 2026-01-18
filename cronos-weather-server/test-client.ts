/**
 * Test Client for Cronos402 SDK
 *
 * This script tests the SDK client with x402 payment support.
 * It connects to the weather server and calls both free and paid tools.
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { withX402Client } from "cronos402/client";
import { createSigner } from "cronos402";

const PRIVATE_KEY = "0xdfe9a1d1c29b40417ee15201f33240236c1750f4ce60fe32ba809a673ab24f99";
const SERVER_URL = "http://localhost:3000/mcp";

async function main() {
  console.log("=".repeat(50));
  console.log("Cronos402 SDK Client Test");
  console.log("=".repeat(50));

  // Create signer for Cronos testnet
  console.log("\n1. Creating signer...");
  const signer = await createSigner("cronos-testnet", PRIVATE_KEY);
  console.log(`   Wallet: ${signer.account.address}`);

  // Create MCP client
  console.log("\n2. Creating MCP client...");
  const client = new Client(
    { name: "test-client", version: "1.0.0" },
    { capabilities: {} }
  );

  // Connect to server
  console.log("\n3. Connecting to server...");
  const transport = new StreamableHTTPClientTransport(new URL(SERVER_URL));
  await client.connect(transport);
  console.log("   Connected!");

  // Wrap with x402 payment support
  console.log("\n4. Adding x402 payment capabilities...");
  const paidClient = withX402Client(client, {
    wallet: { evm: signer },
    maxPaymentValue: BigInt(100000), // Max 0.1 USDC (6 decimals)
    confirmationCallback: async (accepts) => {
      console.log("\n   Payment required:");
      for (const accept of accepts) {
        console.log(`   - Network: ${accept.network}`);
        console.log(`   - Amount: ${accept.maxAmountRequired} (atomic units)`);
        console.log(`   - Recipient: ${accept.payTo}`);
      }
      return true; // Auto-approve for testing
    }
  });
  console.log("   Payment wrapper ready!");

  // List available tools
  console.log("\n5. Listing available tools...");
  const tools = await paidClient.listTools();
  console.log("   Available tools:");
  for (const tool of tools.tools) {
    console.log(`   - ${tool.name}: ${tool.description}`);
  }

  // Call FREE tool
  console.log("\n" + "=".repeat(50));
  console.log("Testing FREE tool: list_cities");
  console.log("=".repeat(50));
  const freeResult = await paidClient.callTool({
    name: "list_cities",
    arguments: {}
  });
  console.log("\nResult:");
  if (freeResult.content && Array.isArray(freeResult.content)) {
    for (const item of freeResult.content) {
      if (item.type === "text") {
        console.log(item.text);
      }
    }
  }

  // Call PAID tool
  console.log("\n" + "=".repeat(50));
  console.log("Testing PAID tool: get_weather");
  console.log("=".repeat(50));
  const paidResult = await paidClient.callTool({
    name: "get_weather",
    arguments: { city: "San Francisco" }
  });

  console.log("\nResult:");
  if (paidResult.content && Array.isArray(paidResult.content)) {
    for (const item of paidResult.content) {
      if (item.type === "text") {
        console.log(item.text);
      }
    }
  }

  // Check for payment response
  const meta = (paidResult as any)._meta;
  if (meta?.["x402/payment-response"]) {
    const payment = meta["x402/payment-response"];
    console.log("\nPayment Details:");
    console.log(`   Success: ${payment.success}`);
    console.log(`   Transaction: ${payment.transaction}`);
    console.log(`   Network: ${payment.network}`);
    console.log(`   Payer: ${payment.payer}`);
  }

  console.log("\n" + "=".repeat(50));
  console.log("Test Complete!");
  console.log("=".repeat(50));
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
