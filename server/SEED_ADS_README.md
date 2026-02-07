# Seed Ads Script - Usage Guide

## Overview
This directory contains scripts to populate the database with 27 sample ads across various product categories.

## What's Included

### 27 Sample Ads
The sample ads are organized into 6 categories:

1. **Electronics (5 ads)**: iPhone, Samsung Galaxy, Dell Laptop, Sony Headphones, Canon Camera
2. **Fashion (6 ads)**: Nike Shoes, Rolex Watch, Levi's Jeans, Ray-Ban Sunglasses, LV Bag, North Face Jacket
3. **Home & Garden (5 ads)**: IKEA Chair, Dyson Vacuum, Bed Sheets, KitchenAid Mixer, Smart Lights
4. **Sports (4 ads)**: Badminton Racket, Running Shoes, Basketball, Yoga Mat
5. **Beauty (4 ads)**: La Mer Cream, MAC Lipstick, Chanel Perfume, Dyson Airwrap
6. **Food & Beverage (3 ads)**: Nespresso Machine, Godiva Chocolate, Dom Pérignon Champagne

### Features
- Realistic product titles and descriptions
- Professional product images from Unsplash
- Prices in LKR (Sri Lankan Rupees): 6,500 - 2,850,000
- Reward values (typically 1% of price)
- All ads set to active by default
- 30-second duration for each ad

## Usage Options

### Option 1: In-Memory Storage (Instant - No Database Needed)
The 27 sample ads are **automatically loaded** into `inMemoryAds` array in `server/memStorage.ts`.

**How it works:**
- When the server starts without a database connection
- The admin ads management panel will show all 27 ads immediately
- No action required!

**To verify:**
1. Start the server: `npm run dev`
2. Login to admin panel
3. Navigate to Admin → Ads
4. You should see all 27 ads

### Option 2: Database Seeding (Persistent Storage)
Use the seed script to insert ads into your PostgreSQL database.

**Prerequisites:**
- PostgreSQL database configured
- `DATABASE_URL` environment variable set
- Database migrations run

**Run the seed script:**
```bash
# From the root directory
npm run seed:ads

# Or run directly with ts-node
npx ts-node server/seed-ads.ts

# Or with tsx
npx tsx server/seed-ads.ts
```

**Output:**
```
🌱 Starting to seed ads...
✅ Added: Apple iPhone 15 Pro Max (ID: 1)
✅ Added: Samsung Galaxy S24 Ultra (ID: 2)
...
✅ Added: Dom Pérignon Vintage Champagne (ID: 27)

🎉 Seeding complete!
📊 Total ads attempted: 27
✨ Done!
```

## Customization

### Modify Ads
Edit `server/seed-ads.ts` or `server/memStorage.ts` to:
- Change product names or descriptions
- Update prices or rewards
- Replace images with your own URLs
- Add more ads
- Change categories

### Image Sources
All images use Unsplash URLs. You can:
- Use different Unsplash images: `https://images.unsplash.com/photo-[PHOTO_ID]?w=800`
- Upload your own images and update `imageUrl` fields
- Use placeholder services like Placeholder.com

### Price Format
Prices are stored as strings in decimal format:
```typescript
price: "385000"  // LKR 385,000.00
reward: "3850"   // LKR 3,850.00 (typically 1% of price)
```

## Troubleshooting

### "Database not connected" Error
```
❌ Database not connected. Cannot seed ads.
💡 Tip: Make sure DATABASE_URL is set in environment variables.
```
**Solution:** Check that your `.env` file has a valid `DATABASE_URL`.

### Ads Not Showing in Admin Panel
1. Check if database is connected: Look for logs on server start
2. Check if in-memory storage is being used: You should see "Using in-memory storage"
3. Verify admin authentication: Make sure you're logged in as admin
4. Clear browser cache and refresh

### Duplicate Ads
If you run the seed script multiple times, you'll get duplicate ads. To avoid this:
1. Clear existing ads from database first
2. Or modify the script to check for existing ads before inserting

## Integration with Admin Panel

The admin panel (`/admin/ads`) automatically displays ads from:
1. Database (if connected)
2. In-memory storage (if database unavailable)

Both sources work seamlessly with the same admin UI, allowing you to:
- View all ads in a list
- Edit ad details
- Toggle active status
- Delete ads
- Add new ads

## Technical Details

### Database Schema
```typescript
{
  id: serial (auto-increment)
  title: text (required)
  description: text (required)
  imageUrl: text (required)
  targetUrl: text (required)
  price: decimal(10, 2) (required)
  reward: decimal(10, 2)
  type: text (default: "click")
  duration: integer (default: 30)
  totalViews: integer (default: 0)
  isActive: boolean (default: true)
  createdAt: timestamp (auto)
}
```

### In-Memory Storage Structure
Same structure as database schema, with:
- Manual ID assignment (1-27)
- Date objects for `createdAt`
- All fields pre-populated

## Next Steps

After seeding:
1. ✅ View ads in Admin → Ads panel
2. ✅ Edit ads as needed
3. ✅ Users can see active ads in Ads Hub
4. ✅ Users can click ads to earn rewards
5. ✅ Track ad performance in admin panel

## Support

For issues or questions:
- Check logs in terminal/console
- Verify database connection
- Review code in `server/seed-ads.ts` and `server/memStorage.ts`
- Ensure environment variables are set correctly
