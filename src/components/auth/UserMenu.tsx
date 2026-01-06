import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User } from "lucide-react";

export const UserMenu = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 group relative">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || "User"}
            className="w-9 h-9 rounded-full border-2 border-gray-200"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
            <User className="w-5 h-5 text-gray-600" />
          </div>
        )}
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-gray-900">
            {user.displayName || "Admin"}
          </p>
        </div>
        {/* Email tooltip on hover */}
        <div className="hidden group-hover:block absolute top-full left-0 mt-1 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
          {user.email}
        </div>
      </div>
      <Button
        onClick={logout}
        className="p-2 text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-100 rounded-lg transition-colors"
        title="Изход"
        aria-label="Изход"
      >
        <LogOut className="w-5 h-5" />
      </Button>
    </div>
  );
};
