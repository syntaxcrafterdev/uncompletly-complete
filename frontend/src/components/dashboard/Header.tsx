import { useState } from 'react';
import { Menu, Bell, Search, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { useAuth } from '@/contexts/AuthContext';
import { getInitials } from '@/lib/utils';

interface HeaderProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  onMenuToggle?: () => void;
}

export function DashboardHeader({ user, onMenuToggle }: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 md:hidden"
            onClick={onMenuToggle}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-md border-0 bg-background py-1.5 pl-10 pr-3 text-sm ring-1 ring-inset ring-gray-300 placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500"></span>
            <span className="sr-only">View notifications</span>
          </Button>
          
          <div className="relative">
            <Button
              variant="ghost"
              className="flex items-center space-x-2 px-2"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline-flex">{user.name}</span>
            </Button>
            
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1" role="none">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <div className="font-medium">{user.name}</div>
                    <div className="truncate text-gray-500">{user.email}</div>
                  </div>
                  <a
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Your Profile
                  </a>
                  <button
                    onClick={logout}
                    className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
