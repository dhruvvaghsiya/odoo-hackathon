-- ============================================================
-- 8. TRIP_SHARES — Public itinerary sharing
-- Run:  psql -U postgres -d globetrotter -f database/migration_trip_shares.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS trip_shares (
  id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id       UUID         NOT NULL
                              REFERENCES trips (id) ON DELETE CASCADE,
  public_token  VARCHAR(64)  UNIQUE NOT NULL,
  is_active     BOOLEAN      NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  -- One share record per trip
  CONSTRAINT uq_trip_shares_trip_id
    UNIQUE (trip_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trip_shares_trip_id      ON trip_shares (trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_shares_public_token ON trip_shares (public_token);

-- Trigger
CREATE OR REPLACE TRIGGER trg_trip_shares_updated_at
  BEFORE UPDATE ON trip_shares
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
