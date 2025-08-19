// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'participant' | 'organizer' | 'judge' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// Event related types
export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  isOnline: boolean;
  maxParticipants?: number;
  status: 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  organizerId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Team related types
export interface Team {
  id: string;
  name: string;
  eventId: string;
  members: string[]; // Array of user IDs
  projectId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Project submission types
export interface Project {
  id: string;
  title: string;
  description: string;
  eventId: string;
  teamId: string;
  repoUrl?: string;
  videoUrl?: string;
  submissionDate: Date;
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

// Judging criteria and scores
export interface JudgingCriteria {
  id: string;
  name: string;
  description: string;
  maxScore: number;
  eventId: string;
}

export interface Score {
  id: string;
  projectId: string;
  judgeId: string;
  criteriaId: string;
  score: number;
  comments?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Announcement types
export interface Announcement {
  id: string;
  eventId: string;
  title: string;
  content: string;
  authorId: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Authentication types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  role: 'participant' | 'organizer' | 'judge';
}
