import type { Employee } from "./types";

/**
 * Helper functions for employee shift updates
 * Extracted from useFirebaseSchedules hook for better maintainability
 */

/**
 * Update employee's shift messages when message is null (deletion)
 * @param employee - The employee to update
 * @param date - The date of the shift
 * @returns Updated shiftMessages object or undefined
 */
export const deleteShiftMessage = (
  employee: Employee,
  date: string,
): Record<string, string> | undefined => {
  if (employee.shiftMessages && employee.shiftMessages[date]) {
    const { [date]: _, ...remainingMessages } = employee.shiftMessages;
    return remainingMessages;
  }
  return employee.shiftMessages;
};

/**
 * Update employee's shift messages when adding or updating a message
 * @param employee - The employee to update
 * @param date - The date of the shift
 * @param message - The new message
 * @returns Updated shiftMessages object
 */
export const updateShiftMessage = (
  employee: Employee,
  date: string,
  message: string,
): Record<string, string> => {
  return {
    ...employee.shiftMessages,
    [date]: message,
  };
};

/**
 * Increment the change count for a shift
 * @param employee - The employee to update
 * @param date - The date of the shift
 * @returns Updated changedShifts object
 */
export const incrementChangeCount = (
  employee: Employee,
  date: string,
): Record<string, number> => {
  const currentCount = employee.changedShifts?.[date] || 0;
  return {
    ...employee.changedShifts,
    [date]: currentCount + 1,
  };
};

/**
 * Check if an employee had a previous shift on a specific date
 * @param employee - The employee to check
 * @param date - The date to check
 * @returns True if employee had a shift on this date
 */
export const hadPreviousShift = (employee: Employee, date: string): boolean => {
  return employee.shifts[date] !== undefined && employee.shifts[date] !== null;
};
