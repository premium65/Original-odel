import { db } from "./connection.js";
import { ads } from "./schema.js";

async function seedAds() {
  const adsList = [
    { id: 1, code: "AD-0001", link: "https://example.com/ad1", image: "photo_1" },
    { id: 2, code: "AD-0002", link: "https://example.com/ad2", image: "photo_2" },
    { id: 3, code: "AD-0003", link: "https://example.com/ad3", image: "photo_3" },
    { id: 4, code: "AD-0004", link: "https://example.com/ad4", image: "photo_4" },
    { id: 5, code: "AD-0005", link: "https://example.com/ad5", image: "photo_5" },
    { id: 6, code: "AD-0006", link: "https://example.com/ad6", image: "photo_1" },
    { id: 7, code: "AD-0007", link: "https://example.com/ad7", image: "photo_2" },
    { id: 8, code: "AD-0008", link: "https://example.com/ad8", image: "photo_3" },
    { id: 9, code: "AD-0009", link: "https://example.com/ad9", image: "photo_4" },
    { id: 10, code: "AD-0010", link: "https://example.com/ad10", image: "photo_1" },
    { id: 11, code: "AD-0011", link: "https://example.com/ad11", image: "photo_2" },
    { id: 12, code: "AD-0012", link: "https://example.com/ad12", image: "photo_3" },
    { id: 13, code: "AD-0013", link: "https://example.com/ad13", image: "custom_image" },
    { id: 14, code: "AD-0014", link: "https://example.com/ad14", image: "photo_5" },
    { id: 15, code: "AD-0015", link: "https://example.com/ad15", image: "photo_1" },
    { id: 16, code: "AD-0016", link: "https://example.com/ad16", image: "photo_2" },
    { id: 17, code: "AD-0017", link: "https://example.com/ad17", image: "photo_3" },
    { id: 18, code: "AD-0018", link: "https://example.com/ad18", image: "photo_4" },
    { id: 19, code: "AD-0019", link: "https://example.com/ad19", image: "photo_1" },
    { id: 20, code: "AD-0020", link: "https://example.com/ad20", image: "photo_2" },
    { id: 21, code: "AD-0021", link: "https://example.com/ad21", image: "photo_3" },
    { id: 22, code: "AD-0022", link: "https://example.com/ad22", image: "photo_4" },
    { id: 23, code: "AD-0023", link: "https://example.com/ad23", image: "photo_5" },
    { id: 24, code: "AD-0024", link: "https://example.com/ad24", image: "photo_1" },
    { id: 25, code: "AD-0025", link: "https://example.com/ad25", image: "photo_2" },
    { id: 26, code: "AD-0026", link: "https://example.com/ad26", image: "photo_3" },
    { id: 27, code: "AD-0027", link: "https://example.com/ad27", image: "photo_4" },
    { id: 28, code: "AD-0028", link: "https://example.com/ad28", image: "photo_1" }
  ];

  console.log("📌 Seeding 28 Ads...");

  for (const ad of adsList) {
    await db.insert(ads).values({
      id: ad.id,
      code: ad.code,
      duration: 10,
      price: 101.75,
      link: ad.link,
      image: ad.image
    }).onConflictDoNothing();
  }

  console.log("✅ All 28 Ads inserted successfully!");
}

seedAds();
