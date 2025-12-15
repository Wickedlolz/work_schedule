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
  subtitleClassName?: string;
  user: User | null;
}

export const Header = ({
  title,
  subtitle,
  subtitleClassName = "",
  user,
}: HeaderProps) => {
  return (
    <div className="relative text-xl sm:text-2xl md:text-4xl font-bold text-gray-800 mb-4 sm:mb-6 p-3 sm:p-4 border-b bg-linear-to-r from-red-50 via-white to-red-50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <h1 className="text-center sm:text-left w-full sm:w-auto">
          {title}{" "}
          <span className={`${subtitleClassName} block sm:inline mt-1 sm:mt-0`}>
            {subtitle}
          </span>
        </h1>
        <div className="shrink-0 w-full sm:w-auto flex justify-center sm:justify-end">
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
