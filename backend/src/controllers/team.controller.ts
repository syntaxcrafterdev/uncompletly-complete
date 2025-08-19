import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Team from '../models/Team';
import { AuthenticatedRequest } from '../middleware/auth';

export const createTeam = async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, eventId } = req.body;
    const userId = req.user?.id;

    // Check if user is already in a team for this event
    const existingTeam = await Team.findOne({
      eventId,
      'members.user': userId,
    });

    if (existingTeam) {
      return res.status(400).json({ message: 'You are already in a team for this event' });
    }

    const team = new Team({
      name,
      eventId,
      members: [{ user: userId, role: 'leader' }],
    });

    await team.save();
    res.status(201).json(team);
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTeam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const team = await Team.findById(id)
      .populate('members.user', 'name email avatar')
      .populate('eventId', 'title startDate endDate');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const joinTeam = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { code } = req.body;
    const userId = req.user?.id;

    const team = await Team.findOne({ inviteCode: code });

    if (!team) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }

    // Check if team is full
    if (team.members.length >= 5) { // Assuming max 5 members per team
      return res.status(400).json({ message: 'Team is full' });
    }

    // Check if user is already in the team
    const isMember = team.members.some(member => member.user.toString() === userId);
    if (isMember) {
      return res.status(400).json({ message: 'You are already in this team' });
    }

    // Check if user is already in another team for this event
    const existingTeam = await Team.findOne({
      'members.user': userId,
      eventId: team.eventId,
    });

    if (existingTeam) {
      return res.status(400).json({ message: 'You are already in a team for this event' });
    }

    team.members.push({ user: userId, role: 'member' });
    await team.save();

    res.json(team);
  } catch (error) {
    console.error('Join team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const leaveTeam = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { teamId } = req.params;
    const userId = req.user?.id;

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const memberIndex = team.members.findIndex(
      member => member.user.toString() === userId
    );

    if (memberIndex === -1) {
      return res.status(400).json({ message: 'You are not a member of this team' });
    }

    // If team has only one member, delete the team
    if (team.members.length === 1) {
      await team.remove();
      return res.json({ message: 'Team deleted' });
    }

    // If leaving member is the leader, assign new leader
    if (team.members[memberIndex].role === 'leader') {
      const newLeader = team.members.find(member => member.role !== 'leader');
      if (newLeader) {
        newLeader.role = 'leader';
      }
    }

    team.members.splice(memberIndex, 1);
    await team.save();

    res.json({ message: 'Left team successfully' });
  } catch (error) {
    console.error('Leave team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const generateInviteCode = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { teamId } = req.params;
    const userId = req.user?.id;

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is the team leader
    const isLeader = team.members.some(
      member => member.user.toString() === userId && member.role === 'leader'
    );

    if (!isLeader) {
      return res.status(403).json({ message: 'Only team leader can generate invite codes' });
    }

    // Generate a random 8-character invite code
    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    team.inviteCode = inviteCode;
    team.inviteExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await team.save();

    res.json({ inviteCode });
  } catch (error) {
    console.error('Generate invite code error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
