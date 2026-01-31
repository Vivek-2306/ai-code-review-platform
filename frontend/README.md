# AI Code Review Platform - Frontend

Next.js frontend application for the AI-Assisted Live Code Review Platform.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
# or
yarn install
```

### Development

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/        # React components
│   ├── lib/               # Utility libraries and API clients
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   ├── styles/            # Global styles and Tailwind config
│   ├── utils/             # Helper functions
│   └── config/            # Configuration files
├── public/                # Static assets
└── package.json
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure your environment variables.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (to be configured)
- **State Management**: React Context / Zustand (to be configured)
