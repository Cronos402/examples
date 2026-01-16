# Cronos Weather Server Example

A simple paid MCP server that demonstrates how to accept **USDC.e payments on Cronos** using the Cronos402 SDK.

## Features

- ✅ **Paid Tool**: Get weather for $0.01 per call (paid in USDC.e)
- ✅ **Free Tool**: List supported cities
- ✅ **Gasless Payments**: Uses Cronos facilitator for EIP-3009 (user pays $0 gas)
- ✅ **Cronos Testnet**: Ready for testing with test USDC.e

## How It Works

1. **Client calls** `get_weather` tool
2. **Server responds** with `402 Payment Required` + payment details
3. **Client signs** EIP-3009 authorization (no gas needed)
4. **Facilitator executes** `transferWithAuthorization` on-chain
5. **Server verifies** payment and returns weather data

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Your Wallet

Edit `index.ts` and replace the recipient address:

```typescript
recipient: {
  evm: {
    address: "0xYourWalletAddress", // 👈 Your Cronos wallet
    isTestnet: true, // Cronos Testnet
  },
},
```

### 3. Run the Server

```bash
pnpm dev
```

Server starts at `http://localhost:3000`

## Testing with CLI

Use the Cronos402 CLI to connect as a client:

```bash
# Install CLI globally
npm install -g cronos402

# Connect to the server
cronos402 connect \
  --urls http://localhost:3000 \
  --private-key 0xYOUR_PRIVATE_KEY \
  --network cronos-testnet \
  --max-atomic 1000000  # Max 1 USDC per call
```

## API Endpoints

### MCP Endpoint
- **URL**: `http://localhost:3000/`
- **Protocol**: Model Context Protocol (MCP) over HTTP

### Health Check
- **URL**: `http://localhost:3000/health`
- **Method**: GET
- **Response**: `{ "status": "healthy", "network": "cronos-testnet" }`

## Tools

### `get_weather` (Paid: $0.01)

Get current weather for a city.

**Parameters:**
- `city` (string): City name

**Example Response:**
```
🌤️ Weather in Tokyo:
Temperature: 25°C
Condition: Clear
```

### `list_cities` (Free)

List all supported cities.

**Example Response:**
```
Supported cities:
• San Francisco
• New York
• London
• Tokyo
• Sydney
```

## Payment Flow

### USDC.e on Cronos (Gasless)

1. Server price: `$0.01`
2. Converted to: `10,000 atomic units` (USDC.e has 6 decimals)
3. Token: `0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0` (Testnet USDC.e)
4. Client signs EIP-3009 message (no gas!)
5. Facilitator submits transaction
6. Payment verified on-chain

## Token Addresses

### Cronos Testnet
- **USDC.e**: `0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0`
- **Facilitator**: `https://facilitator.cronoslabs.org/v2/x402`
- **Chain ID**: 338

### Cronos Mainnet
- **USDC.e**: `0xf951eC28187D9E5Ca673Da8FE6757E6f0Be5F77C`
- **Facilitator**: `https://facilitator.cronoslabs.org/v2/x402`
- **Chain ID**: 25

## Deployment

### Deploy to Vercel

```bash
# Build
pnpm build

# Deploy (configure Vercel for Hono app)
vercel deploy
```

### Deploy to Cloudflare Workers

Compatible with Hono's Cloudflare Workers adapter.

## Learn More

- [Cronos402 SDK Documentation](../../packages/js-sdk/README.md)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [x402 Protocol](https://x402.org)
- [Cronos Blockchain](https://cronos.org)

## License

MIT
