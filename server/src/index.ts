import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { checkDatabase, pool } from './db.js';

dotenv.config({ path: '../.env' });
dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    const db = await checkDatabase();
    res.json({ status: 'ok', service: 'globetrotter-server', database: 'connected', time: db.now });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(503).json({ status: 'error', service: 'globetrotter-server', database: 'disconnected' });
  }
});

async function getOrCreateDemoUser() {
  const existing = await pool.query('SELECT id, email, name FROM "User" ORDER BY "createdAt" LIMIT 1');
  if (existing.rowCount) return existing.rows[0];
  const created = await pool.query(
    'INSERT INTO "User" (id, email, name, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, NOW(), NOW()) RETURNING id, email, name',
    ['demo@globetrotter.local', 'GlobeTrotter Demo']
  );
  return created.rows[0];
}

app.get('/api/trips', async (_req, res) => {
  try {
    const trips = await pool.query(`
      SELECT t.id, t.title, t.description, t."startDate", t."endDate", t."createdAt", t."updatedAt",
             COALESCE(json_agg(
               json_build_object('id', c.id, 'name', c.name, 'sortOrder', c."sortOrder")
               ORDER BY c."sortOrder"
             ) FILTER (WHERE c.id IS NOT NULL), '[]') AS cities
      FROM "Trip" t
      LEFT JOIN "TripCity" c ON c."tripId" = t.id
      GROUP BY t.id
      ORDER BY t."createdAt" DESC
    `);

    const activities = await pool.query(`
      SELECT id, title, time, location, duration, notes, date, "tripId", "cityId", "createdAt", "updatedAt"
      FROM "Activity"
      ORDER BY date NULLS LAST, "createdAt"
    `);

    const activityByTrip = new Map<string, any[]>();
    for (const activity of activities.rows) {
      const list = activityByTrip.get(activity.tripId) ?? [];
      list.push(activity);
      activityByTrip.set(activity.tripId, list);
    }

    res.json(trips.rows.map((trip) => ({
      ...trip,
      cities: trip.cities,
      activities: activityByTrip.get(trip.id) ?? [],
    })));
  } catch (error) {
    console.error('Unable to load trips:', error);
    res.status(500).json({ error: 'Unable to load trips' });
  }
});

app.post('/api/trips', async (req, res) => {
  const { title, description = '', cities, startDate, endDate } = req.body ?? {};
  if (!title || !Array.isArray(cities) || cities.length === 0 || !startDate || !endDate || startDate > endDate) {
    return res.status(400).json({ error: 'title, cities, startDate and endDate are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const user = await getOrCreateDemoUser();
    const tripId = crypto.randomUUID();
    const tripResult = await client.query(
      'INSERT INTO "Trip" (id, title, description, "startDate", "endDate", "createdAt", "updatedAt", "userId") VALUES ($1,$2,$3,$4,$5,NOW(),NOW(),$6) RETURNING id, title, description, "startDate", "endDate"',
      [tripId, title.trim(), description, startDate, endDate, user.id]
    );

    for (const [sortOrder, city] of cities.map((c: unknown) => String(c).trim()).filter(Boolean).entries()) {
      await client.query(
        'INSERT INTO "TripCity" (id, name, "sortOrder", "tripId", "createdAt") VALUES ($1,$2,$3,$4,NOW())',
        [crypto.randomUUID(), city, sortOrder, tripId]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(tripResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Unable to create trip:', error);
    res.status(500).json({ error: 'Unable to create trip' });
  } finally {
    client.release();
  }
});

app.put('/api/trips/:id', async (req, res) => {
  const tripId = req.params.id;
  const { title, description = '', cities, startDate, endDate } = req.body ?? {};
  if (!tripId || !title || !Array.isArray(cities) || !cities.length || !startDate || !endDate || startDate > endDate) {
    return res.status(400).json({ error: 'Invalid trip data' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const updated = await client.query(
      'UPDATE "Trip" SET title=$1, description=$2, "startDate"=$3, "endDate"=$4, "updatedAt"=NOW() WHERE id=$5 RETURNING id, title, description, "startDate", "endDate"',
      [title.trim(), description, startDate, endDate, tripId]
    );
    if (!updated.rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Trip not found' });
    }

    await client.query('DELETE FROM "TripCity" WHERE "tripId"=$1', [tripId]);
    for (const [sortOrder, city] of cities.map((c: unknown) => String(c).trim()).filter(Boolean).entries()) {
      await client.query(
        'INSERT INTO "TripCity" (id, name, "sortOrder", "tripId", "createdAt") VALUES ($1,$2,$3,$4,NOW())',
        [crypto.randomUUID(), city, sortOrder, tripId]
      );
    }

    await client.query('COMMIT');
    res.json(updated.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Unable to update trip:', error);
    res.status(500).json({ error: 'Unable to update trip' });
  } finally {
    client.release();
  }
});

app.delete('/api/trips/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM "Trip" WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Trip not found' });
    res.status(204).send();
  } catch (error) {
    console.error('Unable to delete trip:', error);
    res.status(500).json({ error: 'Unable to delete trip' });
  }
});

app.post('/api/trips/:id/activities', async (req, res) => {
  const tripId = req.params.id;
  const { cityId, activityDate, title, time = 'Flexible', location = '', duration = '', notes = '' } = req.body ?? {};
  if (!tripId || !cityId || !activityDate || !title) {
    return res.status(400).json({ error: 'cityId, activityDate and title are required' });
  }

  try {
    const city = await pool.query('SELECT id FROM "TripCity" WHERE id=$1 AND "tripId"=$2', [cityId, tripId]);
    if (!city.rowCount) return res.status(404).json({ error: 'City not found for this trip' });
    const result = await pool.query(
      `INSERT INTO "Activity" (id, title, time, location, duration, notes, date, "tripId", "cityId", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW())
       RETURNING id, title, time, location, duration, notes, date, "tripId", "cityId"`,
      [crypto.randomUUID(), String(title).trim(), time, location, duration, notes, activityDate, tripId, cityId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Unable to create activity:', error);
    res.status(500).json({ error: 'Unable to create activity' });
  }
});

app.delete('/api/activities/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM "Activity" WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Activity not found' });
    res.status(204).send();
  } catch (error) {
    console.error('Unable to delete activity:', error);
    res.status(500).json({ error: 'Unable to delete activity' });
  }
});

app.listen(port, () => {
  console.log(`GlobeTrotter API listening on port ${port}`);
});
