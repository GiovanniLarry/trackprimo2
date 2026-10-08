import express from "express";
import { randomUUID } from "crypto";

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

// In-memory storage
const SEED_PACKAGES = [
  {
    id: "TRK-7849201",
    status: "In Transit",
    senderName: "Global Logistics Hub",
    recipientName: "Sarah Jenkins",
    senderAddress: "450 Lexington Ave, New York, NY 10017",
    recipientAddress: "1280 Sunset Blvd, Los Angeles, CA 90026",
    weight: "3.5",
    shipDate: new Date("2026-09-18T10:00:00Z").toISOString(),
    expectedDelivery: new Date("2026-09-24T18:00:00Z").toISOString(),
    description: "Electronics & Accessories",
    notes: "Signature required upon delivery. Package in regional transit facility.",
    createdAt: new Date("2026-09-18T09:30:00Z").toISOString()
  },
  {
    id: "TRK-1092834",
    status: "Delivered",
    senderName: "TechWare Supply Co",
    recipientName: "Michael Chen",
    senderAddress: "100 S Wacker Dr, Chicago, IL 60606",
    recipientAddress: "350 Ocean Drive, Miami, FL 33139",
    weight: "1.2",
    shipDate: new Date("2026-09-15T08:30:00Z").toISOString(),
    expectedDelivery: new Date("2026-09-19T14:00:00Z").toISOString(),
    description: "Documents & Spare Parts",
    notes: "Delivered at front porch. Signed by M. Chen.",
    createdAt: new Date("2026-09-15T08:00:00Z").toISOString()
  },
  {
    id: "TRK-5521940",
    status: "Processing",
    senderName: "Pacific Fulfillment Center",
    recipientName: "Anna Rodriguez",
    senderAddress: "800 5th Ave, Seattle, WA 98104",
    recipientAddress: "201 Congress Ave, Austin, TX 78701",
    weight: "5.8",
    shipDate: new Date("2026-09-21T14:15:00Z").toISOString(),
    expectedDelivery: new Date("2026-09-26T17:00:00Z").toISOString(),
    description: "Apparel and Merchandise",
    notes: "Package prepared and sorting in facility.",
    createdAt: new Date("2026-09-21T11:00:00Z").toISOString()
  },
  {
    id: "TRK-8830192",
    status: "Out for Delivery",
    senderName: "Apex Retailers Ltd",
    recipientName: "David Miller",
    senderAddress: "1717 Main St, Dallas, TX 75201",
    recipientAddress: "1075 Peachtree St NE, Atlanta, GA 30309",
    weight: "2.4",
    shipDate: new Date("2026-09-19T09:00:00Z").toISOString(),
    expectedDelivery: new Date("2026-09-22T20:00:00Z").toISOString(),
    description: "Urgent Medical & Lab Equipment",
    notes: "Courier assigned for final delivery window today.",
    createdAt: new Date("2026-09-19T08:45:00Z").toISOString()
  }
];

const SEED_MESSAGES = [
  {
    id: randomUUID(),
    fullName: "Emily Davis",
    email: "emily.davis@example.com",
    packageId: "TRK-7849201",
    message: "Could you confirm if delivery requires a signature? Thank you!",
    createdAt: new Date("2026-09-20T10:15:00Z").toISOString()
  }
];

let memoryStore = {
  packages: [...SEED_PACKAGES],
  messages: [...SEED_MESSAGES]
};

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
router.get("/packages", (req, res) => {
  const sorted = [...memoryStore.packages].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return res.json(sorted);
});

// Get single package by ID
router.get("/packages/:id", (req, res) => {
  const { id } = req.params;
  const pkg = memoryStore.packages.find(
    (p) => p.id.toLowerCase() === id.toLowerCase()
  );
  if (!pkg) {
    return res.status(404).json({ message: "Package not found" });
  }
  return res.json(pkg);
});

// Create package
router.post("/packages", (req, res) => {
  const body = req.body || {};
  if (!body.id || !body.status || !body.senderName || !body.recipientName) {
    return res.status(400).json({ message: "Missing required package fields" });
  }

  const existing = memoryStore.packages.find(
    (p) => p.id.toLowerCase() === body.id.toLowerCase()
  );
  if (existing) {
    return res.status(409).json({ message: "Package ID already exists" });
  }

  const newPackage = {
    id: body.id,
    status: body.status,
    senderName: body.senderName,
    recipientName: body.recipientName,
    senderAddress: body.senderAddress || "",
    recipientAddress: body.recipientAddress || "",
    weight: body.weight ? body.weight.toString() : "0",
    shipDate: body.shipDate ? new Date(body.shipDate).toISOString() : new Date().toISOString(),
    expectedDelivery: body.expectedDelivery ? new Date(body.expectedDelivery).toISOString() : new Date().toISOString(),
    description: body.description || "",
    notes: body.notes || "",
    createdAt: new Date().toISOString()
  };

  memoryStore.packages.unshift(newPackage);
  return res.status(201).json(newPackage);
});

// Update package
router.put("/packages/:id", (req, res) => {
  const { id } = req.params;
  const index = memoryStore.packages.findIndex(
    (p) => p.id.toLowerCase() === id.toLowerCase()
  );
  if (index === -1) {
    return res.status(404).json({ message: "Package not found" });
  }

  const body = req.body || {};
  memoryStore.packages[index] = {
    ...memoryStore.packages[index],
    ...body,
    shipDate: body.shipDate ? new Date(body.shipDate).toISOString() : memoryStore.packages[index].shipDate,
    expectedDelivery: body.expectedDelivery ? new Date(body.expectedDelivery).toISOString() : memoryStore.packages[index].expectedDelivery,
  };

  return res.json(memoryStore.packages[index]);
});

// Delete package
router.delete("/packages/:id", (req, res) => {
  const { id } = req.params;
  const initialLength = memoryStore.packages.length;
  memoryStore.packages = memoryStore.packages.filter(
    (p) => p.id.toLowerCase() !== id.toLowerCase()
  );

  if (memoryStore.packages.length === initialLength) {
    return res.status(404).json({ message: "Package not found" });
  }

  return res.json({ message: "Package deleted successfully" });
});

// Get all messages
router.get("/messages", (req, res) => {
  const sorted = [...memoryStore.messages].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return res.json(sorted);
});

// Create new message
router.post("/messages", (req, res) => {
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
    createdAt: new Date().toISOString()
  };

  memoryStore.messages.unshift(newMessage);
  return res.status(201).json(newMessage);
});

// Delete message
router.delete("/messages/:id", (req, res) => {
  const { id } = req.params;
  const initialLength = memoryStore.messages.length;
  memoryStore.messages = memoryStore.messages.filter((m) => m.id !== id);

  if (memoryStore.messages.length === initialLength) {
    return res.status(404).json({ message: "Message not found" });
  }

  return res.json({ message: "Message deleted successfully" });
});

// Mount routes at both `/api` and `/` so requests with or without `/api` prefix work seamlessly
app.use("/api", router);
app.use("/", router);

export default app;
export { router };
