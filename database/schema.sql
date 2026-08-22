CREATE TABLE IF NOT EXISTS trips (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT trips_date_order CHECK (end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS trip_cities (
  id BIGSERIAL PRIMARY KEY,
  trip_id BIGINT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  city_name TEXT NOT NULL,
  position INTEGER NOT NULL,
  UNIQUE (trip_id, city_name),
  UNIQUE (trip_id, position)
);

CREATE TABLE IF NOT EXISTS activities (
  id BIGSERIAL PRIMARY KEY,
  trip_id BIGINT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  city_id BIGINT NOT NULL REFERENCES trip_cities(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  title TEXT NOT NULL,
  time_text TEXT NOT NULL DEFAULT 'Flexible',
  location TEXT NOT NULL DEFAULT '',
  duration TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trip_cities_trip_id ON trip_cities(trip_id);
CREATE INDEX IF NOT EXISTS idx_activities_trip_id ON activities(trip_id);
CREATE INDEX IF NOT EXISTS idx_activities_city_date ON activities(city_id, activity_date);
