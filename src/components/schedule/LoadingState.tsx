import { Loader2 } from "lucide-react";
import { COLORS, MESSAGES } from "@/lib/constants";

/**
 * Loading state component displayed while schedules are being fetched
 */
export const LoadingState = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2
      className="w-8 h-8 animate-spin"
      style={{ color: COLORS.PRIMARY }}
    />
    <span className="ml-2 text-lg">{MESSAGES.loading}</span>
  </div>
);
