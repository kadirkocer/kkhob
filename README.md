# Hobby Manager v1.0.0

A personal, local-first hobby management app designed for macOS. Manage all your hobbies (Music, Books & Performing Arts & Cinema, Photography, Videography, Skateboarding, Cardistry/Magic, Fashion, Technology) in one place.

## Quick Start

```bash
npm start
```

That's it! The setup script will handle everything automatically.

## Features

- **Local-first**: All data stored in SQLite on your device
- **Multi-hobby support**: Manage different types of content with dynamic schemas
- **Full-text search**: Fast search across all entries with FTS5
- **Media management**: Auto-optimized image uploads and galleries
- **Admin panel**: Complete database visibility and control
- **Version tracking**: Always see what version you're running

## Architecture

- **Backend**: FastAPI + SQLite with WAL mode
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Database**: SQLite with FTS5 for search
- **State**: Zustand + TanStack Query

## Development

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Run tests
npm run test

# Lint code
npm run lint
```

## Manual Setup

If you prefer to set up manually:

1. Backend: `cd apps/api && pip install -r requirements.txt`
2. Frontend: `cd apps/web && npm install`
3. Database: `python scripts/init_db.py`
4. Seed data: `python scripts/seed_data.py`

## Performance

- Setup time: < 30 seconds
- Search response: < 100ms
- Memory usage: < 500MB active
- Optimized for MacBook Air 8GB RAM

## License

Personal use only.# kkhob
