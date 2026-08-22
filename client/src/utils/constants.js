// City image mapping — Unsplash photos for demo destinations
// Used when city.image is null (seed data has no images)
export const CITY_IMAGES = {
  'Paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  'Barcelona': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80',
  'Rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80',
  'Amsterdam': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80',
  'Prague': 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800&q=80',
  'Lisbon': 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&q=80',
  'Berlin': 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&q=80',
  'Vienna': 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800&q=80',
  'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
  'Bangkok': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80',
  'Bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
  'Seoul': 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&q=80',
  'Hanoi': 'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=800&q=80',
  'Kyoto': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
  'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
  'Mexico City': 'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?w=800&q=80',
  'Rio de Janeiro': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80',
  'Buenos Aires': 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&q=80',
  'Lima': 'https://images.unsplash.com/photo-1531968455001-5c5272a67c71?w=800&q=80',
  'Cape Town': 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80',
  'Marrakech': 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&q=80',
  'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
  'Istanbul': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80',
  'Sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80',
  'Queenstown': 'https://images.unsplash.com/photo-1589871973318-9ca1258faa96?w=800&q=80',
};

/**
 * Get image URL for a city (fallback to Unsplash if no DB image)
 */
export function getCityImage(city) {
  if (city?.image) return city.image;
  return CITY_IMAGES[city?.name] || `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80`;
}

// Activity type labels and colors
export const ACTIVITY_TYPES = {
  sightseeing: { label: 'Sightseeing', color: 'terracotta' },
  food: { label: 'Food & Drink', color: 'olive' },
  adventure: { label: 'Adventure', color: 'terracotta' },
  culture: { label: 'Culture', color: 'olive' },
  nightlife: { label: 'Nightlife', color: 'terracotta' },
  shopping: { label: 'Shopping', color: 'olive' },
  nature: { label: 'Nature', color: 'olive' },
  wellness: { label: 'Wellness', color: 'olive' },
  entertainment: { label: 'Entertainment', color: 'terracotta' },
  transport: { label: 'Transport', color: 'ink' },
  other: { label: 'Other', color: 'ink' },
};

// Expense categories
export const EXPENSE_CATEGORIES = [
  { value: 'TRANSPORT', label: 'Transport', icon: 'Plane' },
  { value: 'STAY', label: 'Stay', icon: 'Hotel' },
  { value: 'ACTIVITY', label: 'Activity', icon: 'Ticket' },
  { value: 'MEAL', label: 'Meal', icon: 'UtensilsCrossed' },
  { value: 'OTHER', label: 'Other', icon: 'MoreHorizontal' },
];

// Currency options
export const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'INR', 'AUD', 'CAD',
  'CHF', 'CNY', 'THB', 'BRL', 'ARS', 'PEN', 'ZAR',
  'MAD', 'AED', 'TRY', 'NZD', 'IDR', 'VND', 'KRW', 'MXN',
];
