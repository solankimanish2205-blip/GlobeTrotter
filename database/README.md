# Database

PostgreSQL is the planned relational database for GlobeTrotter.

Prisma is used as the database schema and migration layer.

The initial schema lives in `database/prisma/schema.prisma` and currently contains only the foundational `User` and `Trip` entities. Destinations, activities, itinerary items, expenses, and sharing relationships will be added after the core application requirements are finalized.
