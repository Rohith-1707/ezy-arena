import { Request, Response } from 'express';
import { getDb } from '../db';
import { SocketService } from '../services/socket.service';

export class FoodController {
  /**
   * Retrieves food vendors, rating, queue length, and prep times.
   */
  static async getVendors(req: Request, res: Response) {
    try {
      const { prisma, useMock, mockDb } = getDb();
      let vendors = [];

      if (useMock) {
        vendors = mockDb.foodVendors;
      } else {
        vendors = await prisma!.foodVendor.findMany();
      }

      return res.status(200).json(vendors);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Retrieves menu items for a specific food vendor.
   */
  static async getVendorMenu(req: Request, res: Response) {
    try {
      const { vendorId } = req.params;
      const { prisma, useMock, mockDb } = getDb();

      let menuItems = [];

      if (useMock) {
        menuItems = mockDb.menuItems.filter(item => item.vendorId === vendorId);
      } else {
        menuItems = await prisma!.menuItem.findMany({
          where: { vendorId }
        });
      }

      return res.status(200).json(menuItems);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Submits a food/beverage order with real-time seat delivery support.
   */
  static async placeOrder(req: Request, res: Response) {
    try {
      const { vendorId, seatNumber, deliveryType, items, totalAmount } = req.body;
      const userId = (req as any).user?.id;
      const { prisma, useMock, mockDb } = getDb();

      if (!vendorId || !seatNumber || !deliveryType || !items || !totalAmount) {
        return res.status(400).json({ error: "Missing required food order parameters" });
      }

      let order: any = null;

      if (useMock) {
        order = {
          id: `order-${Date.now()}`,
          userId,
          vendorId,
          status: 'PENDING',
          seatNumber,
          type: deliveryType,
          items, // JSON array
          totalAmount,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        mockDb.orders.push(order);

        // Increment vendor queue length
        const vendor = mockDb.foodVendors.find(v => v.id === vendorId);
        if (vendor) {
          vendor.queueLength += 1;
        }
      } else {
        // Postgres
        order = await prisma!.foodOrder.create({
          data: {
            userId,
            vendorId,
            status: 'PENDING',
            seatNumber,
            type: deliveryType,
            items,
            totalAmount
          }
        });

        // Increment vendor queue length
        await prisma!.foodVendor.update({
          where: { id: vendorId },
          data: { queueLength: { increment: 1 } }
        });
      }

      // Emit new food order update to Vendor and Organizer panels
      SocketService.emitToRoom('organizer', 'new_food_order', order);
      SocketService.emitToRoom(`vendor:${vendorId}`, 'incoming_order', order);

      return res.status(201).json({
        message: "Order placed successfully! Check dashboard for live updates.",
        order
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Retrieves current fan order history.
   */
  static async getMyOrders(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { prisma, useMock, mockDb } = getDb();

      let orders = [];

      if (useMock) {
        const userOrders = mockDb.orders.filter(o => o.userId === userId);
        orders = userOrders.map(o => {
          const vendor = mockDb.foodVendors.find(v => v.id === o.vendorId);
          return {
            ...o,
            vendorName: vendor ? vendor.name : "Arena Vendor"
          };
        });
      } else {
        orders = await prisma!.foodOrder.findMany({
          where: { userId },
          include: {
            vendor: true
          },
          orderBy: { createdAt: 'desc' }
        });
      }

      return res.status(200).json(orders);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Updates food order delivery status (called by vendor panel).
   */
  static async updateOrderStatus(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
      const { prisma, useMock, mockDb } = getDb();

      if (!status) {
        return res.status(400).json({ error: "Order status parameter is required" });
      }

      let order: any = null;

      if (useMock) {
        order = mockDb.orders.find(o => o.id === orderId);
        if (!order) {
          return res.status(404).json({ error: "Order not found" });
        }

        // Adjust queue lengths if order completed/cancelled
        if ((status === 'COMPLETED' || status === 'CANCELLED') && order.status !== 'COMPLETED' && order.status !== 'CANCELLED') {
          const vendor = mockDb.foodVendors.find(v => v.id === order.vendorId);
          if (vendor && vendor.queueLength > 0) {
            vendor.queueLength -= 1;
          }
        }
        order.status = status;
        order.updatedAt = new Date();
      } else {
        order = await prisma!.foodOrder.findUnique({
          where: { id: orderId }
        });

        if (!order) {
          return res.status(404).json({ error: "Order not found" });
        }

        if ((status === 'COMPLETED' || status === 'CANCELLED') && order.status !== 'COMPLETED' && order.status !== 'CANCELLED') {
          await prisma!.foodVendor.update({
            where: { id: order.vendorId },
            data: { queueLength: { decrement: 1 } }
          });
        }

        order = await prisma!.foodOrder.update({
          where: { id: orderId },
          data: { status }
        });
      }

      // Notify the fan via real-time Socket and PWA notification
      SocketService.sendNotificationToUser(order.userId, {
        title: `Food Order Update`,
        message: `Your food order is now: ${status}!`,
        type: 'INFO'
      });

      // Broadcast order update to vendor room
      SocketService.emitToRoom(`vendor:${order.vendorId}`, 'order_updated', order);
      SocketService.emitToRoom('organizer', 'food_order_update', order);

      return res.status(200).json({
        message: "Order status updated successfully!",
        order
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
