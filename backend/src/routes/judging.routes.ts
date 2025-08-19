import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as judgingController from '../controllers/judging.controller';
import { auth } from '../middleware/auth';
import { isJudge } from '../middleware/roles';

const router = Router();

// Create judging criteria (Admin only)
router.post(
  '/criteria',
  [
    auth,
    isJudge,
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('maxScore').isInt({ min: 1 }).withMessage('Max score must be at least 1'),
    body('eventId').isMongoId().withMessage('Invalid event ID'),
  ],
  judgingController.createCriteria
);

// Submit score (Judge only)
router.post(
  '/scores',
  [
    auth,
    isJudge,
    body('criteriaId').isMongoId().withMessage('Invalid criteria ID'),
    body('teamId').isMongoId().withMessage('Invalid team ID'),
    body('score').isNumeric().withMessage('Score must be a number'),
    body('notes').optional().isString(),
  ],
  judgingController.submitScore
);

// Get scores
router.get(
  '/scores',
  [
    query('eventId').optional().isMongoId().withMessage('Invalid event ID'),
    query('teamId').optional().isMongoId().withMessage('Invalid team ID'),
  ],
  judgingController.getScores
);

// Get judging criteria for an event
router.get(
  '/criteria/:eventId',
  [param('eventId').isMongoId().withMessage('Invalid event ID')],
  judgingController.getCriteria
);

// Get judging progress for an event
router.get(
  '/progress/:eventId',
  [
    auth,
    param('eventId').isMongoId().withMessage('Invalid event ID'),
  ],
  judgingController.getJudgingProgress
);

export default router;
