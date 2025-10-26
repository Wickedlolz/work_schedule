import { useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MESSAGES,
  WORKING_HOURS_OPTIONS,
  DEFAULT_WORKING_HOURS,
} from "@/lib/constants";
import type { WorkingHours } from "@/lib/types";

type EmployeeFormInputs = {
  employeeName: string;
};

interface EmployeeFormProps {
  onSubmit: (name: string, workingHours: WorkingHours) => Promise<void>;
  isSubmitting: boolean;
}

/**
 * Form component for adding a new employee with validation
 */
export const EmployeeForm = ({ onSubmit, isSubmitting }: EmployeeFormProps) => {
  const [workingHours, setWorkingHours] = useState<WorkingHours>(
    DEFAULT_WORKING_HOURS
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormInputs>();

  const handleFormSubmit: SubmitHandler<EmployeeFormInputs> = async (data) => {
    await onSubmit(data.employeeName, workingHours);
    reset();
    setWorkingHours(DEFAULT_WORKING_HOURS); // Reset to default after submission
  };

  return (
    <form
      className="flex flex-col sm:flex-row sm:items-start sm:gap-2 gap-3"
      aria-label={MESSAGES.form.addEmployeeAriaLabel}
      name={MESSAGES.form.addEmployeeAriaLabel}
      onSubmit={handleSubmit(handleFormSubmit)}
    >
      <div className="flex-1">
        <Input
          id="employeeName"
          placeholder={MESSAGES.form.employeeName}
          aria-invalid={errors.employeeName ? "true" : "false"}
          aria-describedby={
            errors.employeeName ? "employeeName-error" : undefined
          }
          {...register("employeeName", {
            required: MESSAGES.form.employeeNameRequired,
            minLength: {
              value: 2,
              message: MESSAGES.form.employeeNameMinLength,
            },
          })}
          className="w-full"
        />
        <AnimatePresence mode="wait">
          {errors.employeeName && (
            <motion.span
              key="error"
              id="employeeName-error"
              role="alert"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="text-red-500 text-sm mt-1"
            >
              {errors.employeeName.message}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full sm:w-[140px]">
        <Select
          value={workingHours.toString()}
          onValueChange={(value) =>
            setWorkingHours(Number(value) as WorkingHours)
          }
        >
          <SelectTrigger aria-label="Select working hours">
            <SelectValue placeholder="Работни часове" />
          </SelectTrigger>
          <SelectContent>
            {WORKING_HOURS_OPTIONS.map((hours) => (
              <SelectItem key={hours} value={hours.toString()}>
                {hours}ч/ден
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="cursor-pointer" disabled={isSubmitting}>
        {isSubmitting ? MESSAGES.form.addingButton : MESSAGES.form.addButton}
      </Button>
    </form>
  );
};
