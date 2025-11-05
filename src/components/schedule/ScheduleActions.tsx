import { Button } from "@/components/ui/button";
import { MESSAGES } from "@/lib/constants";

interface ScheduleActionsProps {
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
  onAutoGenerate?: () => void;
  isAuthenticated?: boolean;
}

/**
 * Component for navigation and export action buttons
 */
export const ScheduleActions = ({
  onPreviousMonth,
  onNextMonth,
  onExportExcel,
  onExportPDF,
  onAutoGenerate,
  isAuthenticated,
}: ScheduleActionsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
      <Button
        variant="outline"
        onClick={onPreviousMonth}
        className="cursor-pointer"
      >
        {MESSAGES.navigation.previous}
      </Button>
      <Button
        variant="outline"
        onClick={onNextMonth}
        className="cursor-pointer"
      >
        {MESSAGES.navigation.next}
      </Button>
      {isAuthenticated && onAutoGenerate && (
        <Button
          onClick={onAutoGenerate}
          variant="default"
          className="cursor-pointer bg-green-600 hover:bg-green-700"
        >
          {MESSAGES.autoGenerate.button}
        </Button>
      )}
      <Button
        onClick={onExportExcel}
        variant="secondary"
        className="cursor-pointer"
      >
        {MESSAGES.export.excel}
      </Button>
      <Button
        onClick={onExportPDF}
        variant="secondary"
        className="cursor-pointer"
      >
        {MESSAGES.export.pdf}
      </Button>
    </div>
  );
};
