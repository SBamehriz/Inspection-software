import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertOrderSchema, insertInspectionSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import session from "express-session";

// Extend session data type
declare module "express-session" {
  interface SessionData {
    userId: number;
    username: string;
  }
}

// Simple IMEI lookup function
async function lookupIMEI(imei: string) {
  const tac = imei.substring(0, 8);
  const tacDatabase: Record<string, any> = {
    "35326909": { brand: "Apple", model: "iPhone 13 Pro", storage: "128GB" },
    "35898932": { brand: "Samsung", model: "Galaxy S21", storage: "256GB" },
    "35284610": { brand: "Google", model: "Pixel 6", storage: "128GB" },
  };

  return tacDatabase[tac] || {
    brand: "Unknown",
    model: "Unknown Model",
    storage: "Unknown",
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'astora-secret-key-2025',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
  }));

  // Sign up
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { username, password } = req.body;
      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(409).json({ message: "User exists" });
      }
      const hash = await bcrypt.hash(password, 10);
      const user = await storage.createUser({ username, password: hash });
      return res.json({ id: user.id, username: user.username });
    } catch (err) {
      console.error("Signup error:", err);
      return res.status(500).json({ message: "Failed to create user" });
    }
  });


  // Auth middleware
  const requireAuth = (req: Request & { session: any }, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.username = user.username;
      
      res.json({ 
        id: user.id, 
        username: user.username, 
        role: user.role 
      });
    } catch (error) {
      console.error("Sign in error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/signout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Signed out successfully" });
    });
  });

  app.get("/api/auth/user", requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      res.json({ 
        id: user.id, 
        username: user.username, 
        role: user.role 
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Order routes
  app.post("/api/orders", requireAuth, async (req: any, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder({
        ...orderData,
        createdBy: req.session.userId
      });
      res.json(order);
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders/recent", requireAuth, async (req, res) => {
    try {
      const orders = await storage.getRecentOrders(5);
      res.json(orders);
    } catch (error) {
      console.error("Get recent orders error:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:orderNumber", requireAuth, async (req, res) => {
    try {
      const order = await storage.getOrderByNumber(req.params.orderNumber);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Get order error:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Update order
  app.put("/api/orders/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.id);
      const updateData = req.body;
      
      // Validate order number format (exactly 12 digits)
      if (updateData.orderNumber && !updateData.orderNumber.match(/^\d{12}$/)) {
        return res.status(400).json({ message: "Order number must be exactly 12 digits" });
      }
      
      await storage.updateOrder(orderId, updateData);
      res.json({ message: "Order updated successfully" });
    } catch (error) {
      console.error("Update order error:", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // IMEI lookup
  app.get("/api/imei/:imei", requireAuth, async (req: Request, res: Response) => {
    try {
      const specs = await lookupIMEI(req.params.imei);
      res.json(specs);
    } catch (error) {
      console.error("IMEI lookup error:", error);
      res.status(500).json({ message: "Failed to lookup IMEI" });
    }
  });

  // Inspection routes
  app.post("/api/inspections", requireAuth, async (req: any, res) => {
    try {
      const inspectionData = insertInspectionSchema.parse(req.body);
      
      // Check if IMEI already exists for this order
      const existingInspection = await storage.getInspectionByImei(inspectionData.imei, inspectionData.orderId);
      if (existingInspection) {
        return res.status(400).json({ 
          message: "IMEI already exists for this order",
          existingInspection 
        });
      }
      
      const inspection = await storage.createInspection({
        ...inspectionData,
        inspectorId: req.session.userId
      });
      res.json(inspection);
    } catch (error) {
      console.error("Create inspection error:", error);
      res.status(500).json({ message: "Failed to create inspection" });
    }
  });

  app.get("/api/inspections/imei/:imei/order/:orderId", requireAuth, async (req, res) => {
    try {
      const inspection = await storage.getInspectionByImei(
        req.params.imei, 
        parseInt(req.params.orderId)
      );
      if (!inspection) {
        return res.status(404).json({ message: "Inspection not found" });
      }
      res.json(inspection);
    } catch (error) {
      console.error("Get inspection error:", error);
      res.status(500).json({ message: "Failed to fetch inspection" });
    }
  });

  app.get("/api/inspections/order/:orderId", requireAuth, async (req, res) => {
    try {
      const inspections = await storage.getInspectionsByOrder(parseInt(req.params.orderId));
      res.json(inspections);
    } catch (error) {
      console.error("Get inspections error:", error);
      res.status(500).json({ message: "Failed to fetch inspections" });
    }
  });

  app.put("/api/inspections/:id/status", requireAuth, async (req, res) => {
    try {
      const { status } = req.body;
      await storage.updateInspectionStatus(
        parseInt(req.params.id), 
        status, 
        new Date()
      );
      res.json({ message: "Status updated successfully" });
    } catch (error) {
      console.error("Update inspection status error:", error);
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  // Simplified image upload simulation
  app.post("/api/inspections/:id/images", requireAuth, async (req: Request, res: Response) => {
    try {
      // Simulate image upload success
      const mockImageUrls = [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg"
      ];
      
      await storage.updateInspectionImages(parseInt(req.params.id), mockImageUrls);
      res.json({ imageUrls: mockImageUrls });
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({ message: "Failed to upload images" });
    }
  });

  // Get inspections by order
  app.get("/api/orders/:orderId/inspections", requireAuth, async (req: Request, res: Response) => {
    try {
      const inspections = await storage.getInspectionsByOrder(parseInt(req.params.orderId));
      res.json(inspections);
    } catch (error) {
      console.error("Get inspections error:", error);
      res.status(500).json({ message: "Failed to fetch inspections" });
    }
  });

  // Get all orders for reports
  app.get("/api/orders", requireAuth, async (req: Request, res: Response) => {
    try {
      const orders = await storage.getRecentOrders(50); // Get more orders for reports
      res.json(orders);
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Simplified report generation
  app.post("/api/reports/excel", requireAuth, async (req: Request, res: Response) => {
    try {
      const { orderId } = req.body;
      const inspections = await storage.getInspectionsByOrder(orderId);
      
      // Create a simple CSV-style report data
      const reportData = {
        orderNumber: `Order-${orderId}`,
        totalInspections: inspections.length,
        gradeDistribution: {
          A: inspections.filter(i => i.grade === 'A').length,
          B: inspections.filter(i => i.grade === 'B').length,
          C: inspections.filter(i => i.grade === 'C').length,
          D: inspections.filter(i => i.grade === 'D').length,
        },
        inspections: inspections.map(i => ({
          imei: i.imei,
          grade: i.grade,
          status: i.status,
          brand: i.phoneSpecs?.brand || 'Unknown',
          model: i.phoneSpecs?.model || 'Unknown'
        }))
      };
      
      res.json({ 
        reportUrl: `data:application/json;base64,${Buffer.from(JSON.stringify(reportData, null, 2)).toString('base64')}`,
        reportData 
      });
    } catch (error) {
      console.error("Excel report error:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
