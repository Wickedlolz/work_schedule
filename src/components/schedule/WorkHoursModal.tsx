import { cn, calculateEmployeeWorkHours } from "@/lib/utils";
import type { Employee } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WorkHoursModalProps {
  open: boolean;
  employee: Employee | null;
  days: string[];
  onClose: () => void;
}

export const WorkHoursModal = ({
  open,
  employee,
  days,
  onClose,
}: WorkHoursModalProps) => {
  if (!employee) return null;

  const workHoursStats = calculateEmployeeWorkHours(employee, days);

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent aria-modal="true">
        <AlertDialogHeader>
          <AlertDialogTitle>Работни часове за {employee.name}</AlertDialogTitle>
          <AlertDialogDescription>
            Информация за работните часове за текущия месец
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4 space-y-3">
          {/* Expected Hours */}
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">
              Очаквани часове:
            </span>
            <span className="text-lg font-bold text-gray-900">
              {workHoursStats.expected}ч
            </span>
          </div>

          {/* Actual Hours */}
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">
              Реални часове:
            </span>
            <span
              className={cn(
                "text-lg font-bold",
                workHoursStats.isOverworked ? "text-red-600" : "text-gray-900"
              )}
            >
              {workHoursStats.actual}ч
            </span>
          </div>

          {/* Overwork Warning */}
          {workHoursStats.isOverworked && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-red-600">⚠️</span>
                <div>
                  <p className="text-sm font-semibold text-red-800">
                    Внимание!
                  </p>
                  <p className="text-sm text-red-700">
                    Служителят има повече часове от очакваното!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>Затвори</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
