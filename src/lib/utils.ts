import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const generateMonthDays = (year: number, month: number) => {
    const days: string[] = [];
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
        const day = date.toISOString().split('T')[0];
        days.push(day);
        date.setDate(date.getDate() + 1);
    }
    return days;
};
