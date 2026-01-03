const Book = require('../models/Book');
const Category = require('../models/Category');
const Author = require('../models/Author');
const HomePageSection = require('../models/HomePageSection');
const pexelsService = require('./pexelsService');

const homeData = async () => {
  // Get admin-configured sections
  const [bestSellersSection, newArrivalsSection, bookshelfSection, promoSection, featuredSection, recommendationsSection] = await Promise.all([
    HomePageSection.findOne({ sectionId: 'bestSellers' }),
    HomePageSection.findOne({ sectionId: 'newArrivals' }),
    HomePageSection.findOne({ sectionId: 'bookshelf' }),
    HomePageSection.findOne({ sectionId: 'promo' }),
    HomePageSection.findOne({ sectionId: 'featured' }),
    HomePageSection.findOne({ sectionId: 'recommendations' })
  ]);

  // Helper function to get books for a section
  const getSectionBooks = async (section, fallbackQuery, fallbackLimit) => {
    if (section && section.enabled && section.bookIds && section.bookIds.length > 0) {
      const books = await Book.find({ _id: { $in: section.bookIds } })
        .limit(section.displayLimit || fallbackLimit);
      // Maintain order from bookIds array
      const orderedBooks = section.bookIds
        .map(id => books.find(b => b._id.toString() === id.toString()))
        .filter(Boolean)
        .slice(0, section.displayLimit || fallbackLimit);
      return orderedBooks;
    }
    // Fallback to default query
    return Book.find(fallbackQuery).limit(fallbackLimit);
  };

  const [featured, categories, banners, newArrivals, bestSellers, topAuthors, pexelsImages] = await Promise.all([
    getSectionBooks(featuredSection, { featured: true }, 8),
    Category.find().sort({ name: 1 }).limit(12),
    require('../models/Banner').find({ active: true }).sort({ sort: 1 }).limit(5),
    getSectionBooks(newArrivalsSection, {}, 12).then(books => books.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))),
    getSectionBooks(bestSellersSection, {}, 8).then(books => books.sort((a, b) => (b.sales || 0) - (a.sales || 0))),
    Author.aggregate([
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: 'authors',
          as: 'books'
        }
      },
      {
        $addFields: {
          bookCount: { $size: '$books' }
        }
      },
      {
        $match: { bookCount: { $gt: 0 } }
      },
      {
        $sort: { bookCount: -1 }
      },
      {
        $limit: 12
      }
    ]),
    // Fetch Pexels images for different sections
    Promise.all([
      pexelsService.getBookImages('hero-banner', 1),
      pexelsService.getBookImages('used-books', 6),
      pexelsService.getBookImages('nepali-books', 6)
    ]).then(([heroBanner, usedBooks, nepaliBooks]) => {
      console.log('Pexels images fetched:', {
        heroBanner: heroBanner.length > 0 ? 'yes' : 'no',
        usedBooks: usedBooks.length,
        nepaliBooks: nepaliBooks.length
      });
      return {
        heroBanner: heroBanner[0],
        usedBooks,
        nepaliBooks
      };
    }).catch(err => {
      console.error('Error fetching Pexels images:', err.message);
      return { heroBanner: null, usedBooks: [], nepaliBooks: [] };
    })
  ]);
  
  // If no featured books, get random books from the database
  let featuredBooks = featured;
  if (!featured || featured.length === 0) {
    const totalBooks = await Book.countDocuments();
    if (totalBooks > 0) {
      // Get random books using aggregation
      featuredBooks = await Book.aggregate([
        { $sample: { size: Math.min(8, totalBooks) } }
      ]);
      console.log(`No featured books found. Showing ${featuredBooks.length} random books instead.`);
    }
  }
  
  // Get additional section data for home page
  const bookshelfBooks = await getSectionBooks(bookshelfSection, {}, 12);
  const promoBooks = await getSectionBooks(promoSection, {}, 6);
  const recommendationsBooks = await getSectionBooks(recommendationsSection, {}, 12);

  return { 
    featured: featuredBooks, 
    categories, 
    banners, 
    newArrivals, 
    bestSellers, 
    topAuthors, 
    pexelsImages,
    bookshelfBooks: bookshelfSection && bookshelfSection.enabled ? bookshelfBooks : null,
    promoBooks: promoSection && promoSection.enabled ? promoBooks : null,
    recommendationsBooks: recommendationsSection && recommendationsSection.enabled ? recommendationsBooks : null,
    // Section metadata
    bestSellersSection: bestSellersSection || { enabled: true, title: 'Best Sellers', subtitle: 'Find your next great read among our best sellers' },
    newArrivalsSection: newArrivalsSection || { enabled: true, title: 'New Arrivals', subtitle: 'Explore fresh arrivals and find your next great read' },
    bookshelfSection: bookshelfSection || { enabled: true, title: 'Thousands of Nepali Books', subtitle: 'Explore From Our Amazing Collection of' },
    promoSection: promoSection || { enabled: true, title: 'Start Your Success Journey Today', subtitle: 'Discover books by world-renowned motivational speakers' },
    featuredSection: featuredSection || { enabled: true, title: 'Top Personal Development Books', subtitle: 'Handpicked collection of transformative books' },
    recommendationsSection: recommendationsSection || { enabled: true, title: 'Our picks for you', subtitle: 'We will curate special book recommendations for you' }
  };
};

const relatedBooks = async (book) => {
  if (!book) return [];
  return Book.find({ _id: { $ne: book._id }, category: book.category }).limit(8);
};

module.exports = { homeData, relatedBooks };
