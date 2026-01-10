import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Schedule } from "@/lib/types";
import { MESSAGES, MIN_SCHEDULES } from "@/lib/constants";

import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Edit2, Check, X, Trash2, Copy } from "lucide-react";
import DeleteScheduleDialog from "./schedule/DeleteScheduleDialog";
import { AddScheduleForm } from "./schedule/AddScheduleForm";
import { DuplicateScheduleDialog } from "./schedule/DuplicateScheduleDialog";

interface ScheduleSelectorProps {
  schedules: Schedule[];
  activeScheduleId: string | null;
  onScheduleChange: (scheduleId: string) => void;
  onAddSchedule: (name: string) => Promise<void>;
  onDeleteSchedule: (scheduleId: string) => Promise<void>;
  onRenameSchedule: (scheduleId: string, newName: string) => Promise<void>;
  onDuplicateSchedule: (
    sourceId: string,
    newName: string,
    targetMonth: number,
    targetYear: number,
    copyEmployees: boolean,
    copyShifts: boolean
  ) => Promise<void>;
  isAuthenticated: boolean;
}

const ScheduleSelector = ({
  schedules,
  activeScheduleId,
  onScheduleChange,
  onAddSchedule,
  onDeleteSchedule,
  onRenameSchedule,
  onDuplicateSchedule,
  isAuthenticated,
}: ScheduleSelectorProps) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [showDuplicateDialog, setShowDuplicateDialog] =
    useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm<{ scheduleName: string }>({
    defaultValues: {
      scheduleName: "",
    },
  });

  const scheduleName = watch("scheduleName");
  const activeSchedule = schedules.find((s) => s.id === activeScheduleId);

  const onSubmitRename = async (data: { scheduleName: string }) => {
    if (!activeScheduleId) return;
    try {
      await onRenameSchedule(activeScheduleId, data.scheduleName.trim());
      setIsEditing(false);
      reset();
    } catch (err) {
      console.error("Failed to rename schedule:", err);
    }
  };

  const handleDelete = async () => {
    if (!activeScheduleId) return;

    if (schedules.length <= MIN_SCHEDULES) {
      toast.error(
        "Неуспешно изтриване на график: Минимален брой графици " + MIN_SCHEDULES
      );
      return;
    }

    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!activeScheduleId) return;

    try {
      await onDeleteSchedule(activeScheduleId);
      setShowDeleteDialog(false);
      toast.success("Графикът е изтрит успешно!");
    } catch (err) {
      toast.error(MESSAGES.errors.scheduleDeleteError(err));
      setShowDeleteDialog(false);
    }
  };

  const handleDuplicate = async (
    newName: string,
    targetMonth: number,
    targetYear: number,
    copyEmployees: boolean,
    copyShifts: boolean
  ) => {
    if (!activeScheduleId) return;

    try {
      await onDuplicateSchedule(
        activeScheduleId,
        newName,
        targetMonth,
        targetYear,
        copyEmployees,
        copyShifts
      );
      setShowDuplicateDialog(false);
      toast.success("Графикът е дублиран успешно!");
    } catch (err) {
      toast.error("Грешка при дублиране на график");
      console.error("Failed to duplicate schedule:", err);
    }
  };

  const startEditing = () => {
    if (activeSchedule) {
      reset({ scheduleName: activeSchedule.name });
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    reset();
  };

  return (
    <section
      className="bg-white border rounded-lg p-4 mb-4 shadow-sm"
      aria-label="Schedule selector"
      role="region"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end justify-between">
          <div className="flex-1 w-full sm:w-auto">
            <label
              htmlFor="schedule-selector"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Избери график:
            </label>
            <Select
              value={activeScheduleId || ""}
              onValueChange={onScheduleChange}
              aria-label="Select schedule"
              aria-describedby="schedule-description"
            >
              <SelectTrigger
                className="w-full sm:w-[300px]"
                id="schedule-selector"
                aria-label="Schedule selector dropdown"
              >
                <SelectValue placeholder="Избери график" />
              </SelectTrigger>
              <SelectContent role="listbox">
                {schedules.map((schedule) => (
                  <SelectItem
                    key={schedule.id}
                    value={schedule.id}
                    role="option"
                    aria-selected={schedule.id === activeScheduleId}
                  >
                    {schedule.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span id="schedule-description" className="sr-only">
              Изберете график от списъка за управление на работни смени
            </span>
          </div>

          {isAuthenticated && <AddScheduleForm onAddSchedule={onAddSchedule} />}
        </div>

        {activeScheduleId && activeSchedule && (
          <div
            className="border-t pt-3"
            role="region"
            aria-label="Active schedule management"
          >
            {isEditing ? (
              <form
                onSubmit={handleSubmit(onSubmitRename)}
                className="flex flex-col sm:flex-row gap-2 items-start sm:items-center"
                role="group"
                aria-label="Rename schedule form"
              >
                <label
                  htmlFor="edit-schedule-name"
                  className="text-sm font-medium text-gray-700"
                >
                  Преименувай график:
                </label>
                <div className="flex gap-2 items-center w-full sm:w-auto">
                  <Input
                    id="edit-schedule-name"
                    {...register("scheduleName", { required: true })}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") cancelEditing();
                    }}
                    className="w-full sm:w-[250px]"
                    autoFocus
                    aria-label="Edit schedule name"
                    aria-required="true"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    aria-label="Confirm rename schedule"
                    disabled={!scheduleName.trim() || isSubmitting}
                  >
                    <Check className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">Потвърди</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={cancelEditing}
                    aria-label="Cancel rename schedule"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">Откажи</span>
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div
                  className="flex items-center gap-2"
                  role="status"
                  aria-live="polite"
                >
                  <span className="text-sm text-gray-600">Активен график:</span>
                  <span
                    className="font-semibold text-gray-900"
                    id="active-schedule-name"
                  >
                    {activeSchedule.name}
                  </span>
                </div>
                {isAuthenticated && (
                  <div
                    className="flex gap-2"
                    role="group"
                    aria-label="Schedule actions"
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={startEditing}
                      className="cursor-pointer"
                      aria-label={`Rename schedule ${activeSchedule.name}`}
                    >
                      <Edit2 className="h-4 w-4 mr-1" aria-hidden="true" />
                      Преименувай
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowDuplicateDialog(true)}
                      className="cursor-pointer"
                      aria-label={`Duplicate schedule ${activeSchedule.name}`}
                    >
                      <Copy className="h-4 w-4 mr-1" aria-hidden="true" />
                      Дублирай
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDelete}
                      className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      aria-label={`Delete schedule ${activeSchedule.name}`}
                      disabled={schedules.length <= MIN_SCHEDULES}
                    >
                      <Trash2 className="h-4 w-4 mr-1" aria-hidden="true" />
                      Изтрий
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeScheduleId && activeSchedule && (
          <div
            className="border-t pt-3"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="text-sm text-gray-600">
              <span id="employee-count-label">Брой служители:</span>{" "}
              <span
                className="font-semibold text-gray-900"
                aria-labelledby="employee-count-label"
              >
                {activeSchedule.employees.length}
              </span>
            </div>
          </div>
        )}
      </div>

      <DeleteScheduleDialog
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        activeSchedule={activeSchedule}
        confirmDelete={confirmDelete}
      />

      <DuplicateScheduleDialog
        open={showDuplicateDialog}
        onOpenChange={setShowDuplicateDialog}
        sourceSchedule={activeSchedule || null}
        onConfirm={handleDuplicate}
      />
    </section>
  );
};

export default ScheduleSelector;
