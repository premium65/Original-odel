import { Router } from "express";
import { db } from "../../db";
import { settings, siteContent, contacts, slideshow } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import multer from "multer";
import path from "path";

const router = Router();

const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// ===== SETTINGS =====
router.get("/config", async (req, res) => {
  try {
    const allSettings = await db.select().from(settings);
    const settingsObj = allSettings.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {});
    res.json(settingsObj);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/config", async (req, res) => {
  try {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      await db.insert(settings).values({ key, value: String(value) })
        .onConflictDoUpdate({ target: settings.key, set: { value: String(value), updatedAt: new Date() } });
    }
    res.json({ message: "Settings updated" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ===== SITE CONTENT =====
router.get("/content/:page", async (req, res) => {
  try {
    const content = await db.select().from(siteContent).where(eq(siteContent.page, req.params.page));
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/content/:page", async (req, res) => {
  try {
    const { section, title, content, metadata } = req.body;
    await db.insert(siteContent).values({ page: req.params.page, section, title, content, metadata })
      .onConflictDoUpdate({ target: [siteContent.page], set: { title, content, metadata, updatedAt: new Date() } });
    res.json({ message: "Content updated" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ===== CONTACTS =====
router.get("/contacts", async (req, res) => {
  try {
    const allContacts = await db.select().from(contacts).orderBy(desc(contacts.createdAt));
    res.json(allContacts);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/contacts/:type", async (req, res) => {
  try {
    const typeContacts = await db.select().from(contacts).where(eq(contacts.type, req.params.type));
    res.json(typeContacts);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/contacts", async (req, res) => {
  try {
    const { type, value, label } = req.body;
    const newContact = await db.insert(contacts).values({ type, value, label }).returning();
    res.json(newContact[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/contacts/:id", async (req, res) => {
  try {
    const { value, label, isActive } = req.body;
    const updated = await db.update(contacts).set({ value, label, isActive }).where(eq(contacts.id, Number(req.params.id))).returning();
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/contacts/:id", async (req, res) => {
  try {
    await db.delete(contacts).where(eq(contacts.id, Number(req.params.id)));
    res.json({ message: "Contact deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ===== SLIDESHOW =====
router.get("/slideshow", async (req, res) => {
  try {
    const slides = await db.select().from(slideshow).orderBy(slideshow.sortOrder);
    res.json(slides);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/slideshow", upload.single("image"), async (req, res) => {
  try {
    const { title, link, sortOrder } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";
    const newSlide = await db.insert(slideshow).values({ title, imageUrl, link, sortOrder: Number(sortOrder) }).returning();
    res.json(newSlide[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/slideshow/:id", upload.single("image"), async (req, res) => {
  try {
    const { title, link, sortOrder, isActive } = req.body;
    const updateData: any = { title, link, sortOrder: Number(sortOrder), isActive: isActive === "true" };
    if (req.file) updateData.imageUrl = `/uploads/${req.file.filename}`;
    const updated = await db.update(slideshow).set(updateData).where(eq(slideshow.id, Number(req.params.id))).returning();
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/slideshow/:id", async (req, res) => {
  try {
    await db.delete(slideshow).where(eq(slideshow.id, Number(req.params.id)));
    res.json({ message: "Slide deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
