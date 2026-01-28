
import { storage } from "./storage";

async function seedDatabase() {
  const existingAds = await storage.getAds();
  if (existingAds.length === 0) {
    console.log("Seeding ads...");
    await storage.createAd({
      title: "Watch 10s Video Ad",
      description: "Earn rewards by watching this short video advertisement.",
      imageUrl: "https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=800&auto=format&fit=crop",
      targetUrl: "https://example.com/ad1",
      price: "101.75",
      isActive: true
    });
    
    await storage.createAd({
      title: "Premium Product Showcase",
      description: "Discover the latest premium products and earn instant commission.",
      imageUrl: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=800&auto=format&fit=crop",
      targetUrl: "https://example.com/ad2",
      price: "150.00",
      isActive: true
    });
    
    await storage.createAd({
      title: "Exclusive Survey Offer",
      description: "Complete a simple survey to earn rewards.",
      imageUrl: "https://images.unsplash.com/photo-1553877606-3c66916fae99?w=800&auto=format&fit=crop",
      targetUrl: "https://example.com/survey",
      price: "85.50",
      isActive: true
    });
  }
}

// Ensure seed runs
seedDatabase().catch(err => console.error("Error seeding database:", err));
