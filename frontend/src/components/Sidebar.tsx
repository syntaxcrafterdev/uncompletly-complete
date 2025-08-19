import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: 'grid' },
  { name: 'Events', href: '/events', icon: 'calendar' },
  { name: 'Teams', href: '/teams', icon: 'users' },
  { name: 'Submissions', href: '/submissions', icon: 'file-text' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="hidden w-64 border-r bg-white md:flex md:flex-shrink-0">
      <div className="flex w-full flex-col">
        <div className="flex h-16 flex-shrink-0 items-center px-4">
          <h1 className="text-xl font-bold text-gray-900">SynapEvents</h1>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto">
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'group flex items-center rounded-md px-3 py-2 text-sm font-medium',
                  location.pathname.startsWith(item.href)
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <span className="truncate">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
