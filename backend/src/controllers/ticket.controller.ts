import { Request, Response } from 'express';
import { getDb } from '../db';
import { SocketService } from '../services/socket.service';

export class TicketController {
  /**
   * Retrieves entry slot options and current capacities.
   * Auto-suggests the best available entry slot based on lowest occupancy.
   */
  static async getSlots(req: Request, res: Response) {
    try {
      const { matchId, gate } = req.query;
      const { prisma, useMock, mockDb } = getDb();

      if (!matchId || !gate) {
        return res.status(400).json({ error: "matchId and gate are required queries" });
      }

      const defaultCapacityLimit = 30;
      const slots = [
        "17:00 - 17:05", "17:05 - 17:10", "17:10 - 17:15", "17:15 - 17:20",
        "17:20 - 17:25", "17:25 - 17:30", "17:30 - 17:35", "17:35 - 17:40"
      ];

      let slotStatusList: any[] = [];

      if (useMock) {
        // Retrieve or generate mock slots
        slotStatusList = slots.map(time => {
          let entry = mockDb.entrySlots.find(
            s => s.matchId === matchId && s.gate === gate && s.slotTime === time
          );
          if (!entry) {
            entry = {
              id: `slot-${gate}-${time.replace(/\s/g, '')}`,
              matchId,
              gate,
              slotTime: time,
              currentCapacity: Math.floor(Math.random() * 25), // some random initial load
              maxCapacity: defaultCapacityLimit
            };
            mockDb.entrySlots.push(entry);
          }
          return entry;
        });
      } else {
        // Postgres
        for (const time of slots) {
          let entry = await prisma!.entrySlot.findUnique({
            where: {
              matchId_gate_slotTime: {
                matchId: matchId as string,
                gate: gate as string,
                slotTime: time
              }
            }
          });

          if (!entry) {
            entry = await prisma!.entrySlot.create({
              data: {
                matchId: matchId as string,
                gate: gate as string,
                slotTime: time,
                currentCapacity: Math.floor(Math.random() * 20),
                maxCapacity: defaultCapacityLimit
              }
            });
          }
          slotStatusList.push(entry);
        }
      }

      // AI Recommendation logic: Find the slot with lowest occupancy, check if slot capacity is reached
      const openSlots = slotStatusList.filter(s => s.currentCapacity < s.maxCapacity);
      let recommendedSlot = null;
      if (openSlots.length > 0) {
        recommendedSlot = openSlots.reduce((prev, curr) => 
          prev.currentCapacity < curr.currentCapacity ? prev : curr
        );
      }

      return res.status(200).json({
        slots: slotStatusList,
        recommended: recommendedSlot
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Books a match ticket. Validates and reserves the selected 5-min gate capacity slot.
   */
  static async bookTicket(req: Request, res: Response) {
    try {
      const { matchId, seatNumber, entryGate, entrySlot } = req.body;
      const userId = (req as any).user?.id;
      const fanId = (req as any).user?.fanId;
      const { prisma, useMock, mockDb } = getDb();

      if (!matchId || !seatNumber || !entryGate || !entrySlot) {
        return res.status(400).json({ error: "Missing required booking details" });
      }

      // Check slot capacity limit (maximum 30)
      if (useMock) {
        const slot = mockDb.entrySlots.find(
          s => s.matchId === matchId && s.gate === entryGate && s.slotTime === entrySlot
        );
        if (slot && slot.currentCapacity >= slot.maxCapacity) {
          return res.status(400).json({ error: "Selected entry slot is full! Please choose another slot or entry gate." });
        }
        if (slot) slot.currentCapacity++;
      } else {
        const slot = await prisma!.entrySlot.findUnique({
          where: {
            matchId_gate_slotTime: {
              matchId,
              gate: entryGate,
              slotTime: entrySlot
            }
          }
        });
        if (slot && slot.currentCapacity >= slot.maxCapacity) {
          return res.status(400).json({ error: "Selected entry slot is full! Please choose another slot or entry gate." });
        }

        // Increment capacity
        await prisma!.entrySlot.update({
          where: { id: slot!.id },
          data: { currentCapacity: { increment: 1 } }
        });
      }

      const ticketNumber = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
      const qrCodeToken = `EZY-QR-${Date.now()}-${fanId}-${entryGate}`;

      let ticket: any = null;

      if (useMock) {
        ticket = {
          id: `ticket-${Date.now()}`,
          ticketNumber,
          matchId,
          userId,
          seatNumber,
          entryGate,
          entrySlot,
          qrCodeToken,
          status: 'ACTIVE',
          isOffline: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        mockDb.tickets.push(ticket);
      } else {
        ticket = await prisma!.ticket.create({
          data: {
            ticketNumber,
            matchId,
            userId,
            seatNumber,
            entryGate,
            entrySlot,
            qrCodeToken,
            status: 'ACTIVE'
          }
        });
      }

      // Emit real-time ticket booking to operation metrics room
      SocketService.emitToRoom('organizer', 'new_ticket_booking', {
        matchId,
        gate: entryGate,
        slot: entrySlot
      });

      return res.status(200).json({
        message: "Ticket booked successfully!",
        ticket
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Retrieves all tickets associated with the logged-in fan.
   */
  static async getMyTickets(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { prisma, useMock, mockDb } = getDb();

      let tickets = [];

      if (useMock) {
        const userTickets = mockDb.tickets.filter(t => t.userId === userId);
        // attach match and stadium name info
        tickets = userTickets.map(t => {
          const match = mockDb.matches.find(m => m.id === t.matchId);
          const stadium = match ? mockDb.stadiums.find(s => s.id === match.stadiumId) : null;
          return {
            ...t,
            matchName: match ? match.name : "FIFA Match",
            stadiumName: stadium ? stadium.name : "World Cup Arena",
            matchDate: match ? match.date : "",
            matchTime: match ? match.time : ""
          };
        });
      } else {
        tickets = await prisma!.ticket.findMany({
          where: { userId },
          include: {
            match: {
              include: {
                stadium: true
              }
            }
          }
        });
      }

      return res.status(200).json(tickets);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Validates QR pass scan. Invoked by Security Staff terminal.
   */
  static async scanQrPass(req: Request, res: Response) {
    try {
      const { qrCodeToken } = req.body;
      const { prisma, useMock, mockDb } = getDb();

      if (!qrCodeToken) {
        return res.status(400).json({ error: "QR pass token is required for validation" });
      }

      let ticket: any = null;

      if (useMock) {
        ticket = mockDb.tickets.find(t => t.qrCodeToken === qrCodeToken);
      } else {
        ticket = await prisma!.ticket.findUnique({
          where: { qrCodeToken },
          include: { user: true }
        });
      }

      if (!ticket) {
        return res.status(404).json({ valid: false, error: "Invalid QR Pass: No matching ticket found!" });
      }

      if (ticket.status === 'USED') {
        return res.status(400).json({ valid: false, error: "Expired Ticket: This pass has already been scanned and verified!" });
      }

      if (ticket.status === 'EXPIRED') {
        return res.status(400).json({ valid: false, error: "Expired Ticket: The match duration has ended." });
      }

      // Mark the ticket as used
      if (useMock) {
        ticket.status = 'USED';
        ticket.updatedAt = new Date();
      } else {
        await prisma!.ticket.update({
          where: { id: ticket.id },
          data: { status: 'USED' }
        });
      }

      // Emit real-time validation count update to security dashboard
      SocketService.emitToRoom('organizer', 'qr_scanned', {
        ticketNumber: ticket.ticketNumber,
        gate: ticket.entryGate,
        seat: ticket.seatNumber
      });

      return res.status(200).json({
        valid: true,
        message: "Access Granted! Welcome to Ezy Arena.",
        ticket: {
          ticketNumber: ticket.ticketNumber,
          seatNumber: ticket.seatNumber,
          entryGate: ticket.entryGate,
          entrySlot: ticket.entrySlot
        }
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
