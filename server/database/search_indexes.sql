-- ============================================================
-- GlobeTrotter — Search Optimization Indexes
-- Run:  psql -U postgres -d globetrotter -f database/search_indexes.sql
-- ============================================================

-- ── pg_trgm extension for fast ILIKE / trigram searches ──────
-- This dramatically improves %pattern% searches used by the
-- unified search endpoint.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ── Cities: trigram indexes for ILIKE search ─────────────────
CREATE INDEX IF NOT EXISTS idx_cities_name_trgm
  ON cities USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_cities_country_trgm
  ON cities USING gin (country gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_cities_region_trgm
  ON cities USING gin (region gin_trgm_ops);

-- ── Activities: trigram indexes for ILIKE search ─────────────
CREATE INDEX IF NOT EXISTS idx_activities_name_trgm
  ON activities USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_activities_description_trgm
  ON activities USING gin (description gin_trgm_ops);

-- ── Activities: composite index for filtered cost queries ────
CREATE INDEX IF NOT EXISTS idx_activities_type_cost
  ON activities (type, cost);

-- ── Activities: composite index for filtered duration queries ─
CREATE INDEX IF NOT EXISTS idx_activities_type_duration
  ON activities (type, duration_minutes);
