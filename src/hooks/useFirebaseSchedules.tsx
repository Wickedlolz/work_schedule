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
  addEmployee: (name: string, workingHours?: WorkingHours) => Promise<void>;
  removeEmployee: (employeeId: string) => Promise<void>;
  updateShift: (
    employeeId: string,
    date: string,
    shift: ShiftValue
  ) => Promise<void>;
  bulkUpdateShifts: (
    shiftsData: Record<string, Record<string, ShiftValue>>
  ) => Promise<void>;
  updateEmployeeMaxHours: (
    employeeId: string,
    maxMonthlyHours: number | undefined
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
        `${window.location.pathname}?${params.toString()}`
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
      }
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
          remaining.length > 0 ? remaining[0].id : null
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

  // Add employee to active schedule
  const addEmployee = async (
    name: string,
    workingHours: WorkingHours = DEFAULT_WORKING_HOURS
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
        (e) => e.id !== employeeId
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
    shift: ShiftValue
  ) => {
    if (!activeScheduleId || !activeSchedule) return;

    try {
      const updatedEmployees = activeSchedule.employees.map((emp) =>
        emp.id === employeeId
          ? { ...emp, shifts: { ...emp.shifts, [date]: shift } }
          : emp
      );

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
    shiftsData: Record<string, Record<string, ShiftValue>>
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

  // Update employee max monthly hours
  const updateEmployeeMaxHours = async (
    employeeId: string,
    maxMonthlyHours: number | undefined
  ) => {
    if (!activeScheduleId || !activeSchedule) return;

    try {
      const updatedEmployees = activeSchedule.employees.map((emp) => {
        if (emp.id === employeeId) {
          if (maxMonthlyHours === undefined) {
            // Remove the maxMonthlyHours field
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { maxMonthlyHours: _, ...empWithoutMaxHours } = emp;
            return empWithoutMaxHours;
          }
          return { ...emp, maxMonthlyHours };
        }
        return emp;
      });

      const scheduleRef = doc(db, "schedules", activeScheduleId);

      await updateDoc(scheduleRef, {
        employees: updatedEmployees,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error updating employee max hours:", err);
      setError("Failed to update employee max hours");
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
    addEmployee,
    removeEmployee,
    updateShift,
    bulkUpdateShifts,
    updateEmployeeMaxHours,
  };
}
