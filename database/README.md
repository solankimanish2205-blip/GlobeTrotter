# GlobeTrotter PostgreSQL setup

PostgreSQL is the relational persistence layer for GlobeTrotter. The executable database schema for the current Phase 2 implementation is `database/schema.sql`.

## 1. Create the database

Create a PostgreSQL database named `globetrotter` using pgAdmin or psql.

With psql:

```sql
CREATE DATABASE globetrotter;
```

## 2. Apply the schema

From the repository root:

```powershell
psql -U postgres -d globetrotter -f database/schema.sql
```

If `psql` is not on PATH, use PostgreSQL's `bin` directory or open `database/schema.sql` in pgAdmin Query Tool and execute it.

## 3. Configure the server

Create `server/.env` from the root `.env.example` values and set your real PostgreSQL password:

```env
PORT=4000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/globetrotter
```

Never commit `server/.env` or database passwords.

## 4. Install and run the API

From the repository root:

```powershell
npm install
npm run dev:server
```

The API runs on `http://localhost:4000`.

Health check:

```text
http://localhost:4000/api/health
```

A successful response includes `"database":"connected"`.

## Persistence model

- `trips` stores the trip itself.
- `trip_cities` stores the ordered route for each trip.
- `activities` stores activities linked to a trip and city/date.

The API currently supports loading, creating, updating, and deleting trips, plus creating and deleting activities.
