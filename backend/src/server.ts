import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environmental parameters
dotenv.config();

import { initDatabase } from './db';
import { SocketService } from './services/socket.service';
import { AuthController } from './controllers/auth.controller';
import { TicketController } from './controllers/ticket.controller';
import { FoodController } from './controllers/food.controller';
import { AiController } from './controllers/ai.controller';
import { ThemeController } from './controllers/theme.controller';
import { authMiddleware, roleMiddleware } from './middleware/auth.middleware';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow all origins for easy client connection in local/dev setup
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  }
});

const PORT = process.env.PORT || 5000;

// Enable CORS & JSON Parsing
app.use(cors());
app.use(express.json());

// Diagnostics / Health Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date() });
});

// Authentication Router Entries
app.post('/api/auth/otp/request', AuthController.requestOtp);
app.post('/api/auth/otp/verify', AuthController.verifyOtp);
app.post('/api/auth/google', AuthController.googleLogin);
app.post('/api/auth/offline-ticket', AuthController.verifyOfflineTicket);

// Ticket Reservation & Slot Allocation Entries
app.get('/api/tickets/slots', TicketController.getSlots);
app.post('/api/tickets/book', authMiddleware, TicketController.bookTicket);
app.get('/api/tickets/my', authMiddleware, TicketController.getMyTickets);
app.post('/api/tickets/scan', authMiddleware, TicketController.scanQrPass);

// Smart Food Stall Ordering Entries
app.get('/api/food/vendors', FoodController.getVendors);
app.get('/api/food/menu/:vendorId', FoodController.getVendorMenu);
app.post('/api/food/order', authMiddleware, FoodController.placeOrder);
app.get('/api/food/my', authMiddleware, FoodController.getMyOrders);
app.patch('/api/food/order/:orderId/status', authMiddleware, FoodController.updateOrderStatus);

// AI Assistant natural conversation and custom prompts generator
app.post('/api/ai/chat', authMiddleware, AiController.chatAssistant);
app.post('/api/ai/theme-wallpaper', authMiddleware, AiController.generateWallpaper);

// Custom AI Theme System Entries
app.get('/api/theme/preferences', authMiddleware, ThemeController.getTheme);
app.post('/api/theme/preferences/save', authMiddleware, ThemeController.saveTheme);
app.get('/api/theme/recommend', authMiddleware, ThemeController.recommendTheme);

// Initialize system dependencies and spin up server listener
async function startServer() {
  // Initialize Database engine checks (Postgres w/ prisma -> fallback to mock database)
  await initDatabase();

  // Load Real-time Socket.IO communication service
  SocketService.init(io);

  server.listen(PORT, () => {
    console.log(`[Ezy Arena Server] Express API running on http://localhost:${PORT}`);
    console.log(`[Socket.IO Server] Active telemetry broadcast system initialized.`);
  });
}

startServer();
