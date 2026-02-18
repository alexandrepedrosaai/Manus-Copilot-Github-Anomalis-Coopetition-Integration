# Manus Copilot Web Interface

Cyberpunk-themed web interface for the Manus Copilot Anomaly Detection System.

## Features

- **Real-time Dashboard**: Monitor anomalies with live statistics and severity distribution
- **Anomaly Management**: Filter, view, and resolve anomalies with detailed tracking
- **Blockchain Monitor**: View Manus Blockchain network status and planetary nodes
- **Search Integration**: Integrated Bing Search API with fallback to mock data
- **Mission Control**: Project tagline, mission statement, and coopetition framework
- **Cyberpunk Design**: Neon pink/cyan color scheme with geometric fonts and glow effects

## Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Express + tRPC 11
- **Database**: MySQL/TiDB with Drizzle ORM
- **UI Components**: shadcn/ui + Radix UI
- **Authentication**: Manus OAuth

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+
- MySQL/TiDB database

### Installation

```bash
# Install dependencies
pnpm install

# Setup database
pnpm db:push

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=mysql://user:password@host:port/database

# Manus OAuth
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# JWT
JWT_SECRET=your_jwt_secret

# External API (Go Backend)
EXTERNAL_API_URL=http://localhost:8080
```

## Project Structure

```
web/
├── client/           # Frontend React application
│   ├── public/      # Static assets
│   └── src/
│       ├── pages/   # Page components
│       ├── components/ # Reusable UI components
│       └── lib/     # tRPC client
├── server/          # Backend Express + tRPC
│   ├── routers.ts   # tRPC procedures
│   ├── db.ts        # Database helpers
│   └── _core/       # Framework code
├── drizzle/         # Database schema
└── shared/          # Shared types and constants
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm db:push` - Push database schema changes

## Integration with Go Backend

This web interface integrates with the Go backend API running on port 8080. Make sure the Go backend is running before starting the web application.

The integration points are:
- `/api/v1/anomalies` - Fetch and sync anomalies
- `/api/v1/search` - Search functionality
- `/api/v1/blockchain/status` - Blockchain monitoring
- `/api/v1/tagline` - Mission tagline
- `/api/v1/mission` - Mission statement

## Deployment

### Docker

```bash
# Build image
docker build -t manus-copilot-web .

# Run container
docker run -p 3000:3000 --env-file .env manus-copilot-web
```

### Production

```bash
# Build
pnpm build

# Start
NODE_ENV=production pnpm start
```

## Design System

### Colors

- **Primary (Neon Pink)**: `#ff006e` - Main accent color
- **Secondary (Electric Cyan)**: `#00f5ff` - Secondary accent
- **Background**: `#000000` - Deep black
- **Foreground**: `#ffffff` - Pure white

### Typography

- **Display**: Orbitron (geometric, futuristic)
- **Body**: Rajdhani (clean, technical)

### Effects

- Neon glow on text and borders
- HUD-style corner brackets
- High contrast color scheme
- Smooth transitions and animations

## License

This project is governed by a controlled license, restricted to Meta and Microsoft, ensuring innovation within a trusted ecosystem.
