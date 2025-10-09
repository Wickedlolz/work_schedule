import { useRef, useState } from "react";
import { useFirebaseEmployees } from "@/hooks/useFirebaseEmployees";
import { exportToExcel, exportToPDF, generateMonthDays } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
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

    try {
      await removeEmployeeFromFirebase(id);
    } catch (err) {
      console.error("Неуспешно премахване на служител:", err);
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
      <h1
        className="text-2xl md:text-4xl font-bold text-gray-800 mb-6 p-4 text-center md:text-left border-b bg-gradient-to-r from-red-50 via-white to-red-50"
        aria-label={`Работен график за ${monthLabel}`}
      >
        Работен график за <span className="text-[#E13530]">{monthLabel}</span>
      </h1>

      <div
        className="flex flex-col flex-wrap gap-2 sm:flex-row sm:items-center sm:justify-between mb-4"
        role="region"
        aria-label="Филтри и контрол на графика"
      >
        <select
          id="month-select"
          name="month"
          className="border rounded px-2 py-1"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          aria-label="Избор на месец"
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
          id="year-select"
          name="year"
          className="border rounded px-2 py-1"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          aria-label="Избор на година"
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
          aria-label="Предишен месец"
        >
          ← Предишен
        </Button>
        <Button
          variant="outline"
          onClick={handleNextMonth}
          className="cursor-pointer"
          aria-label="Следващ месец"
        >
          Следващ →
        </Button>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col sm:flex-row sm:items-center sm:gap-2 gap-3"
          aria-label="Добавяне на нов служител"
        >
          <div className="flex flex-col w-full sm:w-auto">
            <Input
              id="employeeName"
              placeholder="Име на служител"
              aria-invalid={errors.employeeName ? "true" : "false"}
              aria-describedby={
                errors.employeeName ? errors.employeeName.message : undefined
              }
              {...register("employeeName", {
                required: "Полето е задължително",
                minLength: { value: 2, message: "Минимум 2 символа" },
              })}
              className="w-full sm:w-[200px]"
            />

            <AnimatePresence mode="wait">
              {errors.employeeName && (
                <motion.span
                  key="error"
                  id="employeeName-error"
                  role="alert"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="text-red-500 text-sm mt-1"
                >
                  {errors.employeeName.message}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <Button
            type="submit"
            className="cursor-pointer w-full sm:w-auto"
            aria-label="Добави служител"
          >
            Добави служител
          </Button>
        </form>
        <Button
          onClick={() => exportToExcel(employees, days, monthLabel)}
          variant="secondary"
          className="cursor-pointer"
          aria-label="Свали графика в Excel формат"
        >
          Свали в Excel формат
        </Button>
        <Button
          onClick={() => exportToPDF(monthLabel, tableRef.current)}
          variant="secondary"
          className="cursor-pointer"
          aria-label="Свали графика в PDF формат"
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
