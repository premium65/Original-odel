// Add these to your existing schema.ts file

import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Slideshow Items Table
export const slideshowItems = pgTable("slideshow_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  linkUrl: text("link_url"),
  buttonText: text("button_text"),
  order: integer("order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Site Settings Table (for colors, theme, etc.)
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  settingKey: text("setting_key").notNull().unique(),
  settingValue: text("setting_value").notNull(),
  settingType: text("setting_type").default("string"), // string, color, json, boolean
  category: text("category").default("general"), // general, colors, theme, slideshow
  label: text("label"),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod Schemas
export const insertSlideshowItemSchema = createInsertSchema(slideshowItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({
  id: true,
  updatedAt: true,
});

export type SlideshowItem = typeof slideshowItems.$inferSelect;
export type InsertSlideshowItem = z.infer<typeof insertSlideshowItemSchema>;

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;

// Default Color Settings
export const defaultColorSettings = [
  { settingKey: "primary_color", settingValue: "#f59e0b", settingType: "color", category: "colors", label: "Primary Color (Amber)", description: "Main accent color for buttons and highlights" },
  { settingKey: "secondary_color", settingValue: "#1a1a2e", settingType: "color", category: "colors", label: "Secondary Color (Dark)", description: "Background and secondary elements" },
  { settingKey: "accent_color", settingValue: "#16213e", settingType: "color", category: "colors", label: "Accent Color", description: "Accent highlights" },
  { settingKey: "text_color", settingValue: "#ffffff", settingType: "color", category: "colors", label: "Text Color", description: "Main text color" },
  { settingKey: "nav_bg_color", settingValue: "#000000", settingType: "color", category: "colors", label: "Navigation Background", description: "Top navigation bar background" },
  { settingKey: "footer_bg_color", settingValue: "#111827", settingType: "color", category: "colors", label: "Footer Background", description: "Footer section background" },
  { settingKey: "card_bg_color", settingValue: "#1f2937", settingType: "color", category: "colors", label: "Card Background", description: "Card and panel backgrounds" },
  { settingKey: "button_color", settingValue: "#f59e0b", settingType: "color", category: "colors", label: "Button Color", description: "Primary button color" },
  { settingKey: "button_hover_color", settingValue: "#d97706", settingType: "color", category: "colors", label: "Button Hover Color", description: "Button hover state" },
  { settingKey: "marquee_bg_color", settingValue: "#f59e0b", settingType: "color", category: "colors", label: "Marquee Banner Background", description: "Scrolling banner background" },
  { settingKey: "marquee_text_color", settingValue: "#000000", settingType: "color", category: "colors", label: "Marquee Text Color", description: "Scrolling banner text" },
];
