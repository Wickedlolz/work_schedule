# 🗓️ Multi-Schedule Work Planning App

A comprehensive, mobile-friendly work scheduling application with **multi-schedule support**. Built with **Vite + React**, styled using **TailwindCSS v4** and **Shadcn UI**, and powered by **Firebase Firestore** for real-time data synchronization across multiple schedules.

---

## 📌 Features

### Core Features

- ✅ **Multiple Schedules** - Create and manage unlimited work schedules
- ✅ **Schedule Management** - Add, rename, delete, and switch between schedules
- ✅ View & edit monthly work schedules for multiple employees
- ✅ **Configurable Working Hours** - Set 4, 6, or 8 hour work days per employee
- ✅ **Custom Shift Times** - Create personalized shifts with specific time ranges (e.g., 9:00-17:30)
- ✅ **Work Hours Analytics** - View detailed monthly work hours summary with expected vs actual hours comparison
- ✅ **Authentication & Authorization** - Secure email/password login with role-based access
- ✅ **Read-Only Mode** - Public viewing without authentication for transparency
- ✅ Color-coded shift types: Morning, Evening, Night, Off, Sick Leave, Vacation, Custom
- ✅ Add & remove employees per schedule
- ✅ **Real-time synchronization** with Firebase Firestore
- ✅ Navigate across different months/years
- ✅ Weekend columns are highlighted
- ✅ Export to:
  - 🧾 **PDF** (print-optimized layout with colors)
  - 📊 **Excel** (.xlsx format with styling)
- ✅ Fully **responsive** for mobile, tablet & desktop
- ✅ Print-friendly layout
- ✅ **Multi-user support** with live updates

---

## 🎯 Multi-Schedule System

### How It Works

1. **Schedule Collection**: Each schedule is a separate document in Firestore
2. **Employee Storage**: Employees are stored within their respective schedule
3. **Independent Management**: Each schedule has its own set of employees and shifts
4. **Easy Switching**: Switch between schedules seamlessly with dropdown selector

### Use Cases

- 📅 **Multiple Departments** - HR, IT, Sales, etc.
- 🏢 **Multiple Locations** - Branch 1, Branch 2, Main Office
- 📆 **Different Periods** - Q1 2024, Q2 2024, Summer Schedule
- 👥 **Team Separation** - Day Team, Night Team, Weekend Team

---

## ⚙️ Tech Stack

- **Vite** – Fast frontend tooling
- **React 19** – UI library
- **TypeScript** – Type safety
- **TailwindCSS v4** – Utility-first styling
- **Shadcn UI** – Accessible, styled UI components
- **Firebase Firestore** – Real-time cloud database
- **Firebase Authentication** – Secure email/password authentication
- **React Hook Form** – Form validation and management
- **Framer Motion** – Smooth animations for UI feedback
- **jsPDF + jspdf-autotable** – PDF export with styling
- **xlsx** – Excel export with colors
- **Lucide React** – Beautiful icons
- **Sonner** – Toast notifications

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Wickedlolz/work-schedule.git
cd work-schedule
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Firestore Database**
4. Get your Firebase configuration from Project Settings
5. Create `.env` file with your credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Configure Firebase Authentication

1. Go to **Firebase Console** → **Authentication**
2. Click on **Get Started**
3. Go to **Sign-in method** tab
4. Click on **Email/Password**
5. **Enable** the toggle for Email/Password
6. Save changes

### 5. Create Admin User

1. In Firebase Console, go to **Authentication** → **Users** tab
2. Click **Add user**
3. Enter email and password for your admin account
4. Click **Add user**

> **Important:** Only manually created users can log in. This ensures controlled access.

### 6. Configure Firestore Security Rules

In Firebase Console, go to **Firestore Database → Rules** and update:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Schedules collection - contains all schedules with their employees
    match /schedules/{scheduleId} {
      // Allow everyone to READ (view-only mode when not authenticated)
      allow read: if true;

      // Only authenticated users can CREATE, UPDATE, DELETE
      allow create: if request.auth != null
                    && request.resource.data.keys().hasAll(['name', 'employees', 'createdAt', 'updatedAt'])
                    && request.resource.data.name is string
                    && request.resource.data.employees is list
                    && request.resource.data.createdAt is string
                    && request.resource.data.updatedAt is string;

      allow update: if request.auth != null
                    && request.resource.data.keys().hasAll(['name', 'employees', 'updatedAt'])
                    && request.resource.data.name is string
                    && request.resource.data.employees is list
                    && request.resource.data.updatedAt is string;

      allow delete: if request.auth != null;
    }
  }
}
```

> **Security Model:**
>
> - ✅ Public can view schedules (read-only mode)
> - 🔒 Only authenticated users can create/edit/delete

### 7. Run the app

```bash
npm run dev
# or
yarn dev
```

Visit: [http://localhost:5173](http://localhost:5173)

---

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Schedule.tsx              # Main schedule page (refactored)
│   ├── ScheduleTable.tsx         # Schedule table component
│   ├── ScheduleSelector.tsx      # Multi-schedule selector
│   ├── auth/                     # Authentication components
│   │   ├── LoginButton.tsx       # Login form with validation
│   │   └── UserMenu.tsx          # User profile and logout
│   ├── schedule/                 # Extracted schedule components
│   │   ├── LoadingState.tsx      # Loading state component
│   │   ├── ErrorState.tsx        # Error state component
│   │   ├── EmptyState.tsx        # Empty state component
│   │   ├── MonthYearSelector.tsx # Month/year selector component
│   │   ├── EmployeeForm.tsx      # Employee form with validation
│   │   ├── ScheduleActions.tsx   # Navigation & export actions
│   │   └── CustomShiftModal.tsx  # Custom shift time picker modal
│   └── ui/                       # Shadcn UI components
├── context/
│   └── AuthContext.tsx           # Authentication context provider
├── hooks/
│   ├── useAuth.tsx               # Authentication hook
│   ├── useFirebaseSchedules.tsx  # Multi-schedule management
│   └── useLocalStorage.tsx       # Legacy hook (optional)
├── lib/
│   ├── firebase.ts               # Firebase initialization (Firestore + Auth)
│   ├── types.ts                  # TypeScript interfaces (ShiftValue, CustomShift)
│   ├── utils.ts                  # Utilities (PDF, Excel, dates, work hours calc)
│   ├── constants.ts              # Constants & i18n messages
│   ├── OpenSans-Regular-normal.js
│   └── OpenSans-Bold-normal.js
├── App.tsx
└── main.tsx
```

---

## 🔥 Firebase Data Structure

### Schedules Collection

```typescript
// Collection: schedules
{
  id: string (auto-generated),
  name: string,
  employees: [
    {
      id: string,
      name: string,
      workingHours: 4 | 6 | 8, // Configurable working hours per day
      shifts: {
        "2024-01-15": "Morning",
        "2024-01-16": "Evening",
        "2024-01-17": "Night",
        "2024-01-18": "Off",
        "2024-01-19": {
          type: "Custom",
          startTime: "09:00",
          endTime: "17:30"
        }
      }
    }
  ],
  createdAt: string (ISO timestamp),
  updatedAt: string (ISO timestamp)
}
```

### Example Document

```json
{
  "name": "IT Department - January",
  "employees": [
    {
      "id": "1705320000000",
      "name": "Виктор",
      "workingHours": 8,
      "shifts": {
        "2024-01-15": "Morning",
        "2024-01-16": {
          "type": "Custom",
          "startTime": "09:00",
          "endTime": "17:30"
        }
      }
    },
    {
      "id": "1705320100000",
      "name": "Регина",
      "workingHours": 6,
      "shifts": {
        "2024-01-15": "Night",
        "2024-01-16": "Off"
      }
    }
  ],
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T14:30:00.000Z"
}
```

---

## 🎨 Features in Detail

### 1. Authentication & Security

**🔐 Login System**

- Email/password authentication via Firebase Auth
- Modal login form with validation using react-hook-form
- Animated error messages for better UX
- Secure session management
- User profile display with photo and email

**🛡️ Access Control**

When **NOT logged in** (Read-Only Mode):

- ✅ View all schedules
- ✅ Navigate between months/years
- ✅ View employee details and shifts
- ✅ Export to PDF/Excel
- ❌ Cannot add/edit/delete schedules
- ❌ Cannot add/remove employees
- ❌ Cannot change shift assignments
- 💡 Blue info banner: "👁️ Режим на преглед"

When **logged in** (Full Access):

- ✅ All read-only features
- ✅ Create, rename, delete schedules
- ✅ Add and remove employees
- ✅ Edit shift assignments
- ✅ Full schedule management

**👤 User Management**

- Manually create users in Firebase Console
- Only approved users can log in
- No public registration to ensure controlled access
- User profile menu with logout option

### 2. Schedule Management

**Create New Schedule**

- Click "Нов график" button (only when authenticated)
- Enter schedule name
- New schedule is created and becomes active

**Switch Schedules**

- Use dropdown selector to switch between schedules
- Schedule changes instantly with real-time sync

**Rename Schedule**

- Click edit icon (✏️) next to schedule name in dropdown (only when authenticated)
- Enter new name and confirm

**Delete Schedule**

- Click delete icon (🗑️) next to schedule name (only when authenticated)
- Confirm deletion (minimum 1 schedule required)

### 3. Employee Management

- Add employees with custom names (only when authenticated)
- **Configurable Working Hours** - Select 4, 6, or 8 hour work days for each employee
- Each schedule has independent employee list
- Remove employees (minimum 1 required per schedule, only when authenticated)
- Employee shifts are preserved when switching schedules
- **Form validation** with real-time error messages
- **Input sanitization** (trim, normalize spaces, max 100 chars)
- **Backward Compatibility** - Existing employees default to 8-hour days

### 4. Shift Assignment

**Available Shifts:**

- 🌞 **Morning** - Yellow background (#FEF9C3)
- 🌙 **Evening** - Blue background (#DBEAFE)
- 🌃 **Night** - Purple background (#F3E8FF)
- ❌ **Off** - Gray background (#F3F4F6)
- 🏥 **Sick Leave** - No color
- 🏖️ **Vacation** - No color
- 🎯 **Custom** - Green background (#DCFCE7) - Personalized time range shifts

**Custom Shift Feature:**

- Create shifts with specific time ranges (e.g., 9:00-17:30)
- Modal interface with time pickers for start and end times
- Validation ensures start time is before end time
- Displayed as time range in schedule table
- Included in PDF and Excel exports with proper formatting
- Hours calculated dynamically based on time range

**Shift Editing:**

- When **authenticated**: Interactive dropdowns to change shifts
- When **not authenticated**: Read-only text display only

**Weekend Highlighting:**

- Saturday and Sunday columns have red tinted background (#FEF2F2)

### 5. Work Hours Analytics

**Employee Work Hours Tracking:**

- Click info icon (ℹ️) next to employee name to view detailed work hours
- Modal displays:
  - **Expected Hours**: Calculated based on working days in month (excluding weekends) × employee's daily hours
  - **Actual Hours**: Sum of all worked shifts for the month
  - **Overwork Alert**: Visual warning if actual hours exceed expected hours

**Hour Calculation Rules:**

- **Morning/Evening**: Uses employee's configured daily working hours (4, 6, or 8)
- **Night Shift**: Always counts as 8 hours regardless of employee's daily hours setting
- **Vacation**: Counts as 8 hours
- **Custom Shifts**: Calculated from time range (e.g., 9:00-17:30 = 8.5 hours)
- **Off/Sick Leave**: 0 hours
- **Expected Hours**: Based on total working days in month (excluding weekends)
  - Example: October 2025 has 23 working days
  - 8-hour employee: 23 × 8 = 184 expected hours
  - 6-hour employee: 23 × 6 = 138 expected hours
  - 4-hour employee: 23 × 4 = 92 expected hours

**Visual Indicators:**

- Expected hours shown in gray card
- Actual hours shown in gray (normal) or red (overworked)
- Red alert box appears when employee exceeds expected hours

### 6. Month Navigation

- **Dropdown Selectors** - Choose specific month and year
- **Next/Previous Buttons** - Navigate through months
- **Auto Year Adjustment** - Handles year transitions smoothly
- **Responsive Layout** - Adapts to mobile, tablet, and desktop
- **Timezone Fix** - Corrected date generation to avoid off-by-one errors

### 6. Export Features

**PDF Export:**

- Includes schedule name and month in title
- Preserves all colors (shifts + weekends)
- Includes working hours column with blue styling
- Cyrillic support with Open Sans font
- Optimized for A4 landscape printing
- Available to both authenticated and non-authenticated users

**Excel Export:**

- Full color styling matching web interface
- Weekend column highlighting
- Working hours column included
- Shift color coding
- Professional borders and formatting
- Cell alignment (centered shifts, left-aligned names)
- Available to both authenticated and non-authenticated users

---

## 🏛️ Architecture & Code Quality

### Component Refactoring

The main `Schedule.tsx` component has been refactored into smaller, focused components for better maintainability:

#### Extracted Components

1. **LoadingState.tsx** - Displays loading spinner during data fetch
2. **ErrorState.tsx** - Shows error message with retry functionality
3. **EmptyState.tsx** - Prompts user to create first schedule
4. **MonthYearSelector.tsx** - Reusable month/year dropdown selectors
5. **EmployeeForm.tsx** - Employee form with validation and error messages
6. **ScheduleActions.tsx** - Navigation and export action buttons
7. **LoginButton.tsx** - Modal login form with react-hook-form validation
8. **UserMenu.tsx** - User profile display with logout functionality

### Authentication Architecture

**AuthContext Pattern:**

- Centralized authentication state management
- React Context API for global auth state
- Custom `useAuth()` hook for easy access
- Automatic session persistence via Firebase Auth

**Protected Routes:**

- Conditional rendering based on authentication state
- Read-only mode for non-authenticated users
- Full access for authenticated users
- Seamless UX transition between states

### Constants & Localization

All hardcoded strings are centralized in `lib/constants.ts`:

```typescript
export const MESSAGES = {
  shifts: { updated: "Смяната е обновена успешно!" },
  employee: { added: "Служителят е добавен успешно!" },
  schedule: { added: "Графикът е добавен успешно!" },
  errors: {
    /* error messages */
  },
  form: {
    /* form labels */
  },
  export: {
    /* export labels */
  },
  navigation: {
    /* navigation labels */
  },
};

export const COLORS = {
  PRIMARY: "#E13530",
  PRIMARY_CLASS: "text-[#E13530]",
};
```

### Benefits

✅ **Maintainability** - Easier to understand and modify components
✅ **Reusability** - Extract components can be used elsewhere
✅ **Testability** - Smaller components are easier to test
✅ **i18n Ready** - Centralized messages for multi-language support
✅ **Type Safety** - Full TypeScript support across all components
✅ **Documentation** - JSDoc comments for all handler functions
✅ **Accessibility** - aria-labels, aria-invalid for better a11y
✅ **Security** - Firebase Auth + Firestore rules protect data integrity
✅ **Validation** - React Hook Form ensures data quality
✅ **UX** - Smooth animations with Framer Motion

---

## 🔐 Security Considerations

### Current Implementation (Production-Ready)

The application uses a **hybrid security model** that balances transparency with security:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /schedules/{scheduleId} {
      // Allow everyone to READ (view-only mode)
      allow read: if true;

      // Only authenticated users can write
      allow create, update, delete: if request.auth != null;
    }
  }
}
```

**Security Features:**

✅ **Public Read Access** - Anyone can view schedules (transparency)
✅ **Authenticated Write Access** - Only logged-in users can modify data
✅ **Data Validation** - Firestore rules validate data structure
✅ **Session Management** - Firebase handles secure authentication
✅ **No Public Registration** - Admin manually creates user accounts
✅ **Password Security** - Firebase handles encryption and storage

**Why This Model?**

- 📊 **Transparency** - Employees can view their schedules without logging in
- 🔒 **Security** - Prevents unauthorized modifications
- 👥 **Controlled Access** - Only approved users can make changes
- 🎯 **Best of Both Worlds** - Open viewing + protected editing

### Alternative: Owner-Based Access

For stricter security where each schedule has an owner:

```javascript
match /schedules/{scheduleId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null;
  allow update, delete: if request.auth != null
                      && request.auth.uid == resource.data.ownerId;
}
```

**Add owner field to schedules:**

```typescript
{
  name: "Schedule 1",
  ownerId: "user-firebase-uid",  // Add this field
  employees: [...],
  createdAt: "...",
  updatedAt: "..."
}
```

---

## 📱 Responsive Design

- **Mobile** (< 640px): Stacked controls, horizontal scroll table
- **Tablet** (640px - 1024px): Flexible layout, optimized spacing
- **Desktop** (> 1024px): Full-width layout, all controls visible

---

## 🎯 Advanced Usage

### Bulk Operations

Create a template schedule and duplicate it:

```typescript
// Future feature - duplicate schedule
const duplicateSchedule = async (scheduleId: string) => {
  const original = schedules.find((s) => s.id === scheduleId);
  if (!original) return;

  await addDoc(collection(db, "schedules"), {
    name: `${original.name} (Copy)`,
    employees: original.employees,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
};
```

### Schedule Templates

Save common patterns:

```typescript
const templates = {
  "5-Day Week": {
    /* employee shifts */
  },
  "Night Shifts Only": {
    /* employee shifts */
  },
  "Weekend Coverage": {
    /* employee shifts */
  },
};
```

---

## 🐛 Troubleshooting

### Firebase Connection Issues

```bash
# Check environment variables
echo $VITE_FIREBASE_API_KEY

# Verify Firestore is enabled in console
# Check browser console for errors
```

### Build Errors

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
npm run dev
```

### Schedule Not Loading

- Verify Firebase credentials in `.env`
- Check Firestore security rules
- Ensure at least one schedule exists in Firestore
- Check browser console for errors

---

## 🚀 Deployment

### GitHub Pages Deployment

This project is configured to automatically deploy to GitHub Pages using GitHub Actions.

#### Setup:

1. **Add GitHub Secrets** (required for Firebase config):

   - Go to your repository → Settings → Secrets and variables → Actions
   - Click "New repository secret" and add each of these:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`

2. **Enable GitHub Pages**:

   - Go to Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` / `root`
   - Save

3. **Deploy**:
   - Push to `main` branch
   - GitHub Actions will automatically build and deploy
   - View workflow status in the "Actions" tab

#### Important Security Notes:

- ✅ Firebase API keys in client-side apps are **safe to expose** (they're meant for browsers)
- ✅ Security is enforced by **Firestore Security Rules**, not by hiding keys
- ✅ Always use **environment variables** (never hardcode in source)
- ✅ The workflow uses **GitHub Secrets** to inject keys during build
- ⚠️ Make sure your Firebase Security Rules are properly configured (see setup section)

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify Deployment

```bash
# Build
npm run build

# Deploy dist folder
netlify deploy --prod --dir=dist
```

**Important:** Add all Firebase environment variables in deployment platform settings.

---

## � SEO Optimization

The application is optimized for search engines with comprehensive SEO features:

### Meta Tags & Structured Data

- ✅ Complete Open Graph tags for social media sharing
- ✅ Twitter Card tags for Twitter previews
- ✅ JSON-LD structured data (Schema.org WebApplication)
- ✅ Comprehensive meta descriptions and keywords (Bulgarian language)
- ✅ Proper language attributes (`lang="bg"`)
- ✅ Canonical URLs to avoid duplicate content

### Technical SEO

- ✅ `robots.txt` - Allows crawling and defines sitemap location
- ✅ `sitemap.xml` - Helps search engines discover pages
- ✅ `manifest.json` - PWA support for better mobile experience
- ✅ Semantic HTML structure
- ✅ Fast loading times with Vite optimization
- ✅ Mobile-responsive design
- ✅ HTTPS-ready configuration

### Performance Optimizations

- ✅ DNS prefetching for Firebase services
- ✅ Font preconnecting for Google Fonts
- ✅ Browser caching headers (`.htaccess`)
- ✅ Gzip compression enabled
- ✅ Optimized asset loading

### Keywords Targeted (Bulgarian)

- работен график (work schedule)
- управление на смени (shift management)
- планиране на служители (employee planning)
- месечен график (monthly schedule)
- национални празници България (Bulgarian national holidays)
- експорт в Excel/PDF

### Social Media Preview

When shared on social media, the app displays:

- 📱 Rich preview card with title and description
- 🖼️ Custom image (configure `og-image.png` in `/public`)
- 🔗 Proper URL structure

### Monitoring & Analytics

To track SEO performance, consider adding:

- Google Analytics
- Google Search Console
- Facebook Pixel (optional)

---

## �📦 Future Enhancements

- [x] 🔐 Firebase Authentication (Email/Password) ✅
- [x] 👥 Role-based access (Read-only vs Full access) ✅
- [ ] 👤 Multi-user roles (Admin, Manager, Viewer)
- [ ] 📧 Email notifications for schedule changes
- [ ] 📊 Statistics dashboard (hours worked, shift distribution)
- [ ] 🔄 Schedule templates and duplication
- [ ] 📅 Calendar view integration
- [ ] 🌙 Dark mode toggle
- [ ] 🌍 Multi-language support (EN, BG, etc.) - _Ready with constants structure_
- [ ] 📱 Progressive Web App (PWA)
- [ ] 🔔 Push notifications
- [ ] 💾 Import/Export schedules (JSON, CSV)
- [ ] 🎨 Custom shift types and colors
- [ ] 📈 Shift conflict detection
- [ ] ⏰ Time-based shifts (not just day-based)
- [ ] 🧠 Integrating Google Gemini AI
- [ ] 🧪 Unit tests for components and hooks
- [ ] 🔄 Duplicate schedule functionality
- [ ] 🔒 Owner-based schedule access control

---

## � Development & Testing

### Running Tests

```bash
# Unit tests (when configured)
npm run test

# Test coverage
npm run test:coverage
```

### Development Best Practices

1. **Component Structure** - Keep components focused and single-responsibility
2. **Constants** - Use `lib/constants.ts` for all hardcoded values
3. **Error Handling** - Use `toast` notifications for user feedback
4. **Accessibility** - Always include aria-labels and semantic HTML
5. **Type Safety** - Use TypeScript for all new code
6. **Documentation** - Add JSDoc comments for complex functions
7. **Authentication** - Always check `user` state before showing protected features
8. **Validation** - Use react-hook-form for all forms with proper validation

### Debugging

```bash
# Enable Vite debug mode
DEBUG=vite:* npm run dev

# Check Firebase connections
console.log(activeSchedule); // In browser console

# Test authentication
console.log(user); // Check auth state
```

### Testing Authentication

1. Create a test user in Firebase Console
2. Open app in incognito mode (not logged in)
3. Verify read-only mode works:
   - Can view schedules ✅
   - Cannot edit schedules ❌
   - Blue banner shows ✅
4. Click "Вход" and log in
5. Verify full access works:
   - Can add schedules ✅
   - Can edit employees ✅
   - Can change shifts ✅

---

## 📋 Changelog

### Latest Version - Authentication & Security Update

#### 🔐 Authentication Features

- ✅ **Email/Password Login** - Secure authentication via Firebase Auth
- ✅ **Modal Login Form** - Beautiful modal with react-hook-form validation
- ✅ **User Profile Menu** - Display user info with logout option
- ✅ **Read-Only Mode** - Public can view, only authenticated can edit
- ✅ **Protected Actions** - All write operations require authentication
- ✅ **Session Management** - Automatic login persistence
- ✅ **Security Rules** - Firestore rules enforce authentication

#### 🛡️ Security Improvements

- 🔒 **Controlled Access** - Manual user creation only (no public registration)
- 🛡️ **Data Protection** - Firestore security rules validate all operations
- 👁️ **Transparent Viewing** - Anyone can view schedules (read-only)
- ✏️ **Restricted Editing** - Only authenticated users can modify data
- 🎯 **Form Validation** - React Hook Form ensures data integrity
- 📝 **Error Messages** - User-friendly Bulgarian error messages

#### ✨ New Features

- 🎨 Extracted UI components for better maintainability
- 📝 Centralized constants and localization strings
- 🔍 Enhanced error handling with user-friendly messages
- ♿ Improved accessibility with aria-labels
- 🎯 Input validation and sanitization for employee names
- ⏰ **Configurable Working Hours** - 4, 6, or 8 hour work days per employee
- 🗓️ **Fixed Date Generation** - Corrected timezone issues in month display
- 🎯 **Custom Shift Times** - Create personalized shifts with specific time ranges
- 📊 **Work Hours Analytics** - Monthly work hours tracking with expected vs actual comparison
- ⚠️ **Overwork Detection** - Visual alerts when employees exceed expected hours

#### 🏗️ Architecture Improvements

- **Component Extraction**: Split large components into smaller, focused ones
- **Constants Consolidation**: All hardcoded strings now in `lib/constants.ts`
- **Better State Management**: Cleaner separation of concerns
- **JSDoc Documentation**: Added comprehensive comments for functions
- **Auth Context Pattern**: Centralized authentication state management
- **Protected Routes**: Conditional rendering based on auth state
- **Type System Enhancement**: Added `CustomShift` interface and `ShiftValue` union type

#### 📊 Components Added/Refactored

- `auth/LoginButton.tsx` - New login form with validation
- `auth/UserMenu.tsx` - New user profile component
- `context/AuthContext.tsx` - New authentication context
- `hooks/useAuth.tsx` - New authentication hook
- `Schedule.tsx` - Main component (reduced complexity)
- `ScheduleTable.tsx` - Added read-only mode, custom shifts, work hours modal
- `ScheduleSelector.tsx` - Protected admin actions
- `schedule/LoadingState.tsx` - New loading component
- `schedule/ErrorState.tsx` - New error component
- `schedule/EmptyState.tsx` - New empty state component
- `schedule/MonthYearSelector.tsx` - New selector component
- `schedule/EmployeeForm.tsx` - New form component with validation
- `schedule/ScheduleActions.tsx` - New actions component
- `schedule/CustomShiftModal.tsx` - New modal for custom shift time selection

#### 🚀 Performance & Quality

- Memoized expensive calculations
- Better TypeScript type safety
- Improved responsive design
- Enhanced form validation with react-hook-form
- Better error messages and feedback
- Smooth animations with Framer Motion
- Timezone-corrected date generation
- Dynamic work hours calculation based on shift types
- Modal-based UI for better mobile experience

---

## 🔑 Quick Start with Authentication

1. **Setup Firebase Auth** (see setup section above)
2. **Create Admin User** in Firebase Console → Authentication → Users
3. **Deploy with environment variables** set
4. **Test in incognito** to verify read-only mode
5. **Login** to test full admin access

---

## � Contributing

Contributions are welcome!

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📃 License

This project is open-source and MIT licensed.

---

## 🙋‍♂️ Author

Made with ❤️ by [Viktor Dimitrov](https://github.com/Wickedlolz)

---

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/Wickedlolz/work-schedule/issues)
- 📧 **Email**: viktor.dimitrov.dev@gmail.com
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Wickedlolz/work-schedule/discussions)

---

## ⭐ Star History

If you find this project useful, please consider giving it a star on GitHub!

---

## 🙏 Acknowledgments

- [React](https://react.dev/)
- [Firebase](https://firebase.google.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Vite](https://vitejs.dev/)
- [jsPDF](https://github.com/parallax/jsPDF)
- [SheetJS](https://sheetjs.com/)
