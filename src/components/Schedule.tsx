import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { exportToExcel, exportToPDF, generateMonthDays } from "@/lib/utils";
import type { Employee, ShiftType } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ScheduleTable from "./ScheduleTable";

const defaultEmployees: Employee[] = [
  { id: "1", name: "Виктор", shifts: {} },
  { id: "2", name: "Регина", shifts: {} },
  { id: "3", name: "Дани", shifts: {} },
];

const SchedulePage = () => {
  const [employees, setEmployees] = useLocalStorage<Employee[]>(
    "work-schedule",
    defaultEmployees
  );
  const [monthOffset, setMonthOffset] = useState<number>(0);
  const [newName, setNewName] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  const baseDate = new Date(selectedYear, selectedMonth + monthOffset, 1);
  const days = generateMonthDays(baseDate.getFullYear(), baseDate.getMonth());
  const monthLabel = baseDate.toLocaleString("bg-BG", {
    month: "long",
    year: "numeric",
  });

  const handleShiftChange = (
    employeeId: string,
    date: string,
    newShift: ShiftType
  ) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === employeeId
          ? { ...emp, shifts: { ...emp.shifts, [date]: newShift } }
          : emp
      )
    );
  };

  const addEmployee = () => {
    if (!newName.trim()) return;
    setEmployees((prev) => [
      ...prev,
      { id: Date.now().toString(), name: newName.trim(), shifts: {} },
    ]);
    setNewName("");
  };

  const removeEmployee = (id: string) => {
    if (employees.length <= 1) return;
    if (window.confirm("Are you sure you want to remove this employee?")) {
      setEmployees((prev) => prev.filter((e) => e.id !== id));
    }
  };

  return (
    <section>
      <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-6 p-4 text-center md:text-left border-b bg-gradient-to-r from-red-50 via-white to-red-50">
        Работен график за <span className="text-[#E13530]">{monthLabel}</span>
      </h1>

      <div className="flex flex-col flex-wrap gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <select
          className="border rounded px-2 py-1"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>
              {new Date(0, i).toLocaleString("bg-BG", {
                month: "long",
              })}
            </option>
          ))}
        </select>

        <select
          className="border rounded px-2 py-1"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {Array.from({ length: 5 }, (_, i) => (
            <option key={i} value={2023 + i}>
              {2023 + i}
            </option>
          ))}
        </select>

        <Button
          variant="outline"
          onClick={() => setMonthOffset((m) => m - 1)}
          className="cursor-pointer"
        >
          ← Предишен
        </Button>
        <Button
          variant="outline"
          onClick={() => setMonthOffset((m) => m + 1)}
          className="cursor-pointer"
        >
          Следващ →
        </Button>
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Име на служител"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-[200px]"
          />
          <Button onClick={addEmployee} className="cursor-pointer">
            Добави служител
          </Button>
        </div>
        <Button
          onClick={() => exportToExcel(employees, days, monthLabel)}
          variant="secondary"
          className="cursor-pointer"
        >
          Свали в Excel формат
        </Button>
        <Button
          onClick={() => exportToPDF(monthLabel)}
          variant="secondary"
          className="cursor-pointer"
        >
          Свали в PDF формат
        </Button>
      </div>

      <ScheduleTable
        employees={employees}
        days={days}
        handleShiftChange={handleShiftChange}
        removeEmployee={removeEmployee}
      />
    </section>
  );
};

export default SchedulePage;
