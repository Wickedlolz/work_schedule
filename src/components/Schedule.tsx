import { useState } from "react";
import { useFirebaseEmployees } from "@/hooks/useFirebaseEmployees";
import { exportToExcel, exportToPDF, generateMonthDays } from "@/lib/utils";
import type { ShiftType } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ScheduleTable from "./ScheduleTable";
import { Loader2 } from "lucide-react";

const SchedulePage = () => {
  const {
    employees,
    loading,
    error,
    addEmployee: addEmployeeToFirebase,
    removeEmployee: removeEmployeeFromFirebase,
    updateShift,
  } = useFirebaseEmployees();

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

  const handleShiftChange = async (
    employeeId: string,
    date: string,
    newShift: ShiftType
  ) => {
    try {
      await updateShift(employeeId, date, newShift);
    } catch (err) {
      console.error("Failed to update shift:", err);
    }
  };

  const handleAddEmployee = async () => {
    if (!newName.trim()) return;
    try {
      await addEmployeeToFirebase(newName.trim());
      setNewName("");
    } catch (err) {
      console.error("Failed to add employee:", err);
    }
  };

  const handleRemoveEmployee = async (id: string) => {
    if (employees.length <= 1) {
      alert("Трябва да има поне един служител в графика");
      return;
    }
    if (
      window.confirm("Сигурни ли сте, че искате да премахнете този служител?")
    ) {
      try {
        await removeEmployeeFromFirebase(id);
      } catch (err) {
        console.error("Failed to remove employee:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#E13530]" />
        <span className="ml-2 text-lg">Зареждане на графика...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">Грешка: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Опитайте отново
          </Button>
        </div>
      </div>
    );
  }

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
            onKeyDown={(e) => e.key === "Enter" && handleAddEmployee()}
            className="w-[200px]"
          />
          <Button onClick={handleAddEmployee} className="cursor-pointer">
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
        removeEmployee={handleRemoveEmployee}
      />
    </section>
  );
};

export default SchedulePage;
