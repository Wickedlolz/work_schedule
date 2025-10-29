import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable, { CellHookData } from "jspdf-autotable";
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
 * Get Bulgarian national holidays for a specific year
 * Returns array of dates in "YYYY-MM-DD" format
 */
export const getBulgarianHolidays = (year: number): string[] => {
  const holidays: string[] = [];

  // Fixed holidays
  const fixedHolidays = [
    { month: 0, day: 1 }, // New Year's Day - January 1
    { month: 2, day: 3 }, // Liberation Day - March 3
    { month: 4, day: 1 }, // Labour Day - May 1
    { month: 4, day: 6 }, // St. George's Day / Bulgarian Army Day - May 6
    { month: 4, day: 24 }, // Day of Bulgarian Education and Culture - May 24
    { month: 8, day: 6 }, // Unification Day - September 6
    { month: 8, day: 22 }, // Independence Day - September 22
    { month: 11, day: 24 }, // Christmas Eve - December 24
    { month: 11, day: 25 }, // Christmas Day - December 25
    { month: 11, day: 26 }, // Second Day of Christmas - December 26
  ];

  fixedHolidays.forEach(({ month, day }) => {
    const date = new Date(year, month, day, 12, 0, 0);
    const dateString = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    holidays.push(dateString);
  });

  // Easter-based holidays (movable)
  // Note: This is a simplified calculation. For production, consider using a library
  // or API for accurate Easter calculation
  const easter = calculateEaster(year);

  // Good Friday (2 days before Easter)
  const goodFriday = new Date(easter);
  goodFriday.setDate(goodFriday.getDate() - 2);
  holidays.push(formatDate(goodFriday));

  // Holy Saturday (1 day before Easter)
  const holySaturday = new Date(easter);
  holySaturday.setDate(holySaturday.getDate() - 1);
  holidays.push(formatDate(holySaturday));

  // Easter Sunday
  holidays.push(formatDate(easter));

  // Easter Monday (1 day after Easter)
  const easterMonday = new Date(easter);
  easterMonday.setDate(easterMonday.getDate() + 1);
  holidays.push(formatDate(easterMonday));

  return holidays;
};

/**
 * Calculate Easter date using Meeus/Jones/Butcher algorithm
 */
const calculateEaster = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day, 12, 0, 0);
};

/**
 * Format date to YYYY-MM-DD string
 */
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

  // Expected hours = working days in month * employee's daily hours
  const expectedHours = workingDaysCount * employee.workingHours;

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
