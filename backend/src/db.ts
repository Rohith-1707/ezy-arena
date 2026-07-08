import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;
let useMock = false;

// Preloaded mock database state for fallback (or hybrid mode)
export const mockDb = {
  stadiums: [
    {
      id: "stadium-1",
      name: "Lusail Iconic Stadium",
      city: "Lusail",
      capacity: 88900,
      gates: ["Gate A", "Gate B", "Gate C", "Gate D", "Gate E"]
    },
    {
      id: "stadium-2",
      name: "MetLife Stadium",
      city: "East Rutherford",
      capacity: 82500,
      gates: ["Gate 1", "Gate 2", "Gate 3", "Gate 4"]
    }
  ],
  matches: [
    {
      id: "match-1",
      name: "Argentina vs France (World Cup Final)",
      date: "2026-07-19",
      time: "18:00",
      stadiumId: "stadium-1",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "match-2",
      name: "USA vs England",
      date: "2026-07-12",
      time: "20:00",
      stadiumId: "stadium-2",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  users: [] as any[],
  tickets: [] as any[],
  entrySlots: [] as any[],
  foodVendors: [
    {
      id: "vendor-1",
      name: "Arena Burgers & Co",
      description: "Premium flame-grilled gourmet beef burgers and fries.",
      category: "Burgers",
      logo: "/assets/burger_logo.png",
      queueLength: 12,
      avgPrepTime: 6,
      rating: 4.8,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "vendor-2",
      name: "Pizza Pitch",
      description: "Stone-baked Italian artisan pizzas.",
      category: "Pizza",
      logo: "/assets/pizza_logo.png",
      queueLength: 5,
      avgPrepTime: 4,
      rating: 4.6,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "vendor-3",
      name: "Green Fields",
      description: "Healthy bowls, salads, and fresh organic juices.",
      category: "Salads & Juices",
      logo: "/assets/salad_logo.png",
      queueLength: 2,
      avgPrepTime: 3,
      rating: 4.5,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "vendor-4",
      name: "Golden Cup Cafe",
      description: "Premium coffee, tea, and local stadium pastries.",
      category: "Beverages",
      logo: "/assets/coffee_logo.png",
      queueLength: 18,
      avgPrepTime: 2,
      rating: 4.7,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  menuItems: [
    {
      id: "menu-1",
      vendorId: "vendor-1",
      name: "Champion Double Burger",
      price: 14.99,
      description: "Double beef patty, cheddar, signature arena sauce, brioche bun.",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60",
      isAvailable: true,
      isAIRecommended: true
    },
    {
      id: "menu-2",
      vendorId: "vendor-1",
      name: "Stadium Crisp Fries",
      price: 5.99,
      description: "Seasoned golden fries served with truffle dipping sauce.",
      image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=500&auto=format&fit=crop&q=60",
      isAvailable: true,
      isAIRecommended: false
    },
    {
      id: "menu-3",
      vendorId: "vendor-2",
      name: "Kickoff Margherita Pizza",
      price: 16.50,
      description: "San Marzano tomatoes, fresh mozzarella, basil, extra virgin olive oil.",
      image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=60",
      isAvailable: true,
      isAIRecommended: false
    },
    {
      id: "menu-4",
      vendorId: "vendor-2",
      name: "Pepperoni Penalty Pizza",
      price: 18.99,
      description: "Spicy pepperoni, mozzarella, chili honey drizzle.",
      image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=60",
      isAvailable: true,
      isAIRecommended: true
    },
    {
      id: "menu-5",
      vendorId: "vendor-3",
      name: "Power Play Acai Bowl",
      price: 12.00,
      description: "Organic acai, banana, wild berries, honey, peanut butter.",
      image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=500&auto=format&fit=crop&q=60",
      isAvailable: true,
      isAIRecommended: true
    },
    {
      id: "menu-6",
      vendorId: "vendor-4",
      name: "Iced Golden Latte",
      price: 6.50,
      description: "Signature cold brew coffee, oat milk, honey, turmeric dusting.",
      image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=60",
      isAvailable: true,
      isAIRecommended: false
    }
  ],
  orders: [] as any[],
  notifications: [] as any[],
  themeSettings: [] as any[],
  emergencyRequests: [] as any[]
};

// Initialize Prisma and check database connectivity
export async function initDatabase() {
  try {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });

    // Try a simple ping request
    await prisma.$connect();
    console.log("Successfully connected to PostgreSQL Database via Prisma.");
    useMock = false;
  } catch (error) {
    console.warn("====================================================================");
    console.warn("WARNING: Could not connect to PostgreSQL Database via Prisma ORM.");
    console.warn("Falling back to local high-performance In-Memory database driver.");
    console.warn("Demo features and dashboards are fully functional.");
    console.warn("To run with Postgres, make sure Postgres is started and matching DATABASE_URL.");
    console.warn("====================================================================");
    useMock = true;
    prisma = null;
  }
}

export function getDb() {
  return {
    prisma,
    useMock,
    mockDb
  };
}
