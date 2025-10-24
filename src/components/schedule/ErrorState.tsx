import { Button } from "@/components/ui/button";
import { MESSAGES } from "@/lib/constants";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

/**
 * Error state component displayed when an error occurs while loading schedules
 */
export const ErrorState = ({ error, onRetry }: ErrorStateProps) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <p className="text-red-600 text-lg mb-4">Грешка: {error}</p>
      <Button onClick={onRetry}>{MESSAGES.retryButton}</Button>
    </div>
  </div>
);
