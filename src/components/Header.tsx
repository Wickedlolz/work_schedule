import { lazy, Suspense } from "react";
import type { User } from "firebase/auth";

import { UserMenu } from "./auth/UserMenu";
import { Button } from "./ui/button";
import { LogIn } from "lucide-react";

// Lazy load LoginButton since it's only needed when user is not authenticated
const LoginButton = lazy(() =>
  import("./auth/LoginButton").then((module) => ({
    default: module.LoginButton,
  }))
);

// Fallback loading button while LoginButton is being loaded
const LoginButtonFallback = () => (
  <Button variant="default" className="gap-2 shadow-sm" disabled>
    <LogIn className="w-4 h-4" />
    Вход
  </Button>
);

interface HeaderProps {
  title: string;
  subtitle: string;
  user: User | null;
}

export const Header = ({ title, subtitle, user }: HeaderProps) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 mb-6 px-4 py-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {title}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 font-medium mt-1">
            {subtitle}
          </p>
        </div>
        <div className="shrink-0">
          {user ? (
            <UserMenu />
          ) : (
            <Suspense fallback={<LoginButtonFallback />}>
              <LoginButton />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
};
