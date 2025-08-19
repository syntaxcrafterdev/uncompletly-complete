import { Router } from 'express';
import { query, param } from 'express-validator';
import * as notificationController from '../controllers/notification.controller';
import { auth } from '../middleware/auth';

const router = Router();

// Get notifications for the authenticated user
router.get(
  '/',
  [
    auth,
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('page').optional().isInt({ min: 1 }),
    query('unreadOnly').optional().isBoolean(),
  ],
  notificationController.getNotifications
);

// Mark a notification as read
router.patch(
  '/:id/read',
  [auth, param('id').isMongoId()],
  notificationController.markAsRead
);

// Mark all notifications as read
router.post(
  '/read-all',
  auth,
  notificationController.markAllAsRead
);

export default router;
