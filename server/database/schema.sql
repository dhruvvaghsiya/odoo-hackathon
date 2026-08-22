-- ============================================================
-- GlobeTrotter — Database Schema
-- Run:  psql -U postgres -d globetrotter -f database/schema.sql
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Trigger function: auto-update updated_at ────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id             UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           VARCHAR(100) NOT NULL,
  email          VARCHAR(255) UNIQUE NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  profile_photo  TEXT,
  language       VARCHAR(10)  NOT NULL DEFAULT 'en',
  role           VARCHAR(20)  NOT NULL DEFAULT 'user',
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_users_role
    CHECK (role IN ('user', 'admin')),

  CONSTRAINT chk_users_email_format
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users (role);

-- Trigger
CREATE OR REPLACE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- 2. CITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS cities (
  id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(150)  NOT NULL,
  country     VARCHAR(100)  NOT NULL,
  region      VARCHAR(100),
  description TEXT,
  image       TEXT,
  cost_index  NUMERIC(5,2),
  popularity  INTEGER       DEFAULT 0,
  latitude    NUMERIC(9,6)  NOT NULL,
  longitude   NUMERIC(9,6)  NOT NULL,

  -- A city name + country pair should be unique
  CONSTRAINT uq_cities_name_country
    UNIQUE (name, country),

  CONSTRAINT chk_cities_latitude
    CHECK (latitude BETWEEN -90 AND 90),

  CONSTRAINT chk_cities_longitude
    CHECK (longitude BETWEEN -180 AND 180),

  CONSTRAINT chk_cities_cost_index
    CHECK (cost_index IS NULL OR cost_index >= 0),

  CONSTRAINT chk_cities_popularity
    CHECK (popularity >= 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cities_country    ON cities (country);
CREATE INDEX IF NOT EXISTS idx_cities_popularity ON cities (popularity DESC);
CREATE INDEX IF NOT EXISTS idx_cities_coords     ON cities (latitude, longitude);


-- ============================================================
-- 3. TRIPS
-- ============================================================
CREATE TABLE IF NOT EXISTS trips (
  id           UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID          NOT NULL
                              REFERENCES users (id) ON DELETE CASCADE,
  name         VARCHAR(200)  NOT NULL,
  description  TEXT,
  cover_photo  TEXT,
  start_date   DATE,
  end_date     DATE,
  total_budget NUMERIC(12,2),
  currency     VARCHAR(3)    NOT NULL DEFAULT 'USD',
  is_public    BOOLEAN       NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_trips_dates
    CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date),

  CONSTRAINT chk_trips_budget
    CHECK (total_budget IS NULL OR total_budget >= 0),

  CONSTRAINT chk_trips_currency_len
    CHECK (char_length(currency) = 3)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trips_user_id    ON trips (user_id);
CREATE INDEX IF NOT EXISTS idx_trips_is_public  ON trips (is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_trips_start_date ON trips (start_date);

-- Trigger
CREATE OR REPLACE TRIGGER trg_trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- 4. TRIP_STOPS
-- ============================================================
CREATE TABLE IF NOT EXISTS trip_stops (
  id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id     UUID          NOT NULL
                             REFERENCES trips (id) ON DELETE CASCADE,
  city_id     UUID          NOT NULL
                             REFERENCES cities (id) ON DELETE RESTRICT,
  start_date  DATE,
  end_date    DATE,
  stop_order  INTEGER       NOT NULL,
  notes       TEXT,

  -- A trip cannot visit the same city at the same position twice
  CONSTRAINT uq_trip_stops_trip_order
    UNIQUE (trip_id, stop_order),

  CONSTRAINT chk_trip_stops_dates
    CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date),

  CONSTRAINT chk_trip_stops_order_positive
    CHECK (stop_order > 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trip_stops_trip_id ON trip_stops (trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_stops_city_id ON trip_stops (city_id);


-- ============================================================
-- 5. ACTIVITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS activities (
  id               UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id          UUID          NOT NULL
                                  REFERENCES cities (id) ON DELETE CASCADE,
  name             VARCHAR(200)  NOT NULL,
  description      TEXT,
  image            TEXT,
  type             VARCHAR(50)   NOT NULL,
  cost             NUMERIC(10,2),
  duration_minutes INTEGER,
  popularity       INTEGER       DEFAULT 0,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- Same activity name should not appear twice for the same city
  CONSTRAINT uq_activities_city_name
    UNIQUE (city_id, name),

  CONSTRAINT chk_activities_type
    CHECK (type IN (
      'sightseeing', 'food', 'adventure', 'culture',
      'nightlife', 'shopping', 'nature', 'wellness',
      'entertainment', 'transport', 'other'
    )),

  CONSTRAINT chk_activities_cost
    CHECK (cost IS NULL OR cost >= 0),

  CONSTRAINT chk_activities_duration
    CHECK (duration_minutes IS NULL OR duration_minutes > 0),

  CONSTRAINT chk_activities_popularity
    CHECK (popularity >= 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activities_city_id    ON activities (city_id);
CREATE INDEX IF NOT EXISTS idx_activities_type       ON activities (type);
CREATE INDEX IF NOT EXISTS idx_activities_popularity ON activities (popularity DESC);

-- Trigger
CREATE OR REPLACE TRIGGER trg_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- 6. TRIP_ACTIVITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS trip_activities (
  id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_stop_id    UUID          NOT NULL
                                 REFERENCES trip_stops (id) ON DELETE CASCADE,
  activity_id     UUID          NOT NULL
                                 REFERENCES activities (id) ON DELETE RESTRICT,
  activity_date   DATE,
  start_time      TIME,
  end_time        TIME,
  activity_order  INTEGER       NOT NULL,
  notes           TEXT,
  estimated_cost  NUMERIC(10,2),

  -- Prevent duplicate ordering within the same trip stop
  CONSTRAINT uq_trip_activities_stop_order
    UNIQUE (trip_stop_id, activity_order),

  CONSTRAINT chk_trip_activities_times
    CHECK (end_time IS NULL OR start_time IS NULL OR end_time > start_time),

  CONSTRAINT chk_trip_activities_order_positive
    CHECK (activity_order > 0),

  CONSTRAINT chk_trip_activities_cost
    CHECK (estimated_cost IS NULL OR estimated_cost >= 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trip_activities_stop_id     ON trip_activities (trip_stop_id);
CREATE INDEX IF NOT EXISTS idx_trip_activities_activity_id ON trip_activities (activity_id);
CREATE INDEX IF NOT EXISTS idx_trip_activities_date        ON trip_activities (activity_date);


-- ============================================================
-- 7. EXPENSES
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id       UUID          NOT NULL
                               REFERENCES trips (id) ON DELETE CASCADE,
  category      VARCHAR(20)   NOT NULL,
  amount        NUMERIC(12,2) NOT NULL,
  currency      VARCHAR(3)    NOT NULL DEFAULT 'USD',
  expense_date  DATE,
  description   TEXT,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_expenses_category
    CHECK (category IN ('TRANSPORT', 'STAY', 'ACTIVITY', 'MEAL', 'OTHER')),

  CONSTRAINT chk_expenses_amount
    CHECK (amount >= 0),

  CONSTRAINT chk_expenses_currency_len
    CHECK (char_length(currency) = 3)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_expenses_trip_id       ON expenses (trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category      ON expenses (category);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date  ON expenses (expense_date);

-- Trigger
CREATE OR REPLACE TRIGGER trg_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

