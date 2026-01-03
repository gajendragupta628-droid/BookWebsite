# Production Deployment Checklist

This checklist covers everything you need to do to deploy the application to production.

## 🔐 1. Environment Variables Setup

Create a `.env` file in production with the following **REQUIRED** variables:

### Critical (Must Have)
```env
# Database - Use MongoDB Atlas or your production MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bookstore?retryWrites=true&w=majority

# Session Secret - Generate a secure random string
# Run: openssl rand -hex 32
SESSION_SECRET=your_secure_random_32_character_string_here

# Environment
NODE_ENV=production
PORT=3000

# Base URL - Your production domain
BASE_URL=https://yourdomain.com
SITE_URL=https://yourdomain.com

# Store Configuration
STORE_NAME=Motivational Books
STORE_CURRENCY=Rs.
CURRENCY=Rs.

# Trust Proxy (set to true if behind nginx/reverse proxy)
TRUST_PROXY=true
```

### Recommended (For Full Functionality)
```env
# Cloudinary - For image uploads
# Sign up at https://cloudinary.com/
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMTP - For order emails
# Gmail example:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your_app_password  # Use App Password, not regular password
ADMIN_EMAIL=admin@yourdomain.com
```

### Optional
```env
# Google OAuth (for customer Google sign-in)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback

# Pexels API (for book cover images)
PEXELS_API_KEY=your_pexels_api_key
```

## 🗄️ 2. Database Setup

### Option A: MongoDB Atlas (Recommended)
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster (M0 tier available)
3. Create a database user
4. Whitelist your server IP (or 0.0.0.0/0 for all IPs - less secure)
5. Get connection string and add to `MONGODB_URI`

### Option B: Self-Hosted MongoDB
1. Install MongoDB on your server
2. Configure authentication
3. Set up firewall rules
4. Use connection string: `mongodb://username:password@host:27017/bookstore`

## 📦 3. Cloudinary Setup (For Image Uploads)

1. **Sign up**: https://cloudinary.com/users/register/free
2. **Get credentials**: Dashboard → Settings → Product Environment Credentials
3. **Add to .env**:
   - Cloud Name
   - API Key
   - API Secret

**Why needed**: Admin panel image uploads require Cloudinary. Without it, book image uploads will fail.

## 📧 4. Email Configuration (SMTP)

### Option A: Gmail (Easiest)
1. Enable 2-factor authentication on your Gmail account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use App Password (not your regular password) in `SMTP_PASS`

### Option B: SendGrid (Recommended for Production)
1. Sign up: https://sendgrid.com/
2. Verify your domain
3. Create API key
4. Use SMTP settings:
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your_sendgrid_api_key
   ```

### Option C: AWS SES, Mailgun, etc.
- Follow provider-specific setup instructions

**Why needed**: Order confirmations and admin notifications require email.

## 🌐 5. Domain & SSL Certificate

1. **Purchase domain** (if you don't have one)
2. **Point DNS** to your server IP
3. **Set up SSL certificate**:
   - **Option A**: Use Let's Encrypt (free) with Certbot
   - **Option B**: Use your hosting provider's SSL
   - **Option C**: Use Cloudflare (free SSL)

**Important**: The app requires HTTPS in production for secure cookies and OAuth.

## 🚀 6. Server Setup

### Minimum Requirements
- **Node.js**: Version 20 or higher
- **RAM**: At least 512MB (1GB recommended)
- **Storage**: At least 1GB free space
- **OS**: Linux (Ubuntu 20.04+ recommended)

### Server Software
1. **Install Node.js 20+**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Install PM2** (Process Manager):
   ```bash
   sudo npm install -g pm2
   ```

3. **Install Nginx** (Reverse Proxy):
   ```bash
   sudo apt-get install nginx
   ```

## 📁 7. Application Deployment

### Step 1: Upload Code
```bash
# Clone or upload your code to server
git clone your-repo-url /var/www/bookstore
cd /var/www/bookstore
```

### Step 2: Install Dependencies
```bash
npm install --production
npm run build:css
```

### Step 3: Create Production .env
```bash
# Copy and edit environment file
cp env.example .env
nano .env  # Add all your production values
```

### Step 4: Create Admin User
```bash
npm run create-admin-quick admin@yourdomain.com SecurePassword123!
```

### Step 5: Start with PM2
```bash
pm2 start src/server.js --name bookstore
pm2 save
pm2 startup  # Follow instructions to enable auto-start
```

## 🔒 8. Security Checklist

- [ ] **Change default SESSION_SECRET** (never use 'change_me')
- [ ] **Use strong MongoDB password**
- [ ] **Enable firewall** (only allow ports 22, 80, 443)
- [ ] **Set up fail2ban** (protect against brute force)
- [ ] **Keep Node.js updated**
- [ ] **Use HTTPS only** (redirect HTTP to HTTPS)
- [ ] **Set secure cookie flags** (already configured in code)
- [ ] **Regular backups** of MongoDB database
- [ ] **Limit admin access** (only create necessary admin users)

## 🌍 9. Nginx Configuration

Create `/etc/nginx/sites-available/bookstore`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Proxy to Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files (optional - can serve directly from Node.js)
    location /public {
        proxy_pass http://localhost:3000;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/bookstore /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 📊 10. Monitoring & Maintenance

### Set Up Monitoring
1. **PM2 Monitoring**:
   ```bash
   pm2 monit
   pm2 logs bookstore
   ```

2. **Uptime Monitoring**: Use services like:
   - UptimeRobot (free)
   - Pingdom
   - StatusCake

3. **Error Tracking** (Optional):
   - Sentry
   - Rollbar
   - LogRocket

### Regular Maintenance Tasks
- [ ] **Backup database** daily (automate with cron)
- [ ] **Monitor disk space**
- [ ] **Check application logs** regularly
- [ ] **Update dependencies** monthly: `npm audit` and `npm update`
- [ ] **Review admin user list** periodically

## 🧪 11. Pre-Launch Testing

Before going live, test:

- [ ] **Admin login** works
- [ ] **Create a test book** with images
- [ ] **Place a test order** (use test payment if available)
- [ ] **Check email notifications** are sent
- [ ] **Test on mobile devices**
- [ ] **Verify HTTPS** is working
- [ ] **Check all admin features**:
  - Books management
  - Orders management
  - Categories/Authors
  - Banners/Discounts
  - Home settings
  - Settings page
  - Admin user management

## 📝 12. Post-Deployment

### Immediate Actions
1. **Create your first admin user** (if not done)
2. **Add your first books** to the catalog
3. **Configure homepage sections** in Home Settings
4. **Set up banners** for promotions
5. **Test the complete order flow**

### Documentation
- [ ] Document admin credentials securely
- [ ] Save backup of `.env` file securely
- [ ] Document database backup/restore process
- [ ] Create runbook for common issues

## 🆘 13. Support & Troubleshooting

### Common Issues

**App won't start:**
- Check environment variables are set correctly
- Verify MongoDB connection
- Check logs: `pm2 logs bookstore`

**Images not uploading:**
- Verify Cloudinary credentials
- Check Cloudinary dashboard for errors

**Emails not sending:**
- Verify SMTP credentials
- Check spam folder
- Test SMTP connection

**Database connection fails:**
- Check MongoDB URI format
- Verify network connectivity
- Check firewall rules

### Getting Help
- Check application logs: `pm2 logs bookstore`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Check MongoDB logs
- Review error messages in admin panel

## ✅ Final Checklist

Before announcing your site is live:

- [ ] All environment variables configured
- [ ] Database connected and tested
- [ ] Cloudinary configured and tested
- [ ] Email configured and tested
- [ ] SSL certificate installed
- [ ] Domain pointing correctly
- [ ] Admin user created
- [ ] Test order completed successfully
- [ ] All admin features tested
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Security measures in place

## 🎉 You're Ready!

Once all items above are checked, your application is production-ready!

**Important Reminders:**
- Never commit `.env` file to git
- Keep admin credentials secure
- Regular backups are essential
- Monitor your application regularly
- Keep dependencies updated

Good luck with your launch! 🚀

