import { memo, useMemo, useState } from "react";
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
import { ShiftChangeDialog } from "./ShiftChangeDialog";

type EmployeeRowProps = {
  employee: Employee;
  days: string[];
  holidays: Set<string>;
  conflicts: Map<string, string>;
  isAuthenticated: boolean;
  onShiftChange: (
    employeeId: string,
    date: string,
    value: ShiftType,
    message?: string | null,
  ) => void;
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
    const [shiftChangeDialog, setShiftChangeDialog] = useState<{
      isOpen: boolean;
      employeeId: string;
      date: string;
      newShift: ShiftType;
      existingMessage?: string;
    }>({
      isOpen: false,
      employeeId: "",
      date: "",
      newShift: "Off",
    });

    const [changeInfoDialog, setChangeInfoDialog] = useState<{
      isOpen: boolean;
      changeCount: number;
      message?: string;
    }>({
      isOpen: false,
      changeCount: 0,
    });

    const workHoursStats = useMemo(
      () => calculateEmployeeWorkHours(employee, days),
      [employee, days],
    );

    const isOverworked = workHoursStats.isOverworked;

    const handleShiftChangeRequest = (
      employeeId: string,
      date: string,
      newShift: ShiftType,
    ) => {
      // Check if this is a change (not first-time assignment)
      const existingShift = employee.shifts[date];
      if (existingShift !== undefined && existingShift !== null) {
        // Get existing message if any
        const existingMessage = employee.shiftMessages?.[date];
        // Open dialog for message
        setShiftChangeDialog({
          isOpen: true,
          employeeId,
          date,
          newShift,
          existingMessage,
        });
      } else {
        // First-time assignment, no dialog needed
        onShiftChange(employeeId, date, newShift);
      }
    };

    const handleConfirmShiftChange = (message?: string | null) => {
      onShiftChange(
        shiftChangeDialog.employeeId,
        shiftChangeDialog.date,
        shiftChangeDialog.newShift,
        message,
      );
    };

    return (
      <>
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
                    : "text-blue-500 hover:text-blue-700",
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
              new Date(day).getDay() as 0 | 6,
            );
            const isHoliday = holidays.has(day);
            const isRedDay = isWeekend || isHoliday;
            const currentShift = employee.shifts[day] || "Off";
            const changeCount = employee.changedShifts?.[day] || 0;
            const isChanged = changeCount > 0;
            const conflictKey = `${employee.id}-${day}`;
            const hasConflict = conflicts.has(conflictKey);
            const conflictMessage = conflicts.get(conflictKey);
            const customMessage = employee.shiftMessages?.[day];

            // Determine badge color based on change count
            let badgeColor = "bg-blue-500";
            if (changeCount >= 6) {
              badgeColor = "bg-red-600";
            } else if (changeCount >= 3) {
              badgeColor = "bg-orange-500";
            }

            // Build tooltip text
            let tooltipText: string | undefined;
            if (hasConflict) {
              tooltipText = conflictMessage;
            } else if (isChanged) {
              const changesText = `Променена ${changeCount} ${changeCount === 1 ? "път" : changeCount < 5 ? "пъти" : "пъти"}`;
              tooltipText = customMessage
                ? `${changesText} \n ${customMessage}`
                : changesText;
            }

            return (
              <td
                key={day}
                role="cell"
                className={cn(
                  "border border-gray-300 p-1 text-center whitespace-nowrap relative",
                  isRedDay && "bg-red-50",
                  hasConflict && "bg-orange-100 border-orange-400 border-2",
                  isChanged &&
                    changeCount < 3 &&
                    "bg-blue-50 border-blue-400 border-2",
                  isChanged &&
                    changeCount >= 3 &&
                    changeCount < 6 &&
                    "bg-orange-50 border-orange-500 border-2",
                  isChanged &&
                    changeCount >= 6 &&
                    "bg-red-50 border-red-500 border-2",
                  getShiftColor(currentShift),
                )}
                title={tooltipText}
              >
                {isChanged && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setChangeInfoDialog({
                        isOpen: true,
                        changeCount,
                        message: customMessage,
                      });
                    }}
                    className={cn(
                      "absolute -top-1 -left-1 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold z-10 cursor-pointer hover:scale-110 transition-transform",
                      badgeColor,
                    )}
                    aria-label="Покажи информация за промени"
                  >
                    {changeCount}
                  </button>
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
                      handleShiftChangeRequest(employee.id, day, val)
                    }
                  >
                    <SelectTrigger
                      className="w-full text-[10px] sm:text-xs h-7 sm:h-8"
                      aria-label={`Смяна за ${employee.name} на ${new Date(
                        day,
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
        <ShiftChangeDialog
          isOpen={shiftChangeDialog.isOpen}
          onClose={() =>
            setShiftChangeDialog((prev) => ({ ...prev, isOpen: false }))
          }
          onConfirm={handleConfirmShiftChange}
          employeeName={employee.name}
          date={shiftChangeDialog.date}
          newShift={shiftChangeDialog.newShift}
          existingMessage={shiftChangeDialog.existingMessage}
        />
        <AlertDialog
          open={changeInfoDialog.isOpen}
          onOpenChange={(open) =>
            setChangeInfoDialog((prev) => ({ ...prev, isOpen: open }))
          }
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Информация за промяна</AlertDialogTitle>
              <AlertDialogDescription>
                <div className="space-y-2 text-sm">
                  <p>
                    Тази смяна е променяна{" "}
                    <strong>{changeInfoDialog.changeCount}</strong>{" "}
                    {changeInfoDialog.changeCount === 1
                      ? "път"
                      : changeInfoDialog.changeCount < 5
                        ? "пъти"
                        : "пъти"}
                    .
                  </p>
                  {changeInfoDialog.message && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="font-semibold text-blue-900 mb-1">
                        Бележка:
                      </p>
                      <p className="text-blue-800">
                        {changeInfoDialog.message}
                      </p>
                    </div>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>Затвори</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  },
);

EmployeeRow.displayName = "EmployeeRow";
