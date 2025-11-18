import { calculateTotalWorkHours } from "@/lib/utils";
import type { Schedule } from "@/lib/types";

interface TotalWorkHoursSummaryProps {
  schedules: Schedule[];
  days: string[];
  isAuthenticated: boolean;
}

export const TotalWorkHoursSummary = ({
  schedules,
  days,
  isAuthenticated,
}: TotalWorkHoursSummaryProps) => {
  if (!isAuthenticated) return null;

  return (
    <div className="bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 rounded-lg p-4 shadow-sm">
      <h3 className="text-sm font-medium text-gray-700 mb-2">
        📊 Общо работни часове за всички графици:
      </h3>
      <div className="space-y-2">
        {schedules.map((schedule) => {
          const totalHours = calculateTotalWorkHours(schedule.employees, days);
          return (
            <div
              key={schedule.id}
              className="flex justify-between items-center text-sm"
            >
              <span className="text-gray-700">{schedule.name}:</span>
              <span className="font-semibold text-gray-900">{totalHours}ч</span>
            </div>
          );
        })}
        <div className="pt-2 mt-2 border-t border-rose-300 flex justify-between items-center">
          <span className="font-semibold text-gray-800">Общо:</span>
          <span className="text-lg font-bold text-rose-700">
            {schedules.reduce(
              (total, schedule) =>
                total + calculateTotalWorkHours(schedule.employees, days),
              0
            )}
            ч
          </span>
        </div>
      </div>
    </div>
  );
};
