import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const packages = pgTable("packages", {
  id: text("id").primaryKey(),
  status: text("status").notNull(),
  senderName: text("sender_name").notNull(),
  recipientName: text("recipient_name").notNull(),
  senderAddress: text("sender_address").notNull(),
  recipientAddress: text("recipient_address").notNull(),
  weight: text("weight").notNull(),
  shipDate: timestamp("ship_date").notNull(),
  expectedDelivery: timestamp("expected_delivery").notNull(),
  description: text("description").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  packageId: text("package_id"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
