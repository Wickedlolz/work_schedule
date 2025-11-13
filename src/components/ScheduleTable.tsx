import { useState, useMemo, useCallback } from "react";
import { cn, getBulgarianHolidays } from "@/lib/utils";
import type {
  Employee,
  ShiftType,
  ShiftValue,
  CustomShift,
  CustomShiftModalState,
  WorkHoursModalState,
} from "@/lib/types";
import { WEEKEND_DAYS } from "@/lib/constants";

import { CustomShiftModal } from "./schedule/CustomShiftModal";
import { WorkHoursModal } from "./schedule/WorkHoursModal";
import { EmployeeRow } from "./schedule/EmployeeRow";

interface ScheduleTableProps {
  employees: Employee[];
  days: string[];
  handleShiftChange: (
    employeeId: string,
    date: string,
    value: ShiftValue
  ) => void;
  removeEmployee: (id: string) => void;
  updateEmployeeMaxHours: (
    employeeId: string,
    maxMonthlyHours: number | undefined
  ) => Promise<void>;
  tableRef: React.RefObject<HTMLTableElement | null>;
  isAuthenticated: boolean;
}

const ScheduleTable = ({
  employees,
  days,
  handleShiftChange,
  removeEmployee,
  updateEmployeeMaxHours,
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

  const handleSelectChange = useCallback(
    (employeeId: string, date: string, value: ShiftType) => {
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
    },
    [employees, handleShiftChange]
  );

  const handleWorkHoursClick = useCallback((employeeId: string) => {
    setWorkHoursModal({ open: true, employeeId });
  }, []);

  const handleCustomShiftSave = (customShift: CustomShift) => {
    handleShiftChange(
      customShiftModal.employeeId,
      customShiftModal.date,
      customShift
    );
    setCustomShiftModal({ open: false, employeeId: "", date: "" });
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
            {employees.map((emp) => (
              <EmployeeRow
                key={emp.id}
                employee={emp}
                days={days}
                holidays={holidays}
                isAuthenticated={isAuthenticated}
                onShiftChange={handleSelectChange}
                onRemove={removeEmployee}
                onWorkHoursClick={handleWorkHoursClick}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Work Hours Info Modal */}
      <WorkHoursModal
        open={workHoursModal.open}
        employee={
          employees.find((e) => e.id === workHoursModal.employeeId) || null
        }
        days={days}
        isAuthenticated={isAuthenticated}
        onClose={() => setWorkHoursModal({ open: false, employeeId: "" })}
        onUpdateMaxHours={updateEmployeeMaxHours}
      />

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
