import { useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { generateMonthDays } from "@/lib/utils";
import type { Employee, ShiftType } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ScheduleTable from "./ScheduleTable";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const defaultEmployees: Employee[] = [
  { id: "1", name: "Alice Johnson", shifts: {} },
  { id: "2", name: "Bob Smith", shifts: {} },
  { id: "3", name: "Charlie Brown", shifts: {} },
];

const SchedulePage = () => {
  const [employees, setEmployees] = useLocalStorage<Employee[]>(
    "work-schedule",
    defaultEmployees
  );
  const [monthOffset, setMonthOffset] = useState(0);
  const [newName, setNewName] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const baseDate = new Date(selectedYear, selectedMonth + monthOffset, 1);
  const days = generateMonthDays(baseDate.getFullYear(), baseDate.getMonth());
  const monthLabel = baseDate.toLocaleString("default", {
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

  const exportToExcel = () => {
    const data = employees.map((emp) => {
      const row: Record<string, string> = { Name: emp.name };
      days.forEach((day) => {
        row[day] = emp.shifts[day] || "Off";
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Schedule");
    XLSX.writeFile(workbook, `work_schedule_${monthLabel}.xlsx`);
  };

  const exportToPDF = async () => {
    const table = document.getElementById("schedule-table");
    if (!table) return;
    const canvas = await html2canvas(table);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "pt", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`work_schedule_${monthLabel}.pdf`);
  };

  return (
    <main className="w-full max-w-screen overflow-x-auto px-2 sm:px-4">
      <h1 className="text-2xl font-semibold mb-4">
        Kaufland Work Schedule for {monthLabel}
      </h1>

      <div className="flex flex-col flex-wrap gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <select
          className="border rounded px-2 py-1"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>
              {new Date(0, i).toLocaleString("default", {
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
          ← Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => setMonthOffset((m) => m + 1)}
          className="cursor-pointer"
        >
          Next →
        </Button>
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Employee name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-[200px]"
          />
          <Button onClick={addEmployee}>Add Employee</Button>
        </div>
        <Button
          onClick={exportToExcel}
          variant="secondary"
          className="cursor-pointer"
        >
          Export to Excel
        </Button>
        <Button
          onClick={exportToPDF}
          variant="secondary"
          className="cursor-pointer"
        >
          Export to PDF
        </Button>
      </div>

      <ScheduleTable
        employees={employees}
        days={days}
        handleShiftChange={handleShiftChange}
        removeEmployee={removeEmployee}
      />
    </main>
  );
};

export default SchedulePage;
