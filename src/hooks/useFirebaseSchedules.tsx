import { useState, useEffect } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Schedule, Employee, ShiftValue, WorkingHours } from "@/lib/types";
import { DEFAULT_WORKING_HOURS } from "@/lib/constants";

interface UseFirebaseSchedulesReturn {
  schedules: Schedule[];
  activeSchedule: Schedule | undefined;
  activeScheduleId: string | null;
  setActiveScheduleId: (id: string | null) => void;
  loading: boolean;
  switchingSchedule: boolean;
  error: string | null;
  addSchedule: (name: string) => Promise<string | undefined>;
  deleteSchedule: (id: string) => Promise<void>;
  renameSchedule: (id: string, newName: string) => Promise<void>;
  duplicateSchedule: (
    sourceId: string,
    newName: string,
    targetMonth: number,
    targetYear: number,
    copyEmployees: boolean,
    copyShifts: boolean,
  ) => Promise<string | undefined>;
  addEmployee: (name: string, workingHours?: WorkingHours) => Promise<void>;
  removeEmployee: (employeeId: string) => Promise<void>;
  updateShift: (
    employeeId: string,
    date: string,
    shift: ShiftValue,
    message?: string | null,
  ) => Promise<void>;
  bulkUpdateShifts: (
    shiftsData: Record<string, Record<string, ShiftValue>>,
  ) => Promise<void>;
}

export function useFirebaseSchedules(): UseFirebaseSchedulesReturn {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [activeScheduleId, setActiveScheduleIdInternal] = useState<
    string | null
  >(() => {
    // Initialize from URL params if available
    const params = new URLSearchParams(window.location.search);
    return params.get("schedule") || null;
  });
  const [loading, setLoading] = useState(true);
  const [switchingSchedule, setSwitchingSchedule] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update URL params whenever activeScheduleId changes
  useEffect(() => {
    if (activeScheduleId) {
      const params = new URLSearchParams(window.location.search);
      params.set("schedule", activeScheduleId);
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${params.toString()}`,
      );
    }
  }, [activeScheduleId]);

  // Subscribe to schedules collection
  useEffect(() => {
    const q = query(collection(db, "schedules"), orderBy("createdAt"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const scheduleData: Schedule[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          // Ensure backward compatibility: add default workingHours to employees that don't have it
          const employees = (data.employees || []).map((emp: Employee) => ({
            ...emp,
            workingHours: emp.workingHours || DEFAULT_WORKING_HOURS,
          }));

          scheduleData.push({
            id: doc.id,
            ...data,
            employees,
          } as Schedule);
        });

        setSchedules(scheduleData);

        // Set first schedule as active if none is selected
        if (scheduleData.length > 0 && !activeScheduleId) {
          setActiveScheduleIdInternal(scheduleData[0].id);
        }

        setLoading(false);
        setSwitchingSchedule(false);
      },
      (err) => {
        console.error("Error fetching schedules:", err);
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [activeScheduleId]);

  // Get active schedule
  const activeSchedule = schedules.find((s) => s.id === activeScheduleId);

  // Add new schedule
  const addSchedule = async (name: string) => {
    try {
      const newSchedule = {
        name,
        employees: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, "schedules"), newSchedule);
      setActiveScheduleIdInternal(docRef.id);
      return docRef.id;
    } catch (err) {
      console.error("Error adding schedule:", err);
      setError("Failed to add schedule");
      throw err;
    }
  };

  // Delete schedule
  const deleteSchedule = async (id: string) => {
    try {
      await deleteDoc(doc(db, "schedules", id));

      // If deleted schedule was active, switch to first available
      if (id === activeScheduleId) {
        const remaining = schedules.filter((s) => s.id !== id);
        setActiveScheduleIdInternal(
          remaining.length > 0 ? remaining[0].id : null,
        );
      }
    } catch (err) {
      console.error("Error deleting schedule:", err);
      setError("Failed to delete schedule");
      throw err;
    }
  };

  // Rename schedule
  const renameSchedule = async (id: string, newName: string) => {
    try {
      const scheduleRef = doc(db, "schedules", id);
      await updateDoc(scheduleRef, {
        name: newName,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error renaming schedule:", err);
      setError("Failed to rename schedule");
      throw err;
    }
  };

  // Duplicate schedule
  const duplicateSchedule = async (
    sourceId: string,
    newName: string,
    targetMonth: number,
    targetYear: number,
    copyEmployees: boolean,
    copyShifts: boolean,
  ): Promise<string | undefined> => {
    try {
      // Find source schedule
      const sourceSchedule = schedules.find((s) => s.id === sourceId);
      if (!sourceSchedule) {
        throw new Error("Source schedule not found");
      }

      // Helper function to adjust date from source month to target month
      const adjustDate = (dateStr: string): string => {
        const [, , day] = dateStr.split("-").map(Number);
        // Keep the same day, but change month/year to target
        // targetMonth is 0-indexed (0-11), so we need to add 1 for the date string
        return `${targetYear}-${String(targetMonth + 1).padStart(
          2,
          "0",
        )}-${String(day).padStart(2, "0")}`;
      };

      // Prepare employees for new schedule
      let newEmployees: Employee[] = [];

      if (copyEmployees) {
        // Copy employees with new IDs
        newEmployees = sourceSchedule.employees.map((emp) => {
          const newEmployee: Employee = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: emp.name,
            workingHours: emp.workingHours,
            shifts: {},
          };

          // If copyShifts is true, copy and adjust shift dates
          if (copyShifts) {
            const adjustedShifts: Record<string, ShiftValue> = {};
            Object.entries(emp.shifts).forEach(([dateStr, shift]) => {
              const newDate = adjustDate(dateStr);
              adjustedShifts[newDate] = shift;
            });
            newEmployee.shifts = adjustedShifts;
            // Don't copy changedShifts - these are fresh shifts
          }

          return newEmployee;
        });
      }

      // Create new schedule
      const newSchedule: Omit<Schedule, "id"> = {
        name: newName,
        employees: newEmployees,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "schedules"), newSchedule);
      setActiveScheduleIdInternal(docRef.id);
      return docRef.id;
    } catch (err) {
      console.error("Error duplicating schedule:", err);
      setError("Failed to duplicate schedule");
      throw err;
    }
  };

  // Add employee to active schedule
  const addEmployee = async (
    name: string,
    workingHours: WorkingHours = DEFAULT_WORKING_HOURS,
  ) => {
    if (!activeScheduleId || !activeSchedule) return;

    try {
      const newEmployee: Employee = {
        id: Date.now().toString(),
        name,
        workingHours,
        shifts: {},
      };

      const updatedEmployees = [...activeSchedule.employees, newEmployee];
      const scheduleRef = doc(db, "schedules", activeScheduleId);

      await updateDoc(scheduleRef, {
        employees: updatedEmployees,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error adding employee:", err);
      setError("Failed to add employee");
      throw err;
    }
  };

  // Remove employee from active schedule
  const removeEmployee = async (employeeId: string) => {
    if (!activeScheduleId || !activeSchedule) return;

    try {
      const updatedEmployees = activeSchedule.employees.filter(
        (e) => e.id !== employeeId,
      );
      const scheduleRef = doc(db, "schedules", activeScheduleId);

      await updateDoc(scheduleRef, {
        employees: updatedEmployees,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error removing employee:", err);
      setError("Failed to remove employee");
      throw err;
    }
  };

  // Update employee shift
  const updateShift = async (
    employeeId: string,
    date: string,
    shift: ShiftValue,
    message?: string | null,
  ) => {
    if (!activeScheduleId || !activeSchedule) return;

    try {
      const updatedEmployees = activeSchedule.employees.map((emp) => {
        if (emp.id === employeeId) {
          // Check if there was already a shift on this date
          const hadPreviousShift =
            emp.shifts[date] !== undefined && emp.shifts[date] !== null;

          // Get current change count and increment it
          const currentCount = emp.changedShifts?.[date] || 0;

          const updatedEmployee: any = {
            ...emp,
            shifts: { ...emp.shifts, [date]: shift },
            // Only increment change count if we're modifying an existing shift
            changedShifts: hadPreviousShift
              ? { ...emp.changedShifts, [date]: currentCount + 1 }
              : emp.changedShifts,
          };

          // Handle custom message for shift changes
          if (hadPreviousShift) {
            if (message === null) {
              // Remove message if null (user cleared it)
              if (emp.shiftMessages && emp.shiftMessages[date]) {
                const { [date]: _, ...remainingMessages } = emp.shiftMessages;
                // Always set shiftMessages to the remaining messages (even if empty)
                updatedEmployee.shiftMessages = remainingMessages;
              } else if (emp.shiftMessages) {
                // Keep existing messages if the date doesn't have a message
                updatedEmployee.shiftMessages = emp.shiftMessages;
              }
            } else if (message) {
              // Save new/updated message
              updatedEmployee.shiftMessages = {
                ...emp.shiftMessages,
                [date]: message,
              };
            } else if (emp.shiftMessages) {
              // Keep existing messages unchanged
              updatedEmployee.shiftMessages = emp.shiftMessages;
            }
          } else if (emp.shiftMessages) {
            // First-time assignment, keep existing messages
            updatedEmployee.shiftMessages = emp.shiftMessages;
          }

          return updatedEmployee;
        }
        return emp;
      });

      const scheduleRef = doc(db, "schedules", activeScheduleId);

      await updateDoc(scheduleRef, {
        employees: updatedEmployees,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error updating shift:", err);
      setError("Failed to update shift");
      throw err;
    }
  };

  // Bulk update shifts for auto-generated schedule
  const bulkUpdateShifts = async (
    shiftsData: Record<string, Record<string, ShiftValue>>,
  ) => {
    if (!activeScheduleId || !activeSchedule) return;

    try {
      const updatedEmployees = activeSchedule.employees.map((emp) => ({
        ...emp,
        shifts: { ...emp.shifts, ...shiftsData[emp.id] },
      }));

      const scheduleRef = doc(db, "schedules", activeScheduleId);

      await updateDoc(scheduleRef, {
        employees: updatedEmployees,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error bulk updating shifts:", err);
      setError("Failed to bulk update shifts");
      throw err;
    }
  };

  // Wrapper function that sets switching state before changing schedule
  const setActiveScheduleId = (id: string | null) => {
    setSwitchingSchedule(true);
    setActiveScheduleIdInternal(id);
  };

  return {
    schedules,
    activeSchedule,
    activeScheduleId,
    setActiveScheduleId,
    loading,
    switchingSchedule,
    error,
    addSchedule,
    deleteSchedule,
    renameSchedule,
    duplicateSchedule,
    addEmployee,
    removeEmployee,
    updateShift,
    bulkUpdateShifts,
  };
}
