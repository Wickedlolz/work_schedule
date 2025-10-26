import { useState } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";

interface ScheduleSelectorProps {
  schedules: Schedule[];
  activeScheduleId: string | null;
  onScheduleChange: (scheduleId: string) => void;
  onAddSchedule: (name: string) => Promise<void>;
  onDeleteSchedule: (scheduleId: string) => Promise<void>;
  onRenameSchedule: (scheduleId: string, newName: string) => Promise<void>;
  isAuthenticated: boolean;
}

const ScheduleSelector = ({
  schedules,
  activeScheduleId,
  onScheduleChange,
  onAddSchedule,
  onDeleteSchedule,
  onRenameSchedule,
  isAuthenticated,
}: ScheduleSelectorProps) => {
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newScheduleName, setNewScheduleName] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>("");
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);

  const activeSchedule = schedules.find((s) => s.id === activeScheduleId);

  const handleAddSchedule = async () => {
    if (!newScheduleName.trim()) return;
    try {
      await onAddSchedule(newScheduleName.trim());
      setNewScheduleName("");
      setIsAdding(false);
    } catch (err) {
      console.error("Failed to add schedule:", err);
    }
  };

  const handleRename = async () => {
    if (!activeScheduleId || !editName.trim()) return;
    try {
      await onRenameSchedule(activeScheduleId, editName.trim());
      setIsEditing(false);
      setEditName("");
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

  const startEditing = () => {
    if (activeSchedule) {
      setEditName(activeSchedule.name);
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditName("");
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

          {isAuthenticated &&
            (isAdding ? (
              <div
                className="flex gap-2 items-center w-full sm:w-auto"
                role="group"
                aria-label="Add new schedule form"
              >
                <Input
                  id="new-schedule-name"
                  placeholder="Име на нов график"
                  value={newScheduleName}
                  onChange={(e) => setNewScheduleName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddSchedule();
                    if (e.key === "Escape") {
                      setIsAdding(false);
                      setNewScheduleName("");
                    }
                  }}
                  className="w-full sm:w-[200px]"
                  autoFocus
                  aria-label="New schedule name"
                  aria-required="true"
                  aria-invalid={
                    !newScheduleName.trim() && newScheduleName.length > 0
                  }
                />
                <Button
                  onClick={handleAddSchedule}
                  size="sm"
                  aria-label="Confirm add schedule"
                  disabled={!newScheduleName.trim()}
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Потвърди</span>
                </Button>
                <Button
                  onClick={() => {
                    setIsAdding(false);
                    setNewScheduleName("");
                  }}
                  size="sm"
                  variant="ghost"
                  aria-label="Cancel add schedule"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Откажи</span>
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsAdding(true)}
                size="sm"
                aria-label="Add new schedule"
              >
                <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                Нов график
              </Button>
            ))}
        </div>

        {activeScheduleId && activeSchedule && (
          <div
            className="border-t pt-3"
            role="region"
            aria-label="Active schedule management"
          >
            {isEditing ? (
              <div
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
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename();
                      if (e.key === "Escape") cancelEditing();
                    }}
                    className="w-full sm:w-[250px]"
                    autoFocus
                    aria-label="Edit schedule name"
                    aria-required="true"
                    aria-invalid={!editName.trim() && editName.length > 0}
                  />
                  <Button
                    size="sm"
                    onClick={handleRename}
                    aria-label="Confirm rename schedule"
                    disabled={!editName.trim()}
                  >
                    <Check className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">Потвърди</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={cancelEditing}
                    aria-label="Cancel rename schedule"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">Откажи</span>
                  </Button>
                </div>
              </div>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Изтриване на график</AlertDialogTitle>
            <AlertDialogDescription>
              Сигурни ли сте, че искате да изтриете "{activeSchedule?.name}"?
              Това действие не може да бъде отменено.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Откажи</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Изтрий
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

export default ScheduleSelector;
