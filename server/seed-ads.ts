import { db } from "./db";
import { ads } from "@shared/schema";

const sampleAds = [
  // Electronics (5)
  {
    title: "Apple iPhone 15 Pro Max",
    description: "Latest iPhone with A17 Pro chip, titanium design, and advanced camera system. 256GB storage.",
    imageUrl: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800",
    targetUrl: "https://example.com/iphone-15",
    price: "385000",
    reward: "3850",
    type: "click",
    duration: 30,
    isActive: true
  },
  {
    title: "Samsung Galaxy S24 Ultra",
    description: "Premium Android flagship with S Pen, 200MP camera, and AI features. 512GB variant.",
    imageUrl: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800",
    targetUrl: "https://example.com/galaxy-s24",
    price: "365000",
    reward: "3650",
    type: "click",
    duration: 30,
    isActive: true
  },
  {
    title: "Dell XPS 15 Laptop",
    description: "Professional laptop with Intel i7, 32GB RAM, 1TB SSD, and stunning 4K OLED display.",
    imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800",
    targetUrl: "https://example.com/dell-xps",
    price: "425000",
    reward: "4250",
    type: "click",
    duration: 30,
    isActive: true
  },
  {
    title: "Sony WH-1000XM5 Headphones",
    description: "Industry-leading noise canceling wireless headphones with 30-hour battery life.",
    imageUrl: "https://images.unsplash.com/photo-1545127398-14699f92334b?w=800",
    targetUrl: "https://example.com/sony-headphones",
    price: "95000",
    reward: "950",
    type: "click",
    duration: 30,
    isActive: true
  },
  {
    title: "Canon EOS R6 Camera",
    description: "Full-frame mirrorless camera with 20MP sensor, 4K 60fps video, and advanced autofocus.",
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
    targetUrl: "https://example.com/canon-r6",
    price: "685000",
    reward: "6850",
    type: "click",
    duration: 30,
    isActive: true
  },
  
  // Fashion (6)
  {
    title: "Nike Air Jordan 1 Retro High",
    description: "Classic basketball sneakers in iconic Chicago colorway. Premium leather construction.",
    imageUrl: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800",
    targetUrl: "https://example.com/jordan-1",
    price: "45000",
    reward: "450",
    type: "click",
    duration: 30,
    isActive: true
  },
  {
    title: "Rolex Submariner Watch",
    description: "Luxury diving watch with automatic movement, 300m water resistance, and ceramic bezel.",
    imageUrl: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800",
    targetUrl: "https://example.com/rolex-sub",
    price: "2850000",
    reward: "28500",
    type: "click",
    duration: 30,
    isActive: true
  },
  {
    title: "Levi's 501 Original Jeans",
    description: "Classic straight fit jeans in dark wash. Made from premium denim with authentic details.",
    imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800",
    targetUrl: "https://example.com/levis-501",
    price: "12500",
    reward: "125",
    type: "click",
    duration: 30,
    isActive: true
  },
  {
    title: "Ray-Ban Aviator Sunglasses",
    description: "Iconic pilot-style sunglasses with gold frame and gradient green lenses. UV protection.",
    imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800",
    targetUrl: "https://example.com/rayban-aviator",
    price: "28000",
    reward: "280",
    type: "click",
    duration: 30,
    isActive: true
  },
  {
    title: "Louis Vuitton Neverfull Tote",
    description: "Elegant monogram canvas tote bag with leather trim. Perfect for daily use.",
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800",
    targetUrl: "https://example.com/lv-tote",
    price: "425000",
    reward: "4250",
    type: "click",
    duration: 30,
    isActive: true
  },
  {
    title: "North Face Puffer Jacket",
    description: "Warm insulated jacket with water-resistant fabric. Perfect for cold weather.",
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800",
    targetUrl: "https://example.com/northface-jacket",
    price: "38000",
    reward: "380",
    type: "click",
    duration: 30,
    isActive: true
  },
  
  // Home & Garden (5)
  {
    title: "IKEA POÄNG Armchair",
    description: "Comfortable bentwood armchair with cushion. Modern Scandinavian design.",
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
    targetUrl: "https://example.com/poang-chair",
    price: "25000",
    reward: "250",
    type: "click",
    duration: 30,
    isActive: true
  },
  {
    title: "Dyson V15 Vacuum Cleaner",
    description: "Cordless vacuum with laser dust detection and advanced filtration. 60-minute runtime.",
    imageUrl: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800",
    targetUrl: "https://example.com/dyson-v15",
    price: "185000",
    reward: "1850",
    type: "click",
    duration: 30,
    isActive: true
  },
  {
    title: "Egyptian Cotton Bed Sheets",
    description: "Luxury 800 thread count bed sheet set. Silky soft and breathable. Queen size.",
    imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
    targetUrl: "https://example.com/cotton-sheets",
    price: "18000",
    reward: "180",
    type: "click",
    duration: 30,
    isActive: true
  },
  {
    title: "KitchenAid Stand Mixer",
    description: "Professional 5-quart stand mixer with 10 speeds. Includes multiple attachments.",
    imageUrl: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800",
    targetUrl: "https://example.com/kitchenaid-mixer",
    price: "95000",
    reward: "950",
    type: "click",
    duration: 30,
    isActive: true
  },
  {
    title: "Philips Hue Smart Lights",
    description: "Color-changing LED bulb starter kit with hub. Control via app or voice.",
    imageUrl: "https://images.unsplash.com/photo-1558089687-81f50c4c2a23?w=800",
    targetUrl: "https://example.com/hue-lights",
    price: "28000",
    reward: "280",
    type: "click",
    duration: 30,
    isActive: true
  },
  
  // Sports (4)
  {
    title: "Yonex Astrox 99 Badminton Racket",
    description: "Professional badminton racket with Rotational Generator System. 4U weight.",
    imageUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800",
    targetUrl: "https://example.com/yonex-racket",
    price: "32000",
    reward: "320",
    type: "click",
    duration: 30,
    isActive: true
  },
  {
    title: "Adidas Ultraboost Running Shoes",
    description: "High-performance running shoes with Boost cushioning and Primeknit upper.",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
    targetUrl: "https://example.com/ultraboost",
    price: "35000",
    reward: "350",
    type: "click",
    duration: 30,
    isActive: true
  },
  {
    title: "Wilson Evolution Basketball",
    description: "Official size basketball with premium composite leather. Indoor use.",
    imageUrl: "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800",
    targetUrl: "https://example.com/wilson-ball",
    price: "12000",
    reward: "120",
    type: "click",
    duration: 30,
    isActive: true
  },
  {
    title: "Manduka PRO Yoga Mat",
    description: "Professional 6mm thick yoga mat with lifetime guarantee. Non-slip surface.",
    imageUrl: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800",
    targetUrl: "https://example.com/manduka-mat",
    price: "22000",
    reward: "220",
    type: "click",
    duration: 30,
    isActive: true
  },
  
  // Beauty (4)
  {
    title: "La Mer Crème de la Mer",
    description: "Luxurious moisturizing cream with Miracle Broth. 100ml jar.",
    imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800",
    targetUrl: "https://example.com/lamer-cream",
    price: "85000",
    reward: "850",
    type: "click",
    duration: 30,
    isActive: true
  },
  {
    title: "MAC Ruby Woo Lipstick",
    description: "Iconic matte red lipstick with retro matte finish. Long-lasting formula.",
    imageUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800",
    targetUrl: "https://example.com/mac-lipstick",
    price: "6500",
    reward: "65",
    type: "click",
    duration: 30,
    isActive: true
  },
  {
    title: "Chanel No. 5 Eau de Parfum",
    description: "Classic feminine fragrance with floral aldehyde composition. 100ml bottle.",
    imageUrl: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800",
    targetUrl: "https://example.com/chanel-no5",
    price: "45000",
    reward: "450",
    type: "click",
    duration: 30,
    isActive: true
  },
  {
    title: "Dyson Airwrap Hair Styler",
    description: "Multi-styler that curls, waves, smooths, and dries with no extreme heat.",
    imageUrl: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800",
    targetUrl: "https://example.com/dyson-airwrap",
    price: "125000",
    reward: "1250",
    type: "click",
    duration: 30,
    isActive: true
  },
  
  // Food & Beverage (3)
  {
    title: "Nespresso Vertuo Coffee Machine",
    description: "Single-serve coffee maker with centrifusion technology. Includes 12 capsules.",
    imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800",
    targetUrl: "https://example.com/nespresso",
    price: "45000",
    reward: "450",
    type: "click",
    duration: 30,
    isActive: true
  },
  {
    title: "Godiva Premium Chocolate Gift Box",
    description: "Assorted Belgian chocolates in elegant gold gift box. 36 pieces.",
    imageUrl: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800",
    targetUrl: "https://example.com/godiva-chocolate",
    price: "8500",
    reward: "85",
    type: "click",
    duration: 30,
    isActive: true
  },
  {
    title: "Dom Pérignon Vintage Champagne",
    description: "Prestigious vintage champagne from exceptional harvest years. 750ml bottle.",
    imageUrl: "https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800",
    targetUrl: "https://example.com/dom-perignon",
    price: "65000",
    reward: "650",
    type: "click",
    duration: 30,
    isActive: true
  }
];

async function seedAds() {
  try {
    console.log("🌱 Starting to seed ads...");
    
    if (!db) {
      console.error("❌ Database not connected. Cannot seed ads.");
      console.log("💡 Tip: Make sure DATABASE_URL is set in environment variables.");
      return;
    }

    // Insert ads one by one
    for (const ad of sampleAds) {
      try {
        const result = await db.insert(ads).values(ad).returning();
        console.log(`✅ Added: ${ad.title} (ID: ${result[0].id})`);
      } catch (error: any) {
        console.error(`❌ Failed to add ${ad.title}:`, error.message);
      }
    }

    console.log("\n🎉 Seeding complete!");
    console.log(`📊 Total ads attempted: ${sampleAds.length}`);
    
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  }
}

// Run if called directly
if (require.main === module) {
  seedAds()
    .then(() => {
      console.log("✨ Done!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Fatal error:", error);
      process.exit(1);
    });
}

export { seedAds, sampleAds };
