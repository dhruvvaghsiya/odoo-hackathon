-- ============================================================
-- GlobeTrotter — Seed Data
-- Run:  psql -U postgres -d globetrotter -f database/seed.sql
-- ============================================================

-- ── Users ──────────────────────────────────────────
-- Passwords below are bcrypt hashes of "password123"
INSERT INTO users (name, email, password_hash, language, role) VALUES
  ('Alice Johnson',   'alice@example.com',   '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz.GjB9RM0RF4rHpzSiGG', 'en', 'user'),
  ('Bob Smith',       'bob@example.com',     '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz.GjB9RM0RF4rHpzSiGG', 'en', 'user'),
  ('Charlie Kumar',   'charlie@example.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz.GjB9RM0RF4rHpzSiGG', 'hi', 'admin')
ON CONFLICT (email) DO NOTHING;


-- ── Cities ─────────────────────────────────────────
INSERT INTO cities (name, country, region, description, image, cost_index, popularity, latitude, longitude) VALUES
  -- Europe
  ('Paris',         'France',      'Île-de-France',    'The City of Light, famed for the Eiffel Tower, world-class cuisine, and rich art history.',                           NULL, 85.50,  95, 48.856613,   2.352222),
  ('Barcelona',     'Spain',       'Catalonia',        'A vibrant Mediterranean city known for Gaudí architecture, beaches, and buzzing nightlife.',                           NULL, 65.20,  88, 41.385063,   2.173404),
  ('Rome',          'Italy',       'Lazio',            'The Eternal City — home to the Colosseum, Vatican City, and centuries of history.',                                     NULL, 70.00,  92, 41.902782,  12.496365),
  ('Amsterdam',     'Netherlands', 'North Holland',    'Canals, cycling culture, and a thriving arts scene define this compact Dutch capital.',                                 NULL, 78.30,  80, 52.367573,   4.904139),
  ('Prague',        'Czech Republic', 'Bohemia',       'A fairy-tale city with a stunning Old Town, Gothic churches, and affordable beer.',                                    NULL, 42.10,  75, 50.075538,  14.437800),

  -- Asia
  ('Tokyo',         'Japan',       'Kantō',            'A dazzling blend of ultra-modern technology and ancient temples in Japan''s sprawling capital.',                        NULL, 82.00,  97, 35.676192, 139.650311),
  ('Bangkok',       'Thailand',    'Central Thailand',  'Street food paradise with ornate temples, floating markets, and electric nightlife.',                                  NULL, 30.50,  90, 13.756331, 100.501762),
  ('Bali',          'Indonesia',   'Bali',             'Tropical island known for terraced rice paddies, surf breaks, yoga retreats, and Hindu temples.',                       NULL, 28.00,  87, -8.340539, 115.091949),
  ('Seoul',         'South Korea', 'Sudogwon',         'K-pop, cutting-edge tech, ancient palaces, and legendary street food in South Korea''s capital.',                       NULL, 60.00,  82, 37.566535, 126.977969),

  -- Americas
  ('New York',      'United States', 'New York',       'The city that never sleeps — iconic skyline, Broadway, Central Park, and world-class museums.',                         NULL, 95.00,  98, 40.712776, -74.005974),
  ('Mexico City',   'Mexico',      'Valley of Mexico',  'A massive metropolis rich with Aztec history, incredible food, and colorful neighborhoods.',                           NULL, 35.00,  78, 19.432608, -99.133209),
  ('Rio de Janeiro','Brazil',      'Southeast',        'Carnival, Copacabana, Christ the Redeemer — Rio pulses with energy and natural beauty.',                                NULL, 45.00,  85, -22.906847, -43.172897),
  ('Buenos Aires',  'Argentina',   'Buenos Aires',     'The Paris of South America — tango, steak, street art, and old-world European charm.',                                 NULL, 38.00,  76, -34.603722, -58.381592),

  -- Africa & Middle East
  ('Cape Town',     'South Africa','Western Cape',     'Table Mountain, vineyards, stunning coastlines, and vibrant culture at Africa''s southern tip.',                        NULL, 40.00,  74, -33.924870,  18.424055),
  ('Marrakech',     'Morocco',     'Marrakech-Safi',   'A sensory overload of spice-scented souks, riads, and the iconic Jemaa el-Fnaa square.',                               NULL, 32.00,  77, 31.629472,  -7.981084),
  ('Dubai',         'UAE',         'Dubai',            'Futuristic skyscrapers, luxury shopping, and desert adventures in the heart of the Gulf.',                              NULL, 88.00,  89, 25.204849,  55.270782),

  -- Oceania
  ('Sydney',        'Australia',   'New South Wales',  'Harbour Bridge, Opera House, golden beaches, and a laid-back lifestyle under the Southern sun.',                        NULL, 80.00,  86, -33.868820, 151.209290),
  ('Queenstown',    'New Zealand', 'Otago',            'The adventure capital of the world — bungee, skiing, and jaw-dropping fjord scenery.',                                  NULL, 68.00,  70, -45.031162, 168.662643)
ON CONFLICT (name, country) DO NOTHING;


-- ── Sample Trips ───────────────────────────────────
-- Uses a subquery to grab user ids rather than hard-coding UUIDs
INSERT INTO trips (user_id, name, description, start_date, end_date, total_budget, currency, is_public) VALUES
  (
    (SELECT id FROM users WHERE email = 'alice@example.com'),
    'Summer in Europe',
    'A three-week backpacking adventure through Western Europe.',
    '2026-06-15', '2026-07-06',
    3500.00, 'EUR', true
  ),
  (
    (SELECT id FROM users WHERE email = 'bob@example.com'),
    'Southeast Asia Explorer',
    'Temple hopping and street food across Thailand and Indonesia.',
    '2026-09-01', '2026-09-21',
    2000.00, 'USD', true
  )
ON CONFLICT DO NOTHING;


-- ── Sample Trip Stops ──────────────────────────────
-- Europe trip stops (Alice)
INSERT INTO trip_stops (trip_id, city_id, start_date, end_date, stop_order, notes) VALUES
  (
    (SELECT id FROM trips WHERE name = 'Summer in Europe' LIMIT 1),
    (SELECT id FROM cities WHERE name = 'Paris' AND country = 'France'),
    '2026-06-15', '2026-06-21', 1,
    'Explore Montmartre, visit the Louvre, and eat croissants every morning.'
  ),
  (
    (SELECT id FROM trips WHERE name = 'Summer in Europe' LIMIT 1),
    (SELECT id FROM cities WHERE name = 'Amsterdam' AND country = 'Netherlands'),
    '2026-06-22', '2026-06-27', 2,
    'Canal tour, Rijksmuseum, and day trip to Zaanse Schans.'
  ),
  (
    (SELECT id FROM trips WHERE name = 'Summer in Europe' LIMIT 1),
    (SELECT id FROM cities WHERE name = 'Prague' AND country = 'Czech Republic'),
    '2026-06-28', '2026-07-06', 3,
    'Old Town walking tour, Charles Bridge sunset, and local craft beer.'
  ),

-- Southeast Asia trip stops (Bob)
  (
    (SELECT id FROM trips WHERE name = 'Southeast Asia Explorer' LIMIT 1),
    (SELECT id FROM cities WHERE name = 'Bangkok' AND country = 'Thailand'),
    '2026-09-01', '2026-09-08', 1,
    'Grand Palace, Chatuchak Weekend Market, and all the pad thai.'
  ),
  (
    (SELECT id FROM trips WHERE name = 'Southeast Asia Explorer' LIMIT 1),
    (SELECT id FROM cities WHERE name = 'Bali' AND country = 'Indonesia'),
    '2026-09-09', '2026-09-21', 2,
    'Ubud rice terraces, Uluwatu temple, and surfing in Canggu.'
  )
ON CONFLICT DO NOTHING;
