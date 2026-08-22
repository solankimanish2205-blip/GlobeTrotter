import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { checkDatabase, pool } from './db.js';

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

app.get('/api/trips', async (_req, res) => {
  try {
    const trips = await pool.query(`
      SELECT t.id, t.title, t.start_date, t.end_date, t.status,
             COALESCE(json_agg(json_build_object('id', c.id, 'name', c.city_name, 'position', c.position)
             ORDER BY c.position) FILTER (WHERE c.id IS NOT NULL), '[]') AS cities
      FROM trips t
      LEFT JOIN trip_cities c ON c.trip_id = t.id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);

    const activities = await pool.query(`
      SELECT a.id, a.trip_id, a.city_id, a.activity_date, a.title,
             a.time_text, a.location, a.duration, a.notes
      FROM activities a
      ORDER BY a.activity_date, a.created_at
    `);

    const activityByTrip = new Map<number, any[]>();
    for (const activity of activities.rows) {
      const list = activityByTrip.get(Number(activity.trip_id)) ?? [];
      list.push(activity);
      activityByTrip.set(Number(activity.trip_id), list);
    }

    res.json(trips.rows.map((trip) => ({
      ...trip,
      id: Number(trip.id),
      cities: trip.cities.map((city: any) => ({ ...city, id: Number(city.id) })),
      activities: activityByTrip.get(Number(trip.id)) ?? [],
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to load trips' });
  }
});

app.post('/api/trips', async (req, res) => {
  const { title, cities, startDate, endDate, status = 'Draft' } = req.body ?? {};
  if (!title || !Array.isArray(cities) || cities.length === 0 || !startDate || !endDate || startDate > endDate) {
    return res.status(400).json({ error: 'title, cities, startDate and endDate are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const tripResult = await client.query(
      'INSERT INTO trips (title, start_date, end_date, status) VALUES ($1, $2, $3, $4) RETURNING id, title, start_date, end_date, status',
      [title.trim(), startDate, endDate, status]
    );
    const trip = tripResult.rows[0];

    for (const [position, city] of cities.map((c: unknown) => String(c).trim()).filter(Boolean).entries()) {
      await client.query(
        'INSERT INTO trip_cities (trip_id, city_name, position) VALUES ($1, $2, $3)',
        [trip.id, city, position]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ ...trip, id: Number(trip.id) });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Unable to create trip' });
  } finally {
    client.release();
  }
});

app.put('/api/trips/:id', async (req, res) => {
  const tripId = Number(req.params.id);
  const { title, cities, startDate, endDate, status } = req.body ?? {};
  if (!Number.isInteger(tripId) || !title || !Array.isArray(cities) || !cities.length || !startDate || !endDate || startDate > endDate) {
    return res.status(400).json({ error: 'Invalid trip data' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const updated = await client.query(
      'UPDATE trips SET title=$1, start_date=$2, end_date=$3, status=COALESCE($4,status), updated_at=NOW() WHERE id=$5 RETURNING id, title, start_date, end_date, status',
      [title.trim(), startDate, endDate, status ?? null, tripId]
    );
    if (!updated.rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Trip not found' });
    }

    const normalizedCities = cities.map((c: unknown) => String(c).trim()).filter(Boolean);
    const existing = await client.query('SELECT id, city_name FROM trip_cities WHERE trip_id=$1', [tripId]);
    const existingByName = new Map(existing.rows.map((row) => [row.city_name, row.id]));
    const keep = new Set<string>();

    for (const [position, city] of normalizedCities.entries()) {
      keep.add(city);
      const existingId = existingByName.get(city);
      if (existingId) {
        await client.query('UPDATE trip_cities SET position=$1 WHERE id=$2', [position, existingId]);
      } else {
        await client.query('INSERT INTO trip_cities (trip_id, city_name, position) VALUES ($1, $2, $3)', [tripId, city, position]);
      }
    }

    for (const row of existing.rows) {
      if (!keep.has(row.city_name)) {
        await client.query('DELETE FROM trip_cities WHERE id=$1', [row.id]);
      }
    }

    await client.query('COMMIT');
    res.json({ ...updated.rows[0], id: Number(updated.rows[0].id), cities: normalizedCities });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Unable to update trip' });
  } finally {
    client.release();
  }
});

app.delete('/api/trips/:id', async (req, res) => {
  const tripId = Number(req.params.id);
  if (!Number.isInteger(tripId)) return res.status(400).json({ error: 'Invalid trip id' });
  try {
    const result = await pool.query('DELETE FROM trips WHERE id=$1 RETURNING id', [tripId]);
    if (!result.rowCount) return res.status(404).json({ error: 'Trip not found' });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to delete trip' });
  }
});

app.post('/api/trips/:id/activities', async (req, res) => {
  const tripId = Number(req.params.id);
  const { cityId, activityDate, title, time = 'Flexible', location = '', duration = '', notes = '' } = req.body ?? {};
  if (!Number.isInteger(tripId) || !cityId || !activityDate || !title) {
    return res.status(400).json({ error: 'cityId, activityDate and title are required' });
  }

  try {
    const city = await pool.query('SELECT id FROM trip_cities WHERE id=$1 AND trip_id=$2', [cityId, tripId]);
    if (!city.rowCount) return res.status(404).json({ error: 'City not found for this trip' });
    const result = await pool.query(
      `INSERT INTO activities (trip_id, city_id, activity_date, title, time_text, location, duration, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id, trip_id, city_id, activity_date, title, time_text, location, duration, notes`,
      [tripId, cityId, activityDate, String(title).trim(), time, location, duration, notes]
    );
    res.status(201).json({ ...result.rows[0], id: Number(result.rows[0].id) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to create activity' });
  }
});

app.delete('/api/activities/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid activity id' });
  try {
    const result = await pool.query('DELETE FROM activities WHERE id=$1 RETURNING id', [id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Activity not found' });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to delete activity' });
  }
});

app.listen(port, () => {
  console.log(`GlobeTrotter API listening on port ${port}`);
});
