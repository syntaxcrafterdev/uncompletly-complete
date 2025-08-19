import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

type MessageHandler = (data: any) => void;

export function useWebSocket(eventId?: string) {
  const { token } = useAuth();
  const { toast } = useToast();
  const ws = useRef<WebSocket | null>(null);
  const messageHandlers = useRef<Map<string, Set<MessageHandler>>>(new Map());
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  const isConnecting = useRef(false);

  const connect = useCallback(() => {
    if (isConnecting.current || !token) return;

    isConnecting.current = true;
    
    // Close existing connection if any
    if (ws.current) {
      ws.current.close();
    }

    // Create new WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    ws.current = new WebSocket(`${protocol}//${host}/api/ws`);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      reconnectAttempts.current = 0;
      isConnecting.current = false;
      
      // Authenticate
      sendMessage({
        type: 'AUTH',
        token,
      });

      // Resubscribe to event if needed
      if (eventId) {
        sendMessage({
          type: 'SUBSCRIBE',
          payload: { eventId },
        });
      }
    };

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('WebSocket message:', message);
        
        // Call all registered handlers for this message type
        const handlers = messageHandlers.current.get(message.type);
        if (handlers) {
          handlers.forEach((handler) => handler(message.payload));
        }

        // Handle specific message types
        switch (message.type) {
          case 'ANNOUNCEMENT_CREATED':
            toast({
              title: 'New Announcement',
              description: message.payload.content,
            });
            break;
          case 'EVENT_UPDATED':
            // Invalidate event queries
            // queryClient.invalidateQueries(['event', message.payload.id]);
            break;
          case 'TEAM_UPDATED':
            // Invalidate teams queries
            // queryClient.invalidateQueries(['teams', message.payload.eventId]);
            break;
          case 'SCORE_UPDATED':
            // Invalidate scores queries
            // queryClient.invalidateQueries(['scores', message.payload.eventId]);
            break;
          default:
            break;
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      isConnecting.current = false;
      
      // Attempt to reconnect with exponential backoff
      if (reconnectAttempts.current < 5) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectAttempts.current++;
        
        console.log(`Reconnecting in ${delay}ms...`);
        reconnectTimeout.current = setTimeout(connect, delay);
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      isConnecting.current = false;
    };
  }, [token, eventId, toast]);

  // Subscribe to an event
  const subscribe = useCallback((eventId: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    
    sendMessage({
      type: 'SUBSCRIBE',
      payload: { eventId },
    });
  }, []);

  // Unsubscribe from an event
  const unsubscribe = useCallback((eventId: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    
    sendMessage({
      type: 'UNSUBSCRIBE',
      payload: { eventId },
    });
  }, []);

  // Send a message through the WebSocket
  const sendMessage = useCallback((message: any) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected');
      return;
    }
    
    try {
      ws.current.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
    }
  }, []);

  // Register a message handler
  const onMessage = useCallback((messageType: string, handler: MessageHandler) => {
    if (!messageHandlers.current.has(messageType)) {
      messageHandlers.current.set(messageType, new Set());
    }
    
    const handlers = messageHandlers.current.get(messageType)!;
    handlers.add(handler);
    
    // Return cleanup function
    return () => {
      handlers.delete(handler);
      if (handlers.size === 0) {
        messageHandlers.current.delete(messageType);
      }
    };
  }, []);

  // Set up connection and cleanup on unmount
  useEffect(() => {
    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [connect]);

  // Handle eventId changes
  useEffect(() => {
    if (!eventId || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    
    // Unsubscribe from previous event if any
    // Note: In a real app, you'd track the current subscription
    
    // Subscribe to new event
    subscribe(eventId);
    
    return () => {
      unsubscribe(eventId);
    };
  }, [eventId, subscribe, unsubscribe]);

  return useMemo(() => ({
    sendMessage,
    onMessage,
    subscribe,
    unsubscribe,
    isConnected: ws.current?.readyState === WebSocket.OPEN,
  }), [onMessage, sendMessage, subscribe, unsubscribe]);
}
