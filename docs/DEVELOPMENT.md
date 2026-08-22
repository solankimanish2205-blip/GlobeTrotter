# Development Guide

## Prerequisites

Install:

- Node.js (LTS)
- npm
- PostgreSQL
- Git

## Local Setup

The application is currently in the foundation stage. Client and server setup will be added as the corresponding applications are created.

Expected workflow:

```bash
git clone https://github.com/solankimanish2205-blip/GlobeTrotter.git
cd GlobeTrotter
```

## Environment Variables

Never commit real credentials or secrets.

A root `.env.example` will be added when the application configuration is established. It will document required variables without containing secret values.

## Git Workflow

Use small, focused commits. Recommended commit prefixes:

- `feat:` new functionality
- `fix:` bug fix
- `docs:` documentation
- `refactor:` code restructuring
- `test:` tests
- `chore:` tooling/configuration

## Development Sequence

1. Establish frontend and backend applications.
2. Configure TypeScript and linting.
3. Design and migrate the PostgreSQL schema.
4. Implement authentication.
5. Implement trip and itinerary APIs.
6. Build the main planning UI.
7. Add budget, calendar, and sharing features.
8. Test and prepare deployment.
