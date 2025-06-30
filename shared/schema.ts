import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("inspector"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  expectedQuantity: integer("expected_quantity").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("active"), // active, completed
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const inspections = pgTable("inspections", {
  id: serial("id").primaryKey(),
  imei: text("imei").notNull(),
  orderId: integer("order_id").references(() => orders.id),
  inspectorId: integer("inspector_id").references(() => users.id),
  phoneSpecs: jsonb("phone_specs"), // brand, model, storage, color
  grade: text("grade"), // A, B, C, D
  defects: text("defects").array().default([]),
  notes: text("notes"),
  images: text("images").array().default([]),
  status: text("status").notNull().default("scanning"), // scanning, photographed, completed
  scannedAt: timestamp("scanned_at"),
  photographedAt: timestamp("photographed_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  orderNumber: true,
  expectedQuantity: true,
  notes: true,
});

export const insertInspectionSchema = createInsertSchema(inspections).pick({
  imei: true,
  orderId: true,
  phoneSpecs: true,
  grade: true,
  defects: true,
  notes: true,
  images: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertInspection = z.infer<typeof insertInspectionSchema>;
export type Inspection = typeof inspections.$inferSelect;
