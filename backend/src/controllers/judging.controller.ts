import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Types } from 'mongoose';
import JudgingCriteria from '../models/JudgingCriteria';
import Score, { IScoreDocument } from '../models/Score';
import Team, { ITeamDocument } from '../models/Team';
import User, { IUserDocument } from '../models/User';
import { Score as IScore, Team as ITeam, User as IUser } from '@shared/types';
import { AuthenticatedRequest } from '../middleware/auth';
import { webSocketService } from '../services/websocket.service';
import { createTeamNotification } from './notification.controller';

interface PopulatedScore extends Omit<IScore, 'criteria' | 'team' | 'judge'> {
  criteria: { _id: Types.ObjectId; name: string; maxScore: number };
  team: { _id: Types.ObjectId; name: string };
  judge: { _id: Types.ObjectId; name: string };
}

export const createCriteria = async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, maxScore, eventId } = req.body;

    const criteria = new JudgingCriteria({
      name,
      description,
      maxScore,
      eventId,
    });

    await criteria.save();
    res.status(201).json(criteria);
  } catch (error) {
    console.error('Create criteria error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const submitScore = async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
  const { criteriaId, teamId, score, comments } = req.body;
    const judgeId = req.user?.id;

    if (!judgeId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if score already exists
    let scoreDoc = await Score.findOne({
      criteriaId,
      teamId,
      judgeId,
    });

    if (scoreDoc) {
      // Update existing score
      scoreDoc.score = score;
      scoreDoc.comments = comments;
      await scoreDoc.save();
    } else {
      // Create new score
      const team = await Team.findById(teamId).select('eventId').lean();
      scoreDoc = new Score({
        criteriaId,
        teamId,
        judgeId,
        score,
        comments,
        eventId: team?.eventId
      });
      await scoreDoc.save();
    }

    // Get the populated score for broadcasting
    const populatedScore = (await Score.findById(scoreDoc._id)
      .populate('criteria', 'name maxScore')
      .populate('team', 'name')
      .populate('judge', 'name')
      .lean()) as unknown as PopulatedScore;

    if (!populatedScore) {
      throw new Error('Failed to populate score');
    }

    // Broadcast score update
    webSocketService.notifyScoreUpdate(teamId, populatedScore);

    // Notify team members
    const team = await Team.findById(teamId).select('eventId').lean();
    await createTeamNotification(
      req.user?.id,
      teamId,
      'Score Updated',
      `Your team has received a new score for ${populatedScore.criteria.name}`,
      { 
        score: populatedScore.score, 
        maxScore: populatedScore.criteria.maxScore,
        teamId,
        criteriaId: populatedScore.criteria._id,
        eventId: team?.eventId
      }
    );

    res.json(populatedScore);
  } catch (error) {
    console.error('Error submitting score:', error);
    res.status(500).json({ message: 'Error submitting score' });
  }
};

export const getScores = async (req: Request, res: Response) => {
  try {
    const { eventId, teamId, judgeId } = req.query;
    
    const query: Record<string, any> = {};
    
    if (eventId) {
      // Get all teams for the event and use their IDs in the query
  const teams = await Team.find({ eventId: eventId }).select('_id');
  query.teamId = { $in: teams.map(t => t._id) };
    }
    
    if (teamId) {
      query.teamId = teamId;
    }
    
    if (judgeId) {
      query.judgeId = judgeId;
    }

    const scores = await Score.find(query)
      .populate('criteriaId', 'name description maxScore')
      .populate('teamId', 'name')
      .populate('judgeId', 'name email')
      .lean();

    res.json(scores);
  } catch (error) {
    console.error('Get scores error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCriteria = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const criteria = await JudgingCriteria.find({ eventId });
    res.json(criteria);
  } catch (error) {
    console.error('Get criteria error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getJudgingProgress = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    
    // Get all teams for the event
  const teams = await Team.find({ eventId: eventId });
    
    // Get all judges for the event
    const judges = await User.find({ 
      role: 'judge', 
      judgingEvents: eventId 
    });
    
    // Get all criteria for the event
  const criteria = await JudgingCriteria.find({ eventId: eventId });
    
    // Get all scores for the event
    const scores = await Score.find({ 
      teamId: { $in: teams.map(t => t._id) },
      judgeId: { $in: judges.map(j => j._id) }
    });

    // Calculate progress for each judge
    const progress = await Promise.all(judges.map(async (judge) => {
      const judgeScores = scores.filter(s => 
        s.judgeId.toString() === judge._id.toString()
      );
      
      const totalPossibleScores = teams.length * criteria.length;
      const completedScores = judgeScores.length;
      
      // Get teams that haven't been fully scored by this judge
      const unscoredTeams = teams.filter(team => {
        const teamScores = judgeScores.filter(s => 
          s.projectId.toString() === team._id.toString()
        );
        return teamScores.length < criteria.length;
      });
      
      return {
        judge: {
          id: judge._id,
          name: judge.name,
          email: judge.email,
        },
        completed: completedScores,
        total: totalPossibleScores,
        percentage: Math.round((completedScores / Math.max(1, totalPossibleScores)) * 100),
        unscoredTeams: unscoredTeams.map(t => ({
          id: t._id,
          name: t.name
        }))
      };
    }));

    res.json(progress);
  } catch (error) {
    console.error('Get judging progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
