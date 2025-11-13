import { useState } from "react";
import { cn, calculateEmployeeWorkHours } from "@/lib/utils";
import type { Employee } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WorkHoursModalProps {
  open: boolean;
  employee: Employee | null;
  days: string[];
  isAuthenticated: boolean;
  onClose: () => void;
  onUpdateMaxHours: (
    employeeId: string,
    maxHours: number | undefined
  ) => Promise<void>;
}

export const WorkHoursModal = ({
  open,
  employee,
  days,
  isAuthenticated,
  onClose,
  onUpdateMaxHours,
}: WorkHoursModalProps) => {
  const [editingMaxHours, setEditingMaxHours] = useState(false);
  const [tempMaxHours, setTempMaxHours] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  if (!employee) return null;

  const workHoursStats = calculateEmployeeWorkHours(employee, days);

  const handleOpen = (isOpen: boolean) => {
    if (!isOpen && !isSaving) {
      onClose();
      setEditingMaxHours(false);
    }
  };

  const handleEdit = () => {
    setTempMaxHours(employee.maxMonthlyHours?.toString() || "");
    setEditingMaxHours(true);
  };

  const handleSave = async () => {
    const value = tempMaxHours.trim();
    const maxHours = value === "" ? undefined : parseInt(value, 10);

    if (value !== "" && (isNaN(maxHours!) || maxHours! <= 0)) {
      return; // Invalid input
    }

    setIsSaving(true);
    try {
      await onUpdateMaxHours(employee.id, maxHours);
      setEditingMaxHours(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsSaving(true);
    try {
      await onUpdateMaxHours(employee.id, undefined);
      setTempMaxHours("");
      setEditingMaxHours(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingMaxHours(false);
    setTempMaxHours(employee.maxMonthlyHours?.toString() || "");
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpen}>
      <AlertDialogContent aria-modal="true">
        <AlertDialogHeader>
          <AlertDialogTitle>Работни часове за {employee.name}</AlertDialogTitle>
          <AlertDialogDescription>
            Информация за работните часове за текущия месец
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4 space-y-3">
          {/* Expected Hours */}
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">
              Очаквани часове:
            </span>
            <div className="flex items-center gap-2">
              {editingMaxHours ? (
                <>
                  <Input
                    type="number"
                    value={tempMaxHours}
                    onChange={(e) => setTempMaxHours(e.target.value)}
                    placeholder={workHoursStats.expected.toString()}
                    className="w-20 h-8 text-right"
                    min="1"
                  />
                  <span className="text-sm">ч</span>
                </>
              ) : (
                <span className="text-lg font-bold text-gray-900">
                  {workHoursStats.expected}ч
                  {employee.maxMonthlyHours && (
                    <span className="text-xs ml-1 text-blue-600">(ръчно)</span>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isAuthenticated && (
            <div className="flex gap-2 flex-wrap">
              {!editingMaxHours ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleEdit}
                    className="cursor-pointer"
                    disabled={isSaving}
                  >
                    ✏️ Промени максимум
                  </Button>
                  {employee.maxMonthlyHours && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleReset}
                      className="cursor-pointer text-red-600"
                      disabled={isSaving}
                    >
                      {isSaving
                        ? "⏳ Зареждане..."
                        : "🔄 Възстанови автоматично"}
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="cursor-pointer"
                    disabled={isSaving}
                  >
                    {isSaving ? "⏳ Записване..." : "💾 Запази"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                    className="cursor-pointer"
                    disabled={isSaving}
                  >
                    ✕ Откажи
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Actual Hours */}
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">
              Реални часове:
            </span>
            <span
              className={cn(
                "text-lg font-bold",
                workHoursStats.isOverworked ? "text-red-600" : "text-gray-900"
              )}
            >
              {workHoursStats.actual}ч
            </span>
          </div>

          {/* Overwork Warning */}
          {workHoursStats.isOverworked && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-red-600">⚠️</span>
                <div>
                  <p className="text-sm font-semibold text-red-800">
                    Внимание!
                  </p>
                  <p className="text-sm text-red-700">
                    Служителят има повече часове от очакваното!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>Затвори</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
