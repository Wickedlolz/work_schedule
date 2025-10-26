import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User } from "lucide-react";

export const UserMenu = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || "User"}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
        )}
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-gray-900">
            {user.displayName || "Admin"}
          </p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
      </div>
      <Button
        onClick={logout}
        variant="outline"
        size="sm"
        className="cursor-pointer"
      >
        <LogOut className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">Изход</span>
      </Button>
    </div>
  );
};
