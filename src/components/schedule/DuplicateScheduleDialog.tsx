import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Schedule } from "@/lib/types";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, X } from "lucide-react";

interface DuplicateScheduleFormData {
  newName: string;
  targetMonth: number;
  targetYear: number;
  copyEmployees: boolean;
  copyShifts: boolean;
}

interface DuplicateScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceSchedule: Schedule | null;
  onConfirm: (
    newName: string,
    targetMonth: number,
    targetYear: number,
    copyEmployees: boolean,
    copyShifts: boolean
  ) => Promise<void>;
}

export const DuplicateScheduleDialog = ({
  open,
  onOpenChange,
  sourceSchedule,
  onConfirm,
}: DuplicateScheduleDialogProps) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm<DuplicateScheduleFormData>({
    defaultValues: {
      newName: "",
      targetMonth: new Date().getMonth(),
      targetYear: new Date().getFullYear(),
      copyEmployees: true,
      copyShifts: true,
    },
  });

  const copyEmployees = watch("copyEmployees");
  const newName = watch("newName");

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  // Disable copyShifts when copyEmployees is unchecked
  useEffect(() => {
    if (!copyEmployees) {
      setValue("copyShifts", false);
    }
  }, [copyEmployees, setValue]);

  const onSubmit = async (data: DuplicateScheduleFormData) => {
    if (!sourceSchedule) return;

    try {
      await onConfirm(
        data.newName.trim(),
        data.targetMonth,
        data.targetYear,
        data.copyEmployees,
        data.copyShifts
      );
      reset();
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to duplicate schedule:", err);
    }
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  const monthNames = [
    "януари",
    "февруари",
    "март",
    "април",
    "май",
    "юни",
    "юли",
    "август",
    "септември",
    "октомври",
    "ноември",
    "декември",
  ];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Copy className="w-5 h-5 text-blue-600" />
              Дублиране на график
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left space-y-4 pt-4">
              {sourceSchedule && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">Източник:</p>
                  <p className="font-semibold text-gray-900">
                    {sourceSchedule.name}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="new-schedule-name"
                  className="text-sm font-medium text-gray-700"
                >
                  Име на новия график:
                </label>
                <Input
                  id="new-schedule-name"
                  placeholder="Въведете име..."
                  {...register("newName", { required: true })}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") handleCancel();
                  }}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  За период:
                </label>
                <div className="flex gap-2">
                  <select
                    {...register("targetMonth", { valueAsNumber: true })}
                    className="flex-1 h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {monthNames.map((month, index) => (
                      <option key={index} value={index}>
                        {month}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    min="2020"
                    max="2100"
                    {...register("targetYear", { valueAsNumber: true })}
                    className="w-24"
                  />
                </div>
              </div>

              <div className="space-y-3 border-t border-gray-200 pt-3">
                <p className="text-sm font-medium text-gray-700">
                  Какво да се копира?
                </p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("copyEmployees")}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Копирай служители
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("copyShifts")}
                      disabled={!copyEmployees}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span
                      className={`text-sm ${
                        copyEmployees ? "text-gray-700" : "text-gray-400"
                      }`}
                    >
                      Копирай смени (изисква копиране на служители)
                    </span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                  💡 Ако копирате само служители без смени, ще получите празен
                  график с готови служители.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Откажи
            </Button>
            <Button type="submit" disabled={!newName.trim() || isSubmitting}>
              <Copy className="w-4 h-4 mr-2" />
              {isSubmitting ? "Дублиране..." : "Дублирай"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};
