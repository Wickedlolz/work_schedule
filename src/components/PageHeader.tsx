import type { User } from "firebase/auth";

import { LoginButton } from "./auth/LoginButton";
import { UserMenu } from "./auth/UserMenu";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  subtitleClassName?: string;
  user: User | null;
}

export const PageHeader = ({
  title,
  subtitle,
  subtitleClassName = "",
  user,
}: PageHeaderProps) => {
  return (
    <div className="relative text-xl sm:text-2xl md:text-4xl font-bold text-gray-800 mb-4 sm:mb-6 p-3 sm:p-4 border-b bg-gradient-to-r from-red-50 via-white to-red-50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <h1 className="text-center sm:text-left w-full sm:w-auto">
          {title}{" "}
          <span className={`${subtitleClassName} block sm:inline mt-1 sm:mt-0`}>
            {subtitle}
          </span>
        </h1>
        <div className="flex-shrink-0 w-full sm:w-auto flex justify-center sm:justify-end">
          {user ? <UserMenu /> : <LoginButton />}
        </div>
      </div>
    </div>
  );
};
