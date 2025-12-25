import { memo, useMemo } from "react";
import { cn, calculateEmployeeWorkHours } from "@/lib/utils";
import type { Employee, ShiftType, ShiftValue } from "@/lib/types";
import {
  SHIFT_OPTIONS,
  SHIFT_COLORS,
  WEEKEND_DAYS,
  SHIFT_LABELS_BG,
} from "@/lib/constants";
import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type EmployeeRowProps = {
  employee: Employee;
  days: string[];
  holidays: Set<string>;
  conflicts: Map<string, string>;
  isAuthenticated: boolean;
  onShiftChange: (employeeId: string, date: string, value: ShiftType) => void;
  onRemove: (employeeId: string) => void;
  onWorkHoursClick: (employeeId: string) => void;
};

const getShiftDisplay = (shift: ShiftValue): string => {
  if (typeof shift === "object" && shift.type === "Custom") {
    return `${shift.startTime} - ${shift.endTime}`;
  }
  return SHIFT_LABELS_BG[shift as ShiftType] || "";
};

const getShiftColor = (shift: ShiftValue): string => {
  if (typeof shift === "object" && shift.type === "Custom") {
    return SHIFT_COLORS.Custom;
  }
  return SHIFT_COLORS[shift as keyof typeof SHIFT_COLORS] || "";
};

const getShiftValue = (shift: ShiftValue): ShiftType => {
  if (typeof shift === "object" && shift.type === "Custom") {
    return "Custom";
  }
  return shift as ShiftType;
};

export const EmployeeRow = memo(
  ({
    employee,
    days,
    holidays,
    conflicts,
    isAuthenticated,
    onShiftChange,
    onRemove,
    onWorkHoursClick,
  }: EmployeeRowProps) => {
    const workHoursStats = useMemo(
      () => calculateEmployeeWorkHours(employee, days),
      [employee, days]
    );

    const isOverworked = workHoursStats.isOverworked;

    return (
      <tr role="row" className="border-t border-gray-200">
        <td
          role="cell"
          className="sticky left-0 z-10 bg-white p-2 border border-gray-300 font-medium text-center whitespace-nowrap"
        >
          <div className="flex items-center justify-center gap-1 relative">
            <span>{employee.name}</span>
            <button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                onWorkHoursClick(employee.id);
              }}
              className={cn(
                "cursor-pointer text-sm hover:scale-110 transition-all relative",
                isOverworked
                  ? "text-red-500 hover:text-red-700 animate-pulse"
                  : "text-blue-500 hover:text-blue-700"
              )}
              aria-label="Покажи работни часове"
              title={
                isOverworked
                  ? "⚠️ Служителят е с повече часове от очакваното!"
                  : "Покажи работни часове"
              }
            >
              {isOverworked ? "⚠️" : "ℹ️"}
            </button>
            {isAuthenticated && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-1 text-red-500 cursor-pointer"
                    aria-label={`Изтриване на ${employee.name}`}
                  >
                    ✕
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent role="alertdialog" aria-modal="true">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Сигурни ли сте, че искате да изтриете този служител?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Това действие е необратимо. След като служителят бъде
                      изтрит, всички свързани данни с неговите смени ще бъдат
                      премахнати от системата.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отказ</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onRemove(employee.id)}>
                      Изтрий
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </td>
        <td
          role="cell"
          className="bg-white p-2 border border-gray-300 text-center whitespace-nowrap font-semibold text-blue-600"
        >
          {employee.workingHours}ч
        </td>
        {days.map((day) => {
          const isWeekend = WEEKEND_DAYS.includes(
            new Date(day).getDay() as 0 | 6
          );
          const isHoliday = holidays.has(day);
          const isRedDay = isWeekend || isHoliday;
          const currentShift = employee.shifts[day] || "Off";
          const isChanged = employee.changedShifts?.[day] || false;
          const conflictKey = `${employee.id}-${day}`;
          const hasConflict = conflicts.has(conflictKey);
          const conflictMessage = conflicts.get(conflictKey);

          return (
            <td
              key={day}
              role="cell"
              className={cn(
                "border border-gray-300 p-1 text-center whitespace-nowrap relative",
                isRedDay && "bg-red-50",
                hasConflict && "bg-orange-100 border-orange-400 border-2",
                isChanged && "bg-blue-50 border-blue-400 border-2",
                getShiftColor(currentShift)
              )}
              title={
                hasConflict
                  ? conflictMessage
                  : isChanged
                  ? "Промяна"
                  : undefined
              }
            >
              {isChanged && (
                <div className="absolute -top-1 -left-1 bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs z-10">
                  ✓
                </div>
              )}
              {hasConflict && (
                <div className="absolute -top-1 -right-1 bg-orange-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs z-10">
                  !
                </div>
              )}
              {isAuthenticated ? (
                <Select
                  value={getShiftValue(currentShift)}
                  onValueChange={(val: ShiftType) =>
                    onShiftChange(employee.id, day, val)
                  }
                >
                  <SelectTrigger
                    className="w-full text-[10px] sm:text-xs h-7 sm:h-8"
                    aria-label={`Смяна за ${employee.name} на ${new Date(
                      day
                    ).toLocaleDateString("bg-BG")}`}
                  >
                    <SelectValue placeholder="Изберете смяна">
                      {getShiftDisplay(currentShift)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {SHIFT_OPTIONS.map((option) => (
                      <SelectItem
                        key={option}
                        value={option}
                        className="text-xs"
                      >
                        {SHIFT_LABELS_BG[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="text-xs sm:text-sm">
                  {getShiftDisplay(currentShift)}
                </span>
              )}
            </td>
          );
        })}
      </tr>
    );
  }
);

EmployeeRow.displayName = "EmployeeRow";
