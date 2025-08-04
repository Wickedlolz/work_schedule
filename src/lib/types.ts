export type ShiftType = 'Morning' | 'Evening' | 'Night' | 'Off';

export interface Employee {
    id: string;
    name: string;
    shifts: Record<string, ShiftType>; // Key = date: "YYYY-MM-DD"
}
