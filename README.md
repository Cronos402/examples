![Cronos402 Logo](https://raw.githubusercontent.com/Cronos402/assets/main/Cronos402-logo-light.svg)

# Cronos402 Examples

Integration examples and templates demonstrating Cronos402 usage patterns.

## Overview

This directory contains self-contained examples showing how to integrate Cronos402 payment capabilities into various applications. Each example is a complete, working project that demonstrates specific use cases and integration patterns.

## Available Examples

### cronos-weather-server
Production-ready MCP weather API with payment requirements.

- **Type**: Paid MCP Server
- **Features**: USDC.e + CRO payments, OpenWeather API integration
- **Tech**: Express.js, cronos402 SDK
- **README**: [cronos-weather-server/README.md](./cronos-weather-server/README.md)

### auth-example
Authentication integration examples.

- **Type**: Auth Integration
- **Features**: Better Auth, session management, API key handling
- **Tech**: Next.js, Better Auth

### chatgpt-apps-sdk-nextjs-starter
ChatGPT app integration with Cronos402.

- **Type**: ChatGPT Plugin
- **Features**: ChatGPT Actions, OpenAPI integration
- **Tech**: Next.js, OpenAPI

## Running Examples

Each example is its own pnpm workspace package:

```bash
# Navigate to example
cd examples/cronos-weather-server

# Install dependencies
pnpm install

# Run in development
pnpm dev

# Build for production
pnpm build
```

## Example Structure

Minimal structure for new examples:

```
example-name/
├── src/                 # Source code
├── README.md            # Example documentation
├── package.json         # Dependencies
├── .env.example         # Environment variables template
└── tsconfig.json        # TypeScript configuration
```

## Creating New Examples

### Guidelines

- Keep examples focused on one concept
- Include comprehensive README
- Provide `.env.example` for configuration
- Add clear comments in code
- Include error handling
- Test on both testnet and mainnet

### Template Structure

```typescript
// Example: Minimal paid MCP server
import { createMcpHandler } from 'cronos402';
import { z } from 'zod';

const handler = createMcpHandler(
  async (server) => {
    server.paidTool(
      'example_tool',
      'Tool description',
      '0.01', // Price in USD
      {
        param: z.string().describe('Parameter description')
      },
      {},
      async ({ param }) => {
        // Tool implementation
        return {
          content: [{
            type: 'text',
            text: `Result: ${param}`
          }]
        };
      }
    );
  },
  {
    recipient: {
      'cronos-testnet': '0x...',
      'cronos-mainnet': '0x...'
    },
    facilitator: {
      url: 'https://facilitator.cronos402.dev'
    }
  }
);

export default handler;
```

## Example Categories

### MCP Servers
Examples of building paid MCP servers:
- Weather API (cronos-weather-server)
- Data API examples
- AI service examples

### Client Integration
Examples of consuming paid services:
- CLI client examples
- ChatGPT app integration
- Custom MCP client implementations

### Authentication
Examples of auth integration:
- Better Auth setup
- API key management
- Session handling

### Payment Flows
Examples demonstrating payment patterns:
- USDC.e gasless payments
- Native CRO payments
- Payment verification

## Testing Examples

### Local Testing

```bash
# Start example server
pnpm dev

# Test with CLI
npx cronos402 connect --urls http://localhost:3000/mcp --api-key test
```

### Testnet Testing

```bash
# Configure testnet
export CRONOS_NETWORK=cronos-testnet
export RECIPIENT_ADDRESS=0xYourTestnetAddress

# Get test tokens
# TCRO: https://cronos.org/faucet
# devUSDC.e: https://faucet.cronos.org

# Run example
pnpm start
```

## Deployment Examples

### Vercel

```bash
cd examples/your-example
vercel
```

### Railway

```bash
railway up
```

### Cloudflare Workers

```bash
wrangler deploy
```

## Resources

- **SDK Documentation**: [docs.cronos402.dev/sdk](https://docs.cronos402.dev)
- **npm Package**: [npmjs.com/package/cronos402](https://www.npmjs.com/package/cronos402)
- **API Reference**: [docs.cronos402.dev/api](https://docs.cronos402.dev)
- **GitHub**: [github.com/Cronos402/examples](https://github.com/Cronos402/examples)

## Contributing

To add a new example:

1. Create directory in `examples/`
2. Add to pnpm workspace
3. Include comprehensive README
4. Test thoroughly
5. Submit pull request

## Support

For questions about examples:
- Check example README files
- Visit [docs.cronos402.dev](https://docs.cronos402.dev)
- Open an issue on GitHub

## License

MIT
