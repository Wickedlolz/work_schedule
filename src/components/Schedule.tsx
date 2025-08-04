import { useEffect, useState } from 'react';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateMonthDays } from '@/lib/utils';
import type { Employee, ShiftType } from '@/lib/types';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const defaultEmployees: Employee[] = [
    { id: '1', name: 'Alice Johnson', shifts: {} },
    { id: '2', name: 'Bob Smith', shifts: {} },
    { id: '3', name: 'Charlie Brown', shifts: {} },
];

const shiftOptions: ShiftType[] = ['Morning', 'Evening', 'Night', 'Off'];
const shiftColors: Record<ShiftType, string> = {
    Morning: 'bg-yellow-100',
    Evening: 'bg-blue-100',
    Night: 'bg-purple-100',
    Off: 'bg-gray-100',
};

const SchedulePage = () => {
    const [monthOffset, setMonthOffset] = useState(0);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [newName, setNewName] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const baseDate = new Date(selectedYear, selectedMonth + monthOffset, 1);
    const days = generateMonthDays(baseDate.getFullYear(), baseDate.getMonth());
    const monthLabel = baseDate.toLocaleString('default', {
        month: 'long',
        year: 'numeric',
    });

    useEffect(() => {
        const data = localStorage.getItem('work-schedule');
        const employees = JSON.parse(data || '[]');

        if (employees?.length > 0) {
            setEmployees(employees);
        } else {
            setEmployees(defaultEmployees);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('work-schedule', JSON.stringify(employees));
    }, [employees]);

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
        setNewName('');
    };

    const removeEmployee = (id: string) => {
        if (employees.length <= 1) return;
        if (window.confirm('Are you sure you want to remove this employee?')) {
            setEmployees((prev) => prev.filter((e) => e.id !== id));
        }
    };

    const exportToExcel = () => {
        const data = employees.map((emp) => {
            const row: Record<string, string> = { Name: emp.name };
            days.forEach((day) => {
                row[day] = emp.shifts[day] || 'Off';
            });
            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Schedule');
        XLSX.writeFile(workbook, `work_schedule_${monthLabel}.xlsx`);
    };

    const exportToPDF = async () => {
        const table = document.getElementById('schedule-table');
        if (!table) return;
        const canvas = await html2canvas(table);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('l', 'pt', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`work_schedule_${monthLabel}.pdf`);
    };

    return (
        <div className="p-4 overflow-x-auto">
            <h1 className="text-2xl font-semibold mb-4">
                Work Schedule for {monthLabel}
            </h1>

            <div className="flex gap-2 mb-4 items-center flex-wrap">
                <select
                    className="border rounded px-2 py-1"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                    {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i}>
                            {new Date(0, i).toLocaleString('default', {
                                month: 'long',
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
                >
                    ← Previous
                </Button>
                <Button
                    variant="outline"
                    onClick={() => setMonthOffset((m) => m + 1)}
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
                <Button onClick={exportToExcel} variant="secondary">
                    Export to Excel
                </Button>
                <Button onClick={exportToPDF} variant="secondary">
                    Export to PDF
                </Button>
            </div>

            <table
                id="schedule-table"
                className="min-w-[1000px] w-full border border-gray-200"
            >
                <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr>
                        <th className="text-left p-2 border border-gray-300">
                            Employee
                        </th>
                        {days.map((day) => {
                            const isWeekend = [0, 6].includes(
                                new Date(day).getDay()
                            );
                            return (
                                <th
                                    key={day}
                                    className={cn(
                                        'text-center text-sm p-1 border border-gray-300',
                                        isWeekend && 'bg-red-50'
                                    )}
                                >
                                    {new Date(day).getDate()}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {employees.map((emp) => (
                        <tr key={emp.id} className="border-t border-gray-200">
                            <td className="p-2 border border-gray-300 font-medium whitespace-nowrap">
                                {emp.name}
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="ml-2 text-red-500"
                                    onClick={() => removeEmployee(emp.id)}
                                >
                                    ✕
                                </Button>
                            </td>
                            {days.map((day) => {
                                const isWeekend = [0, 6].includes(
                                    new Date(day).getDay()
                                );
                                const currentShift = emp.shifts[day] || 'Off';
                                return (
                                    <td
                                        key={day}
                                        className={cn(
                                            'border border-gray-300 p-1',
                                            isWeekend && 'bg-red-50',
                                            shiftColors[currentShift]
                                        )}
                                    >
                                        <Select
                                            value={currentShift}
                                            onValueChange={(val: ShiftType) =>
                                                handleShiftChange(
                                                    emp.id,
                                                    day,
                                                    val
                                                )
                                            }
                                        >
                                            <SelectTrigger className="w-full text-xs h-8">
                                                <SelectValue placeholder="Select shift" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {shiftOptions.map((option) => (
                                                    <SelectItem
                                                        key={option}
                                                        value={option}
                                                        className="text-xs"
                                                    >
                                                        {option}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SchedulePage;
