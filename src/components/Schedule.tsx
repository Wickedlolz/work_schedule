import { useRef, useState, useMemo, useEffect } from "react";
import { useFirebaseSchedules } from "@/hooks/useFirebaseSchedules";
import {
  exportToExcel,
  exportToPDF,
  generateMonthDays,
  autoGenerateSchedule,
  calculateTotalWorkHours,
} from "@/lib/utils";
import { toast } from "sonner";
import type { ShiftValue, WorkingHours } from "@/lib/types";
import {
  MIN_EMPLOYEES,
  DEFAULT_LOCALE,
  COLORS,
  MESSAGES,
} from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";

import ScheduleTable from "./ScheduleTable";
import ScheduleSelector from "./ScheduleSelector";
import { LoadingState } from "./schedule/LoadingState";
import { ErrorState } from "./schedule/ErrorState";
import { EmptyState } from "./schedule/EmptyState";
import { MonthYearSelector } from "./schedule/MonthYearSelector";
import { EmployeeForm } from "./schedule/EmployeeForm";
import { ScheduleActions } from "./schedule/ScheduleActions";
import { Header } from "./Header";

const SchedulePage = () => {
  const { user } = useAuth();
  const {
    schedules,
    activeSchedule,
    activeScheduleId,
    setActiveScheduleId,
    loading,
    error,
    addSchedule,
    deleteSchedule,
    renameSchedule,
    addEmployee: addEmployeeToFirebase,
    removeEmployee: removeEmployeeFromFirebase,
    updateShift,
    bulkUpdateShifts,
    updateEmployeeMaxHours,
  } = useFirebaseSchedules();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    const params = new URLSearchParams(window.location.search);
    const monthParam = params.get("month");
    return monthParam ? parseInt(monthParam, 10) : new Date().getMonth();
  });
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    const params = new URLSearchParams(window.location.search);
    const yearParam = params.get("year");
    return yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();
  });

  // Update URL params whenever month or year changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("month", selectedMonth.toString());
    params.set("year", selectedYear.toString());
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`
    );
  }, [selectedMonth, selectedYear]);

  const tableRef = useRef<HTMLTableElement>(null);

  // Memoized calculations for performance
  const days = useMemo(
    () => generateMonthDays(selectedYear, selectedMonth),
    [selectedYear, selectedMonth]
  );
  const monthLabel = useMemo(
    () =>
      new Date(selectedYear, selectedMonth, 1).toLocaleString(DEFAULT_LOCALE, {
        month: "long",
        year: "numeric",
      }),
    [selectedYear, selectedMonth]
  );

  /**
   * Handles shift changes with error handling and user feedback
   */
  const handleShiftChange = async (
    employeeId: string,
    date: string,
    newShift: ShiftValue
  ) => {
    try {
      await updateShift(employeeId, date, newShift);
      toast.success(MESSAGES.shifts.updated);
    } catch (err) {
      toast.error(MESSAGES.errors.shiftUpdate(err));
    }
  };

  /**
   * Handles adding a new employee with validation and sanitization
   */
  const handleAddEmployee = async (
    employeeName: string,
    workingHours: WorkingHours
  ) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const sanitizedEmployeeName = employeeName
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, 100);
      await addEmployeeToFirebase(sanitizedEmployeeName, workingHours);
      toast.success(MESSAGES.employee.added);
    } catch (err) {
      toast.error(MESSAGES.errors.employeeAdd(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles removing an employee with minimum employee validation
   */
  const handleRemoveEmployee = async (id: string) => {
    if (!activeSchedule) return;
    if (activeSchedule.employees.length <= MIN_EMPLOYEES) {
      toast.error(MESSAGES.employee.minRequired(MIN_EMPLOYEES));
      return;
    }

    try {
      await removeEmployeeFromFirebase(id);
      toast.success(MESSAGES.employee.removed);
    } catch (err) {
      toast.error(MESSAGES.errors.employeeRemove(err));
    }
  };

  /**
   * Navigation handlers for month/year changes
   */
  const handlePreviousMonth = () => {
    const newDate = new Date(selectedYear, selectedMonth - 1, 1);
    setSelectedMonth(newDate.getMonth());
    setSelectedYear(newDate.getFullYear());
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedYear, selectedMonth + 1, 1);
    setSelectedMonth(newDate.getMonth());
    setSelectedYear(newDate.getFullYear());
  };

  /**
   * Handles adding a new schedule with user feedback
   */
  const handleAddSchedule = async (name: string) => {
    await addSchedule(name);
    toast.success(MESSAGES.schedule.added);
  };

  /**
   * Handles auto-generating schedule for the current month
   */
  const handleAutoGenerateSchedule = async () => {
    if (!activeSchedule) return;

    // Require at least 1 employee
    if (activeSchedule.employees.length < 1) {
      toast.error(MESSAGES.autoGenerate.minEmployees);
      return;
    }

    try {
      const generatedShifts = autoGenerateSchedule(
        activeSchedule.employees,
        days
      );
      await bulkUpdateShifts(generatedShifts);
      toast.success(MESSAGES.autoGenerate.success);
    } catch (err) {
      toast.error(MESSAGES.autoGenerate.error(err));
    }
  };

  /**
   * Export handlers for PDF and Excel formats
   */
  const handleExportPDF = () => {
    const scheduleName = activeSchedule?.name || "График";
    exportToPDF(`${scheduleName} - ${monthLabel}`, tableRef.current);
  };

  const handleExportExcel = () => {
    if (!activeSchedule) return;
    const scheduleName = activeSchedule.name;
    exportToExcel(
      activeSchedule.employees,
      days,
      `${scheduleName} - ${monthLabel}`
    );
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState error={error} onRetry={() => window.location.reload()} />
    );
  }

  if (schedules.length === 0) {
    return (
      <EmptyState
        onCreateSchedule={() => handleAddSchedule(MESSAGES.createFirstSchedule)}
      />
    );
  }

  return (
    <section className="space-y-4">
      <Header
        title={MESSAGES.title}
        subtitle={monthLabel}
        subtitleClassName={COLORS.PRIMARY_CLASS}
        user={user}
      />

      <ScheduleSelector
        schedules={schedules}
        activeScheduleId={activeScheduleId}
        onScheduleChange={setActiveScheduleId}
        onAddSchedule={handleAddSchedule}
        onDeleteSchedule={deleteSchedule}
        onRenameSchedule={renameSchedule}
        isAuthenticated={!!user}
      />

      {/* Total Work Hours for All Schedules - Only visible to authenticated users */}
      {user && (
        <div className="bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            📊 Общо работни часове за всички графици:
          </h3>
          <div className="space-y-2">
            {schedules.map((schedule) => {
              const totalHours = calculateTotalWorkHours(
                schedule.employees,
                days
              );
              return (
                <div
                  key={schedule.id}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-gray-700">{schedule.name}:</span>
                  <span className="font-semibold text-gray-900">
                    {totalHours}ч
                  </span>
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
      )}

      {activeSchedule && (
        <>
          <section className="flex flex-col flex-wrap gap-4 sm:gap-2">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between flex-wrap">
              <MonthYearSelector
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onMonthChange={setSelectedMonth}
                onYearChange={setSelectedYear}
              />
              <ScheduleActions
                onPreviousMonth={handlePreviousMonth}
                onNextMonth={handleNextMonth}
                onExportExcel={handleExportExcel}
                onExportPDF={handleExportPDF}
                onAutoGenerate={handleAutoGenerateSchedule}
                isAuthenticated={!!user}
              />
            </div>

            {!user && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <p className="font-medium">👁️ Режим на преглед</p>
                <p className="mt-1">
                  Влезте в профила си, за да добавяте служители, променяте
                  графици и редактирате смени.
                </p>
              </div>
            )}

            {/* Employee Form - Only show when authenticated */}
            {user && (
              <EmployeeForm
                onSubmit={handleAddEmployee}
                isSubmitting={isSubmitting}
              />
            )}
          </section>

          <ScheduleTable
            employees={activeSchedule.employees}
            days={days}
            handleShiftChange={handleShiftChange}
            removeEmployee={handleRemoveEmployee}
            updateEmployeeMaxHours={updateEmployeeMaxHours}
            tableRef={tableRef}
            isAuthenticated={!!user}
          />
        </>
      )}
    </section>
  );
};

export default SchedulePage;
