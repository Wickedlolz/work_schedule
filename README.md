# 🗓️ Work Schedule Web App

A mobile-friendly and printable web application for managing employee work schedules. Built with **Vite + React**, styled using **TailwindCSS v4** and **Shadcn UI**, and powered by **Firebase Firestore** for real-time data synchronization.

[![Netlify Status](https://api.netlify.com/api/v1/badges/86406ffb-d1e0-4958-97e7-71bc61da5684/deploy-status)](https://app.netlify.com/projects/kfworkschedule/deploys)

---

## 📌 Features

- ✅ View & edit monthly work schedules for multiple employees
- ✅ Color-coded shift types: Morning, Evening, Night, Off
- ✅ Add & remove employees
- ✅ **Real-time synchronization** with Firebase Firestore
- ✅ Navigate across different months/years
- ✅ Weekend columns are highlighted
- ✅ Export to:
  - 🧾 **PDF** (print-optimized layout)
  - 📊 **Excel** (.xlsx format)
- ✅ Fully **responsive** for mobile, tablet & desktop
- ✅ Print-friendly layout (fits to single page)
- ✅ **Multi-user support** with live updates

---

## ⚙️ Tech Stack

- **Vite** – Fast frontend tooling
- **React** – UI library
- **TypeScript** – Type safety
- **TailwindCSS v4** – Utility-first styling
- **Shadcn UI** – Accessible, styled UI components
- **Firebase Firestore** – Real-time cloud database
- **jsPDF + jspdf-autotable** – Robust PDF export with manual style control
- **xlsx** – For Excel export

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/work-schedule-app.git
cd work-schedule-app
```

### 2. Install dependencies

```bash
npm install
# or
yarn
```

### 3. Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Firestore Database**
4. Get your Firebase configuration from Project Settings
5. Copy `.env.example` to `.env` and fill in your Firebase credentials:

```bash
cp .env.example .env
```

Edit `.env` with your Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Configure Firestore Security Rules

In the Firebase Console, go to **Firestore Database → Rules** and paste the rules from `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /employees/{employeeId} {
      allow read, write: if true;
    }
  }
}
```

> **Note:** The above rules allow all operations for development. For production, implement proper authentication.

### 5. Run the app locally

```bash
npm run dev
# or
yarn dev
```

The app will be available at: [http://localhost:5173](http://localhost:5173)

---

## 🏗️ Project Structure

```
src/
├── components/         # UI components (Table, Dropdowns, Buttons)
│   ├── Schedule.tsx    # Main schedule page with Firebase integration
│   ├── ScheduleTable.tsx
│   └── ui/             # Shadcn UI components
├── hooks/
│   ├── useFirebaseEmployees.ts  # Firebase CRUD operations
│   └── useLocalStorage.tsx      # Legacy local storage hook
├── lib/
│   ├── firebase.ts     # Firebase initialization
│   ├── types.ts        # TypeScript types
│   └── utils.ts        # Date + Excel + PDF utils
├── App.tsx             # Root App
└── main.tsx            # Entry point
```

---

## 🔥 Firebase Features

### Real-time Updates

- Changes are synchronized across all connected clients instantly
- Multiple users can edit the schedule simultaneously
- Live updates when shifts are modified

### Data Structure

```typescript
// Firestore Collection: employees
{
  id: string (auto-generated),
  name: string,
  shifts: {
    "YYYY-MM-DD": "Morning" | "Evening" | "Night" | "Off"
  },
  createdAt: string (ISO timestamp)
}
```

### CRUD Operations

- **Create**: Add new employees
- **Read**: Real-time fetching with `onSnapshot`
- **Update**: Modify shifts for specific dates
- **Delete**: Remove employees

---

## 🧠 Custom Shift Logic

The available shifts:

- 🌞 Morning – yellow
- 🌙 Evening – indigo
- 🌃 Night – violet
- ❌ Off – gray

You can configure this via a shared constant object or Shadcn `<Select />`.

---

## 📤 Exporting

- **PDF**: Uses **`jsPDF`** and **`jspdf-autotable`** to generate a vector PDF directly from the HTML table structure
  - **Cyrillic Support**: Custom TTF fonts (e.g., Open Sans) are converted to Base64
  - **Weekend Styling**: Automatically applies weekend highlighting in PDF
- **Excel**: Export table content with employee name, shift, and dates

---

## 🔒 Security Considerations

### Development Mode

The current Firestore rules allow unrestricted read/write access for easy development:

```javascript
allow read, write: if true;
```

### Production Mode

For production, implement Firebase Authentication and update the rules:

```javascript
// Require authentication
allow read, write: if request.auth != null;

// Or implement role-based access
allow read: if request.auth != null;
allow write: if request.auth != null &&
             request.auth.token.admin == true;
```

---

## 📱 Mobile UI

The table becomes horizontally scrollable with sticky headers and controls optimized for smaller screens.

---

## 🎯 Future Enhancements

- ✨ Drag-to-fill shifts
- 🌙 Dark mode toggle
- 👤 Firebase Authentication (admin vs. viewer roles)
- 📧 Email notifications for schedule changes
- 📊 Statistics and reporting dashboard
- 🔄 Shift templates and bulk operations
- 📱 Progressive Web App (PWA) support
- 🌍 Multi-language support
- 📅 Calendar view integration

---

## 🐛 Troubleshooting

### Firebase Connection Issues

- Check if Firebase credentials in `.env` are correct
- Ensure Firestore is enabled in Firebase Console
- Verify security rules allow operations

### Build Errors

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check that all environment variables are set
- Ensure TypeScript version compatibility

---

## 📃 License

This project is open-source and MIT licensed.

---

## 🙋‍♂️ Author

Made by [Viktor Dimitrov](https://github.com/Wickedlolz)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
