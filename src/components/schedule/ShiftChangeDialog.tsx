import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ShiftType } from "@/lib/types";

interface ShiftChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (message?: string | null) => void;
  employeeName: string;
  date: string;
  newShift: ShiftType;
  existingMessage?: string;
}

export function ShiftChangeDialog({
  isOpen,
  onClose,
  onConfirm,
  employeeName,
  date,
  newShift,
  existingMessage,
}: ShiftChangeDialogProps) {
  const [message, setMessage] = useState(existingMessage || "");

  // Update message when existingMessage changes (dialog opens with different data)
  useEffect(() => {
    if (isOpen) {
      setMessage(existingMessage || "");
    }
  }, [isOpen, existingMessage]);

  const handleConfirm = () => {
    const trimmed = message.trim();
    // Pass null for empty message (to delete), actual message, or undefined if unchanged
    const finalMessage = trimmed === "" ? null : trimmed || undefined;
    onConfirm(finalMessage);
    setMessage("");
    onClose();
  };

  const handleCancel = () => {
    setMessage("");
    onClose();
  };

  const formattedDate = new Date(date).toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Промяна на смяна</DialogTitle>
          <DialogDescription>
            Променяте смяната на <strong>{employeeName}</strong> на{" "}
            <strong>{formattedDate}</strong> на <strong>{newShift}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Съобщение (опционално)</Label>
            <Textarea
              id="message"
              placeholder="Добави бележка защо е променена смяната..."
              value={message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setMessage(e.target.value)
              }
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Това съобщение ще се показва в подсказката при преминаване с
              мишката
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Отказ
          </Button>
          <Button onClick={handleConfirm}>Потвърди промяната</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
