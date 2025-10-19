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
import type { Schedule, Employee, ShiftType } from "@/lib/types";

export function useFirebaseSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to schedules collection
  useEffect(() => {
    const q = query(collection(db, "schedules"), orderBy("createdAt"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const scheduleData: Schedule[] = [];
        snapshot.forEach((doc) => {
          scheduleData.push({
            id: doc.id,
            ...doc.data(),
          } as Schedule);
        });

        setSchedules(scheduleData);

        // Set first schedule as active if none is selected
        if (scheduleData.length > 0 && !activeScheduleId) {
          setActiveScheduleId(scheduleData[0].id);
        }

        setLoading(false);
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
      setActiveScheduleId(docRef.id);
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
        setActiveScheduleId(remaining.length > 0 ? remaining[0].id : null);
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
  const addEmployee = async (name: string) => {
    if (!activeScheduleId || !activeSchedule) return;

    try {
      const newEmployee: Employee = {
        id: Date.now().toString(),
        name,
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
    shift: ShiftType
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

  return {
    schedules,
    activeSchedule,
    activeScheduleId,
    setActiveScheduleId,
    loading,
    error,
    addSchedule,
    deleteSchedule,
    renameSchedule,
    addEmployee,
    removeEmployee,
    updateShift,
  };
}
