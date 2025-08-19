import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const { currentUser, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-bold text-gray-900">
          SynapEvents
        </Link>
        <nav className="flex items-center space-x-4">
          {currentUser ? (
            <>
              <span className="text-sm text-gray-700">
                {currentUser.email}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
