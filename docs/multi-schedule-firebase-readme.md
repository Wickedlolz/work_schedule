# Multi-Schedule Work Planner with Firebase Integration

This guide explains how to extend your existing employee scheduling app to support **multiple schedules** and integrate it with **Firebase**, assuming you already have Firebase integrated for employees.

---

## 📝 Features

- Manage multiple schedules (e.g., Schedule 1, Schedule 2, Schedule 3)
- Add, switch, and delete schedules
- Each schedule has its own employees and shifts
- Store schedules in Firebase for persistence

---

## 🔧 Steps to Implement Multi-Schedules

### 1. Setup State for Multiple Schedules

Use React `useState` to manage schedules:

```ts
interface Employee {
  id: string;
  name: string;
  shifts: string[];
}

interface Schedule {
  id: string;
  name: string;
  employees: Employee[];
}

const [schedules, setSchedules] = useState<Schedule[]>([
  {
    id: "1",
    name: "Schedule 1",
    employees: [],
  },
]);

const [activeScheduleId, setActiveScheduleId] = useState("1");
```

### 2. Create a Schedule Selector

```tsx
<select
  value={activeScheduleId}
  onChange={(e) => setActiveScheduleId(e.target.value)}
>
  {schedules.map(s => (
    <option key={s.id} value={s.id}>{s.name}</option>
  ))}
</select>
<button onClick={addSchedule}>+ Add Schedule</button>
```

### 3. Function to Add New Schedule

```ts
const addSchedule = () => {
  const newId = String(Date.now());
  setSchedules([
    ...schedules,
    { id: newId, name: `Schedule ${schedules.length + 1}`, employees: [] },
  ]);
  setActiveScheduleId(newId);
};
```

### 4. Display Active Schedule

```tsx
const activeSchedule = schedules.find((s) => s.id === activeScheduleId);

{
  activeSchedule && (
    <ScheduleTable employees={activeSchedule.employees} days={30} />
  );
}
```

### 5. Integrate with Firebase

1. Create a new Firebase collection for schedules (e.g., `schedules`).
2. Each document represents a schedule:

```json
{
  "name": "Schedule 1",
  "employees": [
    { "id": "e1", "name": "Alice", "shifts": ["Morning", "Off", ...] },
    { "id": "e2", "name": "Bob", "shifts": ["Night", "Morning", ...] }
  ]
}
```

3. Update your Firebase hooks to read/write schedules instead of just employees:

```ts
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/firebase";

const schedulesCol = collection(db, "schedules");

// Fetch schedules
const fetchSchedules = async () => {
  const snapshot = await getDocs(schedulesCol);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Add new schedule
const addScheduleToFirebase = async (name: string) => {
  await addDoc(schedulesCol, { name, employees: [] });
};

// Update a schedule
const updateScheduleInFirebase = async (id: string, employees: Employee[]) => {
  const scheduleRef = doc(db, "schedules", id);
  await updateDoc(scheduleRef, { employees });
};
```

### 6. Hook Everything Together

- Load schedules from Firebase on app load.
- When switching schedules, fetch the corresponding employees and shifts.
- When adding/updating employees or shifts, update the correct schedule in Firebase.

### 7. Optional Enhancements

- Delete a schedule from Firebase.
- Rename schedules.
- Export/import schedules to JSON, Excel, or PDF.

---

## ✅ Summary

With these steps, your app will:

- Support **multiple schedules**.
- Store all schedule data in **Firebase**, keeping employees linked to their respective schedules.
- Allow managers to **switch, create, and manage multiple schedules** efficiently.
