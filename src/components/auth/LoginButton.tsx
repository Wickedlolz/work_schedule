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
        className="cursor-pointer gap-2 shadow-sm hover:shadow-md transition-all duration-200"
      >
        <LogIn className="w-4 h-4" />
        Вход
      </Button>

      <AnimatePresence>
        {showForm && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={handleClose}
            />

            {/* Login Form */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-[calc(100%-2rem)] max-w-md"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-br from-rose-600 to-red-600 rounded-t-2xl px-4 sm:px-6 py-6 sm:py-8 text-white">
                <button
                  onClick={handleClose}
                  type="button"
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full hover:bg-white/20 transition-colors duration-200"
                  aria-label="Затвори"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3 pr-10">
                  <div className="bg-white/20 backdrop-blur-sm p-2.5 sm:p-3 rounded-xl">
                    <LogIn className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold">
                      Добре дошли
                    </h3>
                    <p className="text-red-100 text-xs sm:text-sm mt-0.5 sm:mt-1">
                      Влезте във вашия акаунт
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="p-4 sm:p-6 space-y-4 sm:space-y-5"
              >
                {/* Email Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-gray-700 block"
                  >
                    Имейл адрес
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
                    className={`transition-all duration-200 ${
                      errors.email
                        ? "border-red-500 focus:ring-red-500/20"
                        : "focus:ring-rose-500/20"
                    }`}
                  />
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-red-600 text-xs font-medium flex items-center gap-1"
                      >
                        <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                        {errors.email.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-gray-700 block"
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
                    className={`transition-all duration-200 ${
                      errors.password
                        ? "border-red-500 focus:ring-red-500/20"
                        : "focus:ring-rose-500/20"
                    }`}
                  />
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-red-600 text-xs font-medium flex items-center gap-1"
                      >
                        <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                        {errors.password.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full cursor-pointer h-10 sm:h-11 text-sm sm:text-base font-semibold bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-200 mt-4 sm:mt-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Влизане...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Влизане</span>
                    </div>
                  )}
                </Button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
