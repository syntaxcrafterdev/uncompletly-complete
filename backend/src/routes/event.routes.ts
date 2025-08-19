import { Router } from 'express';
import { body } from 'express-validator';
import { 
  createEvent, 
  getEvents, 
  getEvent, 
  updateEvent, 
  deleteEvent 
} from '../controllers/event.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// @route   GET api/events
// @desc    Get all events
// @access  Public
router.get('/', getEvents);

// @route   GET api/events/:id
// @desc    Get event by ID
// @access  Public
router.get('/:id', getEvent);

// Protected routes (require authentication)
router.use(authenticate);

// @route   POST api/events
// @desc    Create a new event
// @access  Private (Organizer/Admin)
router.post(
  '/',
  [
    body('title', 'Title is required').not().isEmpty(),
    body('description', 'Description is required').not().isEmpty(),
    body('startDate', 'Start date is required').isISO8601(),
    body('endDate', 'End date is required').isISO8601(),
    body('location', 'Location is required').not().isEmpty(),
  ],
  authorize('organizer', 'admin'),
  createEvent
);

// @route   PUT api/events/:id
// @desc    Update an event
// @access  Private (Organizer/Admin)
router.put(
  '/:id',
  authorize('organizer', 'admin'),
  updateEvent
);

// @route   DELETE api/events/:id
// @desc    Delete an event
// @access  Private (Organizer/Admin)
router.delete(
  '/:id',
  authorize('organizer', 'admin'),
  deleteEvent
);

export default router;
