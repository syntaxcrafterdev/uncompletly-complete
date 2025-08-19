import { Request, Response } from 'express';
import Event from '../models/Event';
import { AuthenticatedRequest } from '../middleware/auth';

export const createEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, startDate, endDate, location, isOnline, maxParticipants } = req.body;
    
    const newEvent = new Event({
      title,
      description,
      startDate,
      endDate,
      location,
      isOnline: isOnline || false,
      maxParticipants,
      organizerId: req.user?.id,
      status: 'upcoming'
    });

    const event = await newEvent.save();
    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getEvents = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const query: any = {};
    
    if (status) {
      query.status = status;
    }

    const events = await Event.find(query)
      .populate('organizerId', 'name email')
      .sort({ startDate: 1 });
      
    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizerId', 'name email');
      
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, startDate, endDate, location, isOnline, maxParticipants, status } = req.body;
    
    let event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is the organizer or admin
    if (event.organizerId.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }
    
    // Update fields
    event.title = title || event.title;
    event.description = description || event.description;
    if (startDate) event.startDate = startDate;
    if (endDate) event.endDate = endDate;
    if (location) event.location = location;
    if (isOnline !== undefined) event.isOnline = isOnline;
    if (maxParticipants) event.maxParticipants = maxParticipants;
    if (status) event.status = status;
    
    await event.save();
    
    res.json(event);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is the organizer or admin
    if (event.organizerId.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }
    
    await event.remove();
    
    res.json({ message: 'Event removed' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
