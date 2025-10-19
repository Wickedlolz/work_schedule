# 🗓️ Multi-Schedule Work Planning App

A comprehensive, mobile-friendly work scheduling application with **multi-schedule support**. Built with **Vite + React**, styled using **TailwindCSS v4** and **Shadcn UI**, and powered by **Firebase Firestore** for real-time data synchronization across multiple schedules.

[![Netlify Status](https://api.netlify.com/api/v1/badges/86406ffb-d1e0-4958-97e7-71bc61da5684/deploy-status)](https://app.netlify.com/projects/kfworkschedule/deploys)

---

## 📌 Features

### Core Features

- ✅ **Multiple Schedules** - Create and manage unlimited work schedules
- ✅ **Schedule Management** - Add, rename, delete, and switch between schedules
- ✅ View & edit monthly work schedules for multiple employees
- ✅ Color-coded shift types: Morning, Evening, Night, Off
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
- **jsPDF + jspdf-autotable** – PDF export with styling
- **xlsx** – Excel export with colors
- **Lucide React** – Beautiful icons

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

### 4. Configure Firestore Security Rules

In Firebase Console, go to **Firestore Database → Rules** and update:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /schedules/{scheduleId} {
      allow read, write: if true;
    }
  }
}
```

> **Note:** Update rules for production with proper authentication.

### 5. Run the app

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
│   ├── Schedule.tsx          # Main schedule page
│   ├── ScheduleTable.tsx     # Schedule table component
│   ├── ScheduleSelector.tsx  # Multi-schedule selector
│   └── ui/                   # Shadcn UI components
├── hooks/
│   ├── useFirebaseSchedules.ts  # Multi-schedule management
│   └── useLocalStorage.tsx      # Legacy hook (optional)
├── lib/
│   ├── firebase.ts              # Firebase initialization
│   ├── types.ts                 # TypeScript interfaces
│   ├── utils.ts                 # Utilities (PDF, Excel, dates)
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
      shifts: {
        "2024-01-15": "Morning",
        "2024-01-16": "Evening",
        "2024-01-17": "Night",
        "2024-01-18": "Off"
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
      "shifts": {
        "2024-01-15": "Morning",
        "2024-01-16": "Evening"
      }
    },
    {
      "id": "1705320100000",
      "name": "Регина",
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

### 1. Schedule Management

**Create New Schedule**

- Click "Нов график" button
- Enter schedule name
- New schedule is created and becomes active

**Switch Schedules**

- Use dropdown selector to switch between schedules
- Schedule changes instantly with real-time sync

**Rename Schedule**

- Click edit icon (✏️) next to schedule name in dropdown
- Enter new name and confirm

**Delete Schedule**

- Click delete icon (🗑️) next to schedule name
- Confirm deletion (minimum 1 schedule required)

### 2. Employee Management

- Add employees with custom names
- Each schedule has independent employee list
- Remove employees (minimum 1 required per schedule)
- Employee shifts are preserved when switching schedules

### 3. Shift Assignment

**Available Shifts:**

- 🌞 **Morning** - Yellow background (#FEF9C3)
- 🌙 **Evening** - Blue background (#DBEAFE)
- 🌃 **Night** - Purple background (#F3E8FF)
- ❌ **Off** - Gray background (#F3F4F6)

**Weekend Highlighting:**

- Saturday and Sunday columns have red tinted background (#FEF2F2)

### 4. Month Navigation

- **Dropdown Selectors** - Choose specific month and year
- **Next/Previous Buttons** - Navigate through months
- **Auto Year Adjustment** - Handles year transitions smoothly

### 5. Export Features

**PDF Export:**

- Includes schedule name and month in title
- Preserves all colors (shifts + weekends)
- Cyrillic support with Open Sans font
- Optimized for A4 landscape printing

**Excel Export:**

- Full color styling matching web interface
- Weekend column highlighting
- Shift color coding
- Professional borders and formatting
- Cell alignment (centered shifts, left-aligned names)

---

## 🔐 Security Considerations

### Development Mode (Current)

```javascript
allow read, write: if true;
```

### Production Mode (Recommended)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /schedules/{scheduleId} {
      // Require authentication
      allow read: if request.auth != null;
      allow create: if request.auth != null;

      // Only owner can modify
      allow update, delete: if request.auth != null
                            && request.auth.uid == resource.data.ownerId;
    }
  }
}
```

**Add owner field to schedules:**

```typescript
{
  name: "Schedule 1",
  ownerId: "user-firebase-uid",
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

---

## 📦 Future Enhancements

- [ ] 🔐 Firebase Authentication (Google, Email)
- [ ] 👥 Role-based access (Admin, Manager, Viewer)
- [ ] 📧 Email notifications for schedule changes
- [ ] 📊 Statistics dashboard (hours worked, shift distribution)
- [ ] 🔄 Schedule templates and duplication
- [ ] 📅 Calendar view integration
- [ ] 🌙 Dark mode toggle
- [ ] 🌍 Multi-language support (EN, BG, etc.)
- [ ] 📱 Progressive Web App (PWA)
- [ ] 🔔 Push notifications
- [ ] 💾 Import/Export schedules (JSON, CSV)
- [ ] 🎨 Custom shift types and colors
- [ ] 📈 Shift conflict detection
- [ ] ⏰ Time-based shifts (not just day-based)
- [ ] 🧠 Integrating Google Gemini AI

---

## 🤝 Contributing

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
- 📧 **Email**: your-email@example.com
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
