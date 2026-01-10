import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Plus, Check, X } from "lucide-react";

interface AddScheduleFormData {
  scheduleName: string;
}

interface AddScheduleFormProps {
  onAddSchedule: (name: string) => Promise<void>;
}

export const AddScheduleForm = ({ onAddSchedule }: AddScheduleFormProps) => {
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm<AddScheduleFormData>({
    defaultValues: {
      scheduleName: "",
    },
  });

  const scheduleName = watch("scheduleName");

  const onSubmit = async (data: AddScheduleFormData) => {
    try {
      await onAddSchedule(data.scheduleName.trim());
      reset();
      setIsAdding(false);
    } catch (err) {
      console.error("Failed to add schedule:", err);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    reset();
  };

  if (isAdding) {
    return (
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex gap-2 items-center w-full sm:w-auto"
        role="group"
        aria-label="Add new schedule form"
      >
        <Input
          id="new-schedule-name"
          placeholder="Име на нов график"
          {...register("scheduleName", { required: true })}
          onKeyDown={(e) => {
            if (e.key === "Escape") handleCancel();
          }}
          className="w-full sm:w-[200px]"
          autoFocus
          aria-label="New schedule name"
          aria-required="true"
        />
        <Button
          type="submit"
          size="sm"
          aria-label="Confirm add schedule"
          disabled={!scheduleName.trim() || isSubmitting}
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Потвърди</span>
        </Button>
        <Button
          type="button"
          onClick={handleCancel}
          size="sm"
          variant="ghost"
          aria-label="Cancel add schedule"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Откажи</span>
        </Button>
      </form>
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
