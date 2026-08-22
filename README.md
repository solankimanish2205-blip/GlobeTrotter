# GlobeTrotter

A personalized travel planning platform for creating, organizing, and sharing multi-city trips.

## Project Goal

GlobeTrotter helps users plan multi-city journeys by creating itineraries, organizing destinations and activities, managing travel dates, estimating costs, visualizing trips, and sharing itineraries.

## Planned Features

- User authentication and profiles
- Create and manage multi-city trips
- City and destination search
- Activity discovery and selection
- Day-by-day itinerary builder
- Calendar/timeline itinerary view
- Budget and expense tracking
- Trip cost breakdown
- Public itinerary sharing
- Responsive web interface
- Optional admin dashboard

## Architecture

```text
GlobeTrotter/
├── client/          # React + TypeScript frontend
├── server/          # Node.js + Express + TypeScript API
├── database/        # PostgreSQL + Prisma schema
├── docs/            # Architecture and development documentation
├── .env.example     # Environment variable template
├── .gitignore
└── package.json     # npm workspace configuration
```

## Technology Stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL
- ORM: Prisma
- API: REST
- Authentication: Planned JWT + bcrypt implementation

## Development Roadmap

### Phase 1 — Foundation

- [x] Create GitHub repository
- [x] Establish project structure
- [x] Configure frontend
- [x] Configure backend
- [x] Add initial relational database schema
- [x] Add environment configuration
- [x] Add development documentation

### Phase 2 — Core Application

- [ ] Authentication
- [ ] User profile
- [ ] Trip creation
- [ ] Trip management
- [ ] City/activity data
- [ ] Itinerary builder

### Phase 3 — Planning Experience

- [ ] Calendar/timeline view
- [ ] Budget calculations
- [ ] Cost breakdown
- [ ] Trip visualization
- [ ] Sharing

### Phase 4 — Polish

- [ ] Responsive UI
- [ ] Validation and error handling
- [ ] Accessibility improvements
- [ ] Testing
- [ ] Deployment configuration
- [ ] Final documentation

## Getting Started

Clone the repository and install dependencies:

```bash
git clone https://github.com/solankimanish2205-blip/GlobeTrotter.git
cd GlobeTrotter
npm install
```

Client development:

```bash
npm run dev:client
```

API development:

```bash
npm run dev:server
```

Create a local `.env` from `.env.example` before connecting PostgreSQL.

## Status

**Phase 1 — Foundation scaffolded.**
