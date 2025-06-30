import { users, orders, inspections, type User, type InsertUser, type Order, type InsertOrder, type Inspection, type InsertInspection } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, or } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Order operations
  createOrder(order: InsertOrder & { createdBy: number }): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  getRecentOrders(limit?: number): Promise<Order[]>;
  updateOrderStatus(id: number, status: string): Promise<void>;
  updateOrder(id: number, updateData: Partial<InsertOrder & { orderNumber: string }>): Promise<void>;
  
  // Inspection operations
  createInspection(inspection: InsertInspection & { inspectorId: number }): Promise<Inspection>;
  getInspection(id: number): Promise<Inspection | undefined>;
  getInspectionByImei(imei: string, orderId: number): Promise<Inspection | undefined>;
  getInspectionsByOrder(orderId: number): Promise<Inspection[]>;
  updateInspectionStatus(id: number, status: string, timestamp: Date): Promise<void>;
  updateInspectionImages(id: number, images: string[]): Promise<void>;
  searchInspections(query: string, filters: any): Promise<Inspection[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Order operations
  async createOrder(orderData: InsertOrder & { createdBy: number }): Promise<Order> {
    // Generate exactly 12 digit order number
    const orderNumber = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    const [order] = await db
      .insert(orders)
      .values({
        ...orderData,
        orderNumber,
      })
      .returning();
    return order;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
    return order || undefined;
  }

  async getRecentOrders(limit: number = 10): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit);
  }

  async updateOrderStatus(id: number, status: string): Promise<void> {
    const updateData: any = { status };
    if (status === "completed") {
      updateData.completedAt = new Date();
    }
    await db.update(orders).set(updateData).where(eq(orders.id, id));
  }

  async updateOrder(id: number, updateData: Partial<InsertOrder & { orderNumber: string }>): Promise<void> {
    await db.update(orders).set(updateData).where(eq(orders.id, id));
  }

  // Inspection operations
  async createInspection(inspectionData: InsertInspection & { inspectorId: number }): Promise<Inspection> {
    const [inspection] = await db
      .insert(inspections)
      .values(inspectionData)
      .returning();
    return inspection;
  }

  async getInspection(id: number): Promise<Inspection | undefined> {
    const [inspection] = await db.select().from(inspections).where(eq(inspections.id, id));
    return inspection || undefined;
  }

  async getInspectionByImei(imei: string, orderId: number): Promise<Inspection | undefined> {
    const [inspection] = await db
      .select()
      .from(inspections)
      .where(and(eq(inspections.imei, imei), eq(inspections.orderId, orderId)));
    return inspection || undefined;
  }

  async getInspectionsByOrder(orderId: number): Promise<Inspection[]> {
    return await db
      .select()
      .from(inspections)
      .where(eq(inspections.orderId, orderId))
      .orderBy(desc(inspections.createdAt));
  }

  async updateInspectionStatus(id: number, status: string, timestamp: Date): Promise<void> {
    const updateData: any = { status };
    if (status === "photographed") {
      updateData.photographedAt = timestamp;
    } else if (status === "completed") {
      updateData.completedAt = timestamp;
    }
    await db.update(inspections).set(updateData).where(eq(inspections.id, id));
  }

  async updateInspectionImages(id: number, images: string[]): Promise<void> {
    await db.update(inspections).set({ images }).where(eq(inspections.id, id));
  }

  async searchInspections(query: string, filters: any): Promise<Inspection[]> {
    let whereClause = and();
    
    if (query) {
      whereClause = and(
        whereClause,
        or(
          like(inspections.imei, `%${query}%`),
          // Add more search fields as needed
        )
      );
    }
    
    if (filters.grade) {
      whereClause = and(whereClause, eq(inspections.grade, filters.grade));
    }
    
    return await db
      .select()
      .from(inspections)
      .where(whereClause)
      .orderBy(desc(inspections.createdAt));
  }
}

export const storage = new DatabaseStorage();
