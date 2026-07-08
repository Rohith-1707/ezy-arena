import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getDb } from '../db';
import { NotificationService } from '../services/notification.service';

const JWT_SECRET = process.env.JWT_SECRET || 'ezy_arena_super_secret_jwt_key_2026';

// Helper to generate a random 7-character alphanumeric string (uppercase, e.g. X7P4K9A)
function generateFanId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export class AuthController {
  /**
   * Simulates register/login and OTP generation.
   * Send email or phone.
   */
  static async requestOtp(req: Request, res: Response) {
    try {
      const { email, phone, role } = req.body;

      if (!email && !phone) {
        return res.status(400).json({ error: "Email or phone number is required" });
      }

      // Generate a mock 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Log/dispatch OTP
      console.log(`[OTP Verification] Generated OTP ${otp} for target ${email || phone}`);
      
      // In a real application, send via Twilio SMS or SendGrid Email.
      // For testing, we send a simulated notification
      await NotificationService.sendNotification({
        userId: "pre-auth",
        title: "Ezy Arena Verification Code",
        message: `Your verification OTP code is: ${otp}. Valid for 5 minutes.`,
        type: 'INFO'
      });

      // Return OTP in response in development mode for easy manual testing
      return res.status(200).json({ 
        message: "OTP sent successfully", 
        devOtp: otp // handy for the client to prefill or inspect
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Verifies OTP and registers or logs in user, returning JWT and Fan ID.
   */
  static async verifyOtp(req: Request, res: Response) {
    try {
      const { email, phone, otp, role, name } = req.body;
      const { prisma, useMock, mockDb } = getDb();

      if (!otp) {
        return res.status(400).json({ error: "OTP code is required" });
      }

      const userRole = role || 'FAN';
      const userName = name || (email ? email.split('@')[0] : 'Spectator');

      let user: any = null;

      if (useMock) {
        // Find existing mock user
        user = mockDb.users.find(u => 
          (email && u.email === email) || (phone && u.phone === phone)
        );

        if (!user) {
          user = {
            id: `user-${Date.now()}`,
            email,
            phone,
            name: userName,
            role: userRole,
            fanId: userRole === 'FAN' ? generateFanId() : null,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          mockDb.users.push(user);
        }
      } else {
        // Postgres lookup
        user = await prisma!.user.findFirst({
          where: {
            OR: [
              email ? { email } : {},
              phone ? { phone } : {}
            ].filter(Boolean) as any
          }
        });

        if (!user) {
          const fanId = userRole === 'FAN' ? generateFanId() : null;
          user = await prisma!.user.create({
            data: {
              email,
              phone,
              name: userName,
              role: userRole,
              fanId
            }
          });
        }
      }

      // Issue JWT Token
      const token = jwt.sign(
        { id: user.id, role: user.role, email: user.email, fanId: user.fanId },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      return res.status(200).json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          fanId: user.fanId
        }
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Integrates Google registration and logs user in directly.
   */
  static async googleLogin(req: Request, res: Response) {
    try {
      const { email, name, googleId } = req.body;
      const { prisma, useMock, mockDb } = getDb();

      if (!email) {
        return res.status(400).json({ error: "Google email is required" });
      }

      let user: any = null;

      if (useMock) {
        user = mockDb.users.find(u => u.email === email);
        if (!user) {
          user = {
            id: `user-${Date.now()}`,
            email,
            name: name || 'Google User',
            role: 'FAN',
            fanId: generateFanId(),
            createdAt: new Date(),
            updatedAt: new Date()
          };
          mockDb.users.push(user);
        }
      } else {
        user = await prisma!.user.findUnique({
          where: { email }
        });

        if (!user) {
          user = await prisma!.user.create({
            data: {
              email,
              name: name || 'Google User',
              role: 'FAN',
              fanId: generateFanId()
            }
          });
        }
      }

      const token = jwt.sign(
        { id: user.id, role: user.role, email: user.email, fanId: user.fanId },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      return res.status(200).json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          fanId: user.fanId
        }
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Offline Ticket activation:
   * Verification of paper barcode number -> generates virtual QR pass & Fan ID.
   */
  static async verifyOfflineTicket(req: Request, res: Response) {
    try {
      const { ticketNumber, phone, name } = req.body;
      const { prisma, useMock, mockDb } = getDb();

      if (!ticketNumber || !phone) {
        return res.status(400).json({ error: "Ticket number and phone are required" });
      }

      // Check if ticket number is already claimed
      let existingClaimedTicket = false;
      if (useMock) {
        existingClaimedTicket = mockDb.tickets.some(t => t.ticketNumber === ticketNumber);
      } else {
        const ticket = await prisma!.ticket.findUnique({
          where: { ticketNumber }
        });
        if (ticket) existingClaimedTicket = true;
      }

      if (existingClaimedTicket) {
        return res.status(400).json({ error: "This offline ticket number has already been registered." });
      }

      // Create new fan account and issue the ticket
      let user: any = null;
      if (useMock) {
        user = mockDb.users.find(u => u.phone === phone);
        if (!user) {
          user = {
            id: `user-${Date.now()}`,
            phone,
            name: name || `Offline Fan`,
            role: 'FAN',
            fanId: generateFanId(),
            createdAt: new Date(),
            updatedAt: new Date()
          };
          mockDb.users.push(user);
        }

        // Auto-assign random match for offline ticket demo
        const match = mockDb.matches[0];
        const newTicket = {
          id: `ticket-${Date.now()}`,
          ticketNumber,
          matchId: match.id,
          userId: user.id,
          seatNumber: "Section 104, Row K, Seat 12",
          entryGate: "Gate B",
          entrySlot: "17:15 - 17:20",
          qrCodeToken: `OFFLINE-QR-${Date.now()}-${user.fanId}`,
          status: 'ACTIVE',
          isOffline: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        mockDb.tickets.push(newTicket);
      } else {
        // Postgres
        user = await prisma!.user.findUnique({
          where: { phone }
        });

        if (!user) {
          user = await prisma!.user.create({
            data: {
              phone,
              name: name || `Offline Fan`,
              role: 'FAN',
              fanId: generateFanId()
            }
          });
        }

        const match = (await prisma!.match.findFirst()) || { id: "default" };
        await prisma!.ticket.create({
          data: {
            ticketNumber,
            matchId: match.id,
            userId: user.id,
            seatNumber: "Section 104, Row K, Seat 12",
            entryGate: "Gate B",
            entrySlot: "17:15 - 17:20",
            qrCodeToken: `OFFLINE-QR-${Date.now()}-${user.fanId}`,
            status: 'ACTIVE',
            isOffline: true
          }
        });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role, email: user.email, fanId: user.fanId },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      return res.status(200).json({
        message: "Offline ticket verified and digital pass activated!",
        token,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          fanId: user.fanId
        }
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
