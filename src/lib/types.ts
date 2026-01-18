export type ShiftType =
  | "Morning"
  | "Evening"
  | "Night"
  | "Off"
  | "Sick Leave"
  | "Vacation"
  | "Custom";

export type WorkingHours = 4 | 6 | 8;

export interface CustomShift {
  type: "Custom";
  startTime: string; // Format: "HH:mm" (e.g., "09:00")
  endTime: string; // Format: "HH:mm" (e.g., "17:30")
}

export type ShiftValue = ShiftType | CustomShift;

export interface Employee {
  id: string;
  name: string;
  workingHours: WorkingHours; // Daily working hours: 4, 6, or 8
  maxMonthlyHours?: number; // Optional: Manual override for max monthly hours
  shifts: Record<string, ShiftValue>; // Key = date: "YYYY-MM-DD"
  changedShifts?: Record<string, number>; // Track how many times each shift has been changed
}

export interface Schedule {
  id: string;
  name: string;
  employees: Employee[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomShiftModalState {
  open: boolean;
  employeeId: string;
  date: string;
  existingShift?: CustomShift;
}

export interface WorkHoursModalState {
  open: boolean;
  employeeId: string;
}

export interface ShiftConflict {
  employeeId: string;
  employeeName: string;
  date: string;
  shift: ShiftValue;
  conflictReason: string;
}
