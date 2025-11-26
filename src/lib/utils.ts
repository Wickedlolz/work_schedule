import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable, { CellHookData } from "jspdf-autotable";
import Holidays from "date-holidays";
import type { Employee, ShiftValue } from "./types";
import "@/lib/OpenSans-Regular-normal.js";
import "@/lib/OpenSans-Bold-normal.js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Helper function to get shift display text
 */
export const getShiftDisplayText = (shift: ShiftValue | undefined): string => {
  if (!shift) return "Off";
  if (typeof shift === "object" && shift.type === "Custom") {
    return `${shift.startTime}-${shift.endTime}`;
  }
  return shift as string;
};

/**
 * Calculate work hours from a custom shift
 */
export const calculateCustomShiftHours = (customShift: {
  startTime: string;
  endTime: string;
}): number => {
  const [startHour, startMin] = customShift.startTime.split(":").map(Number);
  const [endHour, endMin] = customShift.endTime.split(":").map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  return (endMinutes - startMinutes) / 60;
};

/**
 * Get shift time range in minutes from midnight
 */
const getShiftTimeRange = (
  shift: ShiftValue
): { start: number; end: number } | null => {
  if (
    !shift ||
    shift === "Off" ||
    shift === "Sick Leave" ||
    shift === "Vacation"
  ) {
    return null;
  }

  if (typeof shift === "object" && shift.type === "Custom") {
    const [startHour, startMin] = shift.startTime.split(":").map(Number);
    const [endHour, endMin] = shift.endTime.split(":").map(Number);
    return {
      start: startHour * 60 + startMin,
      end: endHour * 60 + endMin,
    };
  }

  // Standard shift times
  const shiftTimes: Record<string, { start: number; end: number }> = {
    Morning: { start: 6 * 60, end: 14 * 60 }, // 06:00 - 14:00
    Evening: { start: 14 * 60, end: 22 * 60 }, // 14:00 - 22:00
    Night: { start: 22 * 60, end: 6 * 60 + 24 * 60 }, // 22:00 - 06:00 (next day)
  };

  return shiftTimes[shift as string] || null;
};

/**
 * Check if two time ranges overlap
 */
const doTimeRangesOverlap = (
  range1: { start: number; end: number },
  range2: { start: number; end: number }
): boolean => {
  return range1.start < range2.end && range2.start < range1.end;
};

/**
 * Detect shift conflicts for a single employee on a specific date
 */
export const detectShiftConflict = (
  employee: Employee,
  date: string,
  proposedShift: ShiftValue
): string | null => {
  const existingShift = employee.shifts[date];

  // No conflict if no existing shift or if it's Off/Sick/Vacation
  if (
    !existingShift ||
    existingShift === "Off" ||
    existingShift === "Sick Leave" ||
    existingShift === "Vacation"
  ) {
    return null;
  }

  // No conflict if proposed shift is Off/Sick/Vacation
  if (
    !proposedShift ||
    proposedShift === "Off" ||
    proposedShift === "Sick Leave" ||
    proposedShift === "Vacation"
  ) {
    return null;
  }

  const existingRange = getShiftTimeRange(existingShift);
  const proposedRange = getShiftTimeRange(proposedShift);

  if (!existingRange || !proposedRange) {
    return null;
  }

  if (doTimeRangesOverlap(existingRange, proposedRange)) {
    const existingDisplay = getShiftDisplayText(existingShift);
    const proposedDisplay = getShiftDisplayText(proposedShift);
    return `Конфликт: ${proposedDisplay} се припокрива с ${existingDisplay}`;
  }

  return null;
};

/**
 * Detect all shift conflicts across all employees
 */
export const detectAllShiftConflicts = (
  employees: Employee[],
  days: string[]
): Map<string, string> => {
  const conflicts = new Map<string, string>();

  employees.forEach((employee) => {
    days.forEach((date) => {
      const shift = employee.shifts[date];
      if (
        !shift ||
        shift === "Off" ||
        shift === "Sick Leave" ||
        shift === "Vacation"
      ) {
        return;
      }

      // Check for impossible shifts (e.g., custom shift with end time before start time)
      if (typeof shift === "object" && shift.type === "Custom") {
        const [startHour, startMin] = shift.startTime.split(":").map(Number);
        const [endHour, endMin] = shift.endTime.split(":").map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        if (endMinutes <= startMinutes) {
          const key = `${employee.id}-${date}`;
          conflicts.set(key, "Грешка: Крайният час е преди началния");
        }
      }

      // Check for consecutive Night shifts with insufficient rest
      // After a night shift, employee should have at least 2 days off
      if (shift === "Night") {
        // Check next day
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        const nextDateStr = nextDate.toISOString().split("T")[0];
        const nextShift = employee.shifts[nextDateStr];

        if (
          nextShift &&
          nextShift !== "Off" &&
          nextShift !== "Sick Leave" &&
          nextShift !== "Vacation"
        ) {
          const key = `${employee.id}-${nextDateStr}`;
          conflicts.set(
            key,
            "Внимание: Необходими са 2 дни почивка след нощна смяна"
          );
        }

        // Check day after next (second day)
        const secondDate = new Date(date);
        secondDate.setDate(secondDate.getDate() + 2);
        const secondDateStr = secondDate.toISOString().split("T")[0];
        const secondShift = employee.shifts[secondDateStr];

        if (
          secondShift &&
          secondShift !== "Off" &&
          secondShift !== "Sick Leave" &&
          secondShift !== "Vacation"
        ) {
          const key = `${employee.id}-${secondDateStr}`;
          conflicts.set(
            key,
            "Внимание: Необходими са 2 дни почивка след нощна смяна"
          );
        }
      }
    });
  });

  return conflicts;
};

/**
 * Get Bulgarian national holidays for a specific year
 * Returns array of dates in "YYYY-MM-DD" format
 * Uses the date-holidays package for accurate holiday calculations
 */
export const getBulgarianHolidays = (year: number): string[] => {
  const hd = new Holidays("BG"); // Bulgaria
  const holidays = hd.getHolidays(year);

  return holidays
    .filter((holiday) => holiday.type === "public") // Only public holidays
    .map((holiday) => {
      const date = new Date(holiday.date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    });
};

/**
 * Calculate total work hours across all employees
 */
export const calculateTotalWorkHours = (
  employees: Employee[],
  days: string[]
): number => {
  return employees.reduce((total, employee) => {
    const stats = calculateEmployeeWorkHours(employee, days);
    return total + stats.actual;
  }, 0);
};

/**
 * Calculate total work hours for an employee for given days
 */
export const calculateEmployeeWorkHours = (
  employee: Employee,
  days: string[]
): { actual: number; expected: number; isOverworked: boolean } => {
  let actualHours = 0;

  // Get the year from the first day to determine holidays
  const year = new Date(days[0]).getFullYear();
  const holidays = getBulgarianHolidays(year);

  // Count working days (excluding weekends AND holidays)
  const workingDaysCount = days.filter((day) => {
    const dayOfWeek = new Date(day).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = holidays.includes(day);
    return !isWeekend && !isHoliday;
  }).length;

  // Expected hours = manual override OR (working days in month * employee's daily hours)
  const expectedHours =
    employee.maxMonthlyHours ?? workingDaysCount * employee.workingHours;

  days.forEach((day) => {
    const shift = employee.shifts[day];

    // No shift or Off or Sick Leave = 0 hours
    if (!shift || shift === "Off" || shift === "Sick Leave") {
      return;
    }

    // Vacation counts as 8 hours
    if (shift === "Vacation") {
      actualHours += 8;
      return;
    }

    // Night shift always counts as 8 hours
    if (shift === "Night") {
      actualHours += 8;
      return;
    }

    // Custom shift - calculate from time range
    if (typeof shift === "object" && shift.type === "Custom") {
      actualHours += calculateCustomShiftHours(shift);
    } else {
      // Standard shifts (Morning, Evening) - use employee's daily working hours
      actualHours += employee.workingHours;
    }
  });

  return {
    actual: Math.round(actualHours * 10) / 10, // Round to 1 decimal
    expected: expectedHours,
    isOverworked: actualHours > expectedHours,
  };
};

export const generateMonthDays = (year: number, month: number) => {
  const days: string[] = [];
  // Use noon (12:00) to avoid timezone issues with UTC conversion
  const date = new Date(year, month, 1, 12, 0, 0, 0);

  while (date.getMonth() === month) {
    // Format date manually to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    days.push(dateString);
    date.setDate(date.getDate() + 1);
  }
  return days;
};

export const exportToPDF = (month: string, table: HTMLTableElement | null) => {
  const doc = new jsPDF("l", "pt", "a4");

  doc.setFont("OpenSans-Regular", "normal");

  if (!table) {
    console.error("Table element not found for PDF export");
    return;
  }

  autoTable(doc, {
    html: table,
    theme: "grid",
    styles: {
      fontSize: 6,
      font: "OpenSans-Regular",
      cellPadding: 3,
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      font: "OpenSans-Bold",
      fontStyle: "normal",
      minCellHeight: 20,
    },
    bodyStyles: { textColor: [50, 50, 50] },
    columnStyles: {
      0: { cellWidth: 40, halign: "left" },
      1: { cellWidth: 30, halign: "center" }, // Working hours column
    },

    didParseCell: (data: CellHookData) => {
      if (data.section === "head" && data.column.index > 0) {
        // Check if header cell is a weekend
        const headerCell = data.cell.raw as HTMLElement;
        if (headerCell && headerCell.classList.contains("bg-red-50")) {
          data.cell.styles.fillColor = [254, 242, 242]; // bg-red-50
        }
      }

      if (data.section === "body") {
        const colIndex = data.column.index;

        // Employee name column stays white
        if (colIndex === 0) {
          data.cell.styles.fillColor = [255, 255, 255];
          return;
        }

        // Working hours column stays white with blue text
        if (colIndex === 1) {
          data.cell.styles.fillColor = [255, 255, 255];
          data.cell.styles.textColor = [37, 99, 235]; // Blue color
          data.cell.styles.fontStyle = "bold";
          return;
        }

        // Get the actual cell element from the table to check its classes
        const rowIndex = data.row.index;
        const tableCell = table
          .querySelectorAll("tbody tr")
          // eslint-disable-next-line no-unexpected-multiline
          [rowIndex]?.querySelectorAll("td")[colIndex] as HTMLElement;

        if (tableCell) {
          // Check for weekend background
          if (tableCell.classList.contains("bg-red-50")) {
            data.cell.styles.fillColor = [254, 242, 242]; // bg-red-50
          }

          // Check for shift colors - these take precedence over weekend colors
          if (tableCell.classList.contains("bg-yellow-100")) {
            data.cell.styles.fillColor = [254, 249, 195]; // bg-yellow-100 - Morning
          } else if (tableCell.classList.contains("bg-blue-100")) {
            data.cell.styles.fillColor = [219, 234, 254]; // bg-blue-100 - Evening
          } else if (tableCell.classList.contains("bg-purple-100")) {
            data.cell.styles.fillColor = [243, 232, 255]; // bg-purple-100 - Night
          } else if (tableCell.classList.contains("bg-gray-100")) {
            data.cell.styles.fillColor = [243, 244, 246]; // bg-gray-100 - Off
          } else if (tableCell.classList.contains("bg-green-100")) {
            data.cell.styles.fillColor = [220, 252, 231]; // bg-green-100 - Custom
          }
        }
      }
    },
  });

  doc.text(`Работен график за ${month}`, 40, 30);

  doc.save(`работен_график_${month}.pdf`);
};

export const exportToExcel = (
  employees: Employee[],
  days: string[],
  month: string
) => {
  const data = employees.map((emp) => {
    const row: Record<string, string | number> = {
      Name: emp.name,
      "Working Hours": emp.workingHours,
    };
    days.forEach((day) => {
      row[day] = getShiftDisplayText(emp.shifts[day]);
    });
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Schedule");
  XLSX.writeFile(workbook, `work_schedule_${month}.xlsx`);
};
