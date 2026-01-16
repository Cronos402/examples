import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { withX402Client } from "cronos402/client";
import { createSigner } from "x402/types";
import { privateKeyToAccount } from "viem/accounts";
import { createSignerFromViemAccount } from "cronos402/utils";
import { config } from 'dotenv';
config();

// ✅ Cronos-only supported networks (no Base, Avalanche, etc.)
const CRONOS_NETWORKS = ["cronos-testnet", "cronos-mainnet"] as const;
type CronosNetwork = typeof CRONOS_NETWORKS[number];

export const getClient = async () => {
  const client = new Client({
    name: "cronos-vlayer-example",
    version: "1.0.0",
  });

  const CRONOS_PRIVATE_KEY = process.env.CRONOS_PRIVATE_KEY as string;
  const MCP_SERVER_URL = process.env.MCP_SERVER_URL || "http://localhost:3000"; // Your Cronos MCP server

  if (!CRONOS_PRIVATE_KEY) {
    throw new Error("CRONOS_PRIVATE_KEY environment variable is required");
  }

  const transport = new StreamableHTTPClientTransport(new URL(MCP_SERVER_URL), {
    requestInit: {
      headers: {
        'x-mcp-disable-auth': 'true',
        'x-vlayer-enabled': 'true',
      },
    },
  });

  // ✅ Connect to MCP server
  await client.connect(transport);

  // ✅ Create Cronos signer using our implementation
  // (x402's createSigner doesn't support Cronos networks yet, so we use our own)
  console.log("📝 Using Cronos402 custom signer");
  const account = privateKeyToAccount(CRONOS_PRIVATE_KEY as `0x${string}`);
  const cronosSigner = createSignerFromViemAccount("cronos-testnet", account);

  return withX402Client(client, {
    wallet: {
      evm: cronosSigner as any, // x402 types don't include Cronos yet
    },
    confirmationCallback: async (payments) => {
      const readline = await import("readline");

      console.log("\n💰 Payment Required on Cronos");
      console.log("================================");
      console.log("Available payment options:\n");

      payments.forEach((payment, index) => {
        console.log(`Option ${index + 1}:`);
        console.log(`  Network: ${payment.network}`);
        console.log(`  Amount: ${payment.maxAmountRequired} atomic units`);
        if ('asset' in payment) {
          console.log(`  Token: ${payment.asset}`);
        }
        if ('payTo' in payment) {
          console.log(`  Recipient: ${payment.payTo}`);
        }
        console.log("");
      });

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      return new Promise((resolve) => {
        rl.question("Enter network (cronos-testnet/cronos-mainnet) or 'n' to cancel: ", (answer: string) => {
          rl.close();

          if (answer.toLowerCase() === 'n') {
            console.log("❌ Payment cancelled");
            resolve(false);
            return;
          }

          // ✅ Only accept Cronos networks (NOT Base, Avalanche, etc.)
          if (CRONOS_NETWORKS.includes(answer as CronosNetwork)) {
            console.log(`✅ Proceeding with payment on ${answer}`);
            // Type assertion needed since x402 types don't include Cronos networks yet
            resolve({ network: answer as any });
          } else {
            console.log(`❌ Invalid network '${answer}'`);
            console.log(`   Only Cronos networks are supported: ${CRONOS_NETWORKS.join(", ")}`);
            resolve(false);
          }
        });
      });
    }
  });
};

export const getClientResponse = async () => {
  const client = await getClient();

  console.log("\n🔧 Calling MCP tool: getUserInfo");

  const res = await client.callTool({
    name: "getUserInfo",
    arguments: {
      userName: "microchipgnu"
    },
  });

  return res;
};

// Main execution
try {
  console.log("🚀 Cronos402 VLayer Example");
  console.log("============================\n");
  console.log("[main] Starting test...");

  const response = await getClientResponse();

  console.log("\n✅ Success!");
  console.log("[main] Final response:", JSON.stringify(response, null, 2));
} catch (err) {
  console.error("\n❌ Error:", err);
  process.exit(1);
}
