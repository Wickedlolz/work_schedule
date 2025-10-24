import { Button } from "@/components/ui/button";
import { MESSAGES } from "@/lib/constants";

interface EmptyStateProps {
  onCreateSchedule: () => void;
}

/**
 * Empty state component displayed when no schedules exist
 */
export const EmptyState = ({ onCreateSchedule }: EmptyStateProps) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <p className="text-gray-600 text-lg mb-4">{MESSAGES.noSchedules}</p>
      <Button onClick={onCreateSchedule}>{MESSAGES.createFirstSchedule}</Button>
    </div>
  </div>
);
