import { useState, useEffect } from 'react';
import { Bell, BellRing, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useWebSocketContext } from '@/contexts/WebSocketContext';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { onMessage } = useWebSocketContext();

  // Fetch notifications
  const { data: notificationsResponse, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications', {
        params: { limit: 10, unreadOnly: true },
      });
      return data;
    },
  });

  const notifications = notificationsResponse?.data || [];
  const unreadCount = notifications.filter((n: Notification) => !n.read).length;

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await api.post('/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Handle real-time notifications
  useEffect(() => {
    const unsubscribe = onMessage('NOTIFICATION_CREATED', () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    return () => {
      unsubscribe();
    };
  }, [onMessage, queryClient]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
    
    // Handle navigation based on notification type
    if (notification.data?.eventId) {
      window.location.href = `/events/${notification.data.eventId}`;
    } else if (notification.data?.teamId) {
      window.location.href = `/teams/${notification.data.teamId}`;
    }
    
    setIsOpen(false);
  };

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllAsReadMutation.mutate();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'EVENT_UPDATE':
        return '🎯';
      case 'TEAM_UPDATE':
        return '👥';
      case 'SCORE_UPDATE':
        return '🏆';
      case 'ANNOUNCEMENT':
        return '📢';
      case 'SYSTEM':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => setIsOpen(!isOpen)}
        >
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No new notifications
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification: Notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'cursor-pointer p-4 hover:bg-muted/50',
                    !notification.read && 'bg-muted/30'
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-muted text-sm">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">
                          {notification.title}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <div className="border-t p-2 text-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => {
                // Navigate to full notifications page
                window.location.href = '/notifications';
              }}
            >
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
