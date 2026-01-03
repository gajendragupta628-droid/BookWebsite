const mongoose = require('mongoose');
const HomePageSection = require('../models/HomePageSection');
const Book = require('../models/Book');

exports.getSettings = async (req, res) => {
  try {
    // Get or create sections
    const sectionIds = ['bestSellers', 'newArrivals', 'bookshelf', 'promo', 'featured', 'recommendations'];
    const sections = await Promise.all(
      sectionIds.map(async (sectionId) => {
        let section = await HomePageSection.findOne({ sectionId });
        if (!section) {
          const defaultDisplayLimits = {
            bestSellers: 8,
            newArrivals: 12,
            bookshelf: 12,
            promo: 6,
            featured: 6,
            recommendations: 12
          };
          section = await HomePageSection.create({
            sectionId,
            enabled: true,
            bookIds: [],
            displayLimit: defaultDisplayLimits[sectionId] || 8,
            title: getDefaultTitle(sectionId),
            subtitle: getDefaultSubtitle(sectionId)
          });
        }
        return section;
      })
    );

    // Populate books for each section
    const sectionsWithBooks = await Promise.all(
      sections.map(async (section) => {
        const books = await Book.find({ _id: { $in: section.bookIds } })
          .select('title slug images priceSale priceMRP')
          .lean();
        
        // Maintain order from bookIds array
        const orderedBooks = section.bookIds
          .map(id => books.find(b => b._id.toString() === id.toString()))
          .filter(Boolean);
        
        return {
          ...section.toObject(),
          books: orderedBooks
        };
      })
    );

    res.render('admin/home-settings', { sections: sectionsWithBooks });
  } catch (error) {
    console.error('Error loading home settings:', error);
    res.status(500).send('Error loading settings');
  }
};

exports.updateSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { enabled, title, subtitle, displayLimit, bookIds } = req.body;

    let section = await HomePageSection.findOne({ sectionId });
    if (!section) {
      section = await HomePageSection.create({ sectionId });
    }

    if (enabled !== undefined) section.enabled = enabled === 'true' || enabled === true;
    if (title !== undefined) section.title = title;
    if (subtitle !== undefined) section.subtitle = subtitle;
    if (displayLimit !== undefined) section.displayLimit = parseInt(displayLimit) || 8;
    if (bookIds !== undefined) {
      section.bookIds = Array.isArray(bookIds)
        ? bookIds.map((id) => {
          try {
            return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;
          } catch (_) {
            return null;
          }
        }).filter(Boolean)
        : [];
    }

    await section.save();
    res.json({ success: true, section });
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.reorderBooks = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { bookIds } = req.body;

    if (!Array.isArray(bookIds)) {
      return res.status(400).json({ success: false, error: 'bookIds must be an array' });
    }

    const section = await HomePageSection.findOne({ sectionId });
    if (!section) {
      return res.status(404).json({ success: false, error: 'Section not found' });
    }

    section.bookIds = bookIds.map(id => {
      try {
        return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
    await section.save();

    res.json({ success: true, section });
  } catch (error) {
    console.error('Error reordering books:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getBooksForSection = async (req, res) => {
  try {
    const { q, category, author, limit = 50, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    
    if (q) {
      query.$text = { $search: q };
    }
    
    if (category) {
      query.categories = category;
    }
    
    if (author) {
      query.authors = { $regex: author, $options: 'i' };
    }

    const [books, total] = await Promise.all([
      Book.find(query)
        .select('title slug images priceSale priceMRP authors categories')
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ createdAt: -1 })
        .lean(),
      Book.countDocuments(query)
    ]);

    res.json({
      success: true,
      books,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching books for section:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

function getDefaultTitle(sectionId) {
  const titles = {
    bestSellers: 'Best Sellers',
    newArrivals: 'New Arrivals',
    bookshelf: 'Thousands of Nepali Books',
    promo: 'Start Your Success Journey Today',
    featured: 'Top Personal Development Books',
    recommendations: 'Our picks for you'
  };
  return titles[sectionId] || '';
}

function getDefaultSubtitle(sectionId) {
  const subtitles = {
    bestSellers: 'Find your next great read among our best sellers',
    newArrivals: 'Explore fresh arrivals and find your next great read',
    bookshelf: 'Explore From Our Amazing Collection of',
    promo: 'Discover books by world-renowned motivational speakers and thought leaders',
    featured: 'Handpicked collection of transformative books',
    recommendations: 'We will curate special book recommendations for you based on your genre preferences'
  };
  return subtitles[sectionId] || '';
}
