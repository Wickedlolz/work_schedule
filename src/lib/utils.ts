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

/**
 * Auto-generate a monthly schedule for employees.
 * Rules are adaptive based on team size:
 *
 * Large teams (9+ employees):
 * - Weekends: 5-6 Evening shifts, 3 Morning shifts
 * - Weekdays: balanced Morning/Evening distribution
 *
 * Medium teams (4-8 employees):
 * - Weekends: ~2 Morning, rest Evening
 * - Weekdays: balanced Morning/Evening distribution
 *
 * Small teams (1-3 employees):
 * - Weekends: ~1 Morning, rest Evening
 * - Weekdays: balanced Morning/Evening distribution
 *
 * All teams:
 * - Each employee gets at least 2 rest days per week
 * - Night shifts left empty for manual assignment
 * - 4-hour employees always assigned to Evening shift (they have another job in the morning)
 * - Respects expected monthly hours based on working days and employee's daily hours
 * - Ensures continuous coverage by rotating rest days among employees
 * - CRITICAL: Always ensures coverage even if employees exceed expected hours
 *   (better to work slightly over than have zero coverage on any day)
 */
export const autoGenerateSchedule = (
  employees: Employee[],
  days: string[]
): Record<string, Record<string, ShiftValue>> => {
  const scheduleData: Record<string, Record<string, ShiftValue>> = {};
  const WEEKEND_DAYS_NUM = [0, 6]; // Sunday and Saturday

  // Initialize empty schedule
  employees.forEach((emp) => {
    scheduleData[emp.id] = {};
  });

  // Calculate expected hours for each employee
  const year = new Date(days[0]).getFullYear();
  const holidays = getBulgarianHolidays(year);
  const workingDaysCount = days.filter((day) => {
    const dayOfWeek = new Date(day).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = holidays.includes(day);
    return !isWeekend && !isHoliday;
  }).length;

  // Track accumulated hours per employee
  const accumulatedHours: Record<string, number> = {};
  const expectedHours: Record<string, number> = {};
  employees.forEach((emp) => {
    accumulatedHours[emp.id] = 0;
    expectedHours[emp.id] = workingDaysCount * emp.workingHours;
  });

  // Helper to check if employee can work (has hours remaining)
  const canWorkHours = (empId: string, hours: number): boolean => {
    return accumulatedHours[empId] + hours <= expectedHours[empId];
  };

  // Helper to add work hours
  const addWorkHours = (empId: string, hours: number): void => {
    accumulatedHours[empId] += hours;
  };

  // Group days by week
  const weekGroups: Record<number, string[]> = {};
  days.forEach((day) => {
    const date = new Date(day);
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const daysSinceStart = Math.floor(
      (date.getTime() - firstDayOfMonth.getTime()) / (1000 * 60 * 60 * 24)
    );
    const weekNumber = Math.floor(daysSinceStart / 7);

    if (!weekGroups[weekNumber]) {
      weekGroups[weekNumber] = [];
    }
    weekGroups[weekNumber].push(day);
  });

  // Process each week
  Object.keys(weekGroups).forEach((weekKey) => {
    const weekNumber = parseInt(weekKey);
    const weekDays = weekGroups[weekNumber];

    // Sort employees by least accumulated hours to balance workload
    const sortedEmployees = [...employees].sort((a, b) => {
      const hoursDiff = accumulatedHours[a.id] - accumulatedHours[b.id];
      if (hoursDiff !== 0) return hoursDiff;
      return Math.random() - 0.5; // Random for equal hours
    });

    // Assign 2 rest days per employee, ensuring we always have coverage
    const restDayAssignments: Record<string, string[]> = {};
    const restDayCounts: Record<string, number> = {}; // Track how many are resting each day

    // Initialize rest day counts
    weekDays.forEach((day) => {
      restDayCounts[day] = 0;
    });

    // CRITICAL: Never allow ALL employees to rest on the same day
    // At least 1 employee must work every day
    const maxRestOnOneDay = Math.max(1, sortedEmployees.length - 1);

    sortedEmployees.forEach((emp, index) => {
      restDayAssignments[emp.id] = [];

      // Distribute rest days across the week
      // Different employees get different rest day patterns
      const restDayPattern = index % 7; // 7 different patterns

      weekDays.forEach((day, dayIndex) => {
        // Assign rest days based on pattern
        // Patterns ensure different employees rest on different days
        if (
          restDayAssignments[emp.id].length < 2 &&
          restDayCounts[day] < maxRestOnOneDay
        ) {
          if (restDayPattern === 0 && (dayIndex === 0 || dayIndex === 3)) {
            restDayAssignments[emp.id].push(day);
            restDayCounts[day]++;
          } else if (
            restDayPattern === 1 &&
            (dayIndex === 1 || dayIndex === 4)
          ) {
            restDayAssignments[emp.id].push(day);
            restDayCounts[day]++;
          } else if (
            restDayPattern === 2 &&
            (dayIndex === 2 || dayIndex === 5)
          ) {
            restDayAssignments[emp.id].push(day);
            restDayCounts[day]++;
          } else if (
            restDayPattern === 3 &&
            (dayIndex === 0 || dayIndex === 4)
          ) {
            restDayAssignments[emp.id].push(day);
            restDayCounts[day]++;
          } else if (
            restDayPattern === 4 &&
            (dayIndex === 1 || dayIndex === 5)
          ) {
            restDayAssignments[emp.id].push(day);
            restDayCounts[day]++;
          } else if (
            restDayPattern === 5 &&
            (dayIndex === 2 || dayIndex === 6)
          ) {
            restDayAssignments[emp.id].push(day);
            restDayCounts[day]++;
          } else if (
            restDayPattern === 6 &&
            (dayIndex === 1 || dayIndex === 5)
          ) {
            // Changed: Pattern 6 uses weekdays, not weekends, to avoid everyone off on weekends
            restDayAssignments[emp.id].push(day);
            restDayCounts[day]++;
          }
        }
      });

      // Ensure exactly 2 rest days (fill with days that have fewest rest assignments)
      while (restDayAssignments[emp.id].length < 2 && weekDays.length > 2) {
        // Find day with minimum rest count that this employee isn't already resting
        const availableDays = weekDays.filter(
          (day) =>
            !restDayAssignments[emp.id].includes(day) &&
            restDayCounts[day] < maxRestOnOneDay
        );

        if (availableDays.length === 0) break; // Safety check

        // Pick the day with lowest rest count
        const dayToAssign = availableDays.reduce((min, day) =>
          restDayCounts[day] < restDayCounts[min] ? day : min
        );

        restDayAssignments[emp.id].push(dayToAssign);
        restDayCounts[dayToAssign]++;
      }
    });

    // Now assign shifts for each day
    weekDays.forEach((day) => {
      const dayOfWeek = new Date(day).getDay();
      const isWeekend = WEEKEND_DAYS_NUM.includes(dayOfWeek);

      // Get employees who should work this day (not on rest)
      const availableEmployees = sortedEmployees.filter((emp) => {
        return !restDayAssignments[emp.id].includes(day);
      });

      // Prioritize employees who can still work within their hours
      const employeesWithHours = availableEmployees.filter((emp) =>
        canWorkHours(emp.id, emp.workingHours)
      );

      // CRITICAL FIX: If no employees have hours left, use all available employees anyway
      // to ensure coverage (better to work slightly over than have zero coverage)
      const workingEmployees =
        employeesWithHours.length > 0 ? employeesWithHours : availableEmployees;

      // Separate 4-hour employees (always Evening) from others
      const fourHourEmployees = workingEmployees.filter(
        (emp) => emp.workingHours === 4
      );
      const otherEmployees = workingEmployees.filter(
        (emp) => emp.workingHours !== 4
      );

      if (isWeekend) {
        // Weekend rules - flexible based on available employees
        // Large teams (9+): 5-6 Evening, 3 Morning
        // Small teams: adapt to available workforce
        let eveningCount = 0;
        let morningCount = 0;

        // Calculate available employees (prefer those with hours left)
        const totalAvailable = workingEmployees.length;

        const otherEmployeesAvailable = otherEmployees;

        // Adaptive targets based on team size
        let targetMorning: number;
        let targetEvening: number;

        if (totalAvailable >= 9) {
          // Large team: strict weekend rules
          targetMorning = 3;
          targetEvening = Math.min(6, totalAvailable - targetMorning);
        } else if (totalAvailable >= 4) {
          // Medium team: at least 1 Morning, rest Evening
          targetMorning = Math.min(2, Math.floor(totalAvailable / 3));
          targetEvening = totalAvailable - targetMorning;
        } else {
          // Small team: distribute evenly or prioritize Evening
          targetMorning = Math.min(1, Math.floor(totalAvailable / 2));
          targetEvening = totalAvailable - targetMorning;
        }

        // First, assign 4-hour employees to Evening
        fourHourEmployees.forEach((emp) => {
          scheduleData[emp.id][day] = "Evening";
          addWorkHours(emp.id, emp.workingHours);
          eveningCount++;
        });

        // Then assign other employees to Evening until we reach target
        otherEmployeesAvailable.forEach((emp) => {
          if (eveningCount < targetEvening) {
            scheduleData[emp.id][day] = "Evening";
            addWorkHours(emp.id, emp.workingHours);
            eveningCount++;
          }
        });

        // Then assign Morning shifts to remaining available employees
        otherEmployeesAvailable.forEach((emp) => {
          // Skip if already assigned to Evening
          if (scheduleData[emp.id][day]) return;

          if (morningCount < targetMorning) {
            scheduleData[emp.id][day] = "Morning";
            addWorkHours(emp.id, emp.workingHours);
            morningCount++;
          } else {
            scheduleData[emp.id][day] = "Off";
          }
        });

        // Assign Off to employees without shifts
        otherEmployees.forEach((emp) => {
          if (!scheduleData[emp.id][day]) {
            scheduleData[emp.id][day] = "Off";
          }
        });
      } else {
        // Weekday rules: distribute across Morning and Evening only (no Night)
        let morningCount = 0;

        // First, assign all 4-hour employees to Evening
        fourHourEmployees.forEach((emp) => {
          scheduleData[emp.id][day] = "Evening";
          addWorkHours(emp.id, emp.workingHours);
        });

        // Calculate how many employees should be on each shift
        // Aim for roughly equal distribution
        const totalOtherEmployees = otherEmployees.length;
        const targetMorning = Math.ceil(totalOtherEmployees / 2);

        // Distribute other employees to balance Morning and Evening
        otherEmployees.forEach((emp) => {
          // Assign to the shift that needs more people
          if (morningCount < targetMorning) {
            scheduleData[emp.id][day] = "Morning";
            addWorkHours(emp.id, emp.workingHours);
            morningCount++;
          } else {
            scheduleData[emp.id][day] = "Evening";
            addWorkHours(emp.id, emp.workingHours);
          }
        });
      }

      // Assign "Off" to employees on rest
      sortedEmployees.forEach((emp) => {
        if (
          restDayAssignments[emp.id].includes(day) &&
          !scheduleData[emp.id][day]
        ) {
          scheduleData[emp.id][day] = "Off";
        }
      });
    });
  });

  return scheduleData;
};
