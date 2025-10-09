import { useRef, useState } from "react";
import { useFirebaseEmployees } from "@/hooks/useFirebaseEmployees";
import { exportToExcel, exportToPDF, generateMonthDays } from "@/lib/utils";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import type { ShiftType } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ScheduleTable from "./ScheduleTable";
import { Loader2 } from "lucide-react";

type Inputs = {
  employeeName: string;
};

const SchedulePage = () => {
  const {
    employees,
    loading,
    error,
    addEmployee: addEmployeeToFirebase,
    removeEmployee: removeEmployeeFromFirebase,
    updateShift,
  } = useFirebaseEmployees();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Inputs>();

  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const tableRef = useRef<HTMLTableElement>(null);

  const days = generateMonthDays(selectedYear, selectedMonth);
  const monthLabel = new Date(selectedYear, selectedMonth, 1).toLocaleString(
    "bg-BG",
    {
      month: "long",
      year: "numeric",
    }
  );

  const handleShiftChange = async (
    employeeId: string,
    date: string,
    newShift: ShiftType
  ) => {
    try {
      await updateShift(employeeId, date, newShift);
    } catch (err) {
      console.error("Неуспешно обновяване на смяна:", err);
    }
  };

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      await addEmployeeToFirebase(data.employeeName.trim());
      reset();
    } catch (err) {
      console.error("Неуспешно добавяне на служител:", err);
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
        console.error("Неуспешно премахване на служител:", err);
      }
    }
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(selectedYear, selectedMonth - 1, 1);
    setSelectedMonth(newDate.getMonth());
    setSelectedYear(newDate.getFullYear());
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedYear, selectedMonth + 1, 1);
    setSelectedMonth(newDate.getMonth());
    setSelectedYear(newDate.getFullYear());
  };

  if (loading) {
    return (
      <section className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#E13530]" />
        <span className="ml-2 text-lg">Зареждане на графика...</span>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">Грешка: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Опитайте отново
          </Button>
        </div>
      </section>
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
          onClick={handlePreviousMonth}
          className="cursor-pointer"
        >
          ← Предишен
        </Button>
        <Button
          variant="outline"
          onClick={handleNextMonth}
          className="cursor-pointer"
        >
          Следващ →
        </Button>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex gap-2 items-center"
        >
          <Input
            placeholder="Име на служител"
            {...register("employeeName", {
              required: "Полето е задължително",
              minLength: { value: 2, message: "Минимум 2 символа" },
            })}
            className="w-[200px]"
          />
          {errors.employeeName && (
            <span className="text-red-500 text-sm">
              {errors.employeeName.message}
            </span>
          )}
          <Button type="submit" className="cursor-pointer">
            Добави служител
          </Button>
        </form>
        <Button
          onClick={() => exportToExcel(employees, days, monthLabel)}
          variant="secondary"
          className="cursor-pointer"
        >
          Свали в Excel формат
        </Button>
        <Button
          onClick={() => exportToPDF(monthLabel, tableRef.current)}
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
        tableRef={tableRef}
      />
    </section>
  );
};

export default SchedulePage;
