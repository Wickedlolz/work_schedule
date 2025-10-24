import { useRef, useState, useMemo } from "react";
import { useFirebaseSchedules } from "@/hooks/useFirebaseSchedules";
import { exportToExcel, exportToPDF, generateMonthDays } from "@/lib/utils";
import { toast } from "sonner";
import type { ShiftType } from "@/lib/types";
import {
  MIN_EMPLOYEES,
  DEFAULT_LOCALE,
  COLORS,
  MESSAGES,
} from "@/lib/constants";

import ScheduleTable from "./ScheduleTable";
import ScheduleSelector from "./ScheduleSelector";
import { LoadingState } from "./schedule/LoadingState";
import { ErrorState } from "./schedule/ErrorState";
import { EmptyState } from "./schedule/EmptyState";
import { MonthYearSelector } from "./schedule/MonthYearSelector";
import { EmployeeForm } from "./schedule/EmployeeForm";
import { ScheduleActions } from "./schedule/ScheduleActions";

const SchedulePage = () => {
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
  } = useFirebaseSchedules();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

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
    newShift: ShiftType
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
  const handleAddEmployee = async (employeeName: string) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const sanitizedEmployeeName = employeeName
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, 100);
      await addEmployeeToFirebase(sanitizedEmployeeName);
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

  /**
   * Render loading state
   */
  if (loading) {
    return <LoadingState />;
  }

  /**
   * Render error state with retry option
   */
  if (error) {
    return (
      <ErrorState error={error} onRetry={() => window.location.reload()} />
    );
  }

  /**
   * Render empty state when no schedules exist
   */
  if (schedules.length === 0) {
    return (
      <EmptyState
        onCreateSchedule={() => handleAddSchedule(MESSAGES.createFirstSchedule)}
      />
    );
  }

  return (
    <section className="space-y-4">
      {/* Title Section */}
      <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-6 p-4 text-center md:text-left border-b bg-gradient-to-r from-red-50 via-white to-red-50">
        {MESSAGES.title}{" "}
        <span className={COLORS.PRIMARY_CLASS}>{monthLabel}</span>
      </h1>

      {/* Schedule Selector */}
      <ScheduleSelector
        schedules={schedules}
        activeScheduleId={activeScheduleId}
        onScheduleChange={setActiveScheduleId}
        onAddSchedule={handleAddSchedule}
        onDeleteSchedule={deleteSchedule}
        onRenameSchedule={renameSchedule}
      />

      {/* Main Content */}
      {activeSchedule && (
        <>
          {/* Controls Section */}
          <section className="flex flex-col flex-wrap gap-4 sm:gap-2">
            {/* Month/Year Selectors and Navigation */}
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
              />
            </div>

            {/* Employee Form */}
            <EmployeeForm
              onSubmit={handleAddEmployee}
              isSubmitting={isSubmitting}
            />
          </section>

          {/* Schedule Table */}
          <ScheduleTable
            employees={activeSchedule.employees}
            days={days}
            handleShiftChange={handleShiftChange}
            removeEmployee={handleRemoveEmployee}
            tableRef={tableRef}
          />
        </>
      )}
    </section>
  );
};

export default SchedulePage;
