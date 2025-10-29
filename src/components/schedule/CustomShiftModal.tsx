import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import type { CustomShift } from "@/lib/types";

interface CustomShiftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (customShift: CustomShift) => void;
  initialStartTime?: string;
  initialEndTime?: string;
}

export const CustomShiftModal = ({
  open,
  onOpenChange,
  onSave,
  initialStartTime = "09:00",
  initialEndTime = "17:30",
}: CustomShiftModalProps) => {
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [error, setError] = useState<string>("");

  const validateTimes = (): boolean => {
    if (!startTime || !endTime) {
      setError("Моля, въведете начален и краен час");
      return false;
    }

    // Convert times to minutes for comparison
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (startMinutes >= endMinutes) {
      setError("Началният час трябва да е преди крайния");
      return false;
    }

    setError("");
    return true;
  };

  const handleSave = () => {
    if (!validateTimes()) {
      return;
    }

    onSave({
      type: "Custom",
      startTime,
      endTime,
    });

    onOpenChange(false);
  };

  const handleCancel = () => {
    setError("");
    setStartTime(initialStartTime);
    setEndTime(initialEndTime);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Персонализирана смяна</AlertDialogTitle>
          <AlertDialogDescription>
            Въведете начален и краен час за персонализираната смяна
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="startTime" className="text-sm font-medium">
              Начален час
            </label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                setError("");
              }}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="endTime" className="text-sm font-medium">
              Краен час
            </label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => {
                setEndTime(e.target.value);
                setError("");
              }}
            />
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Отказ</AlertDialogCancel>
          <AlertDialogAction onClick={handleSave}>Запази</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
