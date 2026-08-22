-- ============================================================
-- GlobeTrotter — Seed Data
-- Run:  psql -U postgres -d globetrotter -f database/seed.sql
-- ============================================================

-- Passwords below are bcrypt hashes of "password123"
INSERT INTO users (username, email, password_hash) VALUES
  ('alice',   'alice@example.com',   '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz.GjB9RM0RF4rHpzSiGG'),
  ('bob',     'bob@example.com',     '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz.GjB9RM0RF4rHpzSiGG'),
  ('charlie', 'charlie@example.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz.GjB9RM0RF4rHpzSiGG')
ON CONFLICT DO NOTHING;
