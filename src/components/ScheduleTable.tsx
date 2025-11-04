import { useState, useMemo } from "react";
import {
  cn,
  calculateEmployeeWorkHours,
  getBulgarianHolidays,
} from "@/lib/utils";
import type {
  Employee,
  ShiftType,
  ShiftValue,
  CustomShift,
  CustomShiftModalState,
  WorkHoursModalState,
} from "@/lib/types";
import {
  SHIFT_OPTIONS,
  SHIFT_COLORS,
  WEEKEND_DAYS,
  SHIFT_LABELS_BG,
} from "@/lib/constants";

import { Button } from "./ui/button";
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
} from "./ui/select";
import { CustomShiftModal } from "./schedule/CustomShiftModal";

type ScheduleTableProps = {
  employees: Employee[];
  days: string[];
  handleShiftChange: (
    employeeId: string,
    date: string,
    newShift: ShiftValue
  ) => void;
  removeEmployee: (employeeId: string) => void;
  tableRef: React.RefObject<HTMLTableElement | null>;
  isAuthenticated: boolean;
};

const ScheduleTable = ({
  employees,
  days,
  handleShiftChange,
  removeEmployee,
  tableRef,
  isAuthenticated,
}: ScheduleTableProps) => {
  // Calculate holidays once for the current month/year
  const holidays = useMemo(() => {
    if (days.length === 0) return new Set<string>();
    const year = new Date(days[0]).getFullYear();
    return new Set(getBulgarianHolidays(year));
  }, [days]);

  const [customShiftModal, setCustomShiftModal] =
    useState<CustomShiftModalState>({
      open: false,
      employeeId: "",
      date: "",
    });

  const [workHoursModal, setWorkHoursModal] = useState<WorkHoursModalState>({
    open: false,
    employeeId: "",
  });

  const handleSelectChange = (
    employeeId: string,
    date: string,
    value: ShiftType
  ) => {
    if (value === "Custom") {
      // Get existing custom shift if any
      const employee = employees.find((e) => e.id === employeeId);
      const existingShift = employee?.shifts[date];
      const existingCustomShift =
        existingShift && typeof existingShift === "object"
          ? existingShift
          : undefined;

      setCustomShiftModal({
        open: true,
        employeeId,
        date,
        existingShift: existingCustomShift,
      });
    } else {
      handleShiftChange(employeeId, date, value);
    }
  };

  const handleCustomShiftSave = (customShift: CustomShift) => {
    handleShiftChange(
      customShiftModal.employeeId,
      customShiftModal.date,
      customShift
    );
    setCustomShiftModal({ open: false, employeeId: "", date: "" });
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

  return (
    <section className="w-full">
      <div className="w-full overflow-x-auto overflow-y-hidden">
        <table
          ref={tableRef}
          id="schedule-table"
          className="min-w-[900px] w-full border border-gray-300 text-xs sm:text-sm"
          role="table"
          aria-label="Работен график"
        >
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr role="row">
              <th
                scope="col"
                className="sticky left-0 z-20 bg-gray-100 text-left p-2 border border-gray-300 whitespace-nowrap"
              >
                Служител
              </th>
              <th
                scope="col"
                className="bg-gray-100 text-center p-2 border border-gray-300 whitespace-nowrap"
                style={{ left: "auto" }}
              >
                Часове/ден
              </th>
              {days.map((day) => {
                const isWeekend = WEEKEND_DAYS.includes(
                  new Date(day).getDay() as 0 | 6
                );
                const isHoliday = holidays.has(day);
                const isRedDay = isWeekend || isHoliday;
                return (
                  <th
                    key={day}
                    className={cn(
                      "text-center p-1 border border-gray-300 whitespace-nowrap",
                      isRedDay && "bg-red-100"
                    )}
                    scope="col"
                  >
                    {new Date(day).getDate()}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => {
              return (
                <tr
                  key={emp.id}
                  role="row"
                  className="border-t border-gray-200"
                >
                  <td
                    role="cell"
                    className="sticky left-0 z-10 bg-white p-2 border border-gray-300 font-medium text-center whitespace-nowrap"
                  >
                    <div className="flex items-center justify-center gap-1 relative">
                      <span>{emp.name}</span>
                      <button
                        onClick={() =>
                          setWorkHoursModal({ open: true, employeeId: emp.id })
                        }
                        className="cursor-pointer text-blue-500 text-sm hover:text-blue-700 transition-colors"
                        aria-label="Покажи работни часове"
                      >
                        ℹ️
                      </button>
                      {isAuthenticated && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="ml-1 text-red-500 cursor-pointer"
                              aria-label={`Изтриване на ${emp.name}`}
                            >
                              ✕
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent
                            role="alertdialog"
                            aria-modal="true"
                          >
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Сигурни ли сте, че искате да изтриете този
                                служител?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Това действие е необратимо. След като служителят
                                бъде изтрит, всички свързани данни с неговите
                                смени ще бъдат премахнати от системата.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Отказ</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => removeEmployee(emp.id)}
                              >
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
                    {emp.workingHours}ч
                  </td>
                  {days.map((day) => {
                    const isWeekend = WEEKEND_DAYS.includes(
                      new Date(day).getDay() as 0 | 6
                    );
                    const isHoliday = holidays.has(day);
                    const isRedDay = isWeekend || isHoliday;
                    const currentShift = emp.shifts[day] || "Off";
                    return (
                      <td
                        key={day}
                        role="cell"
                        className={cn(
                          "border border-gray-300 p-1 text-center whitespace-nowrap",
                          isRedDay && "bg-red-50",
                          getShiftColor(currentShift)
                        )}
                      >
                        {isAuthenticated ? (
                          <Select
                            value={getShiftValue(currentShift)}
                            onValueChange={(val: ShiftType) =>
                              handleSelectChange(emp.id, day, val)
                            }
                          >
                            <SelectTrigger
                              className="w-full text-[10px] sm:text-xs h-7 sm:h-8"
                              aria-label={`Смяна за ${emp.name} на ${new Date(
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
            })}
          </tbody>
        </table>
      </div>

      {/* Work Hours Info Modal */}
      {workHoursModal.open &&
        (() => {
          const employee = employees.find(
            (e) => e.id === workHoursModal.employeeId
          );
          if (!employee) return null;

          const workHoursStats = calculateEmployeeWorkHours(employee, days);

          return (
            <AlertDialog
              open={workHoursModal.open}
              onOpenChange={(open) =>
                setWorkHoursModal({ open, employeeId: "" })
              }
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Работни часове за {employee.name}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Информация за работните часове за текущия месец
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4 space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Очаквани часове:
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {workHoursStats.expected}ч
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Реални часове:
                    </span>
                    <span
                      className={cn(
                        "text-lg font-bold",
                        workHoursStats.isOverworked
                          ? "text-red-600"
                          : "text-gray-900"
                      )}
                    >
                      {workHoursStats.actual}ч
                    </span>
                  </div>
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
                  <AlertDialogAction
                    onClick={() =>
                      setWorkHoursModal({ open: false, employeeId: "" })
                    }
                  >
                    Затвори
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          );
        })()}

      <CustomShiftModal
        open={customShiftModal.open}
        onOpenChange={(open) =>
          setCustomShiftModal((prev) => ({ ...prev, open }))
        }
        onSave={handleCustomShiftSave}
        initialStartTime={customShiftModal.existingShift?.startTime}
        initialEndTime={customShiftModal.existingShift?.endTime}
      />
    </section>
  );
};

export default ScheduleTable;
