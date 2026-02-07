# Quick Start: 27 Sample Ads Added ✅

> **📍 WHERE TO RUN COMMANDS:** All commands below should be run from the **project root directory** (where `package.json` is located). See [README.md](README.md) for detailed setup instructions.

## What Was Added

**27 diverse product ads** across 6 categories are now available in your ODEL ADS platform!

## Instant Access (No Setup Required!)

The ads are **pre-loaded** and ready to use:

```bash
# IMPORTANT: Navigate to project root first!
cd /path/to/Original-odel

# Verify you're in the right place
ls package.json    # Should show: package.json

# 1. Start your development server
npm run dev

# 2. Open your browser
http://localhost:5000

# 3. Login to admin panel
http://localhost:5000/admin-login

# 4. Navigate to Ads
Click "Admin" → "Ads" in the menu

# 5. See all 27 ads immediately!
No database setup needed - they're already there!
```

**Need help finding the project root?** See the [Where to Run Commands](README.md#-where-to-run-commands) section in README.md

## What You'll See

### In Admin Panel (`/admin/ads`)

**27 Product Ads Including:**
- 📱 Apple iPhone 15 Pro Max (LKR 385,000)
- 🎧 Sony WH-1000XM5 Headphones (LKR 95,000)
- 💻 Dell XPS 15 Laptop (LKR 425,000)
- 👟 Nike Air Jordan 1 (LKR 45,000)
- ⌚ Rolex Submariner (LKR 2,850,000)
- 🪑 IKEA POÄNG Chair (LKR 25,000)
- 🏀 Wilson Basketball (LKR 12,000)
- 💄 MAC Ruby Woo Lipstick (LKR 6,500)
- ☕ Nespresso Coffee Machine (LKR 45,000)
- ...and 18 more!

### Admin Features Available

✅ **View** all 27 ads in scrollable list
✅ **Edit** any ad (title, description, price, image)
✅ **Delete** ads you don't want
✅ **Add** new ads using the same format
✅ **Toggle** active/inactive status
✅ **Preview** how ads appear to users

## Categories

| Category | Count | Examples |
|----------|-------|----------|
| Electronics | 5 | iPhone, Samsung, Dell, Sony, Canon |
| Fashion | 6 | Nike, Rolex, Levi's, Ray-Ban, LV |
| Home & Garden | 5 | IKEA, Dyson, Sheets, Mixer, Lights |
| Sports | 4 | Racket, Running Shoes, Basketball, Yoga Mat |
| Beauty | 4 | La Mer, MAC, Chanel, Dyson Airwrap |
| Food & Drink | 3 | Nespresso, Godiva, Champagne |

## Pricing

- **Lowest**: LKR 6,500 (Lipstick)
- **Highest**: LKR 2,850,000 (Rolex)
- **Average**: ~LKR 183,500
- **Rewards**: ~1% of price

## For Database Users

If you want these ads in your PostgreSQL database permanently:

```bash
npm run seed:ads
```

This will insert all 27 ads into your database.

## Need Help?

**📖 Detailed Documentation:**
- `server/SEED_ADS_README.md` - Full technical guide
- `ADS_VISUAL_PREVIEW.md` - Complete catalog with images

**🔧 Customization:**
- Edit `server/memStorage.ts` to modify ads
- All images from Unsplash (free to use)
- Prices in LKR (Sri Lankan Rupees)

**❓ Questions:**
- Check the README files
- All ads are fully editable
- Add unlimited more ads

## Files Added/Modified

1. ✅ `server/memStorage.ts` - 27 ads pre-loaded
2. ✅ `server/seed-ads.ts` - Database seeding script
3. ✅ `server/SEED_ADS_README.md` - Technical docs
4. ✅ `ADS_VISUAL_PREVIEW.md` - Visual catalog
5. ✅ `package.json` - Added `seed:ads` script

## That's It!

Your platform now has 27 professional sample ads ready to demonstrate. Just start the server and they'll be there! 🎉

---

**Need to customize?** Edit the files above.
**Need more ads?** Copy the existing format.
**Need help?** Check the README files.
