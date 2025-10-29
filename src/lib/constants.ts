/**
 * Shift type options available in the application
 */
export const SHIFT_OPTIONS = [
  "Morning",
  "Evening",
  "Night",
  "Off",
  "Sick Leave",
  "Vacation",
  "Custom",
] as const;

/**
 * Color mapping for each shift type (Tailwind CSS classes)
 */
export const SHIFT_COLORS = {
  Morning: "bg-yellow-100",
  Evening: "bg-blue-100",
  Night: "bg-purple-100",
  Off: "bg-gray-100",
  Custom: "bg-green-100",
} as const;

/**
 * Bulgarian labels for shift types
 */
export const SHIFT_LABELS_BG = {
  Morning: "Сутрешна",
  Evening: "Вечерна",
  Night: "Нощна",
  Off: "Почивка",
  "Sick Leave": "Болничен",
  Vacation: "Отпуск",
  Custom: "Персонализирана",
} as const;

/**
 * Days that are considered weekends (0 = Sunday, 6 = Saturday)
 */
export const WEEKEND_DAYS = [0, 6] as const;

/**
 * Minimum number of employees required in a schedule
 */
export const MIN_EMPLOYEES = 1;

/**
 * Minimum number of schedules required in the application
 */
export const MIN_SCHEDULES = 1;

/**
 * Working hours options available for employees
 */
export const WORKING_HOURS_OPTIONS = [4, 6, 8] as const;

/**
 * Default working hours for new employees
 */
export const DEFAULT_WORKING_HOURS = 8;

/**
 * Color constants
 */
export const COLORS = {
  PRIMARY: "#E13530",
  PRIMARY_CLASS: "text-[#E13530]",
} as const;

/**
 * Locale constants
 */
export const DEFAULT_LOCALE = "bg-BG";

/**
 * Year range constants
 */
export const YEAR_RANGE_SIZE = 5;

/**
 * Messages and localization strings
 */
export const MESSAGES = {
  // Success messages
  shifts: {
    updated: "Смяната е обновена успешно!",
  },
  employee: {
    added: "Служителят е добавен успешно!",
    removed: "Служителят е премахнат успешно!",
    minRequired: (min: number) =>
      `Неуспешно премахване на служител: Минимален брой служители ${min}`,
  },
  schedule: {
    added: "Графикът е добавен успешно!",
  },

  // Error messages
  errors: {
    shiftUpdate: (err: unknown) => `Неуспешно обновяване на смяна: ${err}`,
    employeeAdd: (err: unknown) => `Неуспешно добавяне на служител: ${err}`,
    employeeRemove: (err: unknown) =>
      `Неуспешно премахване на служител: ${err}`,
    scheduleLoadError: "Грешка при зареждане на графици",
    scheduleDeleteError: (err: unknown) =>
      `Неуспешно изтриване на график: ${err}`,
  },

  // Loading/Placeholder messages
  loading: "Зареждане на графици...",
  noSchedules: "Няма създадени графици. Създайте първия си график!",
  createFirstSchedule: "Създай първи график",
  retryButton: "Опитайте отново",

  // Form labels and placeholders
  form: {
    employeeName: "Име на служител",
    employeeNameRequired: "Полето е задължително",
    employeeNameMinLength: "Минимум 2 символа",
    addEmployeeAriaLabel: "Добавяне на нов служител",
    addButton: "Добави служител",
    addingButton: "Добавяне...",
  },

  // Export buttons
  export: {
    excel: "Свали в Excel формат",
    pdf: "Свали в PDF формат",
  },

  // Navigation buttons
  navigation: {
    previous: "← Предишен",
    next: "Следващ →",
  },

  // Title
  title: "Работен график за",
} as const;
