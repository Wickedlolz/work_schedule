export type ShiftType = "Morning" | "Evening" | "Night" | "Off";

export interface Employee {
  id: string;
  name: string;
  shifts: Record<string, ShiftType>; // Key = date: "YYYY-MM-DD"
}

export interface Schedule {
  id: string;
  name: string;
  employees: Employee[];
  createdAt: string;
  updatedAt: string;
}
