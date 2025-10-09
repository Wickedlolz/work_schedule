import { cn } from "@/lib/utils";
import type { Employee, ShiftType } from "@/lib/types";

import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const shiftOptions: ShiftType[] = ["Morning", "Evening", "Night", "Off"];
const shiftColors: Record<ShiftType, string> = {
  Morning: "bg-yellow-100",
  Evening: "bg-blue-100",
  Night: "bg-purple-100",
  Off: "bg-gray-100",
};

type ScheduleTableProps = {
  employees: Employee[];
  days: string[];
  handleShiftChange: (
    employeeId: string,
    date: string,
    newShift: ShiftType
  ) => void;
  removeEmployee: (employeeId: string) => void;
  tableRef: React.RefObject<HTMLTableElement | null>;
};

const ScheduleTable = ({
  employees,
  days,
  handleShiftChange,
  removeEmployee,
  tableRef,
}: ScheduleTableProps) => {
  return (
    <section className="w-full">
      <div className="w-full overflow-x-auto overflow-y-hidden">
        <table
          ref={tableRef}
          id="schedule-table"
          className="min-w-[900px] w-full border border-gray-300 text-xs sm:text-sm"
          role="table"
          aria-label="Работен график"
        >
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr role="row">
              <th
                scope="col"
                className="sticky left-0 z-20 bg-gray-100 text-left p-2 border border-gray-300 whitespace-nowrap"
              >
                Служител
              </th>
              {days.map((day) => {
                const isWeekend = [0, 6].includes(new Date(day).getDay());
                return (
                  <th
                    key={day}
                    className={cn(
                      "text-center p-1 border border-gray-300 whitespace-nowrap",
                      isWeekend && "bg-red-50"
                    )}
                    scope="col"
                  >
                    {new Date(day).getDate()}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} role="row" className="border-t border-gray-200">
                <td
                  role="cell"
                  className="sticky left-0 z-10 bg-white p-2 border border-gray-300 font-medium text-center whitespace-nowrap"
                >
                  {emp.name}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-2 text-red-500 cursor-pointer"
                        aria-label={`Изтриване на ${emp.name}`}
                      >
                        ✕
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent role="alertdialog" aria-modal="true">
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Сигурни ли сте, че искате да изтриете този служител?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Това действие е необратимо. След като служителят бъде
                          изтрит, всички свързани данни с неговите смени ще
                          бъдат премахнати от системата.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отказ</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => removeEmployee(emp.id)}
                        >
                          Изтрий
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </td>
                {days.map((day) => {
                  const isWeekend = [0, 6].includes(new Date(day).getDay());
                  const currentShift = emp.shifts[day] || "Off";
                  return (
                    <td
                      key={day}
                      role="cell"
                      className={cn(
                        "border border-gray-300 p-1 text-center whitespace-nowrap",
                        isWeekend && "bg-red-50",
                        shiftColors[currentShift]
                      )}
                    >
                      <Select
                        value={currentShift}
                        onValueChange={(val: ShiftType) =>
                          handleShiftChange(emp.id, day, val)
                        }
                      >
                        <SelectTrigger className="w-full text-[10px] sm:text-xs h-7 sm:h-8">
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
    </section>
  );
};

export default ScheduleTable;
