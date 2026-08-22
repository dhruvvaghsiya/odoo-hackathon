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
  ('Lisbon',        'Portugal',    'Lisbon District',  'Hilly streets, pastel buildings, and pastel de nata in Europe''s westernmost capital.',                                 NULL, 48.00,  79, 38.722252,  -9.139337),
  ('Berlin',        'Germany',     'Berlin',           'A creative powerhouse with a turbulent history, vibrant nightlife, and world-class museums.',                           NULL, 55.00,  83, 52.520007,  13.404954),
  ('Vienna',        'Austria',     'Vienna',           'Imperial palaces, classical music, and Viennese coffee houses in a stately European capital.',                          NULL, 72.00,  78, 48.208174,  16.373819),

  -- Asia
  ('Tokyo',         'Japan',       'Kantō',            'A dazzling blend of ultra-modern technology and ancient temples in Japan''s sprawling capital.',                        NULL, 82.00,  97, 35.676192, 139.650311),
  ('Bangkok',       'Thailand',    'Central Thailand',  'Street food paradise with ornate temples, floating markets, and electric nightlife.',                                  NULL, 30.50,  90, 13.756331, 100.501762),
  ('Bali',          'Indonesia',   'Bali',             'Tropical island known for terraced rice paddies, surf breaks, yoga retreats, and Hindu temples.',                       NULL, 28.00,  87, -8.340539, 115.091949),
  ('Seoul',         'South Korea', 'Sudogwon',         'K-pop, cutting-edge tech, ancient palaces, and legendary street food in South Korea''s capital.',                       NULL, 60.00,  82, 37.566535, 126.977969),
  ('Hanoi',         'Vietnam',     'Red River Delta',  'A chaotic charm of motorbikes, pho kitchens, French colonial architecture, and ancient temples.',                       NULL, 22.00,  72, 21.028511, 105.804817),
  ('Kyoto',         'Japan',       'Kansai',           'Zen gardens, bamboo groves, geisha culture, and over 2,000 temples and shrines.',                                      NULL, 75.00,  84, 35.011636, 135.768029),

  -- Americas
  ('New York',      'United States', 'New York',       'The city that never sleeps — iconic skyline, Broadway, Central Park, and world-class museums.',                         NULL, 95.00,  98, 40.712776, -74.005974),
  ('Mexico City',   'Mexico',      'Valley of Mexico',  'A massive metropolis rich with Aztec history, incredible food, and colorful neighborhoods.',                           NULL, 35.00,  78, 19.432608, -99.133209),
  ('Rio de Janeiro','Brazil',      'Southeast',        'Carnival, Copacabana, Christ the Redeemer — Rio pulses with energy and natural beauty.',                                NULL, 45.00,  85, -22.906847, -43.172897),
  ('Buenos Aires',  'Argentina',   'Buenos Aires',     'The Paris of South America — tango, steak, street art, and old-world European charm.',                                 NULL, 38.00,  76, -34.603722, -58.381592),
  ('Lima',          'Peru',        'Lima',             'A gastronomic capital where ancient Incan heritage meets colonial architecture and Pacific coastline.',                 NULL, 33.00,  71, -12.046374, -77.042793),

  -- Africa & Middle East
  ('Cape Town',     'South Africa','Western Cape',     'Table Mountain, vineyards, stunning coastlines, and vibrant culture at Africa''s southern tip.',                        NULL, 40.00,  74, -33.924870,  18.424055),
  ('Marrakech',     'Morocco',     'Marrakech-Safi',   'A sensory overload of spice-scented souks, riads, and the iconic Jemaa el-Fnaa square.',                               NULL, 32.00,  77, 31.629472,  -7.981084),
  ('Dubai',         'UAE',         'Dubai',            'Futuristic skyscrapers, luxury shopping, and desert adventures in the heart of the Gulf.',                              NULL, 88.00,  89, 25.204849,  55.270782),
  ('Istanbul',      'Turkey',      'Marmara',          'A transcontinental city straddling Europe and Asia — bazaars, mosques, and the Bosphorus.',                             NULL, 38.00,  81, 41.008238,  28.978359),

  -- Oceania
  ('Sydney',        'Australia',   'New South Wales',  'Harbour Bridge, Opera House, golden beaches, and a laid-back lifestyle under the Southern sun.',                        NULL, 80.00,  86, -33.868820, 151.209290),
  ('Queenstown',    'New Zealand', 'Otago',            'The adventure capital of the world — bungee, skiing, and jaw-dropping fjord scenery.',                                  NULL, 68.00,  70, -45.031162, 168.662643)
ON CONFLICT (name, country) DO NOTHING;


-- ── Trips ──────────────────────────────────────────
-- Alice: 3 trips
INSERT INTO trips (user_id, name, description, start_date, end_date, total_budget, currency, is_public) VALUES
  (
    (SELECT id FROM users WHERE email = 'alice@example.com'),
    'Summer in Europe',
    'A three-week backpacking adventure through Western Europe.',
    '2026-06-15', '2026-07-06',
    3500.00, 'EUR', true
  ),
  (
    (SELECT id FROM users WHERE email = 'alice@example.com'),
    'Japan Culture Deep Dive',
    'Two weeks exploring traditional and modern Japan.',
    '2026-10-01', '2026-10-14',
    4200.00, 'JPY', false
  ),
  (
    (SELECT id FROM users WHERE email = 'alice@example.com'),
    'South America Highlights',
    'A month-long journey through the best of South America.',
    '2027-01-10', '2027-02-10',
    5000.00, 'USD', true
  ),

-- Bob: 2 trips
  (
    (SELECT id FROM users WHERE email = 'bob@example.com'),
    'Southeast Asia Explorer',
    'Temple hopping and street food across Thailand and Indonesia.',
    '2026-09-01', '2026-09-21',
    2000.00, 'USD', true
  ),
  (
    (SELECT id FROM users WHERE email = 'bob@example.com'),
    'Mediterranean Escape',
    'Sun, sea, and history along the Mediterranean coast.',
    '2026-07-10', '2026-07-28',
    2800.00, 'EUR', false
  ),

-- Charlie: 1 trip
  (
    (SELECT id FROM users WHERE email = 'charlie@example.com'),
    'Middle East & Turkey',
    'Explore the crossroads of civilizations from Dubai to Istanbul.',
    '2026-11-05', '2026-11-20',
    3200.00, 'USD', true
  )
ON CONFLICT DO NOTHING;


-- ── Trip Stops ─────────────────────────────────────

-- Alice: Summer in Europe (3 stops)
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

-- Alice: Japan Culture Deep Dive (3 stops)
  (
    (SELECT id FROM trips WHERE name = 'Japan Culture Deep Dive' LIMIT 1),
    (SELECT id FROM cities WHERE name = 'Tokyo' AND country = 'Japan'),
    '2026-10-01', '2026-10-05', 1,
    'Shibuya, Tsukiji Outer Market, Akihabara, and TeamLab Borderless.'
  ),
  (
    (SELECT id FROM trips WHERE name = 'Japan Culture Deep Dive' LIMIT 1),
    (SELECT id FROM cities WHERE name = 'Kyoto' AND country = 'Japan'),
    '2026-10-06', '2026-10-10', 2,
    'Fushimi Inari, Arashiyama bamboo grove, and tea ceremony experience.'
  ),
  (
    (SELECT id FROM trips WHERE name = 'Japan Culture Deep Dive' LIMIT 1),
    (SELECT id FROM cities WHERE name = 'Tokyo' AND country = 'Japan'),
    '2026-10-11', '2026-10-14', 3,
    'Return to Tokyo for Harajuku shopping and day trip to Kamakura.'
  ),

-- Alice: South America Highlights (4 stops)
  (
    (SELECT id FROM trips WHERE name = 'South America Highlights' LIMIT 1),
    (SELECT id FROM cities WHERE name = 'Lima' AND country = 'Peru'),
    '2027-01-10', '2027-01-16', 1,
    'Ceviche tour in Miraflores and exploring Barranco street art.'
  ),
  (
    (SELECT id FROM trips WHERE name = 'South America Highlights' LIMIT 1),
    (SELECT id FROM cities WHERE name = 'Rio de Janeiro' AND country = 'Brazil'),
    '2027-01-17', '2027-01-24', 2,
    'Christ the Redeemer, Sugarloaf Mountain, and Ipanema beach.'
  ),
  (
    (SELECT id FROM trips WHERE name = 'South America Highlights' LIMIT 1),
    (SELECT id FROM cities WHERE name = 'Buenos Aires' AND country = 'Argentina'),
    '2027-01-25', '2027-02-03', 3,
    'Tango shows in San Telmo, steak at a parrilla, and La Boca murals.'
  ),
  (
    (SELECT id FROM trips WHERE name = 'South America Highlights' LIMIT 1),
    (SELECT id FROM cities WHERE name = 'Mexico City' AND country = 'Mexico'),
    '2027-02-04', '2027-02-10', 4,
    'Teotihuacan pyramids, UNAM campus, and tacos al pastor crawl.'
  ),

-- Bob: Southeast Asia Explorer (3 stops)
  (
    (SELECT id FROM trips WHERE name = 'Southeast Asia Explorer' LIMIT 1),
    (SELECT id FROM cities WHERE name = 'Bangkok' AND country = 'Thailand'),
    '2026-09-01', '2026-09-07', 1,
    'Grand Palace, Chatuchak Weekend Market, and all the pad thai.'
  ),
  (
    (SELECT id FROM trips WHERE name = 'Southeast Asia Explorer' LIMIT 1),
    (SELECT id FROM cities WHERE name = 'Hanoi' AND country = 'Vietnam'),
    '2026-09-08', '2026-09-13', 2,
    'Old Quarter walking tour, Hoan Kiem Lake, and egg coffee.'
  ),
  (
    (SELECT id FROM trips WHERE name = 'Southeast Asia Explorer' LIMIT 1),
    (SELECT id FROM cities WHERE name = 'Bali' AND country = 'Indonesia'),
    '2026-09-14', '2026-09-21', 3,
    'Ubud rice terraces, Uluwatu temple, and surfing in Canggu.'
  ),

-- Bob: Mediterranean Escape (3 stops)
  (
    (SELECT id FROM trips WHERE name = 'Mediterranean Escape' LIMIT 1),
    (SELECT id FROM cities WHERE name = 'Barcelona' AND country = 'Spain'),
    '2026-07-10', '2026-07-15', 1,
    'Sagrada Familia, Park Güell, and beach day at Barceloneta.'
  ),
  (
    (SELECT id FROM trips WHERE name = 'Mediterranean Escape' LIMIT 1),
    (SELECT id FROM cities WHERE name = 'Rome' AND country = 'Italy'),
    '2026-07-16', '2026-07-21', 2,
    'Colosseum, Roman Forum, Trastevere food tour, and gelato quest.'
  ),
  (
    (SELECT id FROM trips WHERE name = 'Mediterranean Escape' LIMIT 1),
    (SELECT id FROM cities WHERE name = 'Lisbon' AND country = 'Portugal'),
    '2026-07-22', '2026-07-28', 3,
    'Tram 28, Belém Tower, Time Out Market, and Sintra day trip.'
  ),

-- Charlie: Middle East & Turkey (3 stops)
  (
    (SELECT id FROM trips WHERE name = 'Middle East & Turkey' LIMIT 1),
    (SELECT id FROM cities WHERE name = 'Dubai' AND country = 'UAE'),
    '2026-11-05', '2026-11-10', 1,
    'Burj Khalifa, desert safari, and Dubai Marina night walk.'
  ),
  (
    (SELECT id FROM trips WHERE name = 'Middle East & Turkey' LIMIT 1),
    (SELECT id FROM cities WHERE name = 'Marrakech' AND country = 'Morocco'),
    '2026-11-11', '2026-11-14', 2,
    'Jemaa el-Fnaa, Majorelle Garden, and a hammam experience.'
  ),
  (
    (SELECT id FROM trips WHERE name = 'Middle East & Turkey' LIMIT 1),
    (SELECT id FROM cities WHERE name = 'Istanbul' AND country = 'Turkey'),
    '2026-11-15', '2026-11-20', 3,
    'Hagia Sophia, Grand Bazaar, Bosphorus cruise, and baklava overload.'
  )
ON CONFLICT DO NOTHING;


-- ============================================================
-- ACTIVITIES
-- ============================================================
-- Activities seeded for cities that appear in trip stops, plus extras

-- ── Paris ──────────────────────────────────────────
INSERT INTO activities (city_id, name, description, image, type, cost, duration_minutes, popularity) VALUES
  ((SELECT id FROM cities WHERE name = 'Paris' AND country = 'France'),
   'Louvre Museum Visit', 'Explore the world''s largest art museum, home to the Mona Lisa and Venus de Milo.', NULL, 'culture', 17.00, 180, 98),
  ((SELECT id FROM cities WHERE name = 'Paris' AND country = 'France'),
   'Eiffel Tower Summit', 'Ride the elevator to the top of the iconic iron lattice tower for panoramic views.', NULL, 'sightseeing', 26.80, 120, 99),
  ((SELECT id FROM cities WHERE name = 'Paris' AND country = 'France'),
   'Montmartre Walking Tour', 'Wander the cobblestone streets of the artist quarter, ending at Sacré-Cœur.', NULL, 'sightseeing', 15.00, 150, 85),
  ((SELECT id FROM cities WHERE name = 'Paris' AND country = 'France'),
   'Seine River Cruise', 'A one-hour evening cruise past illuminated landmarks along the Seine.', NULL, 'entertainment', 15.00, 60, 90),
  ((SELECT id FROM cities WHERE name = 'Paris' AND country = 'France'),
   'French Pastry Workshop', 'Learn to make croissants and éclairs from a Parisian pâtissier.', NULL, 'food', 85.00, 180, 72)
ON CONFLICT (city_id, name) DO NOTHING;

-- ── Amsterdam ──────────────────────────────────────
INSERT INTO activities (city_id, name, description, image, type, cost, duration_minutes, popularity) VALUES
  ((SELECT id FROM cities WHERE name = 'Amsterdam' AND country = 'Netherlands'),
   'Rijksmuseum Tour', 'Admire Rembrandt''s Night Watch and 8,000 works of Dutch Golden Age art.', NULL, 'culture', 22.50, 180, 92),
  ((SELECT id FROM cities WHERE name = 'Amsterdam' AND country = 'Netherlands'),
   'Canal Boat Tour', 'Glide through UNESCO-listed canal rings on a guided glass-top boat.', NULL, 'sightseeing', 18.00, 75, 94),
  ((SELECT id FROM cities WHERE name = 'Amsterdam' AND country = 'Netherlands'),
   'Anne Frank House', 'Visit the secret annex where Anne Frank wrote her famous diary.', NULL, 'culture', 16.00, 90, 91),
  ((SELECT id FROM cities WHERE name = 'Amsterdam' AND country = 'Netherlands'),
   'Vondelpark Cycling', 'Rent a bike and explore Amsterdam''s beloved urban park like a local.', NULL, 'nature', 12.00, 120, 78)
ON CONFLICT (city_id, name) DO NOTHING;

-- ── Prague ─────────────────────────────────────────
INSERT INTO activities (city_id, name, description, image, type, cost, duration_minutes, popularity) VALUES
  ((SELECT id FROM cities WHERE name = 'Prague' AND country = 'Czech Republic'),
   'Prague Castle Complex', 'Tour the largest ancient castle in the world, including St. Vitus Cathedral.', NULL, 'sightseeing', 14.00, 180, 93),
  ((SELECT id FROM cities WHERE name = 'Prague' AND country = 'Czech Republic'),
   'Charles Bridge Sunset Walk', 'Stroll across the 14th-century Gothic bridge at golden hour.', NULL, 'sightseeing', 0.00, 60, 88),
  ((SELECT id FROM cities WHERE name = 'Prague' AND country = 'Czech Republic'),
   'Czech Beer Tasting', 'Sample Pilsner Urquell, Staropramen, and local microbrews at a historic pub.', NULL, 'food', 25.00, 120, 82),
  ((SELECT id FROM cities WHERE name = 'Prague' AND country = 'Czech Republic'),
   'Old Town Square Astronomical Clock', 'Watch the hourly procession of the 600-year-old astronomical clock.', NULL, 'culture', 0.00, 30, 86)
ON CONFLICT (city_id, name) DO NOTHING;

-- ── Tokyo ──────────────────────────────────────────
INSERT INTO activities (city_id, name, description, image, type, cost, duration_minutes, popularity) VALUES
  ((SELECT id FROM cities WHERE name = 'Tokyo' AND country = 'Japan'),
   'Senso-ji Temple Visit', 'Tokyo''s oldest temple in Asakusa, with the iconic Kaminarimon gate.', NULL, 'culture', 0.00, 90, 95),
  ((SELECT id FROM cities WHERE name = 'Tokyo' AND country = 'Japan'),
   'Tsukiji Outer Market Food Tour', 'Taste fresh sushi, tamagoyaki, and matcha across dozens of street stalls.', NULL, 'food', 45.00, 150, 93),
  ((SELECT id FROM cities WHERE name = 'Tokyo' AND country = 'Japan'),
   'TeamLab Borderless', 'Immerse yourself in a digital art museum of interactive, flowing projections.', NULL, 'entertainment', 32.00, 120, 89),
  ((SELECT id FROM cities WHERE name = 'Tokyo' AND country = 'Japan'),
   'Shibuya Crossing & Hachiko', 'Experience the world''s busiest pedestrian crossing and visit the loyal dog statue.', NULL, 'sightseeing', 0.00, 45, 91),
  ((SELECT id FROM cities WHERE name = 'Tokyo' AND country = 'Japan'),
   'Akihabara Electronics & Anime', 'Browse multi-story arcades, manga shops, and maid cafés in Electric Town.', NULL, 'shopping', 0.00, 180, 80)
ON CONFLICT (city_id, name) DO NOTHING;

-- ── Bangkok ────────────────────────────────────────
INSERT INTO activities (city_id, name, description, image, type, cost, duration_minutes, popularity) VALUES
  ((SELECT id FROM cities WHERE name = 'Bangkok' AND country = 'Thailand'),
   'Grand Palace & Wat Phra Kaew', 'Marvel at Thailand''s most sacred temple and the glittering royal palace complex.', NULL, 'sightseeing', 16.00, 150, 96),
  ((SELECT id FROM cities WHERE name = 'Bangkok' AND country = 'Thailand'),
   'Chatuchak Weekend Market', 'Haggle for souvenirs across 15,000 stalls in one of the world''s largest markets.', NULL, 'shopping', 0.00, 240, 88),
  ((SELECT id FROM cities WHERE name = 'Bangkok' AND country = 'Thailand'),
   'Street Food Night Tour', 'Eat your way through Yaowarat (Chinatown) with a local guide — pad thai, mango sticky rice, and more.', NULL, 'food', 35.00, 180, 92),
  ((SELECT id FROM cities WHERE name = 'Bangkok' AND country = 'Thailand'),
   'Wat Arun at Sunset', 'Cross the Chao Phraya River to watch the Temple of Dawn glow at golden hour.', NULL, 'culture', 3.00, 90, 85),
  ((SELECT id FROM cities WHERE name = 'Bangkok' AND country = 'Thailand'),
   'Thai Massage Experience', 'Unwind with a traditional two-hour Thai massage at a riverside spa.', NULL, 'wellness', 25.00, 120, 79)
ON CONFLICT (city_id, name) DO NOTHING;

-- ── Bali ───────────────────────────────────────────
INSERT INTO activities (city_id, name, description, image, type, cost, duration_minutes, popularity) VALUES
  ((SELECT id FROM cities WHERE name = 'Bali' AND country = 'Indonesia'),
   'Tegallalang Rice Terraces', 'Walk through sculpted emerald-green rice paddies in the highlands of Ubud.', NULL, 'nature', 5.00, 120, 90),
  ((SELECT id FROM cities WHERE name = 'Bali' AND country = 'Indonesia'),
   'Uluwatu Temple & Kecak Dance', 'Clifftop temple with a dramatic fire-dance performance at sunset.', NULL, 'culture', 10.00, 150, 88),
  ((SELECT id FROM cities WHERE name = 'Bali' AND country = 'Indonesia'),
   'Surfing in Canggu', 'Catch waves at Echo Beach or Batu Bolong — suitable for beginners and intermediates.', NULL, 'adventure', 30.00, 180, 83),
  ((SELECT id FROM cities WHERE name = 'Bali' AND country = 'Indonesia'),
   'Ubud Yoga Retreat', 'Morning vinyasa flow at an open-air shala surrounded by jungle.', NULL, 'wellness', 15.00, 90, 76)
ON CONFLICT (city_id, name) DO NOTHING;

-- ── Barcelona ──────────────────────────────────────
INSERT INTO activities (city_id, name, description, image, type, cost, duration_minutes, popularity) VALUES
  ((SELECT id FROM cities WHERE name = 'Barcelona' AND country = 'Spain'),
   'Sagrada Familia Tour', 'Gaudí''s unfinished masterpiece — a basilica unlike anything else on Earth.', NULL, 'sightseeing', 26.00, 120, 97),
  ((SELECT id FROM cities WHERE name = 'Barcelona' AND country = 'Spain'),
   'Park Güell', 'Mosaic-covered terraces and whimsical architecture with panoramic city views.', NULL, 'sightseeing', 10.00, 90, 89),
  ((SELECT id FROM cities WHERE name = 'Barcelona' AND country = 'Spain'),
   'La Boqueria Market', 'Wander through Barcelona''s famous covered market tasting jamón, fresh juice, and seafood.', NULL, 'food', 0.00, 90, 86),
  ((SELECT id FROM cities WHERE name = 'Barcelona' AND country = 'Spain'),
   'Barceloneta Beach Day', 'Soak up the Mediterranean sun on Barcelona''s most popular urban beach.', NULL, 'nature', 0.00, 240, 82)
ON CONFLICT (city_id, name) DO NOTHING;

-- ── Rome ───────────────────────────────────────────
INSERT INTO activities (city_id, name, description, image, type, cost, duration_minutes, popularity) VALUES
  ((SELECT id FROM cities WHERE name = 'Rome' AND country = 'Italy'),
   'Colosseum & Roman Forum', 'Step inside the ancient gladiatorial arena and walk through the ruins of imperial Rome.', NULL, 'sightseeing', 18.00, 180, 96),
  ((SELECT id FROM cities WHERE name = 'Rome' AND country = 'Italy'),
   'Vatican Museums & Sistine Chapel', 'See Michelangelo''s ceiling fresco and millennia of papal art collections.', NULL, 'culture', 17.00, 210, 95),
  ((SELECT id FROM cities WHERE name = 'Rome' AND country = 'Italy'),
   'Trastevere Food Tour', 'Taste supplì, cacio e pepe, and gelato in Rome''s most charming neighborhood.', NULL, 'food', 55.00, 180, 84),
  ((SELECT id FROM cities WHERE name = 'Rome' AND country = 'Italy'),
   'Trevi Fountain & Spanish Steps', 'Toss a coin in the Baroque fountain and climb the iconic staircase at sunset.', NULL, 'sightseeing', 0.00, 60, 90)
ON CONFLICT (city_id, name) DO NOTHING;

-- ── Dubai ──────────────────────────────────────────
INSERT INTO activities (city_id, name, description, image, type, cost, duration_minutes, popularity) VALUES
  ((SELECT id FROM cities WHERE name = 'Dubai' AND country = 'UAE'),
   'Burj Khalifa At The Top', 'Ascend to the 148th floor of the world''s tallest building for 360° desert-to-sea views.', NULL, 'sightseeing', 55.00, 90, 95),
  ((SELECT id FROM cities WHERE name = 'Dubai' AND country = 'UAE'),
   'Desert Safari & Dune Bashing', 'Adrenaline-pumping 4×4 ride over red dunes, followed by a BBQ dinner under the stars.', NULL, 'adventure', 70.00, 300, 90),
  ((SELECT id FROM cities WHERE name = 'Dubai' AND country = 'UAE'),
   'Dubai Mall & Aquarium', 'Shop in the world''s largest mall and walk through an underwater tunnel of sharks.', NULL, 'shopping', 35.00, 240, 86),
  ((SELECT id FROM cities WHERE name = 'Dubai' AND country = 'UAE'),
   'Dubai Marina Night Walk', 'Stroll the glittering waterfront promenade with skyline reflections on the marina.', NULL, 'nightlife', 0.00, 90, 78)
ON CONFLICT (city_id, name) DO NOTHING;

-- ── Istanbul ───────────────────────────────────────
INSERT INTO activities (city_id, name, description, image, type, cost, duration_minutes, popularity) VALUES
  ((SELECT id FROM cities WHERE name = 'Istanbul' AND country = 'Turkey'),
   'Hagia Sophia', 'A 1,500-year-old architectural marvel — once a cathedral, then a mosque, now a museum-mosque.', NULL, 'culture', 0.00, 90, 94),
  ((SELECT id FROM cities WHERE name = 'Istanbul' AND country = 'Turkey'),
   'Grand Bazaar Shopping', 'Navigate 4,000+ shops in one of the oldest covered markets in the world.', NULL, 'shopping', 0.00, 180, 88),
  ((SELECT id FROM cities WHERE name = 'Istanbul' AND country = 'Turkey'),
   'Bosphorus Sunset Cruise', 'Sail between Europe and Asia as the sun sets over minarets and palaces.', NULL, 'sightseeing', 20.00, 120, 91),
  ((SELECT id FROM cities WHERE name = 'Istanbul' AND country = 'Turkey'),
   'Turkish Breakfast Feast', 'Enjoy a traditional spread of cheeses, olives, eggs, honey, and çay by the waterfront.', NULL, 'food', 15.00, 90, 82)
ON CONFLICT (city_id, name) DO NOTHING;


-- ============================================================
-- TRIP ACTIVITIES
-- ============================================================
-- Link activities to trip stops for the seeded trips

-- Alice: Summer in Europe — Paris stop
INSERT INTO trip_activities (trip_stop_id, activity_id, activity_date, start_time, end_time, activity_order, notes, estimated_cost) VALUES
  (
    (SELECT ts.id FROM trip_stops ts JOIN trips t ON ts.trip_id = t.id WHERE t.name = 'Summer in Europe' AND ts.stop_order = 1),
    (SELECT id FROM activities WHERE name = 'Louvre Museum Visit' AND city_id = (SELECT id FROM cities WHERE name = 'Paris' AND country = 'France')),
    '2026-06-16', '09:30', '12:30', 1,
    'Book skip-the-line tickets in advance!', 17.00
  ),
  (
    (SELECT ts.id FROM trip_stops ts JOIN trips t ON ts.trip_id = t.id WHERE t.name = 'Summer in Europe' AND ts.stop_order = 1),
    (SELECT id FROM activities WHERE name = 'Seine River Cruise' AND city_id = (SELECT id FROM cities WHERE name = 'Paris' AND country = 'France')),
    '2026-06-16', '19:00', '20:00', 2,
    'Evening cruise — bring a jacket.', 15.00
  ),
  (
    (SELECT ts.id FROM trip_stops ts JOIN trips t ON ts.trip_id = t.id WHERE t.name = 'Summer in Europe' AND ts.stop_order = 1),
    (SELECT id FROM activities WHERE name = 'Eiffel Tower Summit' AND city_id = (SELECT id FROM cities WHERE name = 'Paris' AND country = 'France')),
    '2026-06-17', '10:00', '12:00', 3,
    'Go early to beat the crowds.', 26.80
  ),
  (
    (SELECT ts.id FROM trip_stops ts JOIN trips t ON ts.trip_id = t.id WHERE t.name = 'Summer in Europe' AND ts.stop_order = 1),
    (SELECT id FROM activities WHERE name = 'Montmartre Walking Tour' AND city_id = (SELECT id FROM cities WHERE name = 'Paris' AND country = 'France')),
    '2026-06-18', '14:00', '16:30', 4,
    'End at Sacré-Cœur for the view.', 15.00
  ),

-- Alice: Summer in Europe — Amsterdam stop
  (
    (SELECT ts.id FROM trip_stops ts JOIN trips t ON ts.trip_id = t.id WHERE t.name = 'Summer in Europe' AND ts.stop_order = 2),
    (SELECT id FROM activities WHERE name = 'Canal Boat Tour' AND city_id = (SELECT id FROM cities WHERE name = 'Amsterdam' AND country = 'Netherlands')),
    '2026-06-22', '11:00', '12:15', 1,
    'Glass-top boat — great for photos.', 18.00
  ),
  (
    (SELECT ts.id FROM trip_stops ts JOIN trips t ON ts.trip_id = t.id WHERE t.name = 'Summer in Europe' AND ts.stop_order = 2),
    (SELECT id FROM activities WHERE name = 'Rijksmuseum Tour' AND city_id = (SELECT id FROM cities WHERE name = 'Amsterdam' AND country = 'Netherlands')),
    '2026-06-23', '10:00', '13:00', 2,
    'Don''t miss the Night Watch gallery.', 22.50
  ),
  (
    (SELECT ts.id FROM trip_stops ts JOIN trips t ON ts.trip_id = t.id WHERE t.name = 'Summer in Europe' AND ts.stop_order = 2),
    (SELECT id FROM activities WHERE name = 'Anne Frank House' AND city_id = (SELECT id FROM cities WHERE name = 'Amsterdam' AND country = 'Netherlands')),
    '2026-06-24', '09:00', '10:30', 3,
    'Tickets sell out weeks ahead — book now.', 16.00
  ),

-- Alice: Summer in Europe — Prague stop
  (
    (SELECT ts.id FROM trip_stops ts JOIN trips t ON ts.trip_id = t.id WHERE t.name = 'Summer in Europe' AND ts.stop_order = 3),
    (SELECT id FROM activities WHERE name = 'Prague Castle Complex' AND city_id = (SELECT id FROM cities WHERE name = 'Prague' AND country = 'Czech Republic')),
    '2026-06-28', '09:00', '12:00', 1,
    'Start early — the complex is huge.', 14.00
  ),
  (
    (SELECT ts.id FROM trip_stops ts JOIN trips t ON ts.trip_id = t.id WHERE t.name = 'Summer in Europe' AND ts.stop_order = 3),
    (SELECT id FROM activities WHERE name = 'Charles Bridge Sunset Walk' AND city_id = (SELECT id FROM cities WHERE name = 'Prague' AND country = 'Czech Republic')),
    '2026-06-28', '18:30', '19:30', 2,
    'Best light for photography.', 0.00
  ),
  (
    (SELECT ts.id FROM trip_stops ts JOIN trips t ON ts.trip_id = t.id WHERE t.name = 'Summer in Europe' AND ts.stop_order = 3),
    (SELECT id FROM activities WHERE name = 'Czech Beer Tasting' AND city_id = (SELECT id FROM cities WHERE name = 'Prague' AND country = 'Czech Republic')),
    '2026-06-29', '17:00', '19:00', 3,
    'Try the dark lager!', 25.00
  ),

-- Bob: Southeast Asia Explorer — Bangkok stop
  (
    (SELECT ts.id FROM trip_stops ts JOIN trips t ON ts.trip_id = t.id WHERE t.name = 'Southeast Asia Explorer' AND ts.stop_order = 1),
    (SELECT id FROM activities WHERE name = 'Grand Palace & Wat Phra Kaew' AND city_id = (SELECT id FROM cities WHERE name = 'Bangkok' AND country = 'Thailand')),
    '2026-09-02', '08:30', '11:00', 1,
    'Dress modestly — long pants and covered shoulders required.', 16.00
  ),
  (
    (SELECT ts.id FROM trip_stops ts JOIN trips t ON ts.trip_id = t.id WHERE t.name = 'Southeast Asia Explorer' AND ts.stop_order = 1),
    (SELECT id FROM activities WHERE name = 'Street Food Night Tour' AND city_id = (SELECT id FROM cities WHERE name = 'Bangkok' AND country = 'Thailand')),
    '2026-09-02', '18:00', '21:00', 2,
    'Come hungry!', 35.00
  ),
  (
    (SELECT ts.id FROM trip_stops ts JOIN trips t ON ts.trip_id = t.id WHERE t.name = 'Southeast Asia Explorer' AND ts.stop_order = 1),
    (SELECT id FROM activities WHERE name = 'Chatuchak Weekend Market' AND city_id = (SELECT id FROM cities WHERE name = 'Bangkok' AND country = 'Thailand')),
    '2026-09-06', '10:00', '14:00', 3,
    'Saturday is best — more stalls open.', 0.00
  ),

-- Bob: Southeast Asia Explorer — Bali stop
  (
    (SELECT ts.id FROM trip_stops ts JOIN trips t ON ts.trip_id = t.id WHERE t.name = 'Southeast Asia Explorer' AND ts.stop_order = 3),
    (SELECT id FROM activities WHERE name = 'Tegallalang Rice Terraces' AND city_id = (SELECT id FROM cities WHERE name = 'Bali' AND country = 'Indonesia')),
    '2026-09-15', '08:00', '10:00', 1,
    'Go early to avoid tour groups.', 5.00
  ),
  (
    (SELECT ts.id FROM trip_stops ts JOIN trips t ON ts.trip_id = t.id WHERE t.name = 'Southeast Asia Explorer' AND ts.stop_order = 3),
    (SELECT id FROM activities WHERE name = 'Uluwatu Temple & Kecak Dance' AND city_id = (SELECT id FROM cities WHERE name = 'Bali' AND country = 'Indonesia')),
    '2026-09-16', '16:00', '18:30', 2,
    'Arrive before 5pm to get good seats for the dance.', 10.00
  ),
  (
    (SELECT ts.id FROM trip_stops ts JOIN trips t ON ts.trip_id = t.id WHERE t.name = 'Southeast Asia Explorer' AND ts.stop_order = 3),
    (SELECT id FROM activities WHERE name = 'Surfing in Canggu' AND city_id = (SELECT id FROM cities WHERE name = 'Bali' AND country = 'Indonesia')),
    '2026-09-18', '07:00', '10:00', 3,
    'Board rental included. Morning swell is best.', 30.00
  )
ON CONFLICT DO NOTHING;


-- ============================================================
-- EXPENSES
-- ============================================================
-- Realistic expenses across multiple trips and categories

-- Alice: Summer in Europe (EUR)
INSERT INTO expenses (trip_id, category, amount, currency, expense_date, description) VALUES
  -- Paris
  ((SELECT id FROM trips WHERE name = 'Summer in Europe' LIMIT 1),
   'TRANSPORT', 120.00, 'EUR', '2026-06-15', 'CDG to city center — taxi'),
  ((SELECT id FROM trips WHERE name = 'Summer in Europe' LIMIT 1),
   'STAY', 540.00, 'EUR', '2026-06-15', 'Airbnb Marais apartment (6 nights)'),
  ((SELECT id FROM trips WHERE name = 'Summer in Europe' LIMIT 1),
   'MEAL', 42.50, 'EUR', '2026-06-15', 'Dinner at Le Bouillon Chartier'),
  ((SELECT id FROM trips WHERE name = 'Summer in Europe' LIMIT 1),
   'ACTIVITY', 26.80, 'EUR', '2026-06-17', 'Eiffel Tower summit tickets'),
  ((SELECT id FROM trips WHERE name = 'Summer in Europe' LIMIT 1),
   'ACTIVITY', 17.00, 'EUR', '2026-06-16', 'Louvre Museum entry'),
  ((SELECT id FROM trips WHERE name = 'Summer in Europe' LIMIT 1),
   'MEAL', 18.00, 'EUR', '2026-06-18', 'Crêpes and coffee near Sacré-Cœur'),

  -- Amsterdam
  ((SELECT id FROM trips WHERE name = 'Summer in Europe' LIMIT 1),
   'TRANSPORT', 85.00, 'EUR', '2026-06-22', 'Thalys Paris → Amsterdam'),
  ((SELECT id FROM trips WHERE name = 'Summer in Europe' LIMIT 1),
   'STAY', 420.00, 'EUR', '2026-06-22', 'Hotel near Jordaan (5 nights)'),
  ((SELECT id FROM trips WHERE name = 'Summer in Europe' LIMIT 1),
   'ACTIVITY', 22.50, 'EUR', '2026-06-23', 'Rijksmuseum entry'),
  ((SELECT id FROM trips WHERE name = 'Summer in Europe' LIMIT 1),
   'MEAL', 35.00, 'EUR', '2026-06-24', 'Indonesian rijsttafel dinner'),
  ((SELECT id FROM trips WHERE name = 'Summer in Europe' LIMIT 1),
   'OTHER', 12.00, 'EUR', '2026-06-25', 'Bike rental for the day'),

  -- Prague
  ((SELECT id FROM trips WHERE name = 'Summer in Europe' LIMIT 1),
   'TRANSPORT', 45.00, 'EUR', '2026-06-28', 'FlixBus Amsterdam → Prague'),
  ((SELECT id FROM trips WHERE name = 'Summer in Europe' LIMIT 1),
   'STAY', 280.00, 'EUR', '2026-06-28', 'Old Town hostel (8 nights)'),
  ((SELECT id FROM trips WHERE name = 'Summer in Europe' LIMIT 1),
   'MEAL', 15.00, 'EUR', '2026-06-29', 'Svíčková and beer at a local pub'),
  ((SELECT id FROM trips WHERE name = 'Summer in Europe' LIMIT 1),
   'ACTIVITY', 25.00, 'EUR', '2026-06-29', 'Czech beer tasting tour'),

-- Bob: Southeast Asia Explorer (USD)
  ((SELECT id FROM trips WHERE name = 'Southeast Asia Explorer' LIMIT 1),
   'TRANSPORT', 350.00, 'USD', '2026-09-01', 'Flight to Bangkok'),
  ((SELECT id FROM trips WHERE name = 'Southeast Asia Explorer' LIMIT 1),
   'STAY', 180.00, 'USD', '2026-09-01', 'Khaosan Road guesthouse (7 nights)'),
  ((SELECT id FROM trips WHERE name = 'Southeast Asia Explorer' LIMIT 1),
   'MEAL', 5.50, 'USD', '2026-09-02', 'Street pad thai + mango sticky rice'),
  ((SELECT id FROM trips WHERE name = 'Southeast Asia Explorer' LIMIT 1),
   'ACTIVITY', 16.00, 'USD', '2026-09-02', 'Grand Palace entry'),
  ((SELECT id FROM trips WHERE name = 'Southeast Asia Explorer' LIMIT 1),
   'MEAL', 35.00, 'USD', '2026-09-02', 'Chinatown street food night tour'),
  ((SELECT id FROM trips WHERE name = 'Southeast Asia Explorer' LIMIT 1),
   'TRANSPORT', 65.00, 'USD', '2026-09-08', 'Flight Bangkok → Hanoi'),
  ((SELECT id FROM trips WHERE name = 'Southeast Asia Explorer' LIMIT 1),
   'STAY', 120.00, 'USD', '2026-09-08', 'Old Quarter hotel (5 nights)'),
  ((SELECT id FROM trips WHERE name = 'Southeast Asia Explorer' LIMIT 1),
   'MEAL', 3.00, 'USD', '2026-09-09', 'Phở bò breakfast'),
  ((SELECT id FROM trips WHERE name = 'Southeast Asia Explorer' LIMIT 1),
   'TRANSPORT', 90.00, 'USD', '2026-09-14', 'Flight Hanoi → Bali'),
  ((SELECT id FROM trips WHERE name = 'Southeast Asia Explorer' LIMIT 1),
   'STAY', 250.00, 'USD', '2026-09-14', 'Ubud villa (7 nights)'),
  ((SELECT id FROM trips WHERE name = 'Southeast Asia Explorer' LIMIT 1),
   'ACTIVITY', 30.00, 'USD', '2026-09-18', 'Surfing lesson in Canggu'),
  ((SELECT id FROM trips WHERE name = 'Southeast Asia Explorer' LIMIT 1),
   'OTHER', 15.00, 'USD', '2026-09-15', 'Scooter rental (1 day)'),

-- Charlie: Middle East & Turkey (USD)
  ((SELECT id FROM trips WHERE name = 'Middle East & Turkey' LIMIT 1),
   'TRANSPORT', 450.00, 'USD', '2026-11-05', 'Flight to Dubai'),
  ((SELECT id FROM trips WHERE name = 'Middle East & Turkey' LIMIT 1),
   'STAY', 600.00, 'USD', '2026-11-05', 'Dubai Marina hotel (5 nights)'),
  ((SELECT id FROM trips WHERE name = 'Middle East & Turkey' LIMIT 1),
   'ACTIVITY', 55.00, 'USD', '2026-11-06', 'Burj Khalifa At The Top tickets'),
  ((SELECT id FROM trips WHERE name = 'Middle East & Turkey' LIMIT 1),
   'ACTIVITY', 70.00, 'USD', '2026-11-07', 'Desert safari & dune bashing'),
  ((SELECT id FROM trips WHERE name = 'Middle East & Turkey' LIMIT 1),
   'MEAL', 85.00, 'USD', '2026-11-08', 'Dinner at Pierchic'),
  ((SELECT id FROM trips WHERE name = 'Middle East & Turkey' LIMIT 1),
   'TRANSPORT', 120.00, 'USD', '2026-11-11', 'Flight Dubai → Marrakech'),
  ((SELECT id FROM trips WHERE name = 'Middle East & Turkey' LIMIT 1),
   'STAY', 160.00, 'USD', '2026-11-11', 'Riad in the Medina (3 nights)'),
  ((SELECT id FROM trips WHERE name = 'Middle East & Turkey' LIMIT 1),
   'MEAL', 25.00, 'USD', '2026-11-12', 'Tagine and mint tea in Jemaa el-Fnaa'),
  ((SELECT id FROM trips WHERE name = 'Middle East & Turkey' LIMIT 1),
   'OTHER', 30.00, 'USD', '2026-11-13', 'Traditional hammam experience'),
  ((SELECT id FROM trips WHERE name = 'Middle East & Turkey' LIMIT 1),
   'TRANSPORT', 95.00, 'USD', '2026-11-15', 'Flight Marrakech → Istanbul'),
  ((SELECT id FROM trips WHERE name = 'Middle East & Turkey' LIMIT 1),
   'STAY', 240.00, 'USD', '2026-11-15', 'Boutique hotel near Sultanahmet (5 nights)'),
  ((SELECT id FROM trips WHERE name = 'Middle East & Turkey' LIMIT 1),
   'ACTIVITY', 20.00, 'USD', '2026-11-16', 'Bosphorus sunset cruise'),
  ((SELECT id FROM trips WHERE name = 'Middle East & Turkey' LIMIT 1),
   'MEAL', 15.00, 'USD', '2026-11-17', 'Turkish breakfast feast by the waterfront')
ON CONFLICT DO NOTHING;


-- ============================================================
-- NOTIFICATIONS
-- ============================================================
INSERT INTO notifications (user_id, type, title, message, is_read, metadata) VALUES
  -- Alice: budget warning
  (
    (SELECT id FROM users WHERE email = 'alice@example.com'),
    'BUDGET_WARNING',
    'Budget alert: 82% spent on "Summer in Europe"',
    'You''ve used 82% of your EUR 3500.00 budget for "Summer in Europe". EUR 630.00 remaining.',
    false,
    '{"trip_id": "placeholder", "percentage": 82}'
  ),
  -- Alice: upcoming trip
  (
    (SELECT id FROM users WHERE email = 'alice@example.com'),
    'UPCOMING_TRIP',
    '"Japan Culture Deep Dive" starts in 3 days!',
    'Your trip "Japan Culture Deep Dive" begins on 2026-10-01. Time to finalize your itinerary!',
    false,
    '{"trip_id": "placeholder", "days_until": 3}'
  ),
  -- Alice: system notification
  (
    (SELECT id FROM users WHERE email = 'alice@example.com'),
    'SYSTEM',
    'Welcome to GlobeTrotter!',
    'Start planning your next adventure. Create a trip, add stops, and track your budget all in one place.',
    true,
    NULL
  ),

  -- Bob: trip copied
  (
    (SELECT id FROM users WHERE email = 'bob@example.com'),
    'TRIP_COPIED',
    'Someone copied your trip!',
    'Charlie Kumar copied your public trip "Southeast Asia Explorer".',
    false,
    '{"trip_id": "placeholder", "copier_name": "Charlie Kumar"}'
  ),
  -- Bob: budget exceeded
  (
    (SELECT id FROM users WHERE email = 'bob@example.com'),
    'BUDGET_EXCEEDED',
    'Budget exceeded on "Southeast Asia Explorer"',
    'You''ve spent USD 2159.50 on "Southeast Asia Explorer", which is USD 159.50 over your USD 2000.00 budget.',
    false,
    '{"trip_id": "placeholder", "total_budget": 2000, "total_spent": 2159.50}'
  ),
  -- Bob: system
  (
    (SELECT id FROM users WHERE email = 'bob@example.com'),
    'SYSTEM',
    'Welcome to GlobeTrotter!',
    'Start planning your next adventure. Create a trip, add stops, and track your budget all in one place.',
    true,
    NULL
  ),

  -- Charlie: trip shared
  (
    (SELECT id FROM users WHERE email = 'charlie@example.com'),
    'TRIP_SHARED',
    'Alice Johnson shared a trip with you',
    '"Summer in Europe" has been shared with you. Check it out!',
    false,
    '{"trip_id": "placeholder", "sharer_name": "Alice Johnson"}'
  ),
  -- Charlie: upcoming trip
  (
    (SELECT id FROM users WHERE email = 'charlie@example.com'),
    'UPCOMING_TRIP',
    '"Middle East & Turkey" starts in 7 days!',
    'Your trip "Middle East & Turkey" begins on 2026-11-05. Time to finalize your itinerary!',
    true,
    '{"trip_id": "placeholder", "days_until": 7}'
  )
ON CONFLICT DO NOTHING;
