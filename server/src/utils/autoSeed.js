const { query } = require('../config/db');
const { hashPassword } = require('./password');

const DUMMY_USERS = [
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'user',
    phone: '+1 (555) 234-5678',
    city: 'San Francisco',
    country: 'United States',
    additional_info: 'Passionate backpacker exploring world heritage sites and mountain trails.',
    profile_photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
  },
  {
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: 'user',
    phone: '+1 (555) 876-5432',
    city: 'Seattle',
    country: 'United States',
    additional_info: 'Urban explorer, coffee enthusiast, and cultural photographer.',
    profile_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  },
  {
    name: 'Charlie Kumar',
    email: 'charlie@example.com',
    role: 'admin',
    phone: '+91 98765 43210',
    city: 'Mumbai',
    country: 'India',
    additional_info: 'GlobeTrotter platform administrator and luxury travel curator.',
    profile_photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
  },
  {
    name: 'Diana Prince',
    email: 'diana@example.com',
    role: 'user',
    phone: '+1 555-0199',
    city: 'Themyscira',
    country: 'Greece',
    additional_info: 'Loves Mediterranean coastal hikes and ancient temples.',
    profile_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
  },
  {
    name: 'Elena Rostova',
    email: 'elena@example.com',
    role: 'user',
    phone: '+44 20 7946 0912',
    city: 'London',
    country: 'United Kingdom',
    additional_info: 'Solo traveler passionate about museums, cafes, and rail journeys.',
    profile_photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80',
  },
];

/**
 * Ensures demo/dummy accounts exist in PostgreSQL with password123.
 */
const ensureDummyAccounts = async () => {
  try {
    const defaultPasswordHash = await hashPassword('password123');

    for (const u of DUMMY_USERS) {
      await query(
        `INSERT INTO users (name, email, password_hash, role, phone, city, country, additional_info, profile_photo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (email) DO UPDATE SET
           password_hash = EXCLUDED.password_hash,
           role = EXCLUDED.role,
           phone = COALESCE(users.phone, EXCLUDED.phone),
           city = COALESCE(users.city, EXCLUDED.city),
           country = COALESCE(users.country, EXCLUDED.country),
           additional_info = COALESCE(users.additional_info, EXCLUDED.additional_info),
           profile_photo = COALESCE(users.profile_photo, EXCLUDED.profile_photo)`,
        [
          u.name,
          u.email,
          defaultPasswordHash,
          u.role,
          u.phone,
          u.city,
          u.country,
          u.additional_info,
          u.profile_photo,
        ]
      );
    }
    console.log('[DB]     Quick Demo accounts seeded/verified (Alice, Bob, Charlie, Diana, Elena)');
  } catch (err) {
    console.warn('[DB]     Could not auto-seed dummy accounts:', err.message);
  }
};

module.exports = { ensureDummyAccounts };
