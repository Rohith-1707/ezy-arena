import { Server } from 'socket.io';

export class SocketService {
  private static io: Server | null = null;
  private static mockInterval: NodeJS.Timeout | null = null;

  static init(io: Server) {
    this.io = io;

    io.on('connection', (socket) => {
      console.log(`[Socket.IO] New client connected: ${socket.id}`);

      // Allow joining role-based rooms (e.g. 'fan', 'organizer', 'vendor', 'security')
      socket.on('join_room', (room: string) => {
        socket.join(room);
        console.log(`[Socket.IO] Client ${socket.id} joined room: ${room}`);
      });

      socket.on('disconnect', () => {
        console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
      });
    });

    // Start simulated live stadium environment telemetry
    this.startSimulatedTelemetry();
  }

  static getIo() {
    return this.io;
  }

  /**
   * Broadcasts a live notification to a specific user
   */
  static sendNotificationToUser(userId: string, notification: any) {
    if (this.io) {
      this.io.emit(`notification:${userId}`, notification);
    }
  }

  /**
   * Broadcasts update to a specific room
   */
  static emitToRoom(room: string, event: string, data: any) {
    if (this.io) {
      this.io.to(room).emit(event, data);
    }
  }

  /**
   * Generates periodic mock statistics mimicking thousands of fans in the stadium
   */
  private static startSimulatedTelemetry() {
    if (this.mockInterval) clearInterval(this.mockInterval);

    this.mockInterval = setInterval(() => {
      if (!this.io) return;

      // 1. Entry gate slot utilization (simulation)
      const gateStats = {
        timestamp: new Date(),
        gates: [
          { name: "Gate A", currentCount: Math.floor(Math.random() * 10) + 15, capacity: 30, status: "OPEN" },
          { name: "Gate B", currentCount: Math.floor(Math.random() * 5) + 25, capacity: 30, status: "WARNING" },
          { name: "Gate C", currentCount: Math.floor(Math.random() * 8) + 8, capacity: 30, status: "OPEN" },
          { name: "Gate D", currentCount: Math.floor(Math.random() * 4) + 26, capacity: 30, status: "FULL" },
          { name: "Gate E", currentCount: Math.floor(Math.random() * 12) + 2, capacity: 30, status: "OPEN" }
        ],
        avgWaitTime: Math.floor(Math.random() * 6) + 4 // in minutes
      };
      this.io.to('organizer').emit('entry_telemetry', gateStats);

      // 2. Crowd Heatmap densities & risk anomalies
      const crowdHeatmap = {
        zones: [
          { zoneId: "Z-1", name: "North Concourse", density: 0.35 + Math.random() * 0.1, color: "green" },
          { zoneId: "Z-2", name: "East Entry Gates", density: 0.85 + Math.random() * 0.1, color: "red" },
          { zoneId: "Z-3", name: "South Food Court", density: 0.65 + Math.random() * 0.15, color: "orange" },
          { zoneId: "Z-4", name: "West Gate Plaza", density: 0.20 + Math.random() * 0.1, color: "green" },
          { zoneId: "Z-5", name: "VIP Executive Lounge", density: 0.45 + Math.random() * 0.05, color: "green" }
        ]
      };
      this.io.to('organizer').emit('crowd_telemetry', crowdHeatmap);

      // 3. Security Screening lanes wait times
      const securityLanes = {
        lanes: [
          { id: 1, name: "Lane 1 (Express)", status: "ACTIVE", screeningTimeSec: 45 + Math.floor(Math.random() * 15), staff: "John D." },
          { id: 2, name: "Lane 2 (Bags)", status: "ACTIVE", screeningTimeSec: 120 + Math.floor(Math.random() * 40), staff: "Sarah K." },
          { id: 3, name: "Lane 3 (General)", status: "ACTIVE", screeningTimeSec: 80 + Math.floor(Math.random() * 20), staff: "Mike R." },
          { id: 4, name: "Lane 4 (Special)", status: "INACTIVE", screeningTimeSec: 0, staff: "None" }
        ]
      };
      this.io.to('organizer').emit('security_telemetry', securityLanes);

      // 4. Live Food orders dashboard
      const vendorStats = {
        vendors: [
          { id: "vendor-1", queueLength: Math.floor(Math.random() * 6) + 10, avgPrepTime: Math.floor(Math.random() * 3) + 6 },
          { id: "vendor-2", queueLength: Math.floor(Math.random() * 4) + 4, avgPrepTime: Math.floor(Math.random() * 2) + 3 },
          { id: "vendor-3", queueLength: Math.floor(Math.random() * 2) + 1, avgPrepTime: Math.floor(Math.random() * 1) + 2 },
          { id: "vendor-4", queueLength: Math.floor(Math.random() * 10) + 12, avgPrepTime: Math.floor(Math.random() * 2) + 2 }
        ]
      };
      this.io.to('organizer').emit('vendor_telemetry', vendorStats);

      // 5. Parking slot occupancy
      const parkingStats = {
        lots: [
          { id: "A", name: "Parking Lot A (VIP)", total: 500, occupied: Math.floor(Math.random() * 20) + 475 },
          { id: "B", name: "Parking Lot B (General)", total: 2500, occupied: Math.floor(Math.random() * 150) + 2100 },
          { id: "C", name: "Parking Lot C (West)", total: 1800, occupied: Math.floor(Math.random() * 100) + 950 }
        ]
      };
      this.io.to('organizer').emit('parking_telemetry', parkingStats);

      // 6. Sustainability telemetry (Electricity, water, carbon)
      const sustainabilityStats = {
        electricity: 1800 + Math.floor(Math.random() * 200), // kW
        water: 450 + Math.floor(Math.random() * 50), // Liters/min
        plasticWasteKg: 120 + Math.floor(Math.random() * 15),
        foodWasteKg: 85 + Math.floor(Math.random() * 10),
        carbonGrams: 980 + Math.floor(Math.random() * 100)
      };
      this.io.to('organizer').emit('sustainability_telemetry', sustainabilityStats);

      // 7. Live Weather
      const weatherStats = {
        temp: 26 + (Math.sin(Date.now() / 100000) * 2), // smooth temp change
        humidity: 62 + Math.floor(Math.random() * 5),
        condition: "Clear Night"
      };
      this.io.emit('weather_telemetry', weatherStats);

    }, 5000); // Send updates every 5 seconds
  }
}
