import { Server as WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

interface Client extends WebSocket {
  id: string;
  userId?: string;
  eventId?: string;
}

type MessageHandler = (ws: Client, payload: any) => void;

class WebSocketService {
  private wss: WebSocketServer;
  private clients: Map<string, Client> = new Map();
  private userConnections: Map<string, Set<string>> = new Map(); // userId -> Set of clientIds
  private eventSubscriptions: Map<string, Set<string>> = new Map(); // eventId -> Set of clientIds
  private messageHandlers: Map<string, MessageHandler> = new Map();

  constructor(server: HttpServer) {
    this.wss = new WebSocketServer({ server });
    this.setupMessageHandlers();
    this.setupConnectionHandlers();
  }

  private setupMessageHandlers() {
    this.messageHandlers.set('AUTH', this.handleAuth.bind(this));
    this.messageHandlers.set('SUBSCRIBE', this.handleSubscribe.bind(this));
    this.messageHandlers.set('UNSUBSCRIBE', this.handleUnsubscribe.bind(this));
  }

  private setupConnectionHandlers() {
    this.wss.on('connection', (ws: Client) => {
      ws.id = uuidv4();
      this.clients.set(ws.id, ws);

      console.log(`New connection: ${ws.id}`);

      ws.on('message', (message: string) => this.handleMessage(ws, message));
      ws.on('close', () => this.handleDisconnect(ws));
      ws.on('error', (error) => this.handleError(ws, error));
    });
  }

  private async handleMessage(ws: Client, message: string) {
    try {
      const { type, payload, token } = JSON.parse(message);
      const handler = this.messageHandlers.get(type);
      
      if (handler) {
        await handler(ws, { ...payload, token });
      } else {
        console.warn(`No handler for message type: ${type}`);
        this.sendToClient(ws.id, {
          type: 'ERROR',
          payload: { message: 'Unknown message type' },
        });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      this.sendToClient(ws.id, {
        type: 'ERROR',
        payload: { message: 'Invalid message format' },
      });
    }
  }

  private async handleAuth(ws: Client, { token }: { token: string }) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { id: string };
      const userId = decoded.id;
      
      // Update client with user ID
      ws.userId = userId;
      
      // Track user's connections
      if (!this.userConnections.has(userId)) {
        this.userConnections.set(userId, new Set());
      }
      this.userConnections.get(userId)?.add(ws.id);
      
      this.sendToClient(ws.id, { 
        type: 'AUTH_SUCCESS',
        payload: { userId }
      });
      
      console.log(`Client ${ws.id} authenticated as user ${userId}`);
    } catch (error) {
      console.error('Authentication failed:', error);
      this.sendToClient(ws.id, { 
        type: 'AUTH_ERROR', 
        payload: { message: 'Authentication failed' } 
      });
      ws.close();
    }
  }

  private handleSubscribe(ws: Client, { eventId }: { eventId: string }) {
    if (!ws.userId) {
      this.sendToClient(ws.id, {
        type: 'ERROR',
        payload: { message: 'Not authenticated' },
      });
      return;
    }

    // Unsubscribe from previous event if any
    if (ws.eventId && ws.eventId !== eventId) {
      this.handleUnsubscribe(ws, { eventId: ws.eventId });
    }

    ws.eventId = eventId;
    
    if (!this.eventSubscriptions.has(eventId)) {
      this.eventSubscriptions.set(eventId, new Set());
    }
    this.eventSubscriptions.get(eventId)?.add(ws.id);

    console.log(`Client ${ws.id} subscribed to event ${eventId}`);
    
    this.sendToClient(ws.id, {
      type: 'SUBSCRIBE_SUCCESS',
      payload: { eventId }
    });
  }

  private handleUnsubscribe(ws: Client, { eventId }: { eventId: string }) {
    const subscribers = this.eventSubscriptions.get(eventId);
    if (subscribers) {
      subscribers.delete(ws.id);
      if (subscribers.size === 0) {
        this.eventSubscriptions.delete(eventId);
      }
      console.log(`Client ${ws.id} unsubscribed from event ${eventId}`);
    }
    
    if (ws.eventId === eventId) {
      delete ws.eventId;
    }
  }

  private handleDisconnect(ws: Client) {
    console.log(`Client disconnected: ${ws.id}`);
    
    // Clean up user connections
    if (ws.userId) {
      const userConnections = this.userConnections.get(ws.userId);
      if (userConnections) {
        userConnections.delete(ws.id);
        if (userConnections.size === 0) {
          this.userConnections.delete(ws.userId);
        }
      }
    }
    
    // Clean up event subscriptions
    if (ws.eventId) {
      this.handleUnsubscribe(ws, { eventId: ws.eventId });
    }
    
    this.clients.delete(ws.id);
  }

  private handleError(ws: Client, error: Error) {
    console.error(`WebSocket error for client ${ws.id}:`, error);
  }

  // Public API
  public broadcastToEvent(eventId: string, message: any) {
    const subscribers = this.eventSubscriptions.get(eventId) || new Set();
    const messageStr = JSON.stringify(message);

    subscribers.forEach((clientId) => {
      const client = this.clients.get(clientId);
      if (client?.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  public sendToUser(userId: string, message: any) {
    const messageStr = JSON.stringify(message);
    const connections = this.userConnections.get(userId) || new Set();
    
    connections.forEach((clientId) => {
      const client = this.clients.get(clientId);
      if (client?.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  public sendToClient(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (client?.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  public notifyEventUpdate(eventId: string, data: any) {
    this.broadcastToEvent(eventId, {
      type: 'EVENT_UPDATED',
      payload: data,
      timestamp: new Date().toISOString(),
    });
  }

  public notifyTeamUpdate(eventId: string, data: any) {
    this.broadcastToEvent(eventId, {
      type: 'TEAM_UPDATED',
      payload: data,
      timestamp: new Date().toISOString(),
    });
  }

  public notifyScoreUpdate(eventId: string, data: any) {
    this.broadcastToEvent(eventId, {
      type: 'SCORE_UPDATED',
      payload: data,
      timestamp: new Date().toISOString(),
    });
  }

  public notifyNewAnnouncement(eventId: string, data: any) {
    this.broadcastToEvent(eventId, {
      type: 'ANNOUNCEMENT_CREATED',
      payload: {
        ...data,
        timestamp: new Date().toISOString(),
      },
    });
  }

  public getStats() {
    return {
      totalConnections: this.clients.size,
      totalUsers: this.userConnections.size,
      totalEventSubscriptions: this.eventSubscriptions.size,
    };
  }
}

export let webSocketService: WebSocketService;

export const initWebSocketService = (server: HttpServer) => {
  webSocketService = new WebSocketService(server);
  return webSocketService;
};
