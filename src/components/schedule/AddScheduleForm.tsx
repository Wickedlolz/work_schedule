import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Plus, Check, X } from "lucide-react";

interface AddScheduleFormProps {
  onAddSchedule: (name: string) => Promise<void>;
}

export const AddScheduleForm = ({ onAddSchedule }: AddScheduleFormProps) => {
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newScheduleName, setNewScheduleName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleAddSchedule = async () => {
    if (!newScheduleName.trim()) return;

    setIsSubmitting(true);

    try {
      await onAddSchedule(newScheduleName.trim());
      setNewScheduleName("");
      setIsAdding(false);
      setIsSubmitting(false);
    } catch (err) {
      console.error("Failed to add schedule:", err);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setNewScheduleName("");
  };

  if (isAdding) {
    return (
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
            if (e.key === "Escape") handleCancel();
          }}
          className="w-full sm:w-[200px]"
          autoFocus
          aria-label="New schedule name"
          aria-required="true"
          aria-invalid={!newScheduleName.trim() && newScheduleName.length > 0}
        />
        <Button
          onClick={handleAddSchedule}
          size="sm"
          aria-label="Confirm add schedule"
          disabled={!newScheduleName.trim() || isSubmitting}
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Потвърди</span>
        </Button>
        <Button
          onClick={handleCancel}
          size="sm"
          variant="ghost"
          aria-label="Cancel add schedule"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Откажи</span>
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => setIsAdding(true)}
      size="sm"
      aria-label="Add new schedule"
    >
      <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
      Нов график
    </Button>
  );
};
