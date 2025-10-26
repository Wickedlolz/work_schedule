export type ShiftType = "Morning" | "Evening" | "Night" | "Off";

export type WorkingHours = 4 | 6 | 8;

export interface Employee {
  id: string;
  name: string;
  workingHours: WorkingHours; // Daily working hours: 4, 6, or 8
  shifts: Record<string, ShiftType>; // Key = date: "YYYY-MM-DD"
}

export interface Schedule {
  id: string;
  name: string;
  employees: Employee[];
  createdAt: string;
  updatedAt: string;
}
