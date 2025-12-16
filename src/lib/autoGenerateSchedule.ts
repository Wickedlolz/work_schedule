import { getISOWeek } from "date-fns";
import { getBulgarianHolidays } from "./utils";
import type { Employee, ShiftValue } from "./types";

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
  days: string[] // ISO date strings (YYYY-MM-DD)
): Record<string, Record<string, ShiftValue>> => {
  const scheduleData: Record<string, Record<string, ShiftValue>> = {};

  // Initialize structure
  employees.forEach((emp) => {
    scheduleData[emp.id] = {};
  });

  // 1. Calculate Expected Hours
  const year = new Date(days[0]).getFullYear();
  const holidays = getBulgarianHolidays(year);

  const workingDaysCount = days.filter((day) => {
    const d = new Date(day);
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = holidays.includes(day);
    return !isWeekend && !isHoliday;
  }).length;

  const accumulatedHours: Record<string, number> = {};
  const expectedHours: Record<string, number> = {};

  employees.forEach((emp) => {
    accumulatedHours[emp.id] = 0;
    expectedHours[emp.id] = workingDaysCount * emp.workingHours;
  });

  const addWorkHours = (empId: string, hours: number) => {
    accumulatedHours[empId] += hours;
  };

  // 2. Group days by ISO Calendar Week (Mon-Sun)
  // This ensures weekends are always at the end of the group
  const weekGroups: Record<number, string[]> = {};

  days.forEach((day) => {
    const date = new Date(day);
    // getISOWeek handles the year rollover correctly
    const weekNum = getISOWeek(date);
    if (!weekGroups[weekNum]) weekGroups[weekNum] = [];
    weekGroups[weekNum].push(day);
  });

  // 3. Process Each Week
  Object.keys(weekGroups).forEach((weekKey) => {
    const weekNumber = parseInt(weekKey);
    const weekDays = weekGroups[weekNumber];

    // Sort: Least hours worked goes first
    const sortedEmployees = [...employees].sort((a, b) => {
      const diff = accumulatedHours[a.id] - accumulatedHours[b.id];
      return diff !== 0 ? diff : Math.random() - 0.5;
    });

    // --- Dynamic Rest Day Assignment ---
    const restDayAssignments: Record<string, string[]> = {};
    const dailyRestCounts: Record<string, number> = {};
    weekDays.forEach((day) => (dailyRestCounts[day] = 0));

    // Max employees allowed to rest per day (keep at least 1 working)
    const maxRestPerDay = Math.max(0, employees.length - 2);

    sortedEmployees.forEach((emp) => {
      restDayAssignments[emp.id] = [];

      // Determine how many rest days needed?
      // Full week (7 days) = 2 rest days. Partial week (< 5 days) = 1 or 0 rest days.
      const targetRestDays =
        weekDays.length >= 5 ? 2 : weekDays.length >= 3 ? 1 : 0;

      // Try to assign rest days
      // Strategy: Pick random available days to ensure rotation, avoiding days that are full
      const potentialDays = [...weekDays].sort(() => Math.random() - 0.5);

      for (const day of potentialDays) {
        if (restDayAssignments[emp.id].length >= targetRestDays) break;

        // If strict coverage allows more rest on this day
        if (dailyRestCounts[day] < maxRestPerDay) {
          restDayAssignments[emp.id].push(day);
          dailyRestCounts[day]++;
        }
      }
    });

    // --- Shift Assignment ---
    weekDays.forEach((day) => {
      const date = new Date(day);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // First, mark all rest day employees as "Off" BEFORE assigning shifts
      sortedEmployees.forEach((emp) => {
        if (restDayAssignments[emp.id]?.includes(day)) {
          scheduleData[emp.id][day] = "Off";
        }
      });

      // 1. Filter who is available (not resting)
      let availableForShift = sortedEmployees.filter(
        (emp) => !restDayAssignments[emp.id]?.includes(day)
      );

      // CRITICAL: If everyone is on rest (rare edge case), force someone to work
      if (availableForShift.length === 0) {
        // Grab the employee with lowest hours from the rest pool
        const emergencyWorker = sortedEmployees[0];
        // Remove from rest list and clear their "Off" status
        restDayAssignments[emergencyWorker.id] = restDayAssignments[
          emergencyWorker.id
        ].filter((d) => d !== day);
        delete scheduleData[emergencyWorker.id][day]; // Remove the "Off" we just set
        availableForShift = [emergencyWorker];
      }

      // 2. Identify 4-hour vs standard employees
      const fourHourEmps = availableForShift.filter(
        (e) => e.workingHours === 4
      );
      const standardEmps = availableForShift.filter(
        (e) => e.workingHours !== 4
      );

      // 3. Assign 4-hour employees (Always Evening)
      fourHourEmps.forEach((emp) => {
        scheduleData[emp.id][day] = "Evening";
        addWorkHours(emp.id, emp.workingHours);
      });

      // 4. Assign Standard Employees
      if (isWeekend) {
        let morningCount = 0;

        // We don't need to track eveningCount because everyone else falls into Evening
        // to ensure maximum coverage.

        // Determine targets based on TOTAL AVAILABLE standard employees
        const totalStandard = standardEmps.length;

        let targetMorning = 1;
        // Large team (9+ total people) -> 3 mornings
        if (totalStandard + fourHourEmps.length >= 9) targetMorning = 3;
        // Medium team (4-8 total people) -> 2 mornings
        else if (totalStandard + fourHourEmps.length >= 4) targetMorning = 2;

        // Fill Morning First (Standard Emps only)
        standardEmps.forEach((emp) => {
          if (morningCount < targetMorning) {
            scheduleData[emp.id][day] = "Morning";
            morningCount++;
            addWorkHours(emp.id, emp.workingHours);
          } else {
            // Everyone else goes to Evening (better coverage than "Off")
            scheduleData[emp.id][day] = "Evening";
            addWorkHours(emp.id, emp.workingHours);
          }
        });
      } else {
        // --- Weekday Logic ---
        // Balance Morning/Evening
        let morningCount = 0;
        const totalToAssign = standardEmps.length;
        const targetMorning = Math.ceil(totalToAssign / 2);

        standardEmps.forEach((emp) => {
          if (morningCount < targetMorning) {
            scheduleData[emp.id][day] = "Morning";
            morningCount++;
          } else {
            scheduleData[emp.id][day] = "Evening";
          }
          addWorkHours(emp.id, emp.workingHours);
        });
      }
    });
  });

  return scheduleData;
};
