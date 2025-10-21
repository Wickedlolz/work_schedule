import { useState } from "react";
import type { Schedule } from "@/lib/types";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";

interface ScheduleSelectorProps {
  schedules: Schedule[];
  activeScheduleId: string | null;
  onScheduleChange: (scheduleId: string) => void;
  onAddSchedule: (name: string) => Promise<void>;
  onDeleteSchedule: (scheduleId: string) => Promise<void>;
  onRenameSchedule: (scheduleId: string, newName: string) => Promise<void>;
}

const ScheduleSelector = ({
  schedules,
  activeScheduleId,
  onScheduleChange,
  onAddSchedule,
  onDeleteSchedule,
  onRenameSchedule,
}: ScheduleSelectorProps) => {
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newScheduleName, setNewScheduleName] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>("");

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

    if (schedules.length <= 1) {
      alert("Трябва да има поне един график!");
      return;
    }

    if (window.confirm("Сигурни ли сте, че искате да изтриете този график?")) {
      try {
        await onDeleteSchedule(activeScheduleId);
      } catch (err) {
        console.error("Failed to delete schedule:", err);
      }
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
    <section className="bg-white border rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end justify-between">
          <div className="flex-1 w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Избери график:
            </label>
            <Select
              value={activeScheduleId || ""}
              onValueChange={onScheduleChange}
            >
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Избери график" />
              </SelectTrigger>
              <SelectContent>
                {schedules.map((schedule) => (
                  <SelectItem key={schedule.id} value={schedule.id}>
                    {schedule.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isAdding ? (
            <div className="flex gap-2 items-center w-full sm:w-auto">
              <Input
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
              />
              <Button onClick={handleAddSchedule} size="sm">
                <Check className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => {
                  setIsAdding(false);
                  setNewScheduleName("");
                }}
                size="sm"
                variant="ghost"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsAdding(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Нов график
            </Button>
          )}
        </div>

        {activeScheduleId && activeSchedule && (
          <div className="border-t pt-3">
            {isEditing ? (
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <span className="text-sm font-medium text-gray-700">
                  Преименувай график:
                </span>
                <div className="flex gap-2 items-center w-full sm:w-auto">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename();
                      if (e.key === "Escape") cancelEditing();
                    }}
                    className="w-full sm:w-[250px]"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleRename}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelEditing}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Активен график:</span>
                  <span className="font-semibold text-gray-900">
                    {activeSchedule.name}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={startEditing}
                    className="cursor-pointer"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Преименувай
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDelete}
                    className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Изтрий
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeScheduleId && activeSchedule && (
          <div className="border-t pt-3">
            <div className="text-sm text-gray-600">
              Брой служители:{" "}
              <span className="font-semibold text-gray-900">
                {activeSchedule.employees.length}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ScheduleSelector;
