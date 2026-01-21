import type { ShiftValue, ShiftType } from "./types";
import { SHIFT_LABELS_BG, SHIFT_COLORS } from "./constants";

/**
 * Get display text for a shift value
 * @param shift - The shift value to display
 * @returns Formatted display text
 */
export const getShiftDisplay = (shift: ShiftValue): string => {
  if (typeof shift === "object" && shift.type === "Custom") {
    return `${shift.startTime} - ${shift.endTime}`;
  }
  return SHIFT_LABELS_BG[shift as ShiftType] || "";
};

/**
 * Get CSS color class for a shift
 * @param shift - The shift value
 * @returns Tailwind CSS color class
 */
export const getShiftColor = (shift: ShiftValue): string => {
  if (typeof shift === "object" && shift.type === "Custom") {
    return SHIFT_COLORS.Custom;
  }
  return SHIFT_COLORS[shift as keyof typeof SHIFT_COLORS] || "";
};

/**
 * Get the shift type value from a shift
 * Useful for form controls that need the type string
 * @param shift - The shift value
 * @returns ShiftType string
 */
export const getShiftValue = (shift: ShiftValue): ShiftType => {
  if (typeof shift === "object" && shift.type === "Custom") {
    return "Custom";
  }
  return shift as ShiftType;
};
