import { DEFAULT_LOCALE, YEAR_RANGE_SIZE } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MonthYearSelectorProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

/**
 * Component for selecting month and year using shadcn Select components
 */
export const MonthYearSelector = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}: MonthYearSelectorProps) => {
  const currentYear = new Date().getFullYear();

  // Generate array of months
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: new Date(0, i).toLocaleString(DEFAULT_LOCALE, {
      month: "long",
    }),
  }));

  // Generate array of years
  const years = Array.from({ length: YEAR_RANGE_SIZE }, (_, i) => {
    const year = currentYear - Math.floor(YEAR_RANGE_SIZE / 2) + i;
    return { value: year, label: year.toString() };
  });

  return (
    <div className="flex gap-2">
      {/* Month Selector */}
      <Select
        value={selectedMonth.toString()}
        onValueChange={(value) => onMonthChange(Number(value))}
      >
        <SelectTrigger className="w-[180px]" aria-label="Select month">
          <SelectValue placeholder="Избери месец" />
        </SelectTrigger>
        <SelectContent>
          {months.map((month) => (
            <SelectItem key={month.value} value={month.value.toString()}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Year Selector */}
      <Select
        value={selectedYear.toString()}
        onValueChange={(value) => onYearChange(Number(value))}
      >
        <SelectTrigger className="w-[120px]" aria-label="Select year">
          <SelectValue placeholder="Избери година" />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year.value} value={year.value.toString()}>
              {year.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
