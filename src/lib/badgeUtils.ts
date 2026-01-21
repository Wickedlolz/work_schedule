/**
 * Utility functions for shift change badges and related UI logic
 */

/**
 * Get badge color based on change count
 * @param changeCount - Number of times the shift has been changed
 * @returns Tailwind CSS background color class
 */
export const getBadgeColor = (changeCount: number): string => {
  if (changeCount >= 6) {
    return "bg-red-600";
  } else if (changeCount >= 3) {
    return "bg-orange-500";
  }
  return "bg-blue-500";
};

/**
 * Get border color based on change count
 * @param changeCount - Number of times the shift has been changed
 * @returns Tailwind CSS border color class
 */
export const getCellBorderClass = (changeCount: number): string => {
  if (changeCount >= 6) {
    return "bg-red-50 border-red-500 border-2";
  } else if (changeCount >= 3) {
    return "bg-orange-50 border-orange-500 border-2";
  }
  return "bg-blue-50 border-blue-400 border-2";
};

/**
 * Format change count text in Bulgarian
 * @param count - Number of changes
 * @returns Formatted Bulgarian text (e.g., "1 път", "3 пъти")
 */
export const formatChangeCountText = (count: number): string => {
  const suffix = count === 1 ? "път" : count < 5 ? "пъти" : "пъти";
  return `Променена ${count} ${suffix}`;
};

/**
 * Build tooltip text for a shift cell
 * @param hasConflict - Whether the shift has a conflict
 * @param conflictMessage - Conflict message if any
 * @param changeCount - Number of times the shift has been changed
 * @param customMessage - Custom message for the shift change
 * @returns Tooltip text or undefined
 */
export const buildTooltipText = (
  hasConflict: boolean,
  conflictMessage: string | undefined,
  changeCount: number,
  customMessage: string | undefined,
): string | undefined => {
  if (hasConflict) {
    return conflictMessage;
  } else if (changeCount > 0) {
    const changesText = formatChangeCountText(changeCount);
    return customMessage ? `${changesText} \n ${customMessage}` : changesText;
  }
  return undefined;
};
