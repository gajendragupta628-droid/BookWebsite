const { env } = require('../config/env');

/**
 * Pexels API Service
 * Provides images from Pexels with proper attribution
 * Rate limit: 200 requests/hour, 20,000/month
 */

// In-memory cache to reduce API calls
const cache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Search for photos on Pexels
 * @param {string} query - Search query (e.g., "books", "library", "reading")
 * @param {number} perPage - Number of results per page (max 80)
 * @param {number} page - Page number
 * @returns {Promise<Object>} Pexels API response
 */
async function searchPhotos(query, perPage = 15, page = 1) {
  const cacheKey = `search_${query}_${perPage}_${page}`;
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  if (!env.PEXELS_API_KEY) {
    console.warn('PEXELS_API_KEY not set, returning fallback images');
    return getFallbackImages(query, perPage);
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}`,
      {
        headers: {
          Authorization: env.PEXELS_API_KEY
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Cache the result
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    return data;
  } catch (error) {
    console.error('Error fetching from Pexels:', error);
    return getFallbackImages(query, perPage);
  }
}

/**
 * Get curated photos from Pexels
 * @param {number} perPage - Number of results per page (max 80)
 * @param {number} page - Page number
 * @returns {Promise<Object>} Pexels API response
 */
async function getCuratedPhotos(perPage = 15, page = 1) {
  const cacheKey = `curated_${perPage}_${page}`;
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  if (!env.PEXELS_API_KEY) {
    console.warn('PEXELS_API_KEY not set, returning fallback images');
    return getFallbackImages('books', perPage);
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/curated?per_page=${perPage}&page=${page}`,
      {
        headers: {
          Authorization: env.PEXELS_API_KEY
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Cache the result
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    return data;
  } catch (error) {
    console.error('Error fetching curated photos from Pexels:', error);
    return getFallbackImages('books', perPage);
  }
}

/**
 * Get images for specific book-related themes
 * @param {string} theme - Theme like 'library', 'bookshelf', 'reading', 'books'
 * @param {number} count - Number of images needed
 * @returns {Promise<Array>} Array of image objects with src and attribution
 */
async function getBookImages(theme = 'books', count = 6) {
  const queries = {
    library: 'library books shelves',
    bookshelf: 'bookshelf books',
    reading: 'person reading book',
    books: 'books stack',
    'used-books': 'old books vintage',
    'nepali-books': 'books literature',
    'hero-banner': 'library interior architecture'
  };

  const searchQuery = queries[theme] || theme;
  const data = await searchPhotos(searchQuery, count, 1);

  if (!data || !data.photos || data.photos.length === 0) {
    return getFallbackImages(theme, count).photos;
  }

  return data.photos.map(photo => ({
    id: photo.id,
    src: {
      original: photo.src.original,
      large: photo.src.large,
      medium: photo.src.medium,
      small: photo.src.small,
      landscape: photo.src.landscape,
      portrait: photo.src.portrait
    },
    alt: photo.alt || `Book photo by ${photo.photographer}`,
    photographer: photo.photographer,
    photographer_url: photo.photographer_url,
    pexels_url: photo.url,
    avg_color: photo.avg_color || '#978E82'
  }));
}

/**
 * Fallback images when API is not available or rate limited
 */
function getFallbackImages(query, count = 15) {
  // Curated fallback images that work without API
  const fallbackPhotos = [
    {
      id: 1,
      src: {
        original: 'https://images.pexels.com/photos/768125/pexels-photo-768125.jpeg',
        large: 'https://images.pexels.com/photos/768125/pexels-photo-768125.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        medium: 'https://images.pexels.com/photos/768125/pexels-photo-768125.jpeg?auto=compress&cs=tinysrgb&h=350',
        small: 'https://images.pexels.com/photos/768125/pexels-photo-768125.jpeg?auto=compress&cs=tinysrgb&h=130',
        landscape: 'https://images.pexels.com/photos/768125/pexels-photo-768125.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
        portrait: 'https://images.pexels.com/photos/768125/pexels-photo-768125.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800'
      },
      photographer: 'Pexels',
      photographer_url: 'https://www.pexels.com',
      url: 'https://www.pexels.com',
      alt: 'Books'
    },
    {
      id: 2,
      src: {
        original: 'https://images.pexels.com/photos/762686/pexels-photo-762686.jpeg',
        large: 'https://images.pexels.com/photos/762686/pexels-photo-762686.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        medium: 'https://images.pexels.com/photos/762686/pexels-photo-762686.jpeg?auto=compress&cs=tinysrgb&h=350',
        small: 'https://images.pexels.com/photos/762686/pexels-photo-762686.jpeg?auto=compress&cs=tinysrgb&h=130',
        landscape: 'https://images.pexels.com/photos/762686/pexels-photo-762686.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
        portrait: 'https://images.pexels.com/photos/762686/pexels-photo-762686.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800'
      },
      photographer: 'Pexels',
      photographer_url: 'https://www.pexels.com',
      url: 'https://www.pexels.com',
      alt: 'Books'
    },
    {
      id: 3,
      src: {
        original: 'https://images.pexels.com/photos/1148399/pexels-photo-1148399.jpeg',
        large: 'https://images.pexels.com/photos/1148399/pexels-photo-1148399.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        medium: 'https://images.pexels.com/photos/1148399/pexels-photo-1148399.jpeg?auto=compress&cs=tinysrgb&h=350',
        small: 'https://images.pexels.com/photos/1148399/pexels-photo-1148399.jpeg?auto=compress&cs=tinysrgb&h=130',
        landscape: 'https://images.pexels.com/photos/1148399/pexels-photo-1148399.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
        portrait: 'https://images.pexels.com/photos/1148399/pexels-photo-1148399.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800'
      },
      photographer: 'Pexels',
      photographer_url: 'https://www.pexels.com',
      url: 'https://www.pexels.com',
      alt: 'Books'
    },
    {
      id: 4,
      src: {
        original: 'https://images.pexels.com/photos/45717/pexels-photo-45717.jpeg',
        large: 'https://images.pexels.com/photos/45717/pexels-photo-45717.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        medium: 'https://images.pexels.com/photos/45717/pexels-photo-45717.jpeg?auto=compress&cs=tinysrgb&h=350',
        small: 'https://images.pexels.com/photos/45717/pexels-photo-45717.jpeg?auto=compress&cs=tinysrgb&h=130',
        landscape: 'https://images.pexels.com/photos/45717/pexels-photo-45717.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
        portrait: 'https://images.pexels.com/photos/45717/pexels-photo-45717.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800'
      },
      photographer: 'Pexels',
      photographer_url: 'https://www.pexels.com',
      url: 'https://www.pexels.com',
      alt: 'Books'
    },
    {
      id: 5,
      src: {
        original: 'https://images.pexels.com/photos/1907785/pexels-photo-1907785.jpeg',
        large: 'https://images.pexels.com/photos/1907785/pexels-photo-1907785.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        medium: 'https://images.pexels.com/photos/1907785/pexels-photo-1907785.jpeg?auto=compress&cs=tinysrgb&h=350',
        small: 'https://images.pexels.com/photos/1907785/pexels-photo-1907785.jpeg?auto=compress&cs=tinysrgb&h=130',
        landscape: 'https://images.pexels.com/photos/1907785/pexels-photo-1907785.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
        portrait: 'https://images.pexels.com/photos/1907785/pexels-photo-1907785.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800'
      },
      photographer: 'Pexels',
      photographer_url: 'https://www.pexels.com',
      url: 'https://www.pexels.com',
      alt: 'Library'
    },
    {
      id: 6,
      src: {
        original: 'https://images.pexels.com/photos/1926988/pexels-photo-1926988.jpeg',
        large: 'https://images.pexels.com/photos/1926988/pexels-photo-1926988.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        medium: 'https://images.pexels.com/photos/1926988/pexels-photo-1926988.jpeg?auto=compress&cs=tinysrgb&h=350',
        small: 'https://images.pexels.com/photos/1926988/pexels-photo-1926988.jpeg?auto=compress&cs=tinysrgb&h=130',
        landscape: 'https://images.pexels.com/photos/1926988/pexels-photo-1926988.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
        portrait: 'https://images.pexels.com/photos/1926988/pexels-photo-1926988.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800'
      },
      photographer: 'Pexels',
      photographer_url: 'https://www.pexels.com',
      url: 'https://www.pexels.com',
      alt: 'Bookstore'
    }
  ];

  // Cycle through fallback images to fill the requested count
  const photos = [];
  for (let i = 0; i < count; i++) {
    photos.push(fallbackPhotos[i % fallbackPhotos.length]);
  }

  return {
    photos,
    page: 1,
    per_page: count,
    total_results: fallbackPhotos.length
  };
}

/**
 * Clear the cache (useful for development/testing)
 */
function clearCache() {
  cache.clear();
}

module.exports = {
  searchPhotos,
  getCuratedPhotos,
  getBookImages,
  clearCache
};

