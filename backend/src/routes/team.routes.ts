import { Router } from 'express';
import { body, param } from 'express-validator';
import * as teamController from '../controllers/team.controller';
import { auth } from '../middleware/auth';

const router = Router();

// Create a new team
router.post(
  '/',
  [
    auth,
    body('name').trim().notEmpty().withMessage('Team name is required'),
    body('eventId').isMongoId().withMessage('Invalid event ID'),
  ],
  teamController.createTeam
);

// Get team details
router.get('/:id', [auth, param('id').isMongoId()], teamController.getTeam);

// Join a team using invite code
router.post(
  '/join',
  [
    auth,
    body('code').trim().notEmpty().withMessage('Invite code is required'),
  ],
  teamController.joinTeam
);

// Leave a team
router.post(
  '/:teamId/leave',
  [auth, param('teamId').isMongoId()],
  teamController.leaveTeam
);

// Generate team invite code
router.post(
  '/:teamId/generate-invite',
  [auth, param('teamId').isMongoId()],
  teamController.generateInviteCode
);

export default router;
