import express from "express";
import { randomUUID } from "crypto";
import { db } from "./db/index.js";
import { packages, messages } from "./db/schema.js";
import { eq, desc } from "drizzle-orm";

const app = express();

// Enable CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// JSON body parsing (safely handles cases where Vercel already parsed req.body)
app.use((req, res, next) => {
  if (req.body && typeof req.body === "object") {
    return next();
  }
  express.json()(req, res, next);
});

// Seed data function
async function seedDatabase() {
  try {
    const existingPackages = await db.select().from(packages).limit(1);
    if (existingPackages.length === 0) {
      const seedPackages = [
        {
          id: "TRK-7849201",
          status: "In Transit",
          senderName: "Global Logistics Hub",
          recipientName: "Sarah Jenkins",
          senderAddress: "450 Lexington Ave, New York, NY 10017",
          recipientAddress: "1280 Sunset Blvd, Los Angeles, CA 90026",
          weight: "3.5",
          shipDate: new Date("2026-09-18T10:00:00Z"),
          expectedDelivery: new Date("2026-09-24T18:00:00Z"),
          description: "Electronics & Accessories",
          notes: "Signature required upon delivery. Package in regional transit facility.",
          createdAt: new Date("2026-09-18T09:30:00Z")
        },
        {
          id: "TRK-1092834",
          status: "Delivered",
          senderName: "TechWare Supply Co",
          recipientName: "Michael Chen",
          senderAddress: "100 S Wacker Dr, Chicago, IL 60606",
          recipientAddress: "350 Ocean Drive, Miami, FL 33139",
          weight: "1.2",
          shipDate: new Date("2026-09-15T08:30:00Z"),
          expectedDelivery: new Date("2026-09-19T14:00:00Z"),
          description: "Documents & Spare Parts",
          notes: "Delivered at front porch. Signed by M. Chen.",
          createdAt: new Date("2026-09-15T08:00:00Z")
        },
        {
          id: "TRK-5521940",
          status: "Processing",
          senderName: "Pacific Fulfillment Center",
          recipientName: "Anna Rodriguez",
          senderAddress: "800 5th Ave, Seattle, WA 98104",
          recipientAddress: "201 Congress Ave, Austin, TX 78701",
          weight: "5.8",
          shipDate: new Date("2026-09-21T14:15:00Z"),
          expectedDelivery: new Date("2026-09-26T17:00:00Z"),
          description: "Apparel and Merchandise",
          notes: "Package prepared and sorting in facility.",
          createdAt: new Date("2026-09-21T11:00:00Z")
        },
        {
          id: "TRK-8830192",
          status: "Out for Delivery",
          senderName: "Apex Retailers Ltd",
          recipientName: "David Miller",
          senderAddress: "1717 Main St, Dallas, TX 75201",
          recipientAddress: "1075 Peachtree St NE, Atlanta, GA 30309",
          weight: "2.4",
          shipDate: new Date("2026-09-19T09:00:00Z"),
          expectedDelivery: new Date("2026-09-22T20:00:00Z"),
          description: "Urgent Medical & Lab Equipment",
          notes: "Courier assigned for final delivery window today.",
          createdAt: new Date("2026-09-19T08:45:00Z")
        }
      ];

      await db.insert(packages).values(seedPackages);

      const seedMessages = [
        {
          id: randomUUID(),
          fullName: "Emily Davis",
          email: "emily.davis@example.com",
          packageId: "TRK-7849201",
          message: "Could you confirm if delivery requires a signature? Thank you!",
          createdAt: new Date("2026-09-20T10:15:00Z")
        }
      ];

      await db.insert(messages).values(seedMessages);
      console.log("Database seeded successfully");
    }
  } catch (err) {
    console.error("Error seeding database:", err);
  }
}

// Seed database on startup
seedDatabase();

// Setup API routes on a router
const router = express.Router();

// Admin login
router.post("/admin/login", (req, res) => {
  const { username, password } = req.body || {};
  if (username === "kitio123" && password === "kitio000") {
    return res.json({ success: true, message: "Login successful" });
  }
  return res.status(401).json({ success: false, message: "Invalid credentials" });
});

// Get all packages
router.get("/packages", async (req, res) => {
  try {
    const allPackages = await db.select().from(packages).orderBy(desc(packages.createdAt));
    return res.json(allPackages);
  } catch (err) {
    console.error("Error fetching packages:", err);
    return res.status(500).json({ message: "Error fetching packages" });
  }
});

// Get single package by ID
router.get("/packages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pkg = await db.select().from(packages).where(eq(packages.id, id)).limit(1);
    if (!pkg || pkg.length === 0) {
      return res.status(404).json({ message: "Package not found" });
    }
    return res.json(pkg[0]);
  } catch (err) {
    console.error("Error fetching package:", err);
    return res.status(500).json({ message: "Error fetching package" });
  }
});

// Create package
router.post("/packages", async (req, res) => {
  try {
    const body = req.body || {};
    console.log("Creating package with body:", JSON.stringify(body, null, 2));
    
    if (!body.id || !body.status || !body.senderName || !body.recipientName) {
      return res.status(400).json({ message: "Missing required package fields" });
    }

    console.log("Checking for existing package...");
    const existing = await db.select().from(packages).where(eq(packages.id, body.id)).limit(1);
    if (existing && existing.length > 0) {
      return res.status(409).json({ message: "Package ID already exists" });
    }

    console.log("Creating new package object...");
    const newPackage = {
      id: body.id,
      status: body.status,
      senderName: body.senderName,
      recipientName: body.recipientName,
      senderAddress: body.senderAddress || "",
      recipientAddress: body.recipientAddress || "",
      weight: body.weight ? body.weight.toString() : "0",
      shipDate: body.shipDate ? new Date(body.shipDate) : new Date(),
      expectedDelivery: body.expectedDelivery ? new Date(body.expectedDelivery) : new Date(),
      description: body.description || "",
      notes: body.notes || "",
      createdAt: new Date()
    };

    console.log("Inserting package into database...");
    await db.insert(packages).values(newPackage);
    console.log("Package created successfully");
    return res.status(201).json(newPackage);
  } catch (err) {
    console.error("Error creating package:", err);
    console.error("Error details:", JSON.stringify(err, null, 2));
    return res.status(500).json({ message: "Error creating package", error: err.message });
  }
});

// Update package
router.put("/packages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    
    const updateData = {};
    if (body.status) updateData.status = body.status;
    if (body.senderName) updateData.senderName = body.senderName;
    if (body.recipientName) updateData.recipientName = body.recipientName;
    if (body.senderAddress) updateData.senderAddress = body.senderAddress;
    if (body.recipientAddress) updateData.recipientAddress = body.recipientAddress;
    if (body.weight) updateData.weight = body.weight.toString();
    if (body.shipDate) updateData.shipDate = new Date(body.shipDate);
    if (body.expectedDelivery) updateData.expectedDelivery = new Date(body.expectedDelivery);
    if (body.description) updateData.description = body.description;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const updated = await db.update(packages).set(updateData).where(eq(packages.id, id)).returning();
    if (!updated || updated.length === 0) {
      return res.status(404).json({ message: "Package not found" });
    }
    return res.json(updated[0]);
  } catch (err) {
    console.error("Error updating package:", err);
    return res.status(500).json({ message: "Error updating package" });
  }
});

// Delete package
router.delete("/packages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.delete(packages).where(eq(packages.id, id)).returning();
    if (!deleted || deleted.length === 0) {
      return res.status(404).json({ message: "Package not found" });
    }
    return res.json({ message: "Package deleted successfully" });
  } catch (err) {
    console.error("Error deleting package:", err);
    return res.status(500).json({ message: "Error deleting package" });
  }
});

// Get all messages
router.get("/messages", async (req, res) => {
  try {
    const allMessages = await db.select().from(messages).orderBy(desc(messages.createdAt));
    return res.json(allMessages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    return res.status(500).json({ message: "Error fetching messages" });
  }
});

// Create new message
router.post("/messages", async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.fullName || !body.email || !body.message) {
      return res.status(400).json({ message: "Full name, email, and message are required" });
    }

    const newMessage = {
      id: randomUUID(),
      fullName: body.fullName,
      email: body.email,
      packageId: body.packageId || null,
      message: body.message,
      createdAt: new Date()
    };

    await db.insert(messages).values(newMessage);
    return res.status(201).json(newMessage);
  } catch (err) {
    console.error("Error creating message:", err);
    return res.status(500).json({ message: "Error creating message" });
  }
});

// Delete message
router.delete("/messages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.delete(messages).where(eq(messages.id, id)).returning();
    if (!deleted || deleted.length === 0) {
      return res.status(404).json({ message: "Message not found" });
    }
    return res.json({ message: "Message deleted successfully" });
  } catch (err) {
    console.error("Error deleting message:", err);
    return res.status(500).json({ message: "Error deleting message" });
  }
});

// Mount routes at both `/api` and `/` so requests with or without `/api` prefix work seamlessly
app.use("/api", router);
app.use("/", router);

export default app;
export { router };
