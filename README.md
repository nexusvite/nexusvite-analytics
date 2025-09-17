# NexusVite Analytics Dashboard

Analytics Dashboard App for NexusVite Platform - A standalone analytics application that integrates with the NexusVite distributed apps ecosystem.

## Features

- Real-time analytics dashboard with KPI tracking
- Revenue and user activity charts
- OAuth 2.0 integration with NexusVite Platform
- Interactive data visualizations using Recharts
- Responsive design with Tailwind CSS
- Export functionality for reports

## Tech Stack

- Next.js 15.5.3
- TypeScript
- Tailwind CSS 4.x
- Shadcn/UI components
- Recharts for data visualization
- OAuth 2.0 client for platform integration

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm package manager
- Access to NexusVite Platform

### Installation

1. Clone the repository:
```bash
git clone https://github.com/nexusvite/nexusvite-analytics.git
cd nexusvite-analytics
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Configure the following variables:
- `NEXUSVITE_CLIENT_ID`: Your OAuth client ID from NexusVite Platform
- `NEXUSVITE_CLIENT_SECRET`: Your OAuth client secret
- `NEXUSVITE_PLATFORM_URL`: URL of the NexusVite Platform (default: http://localhost:3000)
- `NEXUSVITE_REDIRECT_URI`: OAuth callback URL (default: http://localhost:3001/api/auth/callback)

4. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) to see the analytics dashboard.

## NexusVite Platform Integration

This app integrates with the NexusVite Platform using:
- OAuth 2.0 for authentication
- App manifest for discovery and configuration
- Webhook support for real-time events
- API access to platform data

### App Manifest

The `nexusvite.manifest.json` file defines:
- App metadata and pricing
- Required OAuth scopes
- Webhook events
- API permissions

## Development

The main dashboard is in `app/page.tsx`. You can modify the analytics components and add new charts as needed.

### Project Structure

```
├── app/              # Next.js app directory
├── components/       # UI components
├── lib/             # Utilities and OAuth client
├── public/          # Static assets
└── nexusvite.manifest.json  # App manifest
```

## Deployment

This app can be deployed independently on any platform that supports Next.js:

- Vercel (recommended)
- Netlify
- Docker
- Self-hosted

## License

MIT
