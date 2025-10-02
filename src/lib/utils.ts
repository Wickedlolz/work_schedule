import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable, { CellHookData } from "jspdf-autotable";
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

export const exportToPDF = (month: string, table: HTMLTableElement | null) => {
  const doc = new jsPDF("l", "pt", "a4");

  doc.setFont("OpenSans-Regular", "normal");

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

    didParseCell: (data: CellHookData) => {
      if (data.section === "body") {
        const colIndex = data.column.index;
        let cellText = "";

        if (data.cell.raw instanceof HTMLElement) {
          cellText = data.cell.raw.textContent?.trim() || "";
        } else {
          cellText = String(data.cell.raw || "").trim();
        }

        // Employee name column stays white
        if (colIndex === 0) {
          data.cell.styles.fillColor = [255, 255, 255];
          return;
        }

        // Weekend check (from header text)
        const headerCell = table.querySelectorAll("thead th")[colIndex];
        const day = parseInt(headerCell?.textContent || "0", 10);
        const [monthName, year] = month.split(" ");
        const isWeekend = [0, 6].includes(
          new Date(`${day} ${monthName} ${year}`).getDay()
        );

        if (isWeekend) {
          data.cell.styles.fillColor = [254, 242, 242]; // Tailwind bg-red-50
        }

        // Shift color mapping with exact Tailwind values
        const shiftColors: Record<string, [number, number, number]> = {
          Morning: [254, 249, 195], // bg-yellow-100
          Evening: [219, 234, 254], // bg-blue-100
          Night: [233, 213, 255], // bg-purple-100
          Off: [243, 244, 246], // bg-gray-100
        };

        if (shiftColors[cellText]) {
          data.cell.styles.fillColor = shiftColors[cellText];
        }
      }
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
