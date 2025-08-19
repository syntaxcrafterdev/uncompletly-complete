import { createContext, useContext, ReactNode } from 'react';
import { useWebSocket, WebSocketHandlers } from '@/hooks/useWebSocket';

interface WebSocketContextType extends WebSocketHandlers {
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ 
  children,
  eventId 
}: { 
  children: ReactNode;
  eventId?: string;
}) {
  const webSocket = useWebSocket(eventId);

  return (
    <WebSocketContext.Provider value={webSocket}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}
