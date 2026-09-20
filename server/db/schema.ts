import { pgTable, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Unique identifier from your future Auth provider
  email: text("email").notNull().unique(),
  tier: integer("tier").default(0).notNull(), // 0 = Free, 1 = Pro, 2 = Syndicate
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const media = pgTable("media", {
  id: text("id").primaryKey(), // e.g., slug or UUID
  title: text("title").notNull(),
  magnetUri: text("magnet_uri").notNull(),
  category: text("category").default("general").notNull(),
  requiresTier: integer("requires_tier").default(0).notNull(),
  isLive: boolean("is_live").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
