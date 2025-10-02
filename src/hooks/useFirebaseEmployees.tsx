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
import type { Employee, ShiftType } from "@/lib/types";

export function useFirebaseEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "employees"), orderBy("name"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const employeeData: Employee[] = [];
        snapshot.forEach((doc) => {
          employeeData.push({
            id: doc.id,
            ...doc.data(),
          } as Employee);
        });
        setEmployees(employeeData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching employees:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addEmployee = async (name: string) => {
    try {
      const newEmployee = {
        name,
        shifts: {},
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, "employees"), newEmployee);
    } catch (err) {
      console.error("Error adding employee:", err);
      setError("Failed to add employee");
      throw err;
    }
  };

  const removeEmployee = async (id: string) => {
    try {
      await deleteDoc(doc(db, "employees", id));
    } catch (err) {
      console.error("Error removing employee:", err);
      setError("Failed to remove employee");
      throw err;
    }
  };

  const updateShift = async (
    employeeId: string,
    date: string,
    shift: ShiftType
  ) => {
    try {
      const employeeRef = doc(db, "employees", employeeId);
      const employee = employees.find((e) => e.id === employeeId);

      if (!employee) return;

      const updatedShifts = {
        ...employee.shifts,
        [date]: shift,
      };

      await updateDoc(employeeRef, {
        shifts: updatedShifts,
      });
    } catch (err) {
      console.error("Error updating shift:", err);
      setError("Failed to update shift");
      throw err;
    }
  };

  const bulkUpdateShifts = async (
    employeeId: string,
    shifts: Record<string, ShiftType>
  ) => {
    try {
      const employeeRef = doc(db, "employees", employeeId);
      await updateDoc(employeeRef, { shifts });
    } catch (err) {
      console.error("Error bulk updating shifts:", err);
      setError("Failed to update shifts");
      throw err;
    }
  };

  return {
    employees,
    loading,
    error,
    addEmployee,
    removeEmployee,
    updateShift,
    bulkUpdateShifts,
  };
}
