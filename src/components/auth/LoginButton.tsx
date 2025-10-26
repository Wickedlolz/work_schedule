import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { LogIn, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginButton = () => {
  const { signIn, loading } = useAuth();
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormData>({
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await signIn(data.email.trim(), data.password);
      setShowForm(false);
      reset();
    } catch (error) {
      // Error is handled in AuthContext
      console.error("Грешка при влизане:", error);
    }
  };

  const handleClose = () => {
    setShowForm(false);
    reset();
  };

  return (
    <>
      <Button
        onClick={() => setShowForm(true)}
        disabled={loading}
        variant="default"
        className="cursor-pointer"
      >
        <LogIn className="w-4 h-4 mr-2" />
        Вход
      </Button>

      {showForm && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={handleClose}
          />

          {/* Login Form */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-lg p-6 shadow-xl z-50 w-[320px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Вход</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                type="button"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 block mb-1"
                >
                  Имейл
                </label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: "Имейлът е задължителен",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Невалиден имейл адрес",
                    },
                  })}
                  placeholder="your@email.com"
                  disabled={isSubmitting}
                  autoFocus
                  aria-invalid={errors.email ? "true" : "false"}
                  className={errors.email ? "border-red-500" : ""}
                />
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-red-500 text-xs mt-1"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700 block mb-1"
                >
                  Парола
                </label>
                <Input
                  id="password"
                  type="password"
                  {...register("password", {
                    required: "Паролата е задължителна",
                    minLength: {
                      value: 6,
                      message: "Паролата трябва да е поне 6 символа",
                    },
                  })}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  aria-invalid={errors.password ? "true" : "false"}
                  className={errors.password ? "border-red-500" : ""}
                />
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-red-500 text-xs mt-1"
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Влизане..." : "Вход"}
              </Button>
            </form>
          </div>
        </>
      )}
    </>
  );
};
