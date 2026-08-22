# GlobeTrotter Architecture

## 1. Overview

GlobeTrotter is planned as a full-stack web application for personalized multi-city travel planning.

The application will separate presentation, application/API logic, and persistent relational data so that each layer can evolve independently.

## 2. High-Level Structure

```text
Browser
   │
   ▼
React + TypeScript Client
   │
   │ REST API
   ▼
Node.js + Express + TypeScript Server
   │
   ▼
PostgreSQL Database
```

## 3. Repository Structure

```text
client/
server/
database/
docs/
```

### client/

Responsible for the user interface and client-side application state.

Planned areas:

- Authentication screens
- Dashboard
- Trip management
- Itinerary builder
- City/activity search
- Calendar/timeline
- Budget views
- Sharing
- Profile/settings

### server/

Responsible for API endpoints, authentication, validation, business rules, and database access.

### database/

Responsible for relational schema, migrations, seed data, and database documentation.

### docs/

Architecture, API, setup, decisions, and other project documentation.

## 4. Core Domain Model

Initial entities:

- User
- Trip
- TripStop / Destination
- Activity
- ItineraryItem
- Expense
- TripShare

Relationships will be finalized before implementation of the database layer.

## 5. Design Principles

- Keep frontend and backend responsibilities separate.
- Validate user input at the API boundary.
- Keep secrets out of source control.
- Use relational constraints for important data relationships.
- Prefer reusable UI and server modules over duplicated logic.
- Build features incrementally and keep each commit understandable.

## 6. Initial API Areas

Planned REST resources:

```text
/api/auth
/api/users
/api/trips
/api/trips/:tripId/stops
/api/trips/:tripId/itinerary
/api/trips/:tripId/expenses
/api/cities
/api/activities
/api/shares
```

These endpoints are planning-level definitions and will be refined when the server is implemented.
