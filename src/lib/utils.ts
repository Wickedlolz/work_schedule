import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Employee } from "./types";
import "@/lib/OpenSans-Regular-normal.js";
import "@/lib/OpenSans-Bold-normal.js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateMonthDays = (year: number, month: number) => {
  const days: string[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    const day = date.toISOString().split("T")[0];
    days.push(day);
    date.setDate(date.getDate() + 1);
  }
  return days;
};

export const exportToPDF = (month: string) => {
  const doc = new jsPDF("l", "pt", "a4");

  doc.setFont("OpenSans-Regular", "normal");

  const table = document.getElementById(
    "schedule-table"
  ) as HTMLTableElement | null;

  if (!table) return;

  autoTable(doc, {
    html: table,
    theme: "grid",
    styles: {
      fontSize: 8,
      font: "OpenSans-Regular",
      cellPadding: 3,
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      font: "OpenSans-Bold",
      fontStyle: "normal",
      minCellHeight: 20,
    },
    bodyStyles: { textColor: [50, 50, 50] },
    columnStyles: {
      0: { cellWidth: 80, halign: "left" },
    },
  });

  doc.text(`Работен график за ${month}`, 40, 30);

  doc.save(`работен_график_${month}.pdf`);
};

export const exportToExcel = (
  employees: Employee[],
  days: string[],
  month: string
) => {
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
  XLSX.writeFile(workbook, `work_schedule_${month}.xlsx`);
};
