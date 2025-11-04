# 🏗️ Architecture & Code Quality

## Project Structure

```
src/
├── components/
│   ├── Schedule.tsx              # Main schedule page (orchestrator)
│   ├── ScheduleTable.tsx         # Schedule table with shifts
│   ├── ScheduleSelector.tsx      # Multi-schedule dropdown
│   ├── ProductList.tsx           # Product management (if exists)
│   │
│   ├── auth/                     # Authentication components
│   │   ├── LoginButton.tsx       # Login modal with validation
│   │   └── UserMenu.tsx          # User profile & logout
│   │
│   ├── schedule/                 # Extracted schedule components
│   │   ├── LoadingState.tsx      # Loading spinner state
│   │   ├── ErrorState.tsx        # Error display with retry
│   │   ├── EmptyState.tsx        # No schedules state
│   │   ├── MonthYearSelector.tsx # Date selection dropdowns
│   │   ├── EmployeeForm.tsx      # Add employee form
│   │   ├── ScheduleActions.tsx   # Export & navigation buttons
│   │   └── CustomShiftModal.tsx  # Time picker for custom shifts
│   │
│   └── ui/                       # Shadcn UI components
│       ├── button.tsx            # Button component
│       ├── select.tsx            # Select dropdown
│       ├── input.tsx             # Input field
│       └── alert-dialog.tsx      # Modal dialogs
│
├── context/
│   └── AuthContext.tsx           # Global auth state provider
│
├── hooks/
│   ├── useAuth.tsx               # Authentication hook
│   └── useFirebaseSchedules.tsx  # Multi-schedule CRUD operations
│
├── lib/
│   ├── firebase.ts               # Firebase initialization
│   ├── types.ts                  # TypeScript interfaces
│   ├── utils.ts                  # Helper functions
│   ├── constants.ts              # Constants & messages
│   ├── OpenSans-Regular-normal.js # PDF font (Cyrillic)
│   └── OpenSans-Bold-normal.js    # PDF font (Cyrillic bold)
│
├── assets/                       # Static assets
├── App.tsx                       # Root component
├── main.tsx                      # Entry point
└── index.css                     # Global styles
```

---

## Component Architecture

### Component Refactoring Strategy

The main `Schedule.tsx` component was refactored into smaller, focused components following **Single Responsibility Principle**:

#### Extracted Components

1. **LoadingState.tsx**

   - Displays loading spinner during data fetch
   - Centered layout with animation

2. **ErrorState.tsx**

   - Shows error message with retry button
   - Props: `error` (string), `onRetry` (function)

3. **EmptyState.tsx**

   - Prompts user to create first schedule
   - Props: `onCreateSchedule` (function)

4. **MonthYearSelector.tsx**

   - Reusable month/year dropdown selectors
   - Props: `selectedMonth`, `selectedYear`, `onMonthChange`, `onYearChange`
   - Generates months 0-11 and years dynamically

5. **EmployeeForm.tsx**

   - Employee form with validation
   - React Hook Form for form management
   - Props: `onSubmit`, `isSubmitting`
   - Includes working hours selector (4, 6, or 8 hours)

6. **ScheduleActions.tsx**

   - Navigation (prev/next month) and export buttons
   - Props: `onPreviousMonth`, `onNextMonth`, `onExportExcel`, `onExportPDF`

7. **LoginButton.tsx**

   - Modal login form
   - React Hook Form validation
   - Firebase Auth integration
   - Error handling with toast notifications

8. **UserMenu.tsx**

   - User profile display
   - Logout functionality
   - Dropdown menu with animations

9. **CustomShiftModal.tsx**
   - Time picker modal for custom shifts
   - Start/end time validation
   - Bulgarian localized labels

### Authentication Architecture

**AuthContext Pattern:**

```typescript
// AuthContext.tsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Usage in components
const { user } = useAuth();
```

**Benefits:**

- Centralized authentication state
- Automatic session persistence
- Easy access via `useAuth()` hook
- Seamless UX transitions

### State Management

**Firebase Real-time Subscriptions:**

```typescript
// useFirebaseSchedules.tsx
useEffect(() => {
  const q = query(collection(db, "schedules"), orderBy("createdAt"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const schedules = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setSchedules(schedules);
  });

  return () => unsubscribe();
}, []);
```

**URL State Management:**

```typescript
// Persist schedule, month, year in URL params
const [selectedMonth, setSelectedMonth] = useState(() => {
  const params = new URLSearchParams(window.location.search);
  return params.get("month")
    ? parseInt(params.get("month"))
    : new Date().getMonth();
});

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  params.set("month", selectedMonth.toString());
  params.set("year", selectedYear.toString());
  window.history.replaceState({}, "", `?${params.toString()}`);
}, [selectedMonth, selectedYear]);
```

---

## Code Quality Features

### Constants & Localization

All hardcoded strings centralized in `lib/constants.ts`:

```typescript
export const MESSAGES = {
  shifts: {
    updated: "Смяната е обновена успешно!",
  },
  employee: {
    added: "Служителят е добавен успешно!",
    removed: "Служителят е премахнат успешно!",
    minRequired: (min: number) => `Минимум ${min} служител е необходим!`,
  },
  schedule: {
    added: "Графикът е добавен успешно!",
  },
  errors: {
    shiftUpdate: (err: any) => `Грешка: ${err.message}`,
    employeeAdd: (err: any) => `Грешка: ${err.message}`,
  },
  form: {
    employeeName: "Име на служител",
    workingHours: "Работни часове на ден",
    addEmployee: "Добави служител",
  },
  export: {
    pdf: "Експорт PDF",
    excel: "Експорт Excel",
  },
  navigation: {
    previousMonth: "Предишен месец",
    nextMonth: "Следващ месец",
  },
};

export const COLORS = {
  PRIMARY: "#E13530",
  PRIMARY_CLASS: "text-[#E13530]",
};

export const SHIFT_LABELS_BG: Record<ShiftType, string> = {
  Morning: "Сутрешна",
  Evening: "Вечерна",
  Night: "Нощна",
  Off: "Почивен",
  "Sick Leave": "Болничен",
  Vacation: "Ваканция",
  Custom: "Персонализирана",
};
```

### TypeScript Types

```typescript
// lib/types.ts
export type ShiftType =
  | "Morning"
  | "Evening"
  | "Night"
  | "Off"
  | "Sick Leave"
  | "Vacation"
  | "Custom";

export type WorkingHours = 4 | 6 | 8;

export interface CustomShift {
  type: "Custom";
  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
}

export type ShiftValue = ShiftType | CustomShift;

export interface Employee {
  id: string;
  name: string;
  workingHours: WorkingHours;
  shifts: Record<string, ShiftValue>;
}

export interface Schedule {
  id: string;
  name: string;
  employees: Employee[];
  createdAt: string;
  updatedAt: string;
}
```

### Validation & Sanitization

```typescript
// Employee form validation
const handleAddEmployee = async (name: string, hours: WorkingHours) => {
  // Sanitization
  const sanitizedName = name.trim().replace(/\s+/g, " ").slice(0, 100);

  // Validation
  if (!sanitizedName) {
    toast.error("Името не може да бъде празно");
    return;
  }

  await addEmployee(sanitizedName, hours);
};
```

### Error Handling

```typescript
// Consistent error handling pattern
try {
  await updateShift(employeeId, date, newShift);
  toast.success(MESSAGES.shifts.updated);
} catch (err) {
  toast.error(MESSAGES.errors.shiftUpdate(err));
}
```

---

## Performance Optimizations

### Memoization

```typescript
// Avoid unnecessary recalculations
const days = useMemo(
  () => generateMonthDays(selectedYear, selectedMonth),
  [selectedYear, selectedMonth]
);

const monthLabel = useMemo(
  () =>
    new Date(selectedYear, selectedMonth, 1).toLocaleString("bg-BG", {
      month: "long",
      year: "numeric",
    }),
  [selectedYear, selectedMonth]
);
```

### Firebase Query Optimization

```typescript
// Order by createdAt for consistent ordering
const q = query(collection(db, "schedules"), orderBy("createdAt"));
```

### Lazy Loading

```typescript
// Only render work hours modal when needed
{
  workHoursModal.open && (
    <AlertDialog open={workHoursModal.open}>{/* Modal content */}</AlertDialog>
  );
}
```

---

## Accessibility

- ✅ Semantic HTML (`<section>`, `<table>`, `<thead>`, `<tbody>`)
- ✅ ARIA labels (`aria-label`, `aria-labelledby`)
- ✅ ARIA states (`aria-invalid`, `aria-modal`)
- ✅ Keyboard navigation
- ✅ Screen reader friendly
- ✅ Focus management in modals
- ✅ Color contrast ratios

---

## Security Best Practices

### Input Validation

- ✅ Trim and normalize user inputs
- ✅ Maximum length constraints
- ✅ Type checking with TypeScript

### Firebase Security

- ✅ Firestore Security Rules enforce access control
- ✅ Authentication required for writes
- ✅ Public read access for transparency
- ✅ No sensitive data in client code

### Environment Variables

- ✅ All Firebase config in `.env`
- ✅ `.env` in `.gitignore`
- ✅ GitHub Secrets for deployment

---

## Testing Approach

### Current Status

- Manual testing for all features
- Real-time testing with Firebase
- Cross-browser testing
- Mobile responsiveness testing

### Future Recommendations

- Unit tests with Vitest
- Component tests with React Testing Library
- E2E tests with Playwright
- Firebase emulator for testing

---

## Benefits of This Architecture

✅ **Maintainability** - Small, focused components
✅ **Reusability** - Components can be used elsewhere
✅ **Testability** - Easy to test isolated components
✅ **i18n Ready** - Centralized messages
✅ **Type Safety** - Full TypeScript coverage
✅ **Documentation** - JSDoc comments
✅ **Accessibility** - ARIA labels and semantic HTML
✅ **Security** - Firestore rules + Auth
✅ **Performance** - Memoization and lazy loading
✅ **UX** - Smooth animations and feedback
