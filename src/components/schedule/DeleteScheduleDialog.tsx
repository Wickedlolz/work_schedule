import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface DeleteScheduleDialogProps {
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  activeSchedule: { id: string; name: string } | undefined;
  confirmDelete: () => void;
}

const DeleteScheduleDialog = ({
  showDeleteDialog,
  setShowDeleteDialog,
  activeSchedule,
  confirmDelete,
}: DeleteScheduleDialogProps) => {
  return (
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Изтриване на график</AlertDialogTitle>
          <AlertDialogDescription>
            Сигурни ли сте, че искате да изтриете "{activeSchedule?.name}"? Това
            действие не може да бъде отменено.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Откажи</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDelete}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            Изтрий
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteScheduleDialog;
