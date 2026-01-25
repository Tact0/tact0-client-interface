# Tact0 Client Interface

Modern web interface for interacting with the Tact0 Engine. Built with Next.js and featuring a clean, responsive design with multi-language support.

## Features

- User authentication and session management
- Chat interface for communicating with the Tact0 Engine
- Multi-language support (English, Spanish, German)
- Dark and light theme modes
- Responsive design for desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 20 or higher
- PostgreSQL database
- Tact0 Engine instance

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables by creating a `.env.local` file:

```env
DATABASE_URL=your_database_url
AUTH_JWT_SECRET=your_jwt_secret
ENGINE_URL=your_engine_url
ENGINE_API_KEY=your_engine_api_key
```

3. Set up the database:

```bash
npx prisma generate
npx prisma migrate dev
```

4. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run code linting

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- PostgreSQL with Prisma

## License

Private - All rights reserved
