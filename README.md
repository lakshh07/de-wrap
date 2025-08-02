# DeWrap - Web3-Native Smart Payments

DeWrap is a comprehensive Web3-native payment platform designed for builders, creators, agencies, and freelancers. Get paid in any token with automatic swapping and investment capabilities, all powered by 1inch cross-chain infrastructure.

## 🚀 Features

- **Multi-Token Payments**: Accept payments in any ERC-20 token or native tokens
- **Cross-Chain Support**: Seamless payments across multiple blockchain networks
- **Auto-Swap**: Automatic token conversion using 1inch DEX aggregator
- **Auto-Invest**: Dollar-cost averaging and investment automation [COMING SOON]
- **Smart Invoicing**: Create and manage invoices with flexible payment options
- **Real-time Tracking**: Monitor payment status and transaction history
- **User Dashboard**: Comprehensive analytics and payout management
- **Secure Authentication**: Clerk-powered user management

## 🏗️ Architecture

This is a monorepo built with Turborepo containing:

### Apps

- **`web`**: Next.js 15 frontend application with TypeScript, Tailwind CSS, and modern UI components
- **`contracts`**: Solidity smart contracts for payment processing and user management
- **`docs`**: Documentation site built with Next.js

### Packages

- **`@repo/ui`**: Shared UI component library
- **`@repo/eslint-config`**: ESLint configurations for the monorepo
- **`@repo/typescript-config`**: TypeScript configurations

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **Radix UI** for accessible components
- **TanStack Query** for data fetching
- **Wagmi + Reown's Appkit** for Web3 integration
- **Clerk** for authentication
- **Prisma** for database management

### Smart Contracts

- **Solidity 0.8.27** with OpenZeppelin contracts
- **Hardhat** for development and deployment
- **Ethers.js** for blockchain interaction
- **TypeChain** for TypeScript bindings

### Infrastructure

- **PostgreSQL** database
- **1inch Cross-Chain SDK** for DEX aggregation
- **Viem** for Ethereum interactions
- **Zod** for runtime validation

## 📦 Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 9.0.0
- PostgreSQL database
- Ethereum development environment

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd de-wrap
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create `.env` files in the following locations:

   **`apps/web/.env`**:

   ```env
   DATABASE_URL="postgresql://..."
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
   CLERK_SECRET_KEY="sk_..."
   NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
   NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/home"
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/home"
   ```

   **`apps/contracts/.env`**:

   ```env
   PRIVATE_KEY="your-private-key"
   INFURA_API_KEY="your-infura-key"
   ETHERSCAN_API_KEY="your-etherscan-key"
   ```

4. **Set up the database**

   ```bash
   cd apps/web
   pnpm prisma generate
   pnpm prisma db push
   ```

5. **Deploy smart contracts**
   ```bash
   cd apps/contracts
   pnpm compile
   pnpm deploy
   ```

## 🚀 Development

### Start Development Servers

```bash
# Start all apps in development mode
pnpm dev

# Start specific app
pnpm dev --filter=web
pnpm dev --filter=contracts
pnpm dev --filter=docs
```

### Build

```bash
# Build all apps and packages
pnpm build

# Build specific app
pnpm build --filter=web
```

### Linting and Type Checking

```bash
# Lint all packages
pnpm lint

# Check types
pnpm check-types

# Format code
pnpm format
```

## 📁 Project Structure

```
de-wrap/
├── apps/
│   ├── web/                 # Next.js frontend application
│   │   ├── src/
│   │   │   ├── app/         # App Router pages
│   │   │   ├── components/  # React components
│   │   │   ├── lib/         # Utilities and configurations
│   │   │   └── contracts/   # Smart contract ABIs
│   │   └── prisma/          # Database schema and migrations
│   ├── contracts/           # Solidity smart contracts
│   │   ├── contracts/       # Smart contract source files
│   │   ├── scripts/         # Deployment scripts
│   │   └── test/            # Contract tests
│   └── docs/                # Documentation site
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── eslint-config/       # ESLint configurations
│   └── typescript-config/   # TypeScript configurations
└── turbo.json              # Turborepo configuration
```

## 🔧 Smart Contracts

### Core Contracts

- **`DeWrap.sol`**: Main contract handling user profiles, invoices, and payouts
- **`DewrapPaymentCollector.sol`**: Payment collection and processing
- **`PaymentCollectorFactory.sol`**: Factory for creating payment collectors

### Key Features

- User registration and profile management
- Invoice creation and management
- Cross-chain payment processing
- Investment and DCA (Dollar-Cost Averaging) functionality
- Multi-token support with automatic swapping

## 🌐 API Endpoints

The web application exposes several API routes:

- `/api/user` - User management
- `/api/invoice` - Invoice operations
- `/api/payment` - Payment processing
- `/api/quote` - Token price quotes
- `/api/execute` - Transaction execution
- `/api/supported-network` - Network and token information
- `/api/token` - Token details

## 🧪 Testing

```bash
# Test smart contracts
cd apps/contracts
pnpm test

# Test frontend (when implemented)
cd apps/web
pnpm test
```

## 📚 Documentation

- Visit the docs site at `apps/docs` for detailed documentation
- Smart contract documentation is available in the contracts directory
- API documentation is embedded in the codebase

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [1inch Protocol](https://1inch.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Turborepo Documentation](https://turborepo.com/docs)

---

Built with ❤️ for the Web3 ecosystem
