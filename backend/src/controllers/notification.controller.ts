import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Notification, { INotification } from '../models/Notification';
import { AuthenticatedRequest } from '../middleware/auth';
import { webSocketService } from '../services/websocket.service';

export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { limit = '10', page = '1', unreadOnly = 'false' } = req.query;
    const userId = req.user?.id;

    const query: any = { userId };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string, 10))
      .skip((parseInt(page as string, 10) - 1) * parseInt(limit as string, 10));

    const total = await Notification.countDocuments(query);

    res.json({
      data: notifications,
      pagination: {
        total,
        page: parseInt(page as string, 10),
        totalPages: Math.ceil(total / parseInt(limit as string, 10)),
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const markAllAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createNotification = async (notificationData: Omit<INotification, 'read' | 'createdAt' | 'updatedAt'>) => {
  try {
    const notification = new Notification({
      ...notificationData,
      read: false,
    });

    await notification.save();
    
    // Emit real-time update
    webSocketService.sendToUser(notification.userId.toString(), {
      type: 'NOTIFICATION_CREATED',
      payload: notification,
    });

    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

export const createEventNotification = async (
  userId: string,
  eventId: string,
  title: string,
  message: string,
  data?: Record<string, any>
) => {
  return createNotification({
    userId: new mongoose.Types.ObjectId(userId),
    type: 'EVENT_UPDATE',
    title,
    message,
    data: { ...data, eventId },
  });
};

export const createTeamNotification = async (
  userId: string,
  teamId: string,
  title: string,
  message: string,
  data?: Record<string, any>
) => {
  return createNotification({
    userId: new mongoose.Types.ObjectId(userId),
    type: 'TEAM_UPDATE',
    title,
    message,
    data: { ...data, teamId },
  });
};

export const createAnnouncement = async (
  userIds: string[],
  title: string,
  message: string,
  data?: Record<string, any>
) => {
  const notifications = await Promise.all(
    userIds.map(userId =>
      createNotification({
        userId: new mongoose.Types.ObjectId(userId),
        type: 'ANNOUNCEMENT',
        title,
        message,
        data,
      })
    )
  );

  // Broadcast announcement to all connected clients
  webSocketService.broadcastToEvent(data?.eventId || 'global', {
    type: 'ANNOUNCEMENT_CREATED',
    payload: {
      title,
      message,
      data,
      createdAt: new Date(),
    },
  });

  return notifications;
};
