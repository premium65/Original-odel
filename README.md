# ODEL ADS Platform 🎯

A comprehensive full-stack advertising platform where users earn money by clicking/watching ads. Features include user registration, ad management, VIP rewards system, and admin panel.

## 📍 Where to Run Commands

**IMPORTANT:** All commands should be run from the **project root directory**:

```bash
# Navigate to project root (where package.json is located)
cd /path/to/Original-odel

# Then run commands like:
npm run dev
```

### How to Find Project Root

The project root is the directory containing these files:
```
Original-odel/
├── package.json          ← You should be here!
├── server/
├── client/
├── shared/
└── README.md (this file)
```

**Quick Check:**
```bash
# Verify you're in the right place
ls package.json
# Should show: package.json

pwd
# Should show: /path/to/Original-odel
```

## 🚀 Quick Start

### 1. Prerequisites

Before running the project, ensure you have:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Terminal/Command Prompt** access

**Verify installations:**
```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
```

### 2. Installation

**Step 1:** Clone the repository (if you haven't already)
```bash
git clone https://github.com/premium65/Original-odel.git
cd Original-odel
```

**Step 2:** Install dependencies
```bash
npm install
```

This will install all required packages. Wait for it to complete (may take 2-5 minutes).

### 3. Start Development Server

```bash
npm run dev
```

**Expected output:**
```
> rest-express@1.0.0 dev
> cross-env NODE_ENV=development tsx server/index-dev.ts

Server running at http://localhost:5000
```

**✅ Success!** Your server is now running.

### 4. Access the Application

Open your web browser and navigate to:

**Main Application:**
- Home Page: http://localhost:5000
- User Login: http://localhost:5000/auth

**Admin Panel:**
- Admin Login: http://localhost:5000/admin-login
- Default credentials:
  - Username: `admin`
  - Password: `admin123`

**View Ads:**
- Admin Ads Management: http://localhost:5000/admin/ads
- User Ads Hub: http://localhost:5000/ads-hub

### 5. What You'll See

**27 Sample Ads Already Loaded!** 🎉

The platform comes with 27 pre-loaded sample ads across 6 categories:
- 📱 Electronics (5 ads)
- 👟 Fashion (6 ads)  
- 🏠 Home & Garden (5 ads)
- ⚽ Sports (4 ads)
- 💄 Beauty (4 ads)
- 🍫 Food & Beverage (3 ads)

**No database setup required** - ads load automatically from in-memory storage!

## 📁 Project Structure

```
Original-odel/
├── 📦 package.json           # Project dependencies and scripts
├── 📄 README.md              # This file - start here!
│
├── 🖥️  server/                # Backend (Express.js)
│   ├── index-dev.ts          # Development server entry
│   ├── index-prod.ts         # Production server entry
│   ├── routes.ts             # Main API routes
│   ├── memStorage.ts         # In-memory storage (27 ads here!)
│   ├── seed-ads.ts           # Database seed script
│   └── routes/admin/         # Admin API routes
│
├── 🌐 client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── App.tsx           # Main app component
│   │   ├── pages/            # All page components
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/            # Custom React hooks
│   │   └── lib/              # Utilities and API client
│   └── index.html
│
├── 🔄 shared/                 # Shared code (client + server)
│   ├── schema.ts             # Database schema
│   └── models/               # Data models
│
├── 📚 Documentation/
│   ├── QUICK_START_ADS.md    # Quick guide for ads
│   ├── ADS_VISUAL_PREVIEW.md # Complete ads catalog
│   ├── CLAUDE.md             # AI assistant guide
│   └── [other guides]
│
└── ⚙️  Configuration Files
    ├── tsconfig.json         # TypeScript config
    ├── vite.config.ts        # Vite build config
    ├── tailwind.config.ts    # Tailwind CSS config
    └── .env.example          # Environment variables template
```

## 📝 Available Commands

Run these from the **project root** directory:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (http://localhost:5000) |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run check` | Type check TypeScript |
| `npm run seed:ads` | Seed database with 27 ads (optional) |

## 🔧 Configuration

### Environment Variables (Optional)

For full database functionality, create a `.env` file:

```bash
# Copy example file
cp .env.example .env

# Edit .env and add your database URL
DATABASE_URL=postgresql://...
SESSION_SECRET=your-secret-key
```

**Note:** The app works without a database using in-memory storage!

### Default Settings

- **Port:** 5000
- **Storage:** In-memory (27 ads pre-loaded)
- **Admin Credentials:** admin / admin123
- **Ad Reward:** 101.75 LKR per click

## 🎯 Common Use Cases

### Access Admin Panel

```bash
# 1. Start server
npm run dev

# 2. Open browser to:
http://localhost:5000/admin-login

# 3. Login with:
Username: admin
Password: admin123

# 4. Navigate to Ads:
Click "Ads" in admin menu
```

### View Sample Ads

```bash
# Ads are automatically loaded!
# Just start the server and go to:
http://localhost:5000/admin/ads
```

### Add More Ads

1. Go to: http://localhost:5000/admin/ads
2. Click "Add New Ad" button
3. Fill in: Title, Description, Price, Image URL
4. Click "Save"

### Customize Existing Ads

Edit `server/memStorage.ts` and modify the `inMemoryAds` array:

```typescript
{
  id: 1,
  title: "Your Product Name",
  description: "Your description",
  imageUrl: "https://your-image-url.com/image.jpg",
  price: "99000",  // In LKR
  reward: "990",   // Usually 1% of price
  // ... other fields
}
```

## 🐛 Troubleshooting

### "npm: command not found"

**Solution:** Install Node.js from https://nodejs.org/

### "Cannot find module..."

**Solution:** Install dependencies
```bash
npm install
```

### "Port 5000 already in use"

**Solution:** Kill the process using port 5000
```bash
# On Linux/Mac:
lsof -ti:5000 | xargs kill -9

# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

### "I don't see any ads"

**Solution:** Ads load automatically! Check:
1. Server is running (`npm run dev`)
2. Navigate to http://localhost:5000/admin/ads
3. Login to admin panel first
4. Check console for errors

### "Where do I run npm run dev?"

**Solution:** Run it from the project root directory where `package.json` is located:

```bash
# Method 1: Navigate to project
cd /path/to/Original-odel
npm run dev

# Method 2: Check you're in the right place
pwd                    # Should show: .../Original-odel
ls package.json        # Should exist
npm run dev            # Now run the command
```

**Visual Guide:**
```
YOUR COMPUTER
└── Documents/
    └── Projects/
        └── Original-odel/    ← YOU ARE HERE (project root)
            ├── package.json  ← This file must be present
            ├── server/
            ├── client/
            └── [run commands here]
```

### Still having issues?

1. Check Node.js version: `node --version` (need v18+)
2. Clear npm cache: `npm cache clean --force`
3. Delete and reinstall: `rm -rf node_modules package-lock.json && npm install`
4. Check documentation in `QUICK_START_ADS.md`

## 📖 Documentation

- **Quick Start for Ads:** [QUICK_START_ADS.md](QUICK_START_ADS.md)
- **Visual Ads Catalog:** [ADS_VISUAL_PREVIEW.md](ADS_VISUAL_PREVIEW.md)
- **Technical Setup:** [server/SEED_ADS_README.md](server/SEED_ADS_README.md)
- **AI Assistant Guide:** [CLAUDE.md](CLAUDE.md)
- **Complete System Guide:** [FULL_SYSTEM_GUIDE.md](FULL_SYSTEM_GUIDE.md)

## 🎨 Features

### User Features
- ✅ User registration and login
- ✅ Click ads to earn money (101.75 LKR per ad)
- ✅ 25,000 LKR welcome bonus
- ✅ Withdrawal requests (28 ads minimum)
- ✅ VIP rewards system with tiers
- ✅ Promotional events
- ✅ Account status tracking

### Admin Features
- ✅ User management (approve, freeze, edit)
- ✅ Ads management (CRUD operations)
- ✅ Withdrawal approvals
- ✅ Manual deposits
- ✅ Premium plan management
- ✅ Content management system
- ✅ Dashboard analytics

### Technical Features
- ✅ Full-stack TypeScript
- ✅ React + Vite frontend
- ✅ Express.js backend
- ✅ PostgreSQL database (optional)
- ✅ In-memory fallback storage
- ✅ 27 pre-loaded sample ads
- ✅ Responsive UI with Tailwind CSS
- ✅ Authentication & sessions

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production

**Build:**
```bash
npm run build
```

**Start:**
```bash
npm start
```

**Deploy to platforms:**
- Replit (primary)
- Heroku
- Railway
- DigitalOcean
- AWS/Azure/GCP

See deployment guides in documentation folder.

## 📊 Statistics

- **27 Sample Ads** pre-loaded
- **6 Product Categories**
- **Price Range:** LKR 6,500 - 2,850,000
- **Total Rewards:** ~LKR 49,545
- **60+ Admin Features**
- **15+ User Pages**

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 💡 Support

For questions or issues:
1. Check the documentation files
2. Review troubleshooting section above
3. Check existing GitHub issues
4. Create a new issue with details

## 🎉 Getting Started Checklist

- [ ] Install Node.js (v18+)
- [ ] Clone repository
- [ ] Navigate to project root (`cd Original-odel`)
- [ ] Install dependencies (`npm install`)
- [ ] Start dev server (`npm run dev`)
- [ ] Open browser to http://localhost:5000
- [ ] Login to admin panel (admin / admin123)
- [ ] View 27 sample ads at /admin/ads
- [ ] Explore and customize!

---

**Need Help?** All commands run from the project root where `package.json` is located. Start with `npm run dev` and access http://localhost:5000/admin-login to begin! 🚀
