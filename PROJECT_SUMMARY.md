# 📚 Motivational Books - Complete E-Commerce Platform

## 🎉 Project Overview

A full-stack, production-ready e-commerce platform for selling motivational and self-help books. Built with Node.js, Express, MongoDB, and EJS, featuring a comprehensive admin dashboard for complete business management.

## ✨ Key Features

### 🛍️ Customer-Facing Store
- **Modern, responsive design** with Tailwind CSS
- **Product catalog** with search, filters, and categories
- **Shopping cart** with session persistence
- **Secure checkout** with order tracking
- **User authentication** (Email + Google OAuth)
- **Wishlist functionality**
- **SEO optimized** pages
- **Mobile-first** responsive design
- **Hero banners** with Pexels integration

### 🎛️ Admin Dashboard
- **Premium dark theme** UI
- **Mobile-responsive** design
- **Real-time statistics** and analytics
- **Comprehensive book management**
  - Advanced 5-tab form (Basic, Details, Pricing, Images, SEO)
  - Bulk upload via CSV/Excel
  - Stock management with alerts
  - Category and author linking
- **Order management**
  - Status tracking and updates
  - Customer information display
  - Order timeline visualization
  - CSV export functionality
- **Interactive features**
  - Toast notifications
  - Auto-save drafts
  - Form validation
  - Keyboard shortcuts
  - Search debouncing
  - Loading states
- **Secure authentication**
  - Session-based login
  - CSRF protection
  - Rate limiting

## 🏗️ Technology Stack

### Backend
- **Runtime**: Node.js (v20+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Template Engine**: EJS
- **Session Store**: connect-mongo
- **Authentication**: Passport.js (Local + Google OAuth)
- **Security**: Helmet, CSRF, bcrypt
- **File Upload**: Multer
- **Image Processing**: Sharp
- **Email**: Nodemailer
- **Logging**: Pino

### Frontend
- **CSS Framework**: Tailwind CSS
- **CSS Custom**: Custom admin dashboard styles
- **JavaScript**: Vanilla JS (no framework dependencies)
- **Icons**: Heroicons (inline SVG)
- **Interactivity**: Alpine.js (optional)
- **Sliders**: Swiper.js

### DevOps
- **Package Manager**: npm
- **Process Manager**: Nodemon (development)
- **Environment**: dotenv
- **Testing**: Jest + Supertest
- **Build Tools**: PostCSS, Autoprefixer

## 📁 Project Structure

```
BOOK_WEB_APP/
├── src/
│   ├── config/           # Configuration files
│   │   ├── db.js         # MongoDB connection
│   │   ├── env.js        # Environment variables
│   │   ├── passport.js   # Authentication strategies
│   │   ├── security.js   # Helmet configuration
│   │   └── session.js    # Session configuration
│   │
│   ├── controllers/      # Request handlers
│   │   ├── adminAuthController.js
│   │   ├── adminBookController.js
│   │   ├── adminOrderController.js
│   │   ├── authController.js
│   │   ├── cartController.js
│   │   ├── catalogController.js
│   │   ├── checkoutController.js
│   │   └── wishlistController.js
│   │
│   ├── middlewares/      # Custom middleware
│   │   ├── auth.js       # Authentication checks
│   │   ├── csrf.js       # CSRF token handling
│   │   ├── errorHandler.js
│   │   ├── notFound.js
│   │   └── rateLimit.js
│   │
│   ├── models/           # Database schemas
│   │   ├── AdminUser.js
│   │   ├── Author.js
│   │   ├── Banner.js
│   │   ├── Book.js
│   │   ├── Category.js
│   │   ├── Discount.js
│   │   ├── Order.js
│   │   └── User.js
│   │
│   ├── routes/           # Route definitions
│   │   ├── admin.*.routes.js  # Admin routes
│   │   ├── auth.routes.js
│   │   ├── cart.routes.js
│   │   ├── catalog.routes.js
│   │   ├── checkout.routes.js
│   │   ├── site.routes.js
│   │   └── wishlist.routes.js
│   │
│   ├── services/         # Business logic
│   │   ├── adminService.js
│   │   ├── bookService.js
│   │   ├── catalogService.js
│   │   ├── orderService.js
│   │   ├── pexelsService.js
│   │   └── uploadService.js
│   │
│   ├── utils/            # Utility functions
│   │   ├── csv.js
│   │   ├── email.js
│   │   ├── image.js
│   │   ├── pagination.js
│   │   ├── price.js
│   │   ├── seo.js
│   │   ├── slugify.js
│   │   └── validators.js
│   │
│   ├── views/            # EJS templates
│   │   ├── layouts/      # Page layouts
│   │   ├── partials/     # Reusable components
│   │   ├── admin/        # Admin dashboard views
│   │   ├── emails/       # Email templates
│   │   └── site/         # Customer-facing views
│   │
│   ├── public/           # Static assets
│   │   ├── css/
│   │   │   ├── app.css           # Compiled Tailwind
│   │   │   ├── admin.css         # Admin dashboard styles
│   │   │   ├── mobile-enhancements.css
│   │   │   └── tailwind.css      # Tailwind source
│   │   ├── js/
│   │   │   ├── admin.js          # Admin interactivity
│   │   │   ├── app.js
│   │   │   ├── cart.js
│   │   │   ├── filters.js
│   │   │   ├── uploader.js
│   │   │   └── wishlist.js
│   │   ├── assets/images/
│   │   └── uploads/
│   │
│   └── server.js         # Application entry point
│
├── scripts/              # Utility scripts
│   ├── create-admin.js   # Create admin user
│   ├── seed.js           # Database seeding
│   ├── gen-sitemap.js    # Generate sitemap
│   ├── build-assets.js   # Asset pipeline
│   └── export-orders-csv.js
│
├── tests/                # Test files
│   └── app.test.js
│
├── .env.example          # Environment template
├── package.json          # Dependencies
├── tailwind.config.cjs   # Tailwind configuration
├── postcss.config.cjs    # PostCSS configuration
├── jest.config.cjs       # Jest configuration
├── docker-compose.yml    # Docker setup
└── Dockerfile            # Container definition
```

## 🚀 Getting Started

### 1. Prerequisites
```bash
node --version  # Should be v20 or higher
mongod --version  # MongoDB should be installed
```

### 2. Installation
```bash
# Clone repository
git clone <repository-url>
cd BOOK_WEB_APP

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Build CSS
npm run build:css
```

### 3. Create Admin User
```bash
npm run create-admin
# Follow prompts to create admin account
```

### 4. (Optional) Seed Sample Data
```bash
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
```

### 6. Access the Application
- **Customer Store**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin/login

## 📊 Admin Dashboard Features

### Dashboard Overview
- Orders today count
- Revenue today
- Low stock alerts
- Total books count
- Latest 10 orders table
- Quick action buttons

### Book Management
- **List View**: Search, filter, bulk upload
- **Create/Edit**: 5-tab advanced form
  1. Basic Info (title, category, authors, description)
  2. Details (publisher, ISBN, pages, language, binding)
  3. Pricing & Stock (prices, quantities, thresholds)
  4. Images (upload, preview, URL input)
  5. SEO (meta title, description, slug)
- **Stock Alerts**: Color-coded badges (green/warning/danger)
- **Bulk Upload**: CSV/Excel support

### Order Management
- **List View**: Filter by status, search by phone
- **Detail View**: 
  - Customer information
  - Order items table
  - Status timeline
  - Update order status
- **Export**: CSV download for reporting
- **Statuses**: New, Confirmed, Packed, Shipped, Delivered, Cancelled, Returned

### Interactive Features
- Toast notifications
- Auto-save form drafts
- Real-time form validation
- Image upload preview
- Character counters
- Keyboard shortcuts
- Search debouncing
- Loading states
- Smooth animations

## 🔐 Security Features

- **CSRF Protection**: All forms include CSRF tokens
- **Rate Limiting**: Login attempts limited
- **Password Hashing**: bcrypt with salt rounds
- **Session Security**: HTTP-only cookies, secure in production
- **Input Validation**: Server-side validation on all inputs
- **XSS Prevention**: Helmet.js security headers
- **SQL Injection Prevention**: Mongoose parameterized queries
- **Content Security Policy**: Configured via Helmet

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px  
- **Desktop**: > 1024px

### Mobile Features
- Touch-optimized navigation
- Collapsible sidebar with overlay
- Stacked layouts
- Horizontal scroll tables
- Mobile-first CSS approach
- Touch gestures support

## 🎨 Design System

### Colors (Admin)
- Primary: #f59e0b (Gold)
- Success: #10b981 (Green)
- Warning: #f59e0b (Orange)
- Danger: #ef4444 (Red)
- Info: #3b82f6 (Blue)
- Background: #0a0a0a (Dark)
- Card: #1a1a1a (Dark Gray)

### Typography
- System font stack for performance
- Font sizes: 0.75rem - 2rem
- Font weights: 400, 600, 700

### Spacing
- Based on 0.25rem (4px) increments
- Consistent padding/margins

## 📝 Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/bookstore

# Session
SESSION_SECRET=your-secret-key-here

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Pexels (optional)
PEXELS_API_KEY=your-pexels-api-key

# Store
STORE_NAME=Motivational Books
STORE_CURRENCY=USD
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

## 🏭 Production Deployment

### Build for Production
```bash
# Build CSS
npm run build:css

# Build all assets
npm run build
```

### Start Production Server
```bash
NODE_ENV=production npm start
```

### Docker Deployment
```bash
# Build image
docker build -t bookstore .

# Run container
docker-compose up -d
```

## 📚 Documentation

- **Admin Quick Start**: `ADMIN_QUICK_START.md`
- **Admin Complete Guide**: `ADMIN_DASHBOARD_COMPLETE.md`
- **Setup Guides**: Various `*_SETUP*.md` files
- **API Documentation**: Inline in route files

## 🛠️ Available Scripts

```bash
npm run dev              # Start development server
npm run start            # Start production server
npm run build:css        # Build Tailwind CSS
npm run build            # Build all assets
npm run create-admin     # Create admin user
npm run seed             # Seed database
npm run sitemap          # Generate sitemap
npm test                 # Run tests
```

## 🎯 Key Achievements

✅ **Complete E-Commerce Platform**
- Customer store with cart and checkout
- User authentication (email + Google)
- Order processing and tracking

✅ **Premium Admin Dashboard**
- Mobile-first responsive design
- Real-time statistics
- Advanced book management
- Comprehensive order management

✅ **Production-Ready Code**
- Security best practices
- Error handling
- Input validation
- Rate limiting
- CSRF protection

✅ **Developer-Friendly**
- Well-organized structure
- Extensive documentation
- Helper scripts
- Environment configuration

✅ **Performance Optimized**
- Minimal dependencies
- Efficient database queries
- Image optimization
- CSS/JS minification

## 📈 Future Enhancements

Potential additions:
- [ ] Customer reviews and ratings
- [ ] Wishlist sharing
- [ ] Advanced analytics dashboard
- [ ] Multi-currency support
- [ ] Inventory management
- [ ] Customer relationship management
- [ ] Email marketing integration
- [ ] Advanced search with filters
- [ ] Product recommendations
- [ ] Loyalty programs

## 📄 License

Private project - All rights reserved

## 🙏 Credits

- **Framework**: Express.js
- **Database**: MongoDB
- **UI**: Tailwind CSS + Custom Admin CSS
- **Icons**: Heroicons
- **Images**: Pexels API

---

## 🎉 Status: Production Ready ✅

All features are complete, tested, and ready for deployment!

**Last Updated**: October 14, 2025

