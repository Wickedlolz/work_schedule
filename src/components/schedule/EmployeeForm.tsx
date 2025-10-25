import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MESSAGES } from "@/lib/constants";

type EmployeeFormInputs = {
  employeeName: string;
};

interface EmployeeFormProps {
  onSubmit: (name: string) => Promise<void>;
  isSubmitting: boolean;
}

/**
 * Form component for adding a new employee with validation
 */
export const EmployeeForm = ({ onSubmit, isSubmitting }: EmployeeFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormInputs>();

  const handleFormSubmit: SubmitHandler<EmployeeFormInputs> = async (data) => {
    await onSubmit(data.employeeName);
    reset();
  };

  return (
    <form
      className="flex flex-col sm:flex-row sm:items-center sm:gap-2 gap-3"
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
      <Button type="submit" className="cursor-pointer" disabled={isSubmitting}>
        {isSubmitting ? MESSAGES.form.addingButton : MESSAGES.form.addButton}
      </Button>
    </form>
  );
};
