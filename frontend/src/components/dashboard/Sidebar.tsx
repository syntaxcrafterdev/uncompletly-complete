import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { getInitials } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Trophy,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Events',
    href: '/events',
    icon: Calendar,
  },
  {
    title: 'Teams',
    href: '/teams',
    icon: Users,
  },
  {
    title: 'Judging',
    href: '/judging',
    icon: Trophy,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

interface SidebarProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  className?: string;
}

export function DashboardSidebar({ user, className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={cn(
        'relative flex h-screen flex-col border-r bg-background transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && (
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">SynapEvents</span>
          </Link>
        )}
        {isCollapsed && (
          <div className="mx-auto">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Trophy className="h-5 w-5 text-white" />
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 ml-auto"
          onClick={toggleSidebar}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center rounded-md px-3 py-2 text-sm font-medium',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  isCollapsed ? 'justify-center' : ''
                )}
              >
                <item.icon className="h-5 w-5" />
                {!isCollapsed && <span className="ml-3">{item.title}</span>}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-4">
        {!isCollapsed && user.role === 'organizer' && (
          <Button className="w-full mb-4" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Event
          </Button>
        )}
        
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
