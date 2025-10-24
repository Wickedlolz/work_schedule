import { DEFAULT_LOCALE, YEAR_RANGE_SIZE } from "@/lib/constants";

interface MonthYearSelectorProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

/**
 * Component for selecting month and year
 */
export const MonthYearSelector = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}: MonthYearSelectorProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex gap-2">
      <select
        className="border rounded px-2 py-1"
        value={selectedMonth}
        onChange={(e) => onMonthChange(Number(e.target.value))}
        aria-label="Select month"
      >
        {Array.from({ length: 12 }, (_, i) => (
          <option key={i} value={i}>
            {new Date(0, i).toLocaleString(DEFAULT_LOCALE, {
              month: "long",
            })}
          </option>
        ))}
      </select>

      <select
        className="border rounded px-2 py-1"
        value={selectedYear}
        onChange={(e) => onYearChange(Number(e.target.value))}
        aria-label="Select year"
      >
        {Array.from({ length: YEAR_RANGE_SIZE }, (_, i) => {
          const year = currentYear - Math.floor(YEAR_RANGE_SIZE / 2) + i;
          return (
            <option key={i} value={year}>
              {year}
            </option>
          );
        })}
      </select>
    </div>
  );
};
