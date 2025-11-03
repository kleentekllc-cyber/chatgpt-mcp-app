/**
 * Business type constants and synonym mappings
 */

import { BusinessType } from '../types/query-parser.js';

/**
 * Canonical business type categories
 */
export const BUSINESS_TYPES: BusinessType[] = [
  'restaurant',
  'coffee_shop',
  'bar',
  'grocery_store',
  'bank',
  'pharmacy',
  'gas_station',
  'hotel',
  'hair_salon',
  'gym',
  'auto_repair',
  'dentist',
  'veterinarian',
  'bakery',
  'cafe',
  'fast_food',
  'food',
  'store',
  'shopping_mall',
  'movie_theater',
  'park',
  'library',
  'hospital',
  'school',
  'business',
  'place',
];

/**
 * Synonym mapping for colloquialisms to canonical business types
 */
export const BUSINESS_TYPE_SYNONYMS: Record<string, BusinessType> = {
  // Coffee shops
  'coffee shop': 'coffee_shop',
  'coffee': 'coffee_shop',
  'cafe': 'cafe',
  'cafes': 'cafe',
  'coffeehouse': 'coffee_shop',

  // Restaurants
  'restaurants': 'restaurant',
  'restaurant': 'restaurant',
  'dining': 'restaurant',
  'eatery': 'restaurant',
  'eateries': 'restaurant',

  // Cuisine types
  'italian': 'restaurant',
  'italian restaurant': 'restaurant',
  'italian restaurants': 'restaurant',
  'sushi': 'restaurant',
  'sushi restaurant': 'restaurant',
  'pizza': 'restaurant',
  'pizza place': 'restaurant',
  'pizza places': 'restaurant',
  'pizzeria': 'restaurant',
  'tacos': 'restaurant',
  'taco': 'restaurant',
  'mexican': 'restaurant',
  'mexican food': 'restaurant',
  'thai': 'restaurant',
  'thai food': 'restaurant',
  'chinese': 'restaurant',
  'chinese food': 'restaurant',
  'japanese': 'restaurant',
  'indian': 'restaurant',
  'burger': 'fast_food',
  'burgers': 'fast_food',

  // Bars
  'bars': 'bar',
  'pub': 'bar',
  'pubs': 'bar',
  'tavern': 'bar',
  'brewery': 'bar',

  // Grocery
  'grocery': 'grocery_store',
  'groceries': 'grocery_store',
  'supermarket': 'grocery_store',
  'market': 'grocery_store',

  // Banks
  'banks': 'bank',
  'atm': 'bank',
  'credit union': 'bank',

  // Pharmacies
  'pharmacies': 'pharmacy',
  'drugstore': 'pharmacy',
  'drug store': 'pharmacy',

  // Gas stations
  'gas': 'gas_station',
  'fuel': 'gas_station',
  'petrol': 'gas_station',

  // Hotels
  'hotels': 'hotel',
  'motel': 'hotel',
  'lodging': 'hotel',
  'accommodation': 'hotel',

  // Services
  'salon': 'hair_salon',
  'salons': 'hair_salon',
  'barber': 'hair_salon',
  'barbers': 'hair_salon',
  'hairdresser': 'hair_salon',
  'gyms': 'gym',
  'fitness': 'gym',
  'fitness center': 'gym',
  'mechanic': 'auto_repair',
  'mechanics': 'auto_repair',
  'car repair': 'auto_repair',
  'dentists': 'dentist',
  'dental': 'dentist',
  'vet': 'veterinarian',
  'vets': 'veterinarian',
  'veterinarians': 'veterinarian',
  'animal hospital': 'veterinarian',

  // Bakeries
  'bakeries': 'bakery',
  'bakery': 'bakery',
  'bread': 'bakery',
  'pastry': 'bakery',

  // Fast food
  'fast food': 'fast_food',
  'quick service': 'fast_food',

  // Shopping
  'stores': 'store',
  'shop': 'store',
  'shops': 'store',
  'mall': 'shopping_mall',
  'shopping center': 'shopping_mall',

  // Entertainment
  'cinema': 'movie_theater',
  'theater': 'movie_theater',
  'movies': 'movie_theater',

  // Parks
  'parks': 'park',

  // Libraries
  'libraries': 'library',

  // Hospitals
  'hospitals': 'hospital',
  'medical center': 'hospital',
  'clinic': 'hospital',

  // Schools
  'schools': 'school',
  'university': 'school',
  'college': 'school',
};

/**
 * Filter keywords for extraction
 */
export const FILTER_KEYWORDS = {
  rating: [
    '4-star',
    '5-star',
    '3-star',
    '2-star',
    '1-star',
    'highly rated',
    'top rated',
    'good reviews',
    'great reviews',
    'excellent',
    'stars',
    'star',
  ],
  temporal: [
    'open now',
    'open late',
    '24 hours',
    '24/7',
    'open on sunday',
    'open on',
    'open after',
    'open before',
  ],
  price: [
    'cheap',
    'affordable',
    'inexpensive',
    'expensive',
    'fine dining',
    'budget',
    '$',
    '$$',
    '$$$',
    '$$$$',
  ],
  attributes: [
    'wifi',
    'wi-fi',
    'outdoor seating',
    'patio',
    'delivery',
    'takeout',
    'wheelchair accessible',
    'parking',
    'pet friendly',
    'kid friendly',
    'vegan',
    'vegetarian',
    'gluten free',
  ],
  distance: [
    'within',
    'less than',
    'under',
    'near',
    'nearby',
    'close',
    'walking distance',
    'mile',
    'miles',
    'km',
    'kilometer',
    'meters',
  ],
};
