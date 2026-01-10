import { useEffect } from "react";
import { useForm } from "react-hook-form";
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

interface CustomShiftFormData {
  startTime: string;
  endTime: string;
}

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
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CustomShiftFormData>({
    defaultValues: {
      startTime: initialStartTime,
      endTime: initialEndTime,
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      reset({
        startTime: initialStartTime,
        endTime: initialEndTime,
      });
    }
  }, [open, initialStartTime, initialEndTime, reset]);

  const onSubmit = (data: CustomShiftFormData) => {
    // Convert times to minutes for comparison
    const [startHour, startMin] = data.startTime.split(":").map(Number);
    const [endHour, endMin] = data.endTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (startMinutes >= endMinutes) {
      setError("root", {
        type: "manual",
        message: "Началният час трябва да е преди крайния",
      });
      return;
    }

    onSave({
      type: "Custom",
      startTime: data.startTime,
      endTime: data.endTime,
    });

    onOpenChange(false);
  };

  const handleCancel = () => {
    reset();
    clearErrors();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
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
                {...register("startTime", { required: true })}
                onChange={(e) => {
                  clearErrors();
                  // Call the default onChange from register
                  register("startTime").onChange(e);
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
                {...register("endTime", { required: true })}
                onChange={(e) => {
                  clearErrors();
                  // Call the default onChange from register
                  register("endTime").onChange(e);
                }}
              />
            </div>
            {errors.root && (
              <p className="text-sm text-red-600" role="alert">
                {errors.root.message}
              </p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel type="button" onClick={handleCancel}>
              Откажи
            </AlertDialogCancel>
            <AlertDialogAction type="submit">Запази</AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};
