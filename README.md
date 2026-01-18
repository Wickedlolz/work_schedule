# 🗓️ Multi-Schedule Work Planning App

A comprehensive, mobile-friendly work scheduling application with **multi-schedule support**. Built with **Vite + React**, styled using **TailwindCSS v4** and **Shadcn UI**, and powered by **Firebase Firestore** for real-time data synchronization.

**[🚀 Live Demo](https://wickedlolz.github.io/work_schedule/)**

---

## 📌 Key Features

- ✅ **Multiple Schedules** - Create and manage unlimited work schedules
- ✅ **Duplicate Schedules** - Clone schedules with flexible copy options (employees, shifts, or both)
- ✅ **Auto-Generate Schedules** - Intelligent algorithm adapts to any team size
- ✅ **Custom Shifts** - Personalized time ranges (e.g., 9:00-17:30)
- ✅ **Work Hours Analytics** - Track expected vs actual hours with overwork alerts
- ✅ **Change Tracking** - Visual indicators with count badges for modified shifts
- ✅ **Custom Messages** - Add optional notes to shift changes (e.g., "По негово желание", "Болничен")
- ✅ **Bulgarian Holidays** - Automatic holiday detection and highlighting
- ✅ **Authentication** - Secure login with read-only public mode
- ✅ **Real-time Sync** - Firebase Firestore for live updates
- ✅ **PWA Support** - Progressive Web App with offline support and installable
- ✅ **Export** - PDF and Excel with full styling
- ✅ **Mobile Responsive** - Works on all devices
- ✅ **SEO Optimized** - Rich meta tags and structured data
- ✅ **URL State** - Shareable links with schedule/month/year params

---

## ⚙️ Tech Stack

- **Vite** – Fast frontend tooling
- **React 19** – UI library
- **TypeScript** – Type safety
- **TailwindCSS v4** – Utility-first styling
- **Shadcn UI** – Accessible UI components
- **Firebase Firestore** – Real-time database
- **Firebase Authentication** – Secure email/password auth
- **jsPDF + xlsx** – PDF and Excel export

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/Wickedlolz/work-schedule.git
cd work-schedule
npm install
```

### 2. Firebase Setup

1. Create a [Firebase project](https://console.firebase.google.com/)
2. Enable Firestore Database and Authentication
3. Copy `.env.example` to `.env`
4. Add your Firebase credentials

```bash
cp .env.example .env
```

### 3. Configure Firestore Rules

In Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /schedules/{scheduleId} {
      // Public read access (transparency)
      allow read: if true;

      // Only authenticated users can modify
      allow create, update, delete: if request.auth != null;
    }
  }
}
```

### 4. Create Admin User

In Firebase Console → Authentication → Users:

1. Click "Add user"
2. Enter email and password
3. Save

### 5. Run Development Server

```bash
npm run dev
```

Open http://localhost:5173

---

## 📖 Documentation

- **[📚 Features in Detail](./docs/FEATURES.md)** - Complete feature documentation
- **[🏗️ Project Structure](./docs/ARCHITECTURE.md)** - Architecture and code organization
- **[⚡ Performance Optimizations](./docs/OPTIMIZATIONS.md)** - React optimization techniques
- **[🚀 Deployment Guide](./docs/DEPLOYMENT.md)** - Deploy to GitHub Pages, Vercel, Netlify
- **[🔍 SEO Checklist](./docs/SEO-CHECKLIST.md)** - SEO optimization guide
- **[🎨 Favicon Guide](./docs/FAVICON-GUIDE.md)** - Icon setup instructions

---

## 🎯 Usage

### Public Mode (No Login)

- ✅ View all schedules
- ✅ Navigate months/years
- ✅ Export to PDF/Excel
- ❌ Cannot edit

### Authenticated Mode (After Login)

- ✅ All public features
- ✅ Create/edit/delete schedules
- ✅ **Duplicate schedules** - Clone existing schedules with flexible options:
  - **Copy employees only**: Creates new empty schedule with same team (useful for new months)
  - **Copy employees + shifts**: Exact clone with all shifts adjusted to target month/year (perfect for recurring schedules)
  - Specify target month/year when duplicating
- ✅ Add/remove employees
- ✅ Assign shifts
- ✅ **Set custom monthly hour limits** - Override automatic calculation (click ℹ️ icon → "Промени максимум")
- ✅ **Track manual changes** - Modified shifts display:
  - **Change count badge** (1-2 changes: blue, 3-5: orange, 6+: red)
  - **Tooltip**: "Променена X пъти | custom message"
  - **Optional custom messages**: Add context when changing shifts (e.g., "По негово желание", "Болничен", "Отпуск")
  - **Edit/delete messages**: Dialog pre-populates existing message, clear text to delete
- ✅ **Auto-generate schedules** with intelligent rules:
  - **Large teams (9+ employees)**: 3 Morning + 5-6 Evening on weekends
  - **Medium teams (4-8 employees)**: ~2 Morning + rest Evening on weekends
  - **Small teams (1-3 employees)**: Balanced distribution adapted to available workforce
  - All teams: 2 rest days/week, respects monthly hour limits, 4-hour employees always Evening
  - Weekdays: Balanced Morning/Evening (Night shifts left for manual assignment)

---

## 🔥 Firebase Data Structure

```javascript
schedules/
  {scheduleId}/
    name: "Schedule 1"
    employees: [
      {
        id: "1234",
        name: "John Doe",
        workingHours: 8,  // 4, 6, or 8 hours
        maxMonthlyHours: 160,  // Optional: Manual override for max monthly hours
        shifts: {
          "2025-11-01": "Morning",number of times each shift was modified
          "2025-11-02": 2,
          "2025-11-03": 5
        },
        shiftMessages: {  // Optional custom messages for shift changes
          "2025-11-02": "По негово желание",
          "2025-11-03": "Болничен"pe: "Custom", startTime: "09:00", endTime: "17:30" },
          "2025-11-03": "Night"
        },
        changedShifts: {  // Tracks manually modified shifts
          "2025-11-02": true
        }
      }
    ]
    createdAt: "2025-11-01T..."
    updatedAt: "2025-11-01T..."
```

---

## 🛠️ Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

---

## 📦 Future Enhancements

Planned features for future versions:

- [ ] Dark mode support
- [ ] Email notifications for schedule changes
- [ ] Statistics and reports
- [ ] PWA with offline support
- [ ] Mobile app version

---

## 🐛 Troubleshooting

### Firebase Connection Issues

- Verify `.env` variables are correct
- Check Firebase console for enabled services
- Whitelist your domain in Firebase settings

### Build Fails

- Ensure Node.js 20+ is installed
- Clear cache: `rm -rf node_modules package-lock.json && npm install`

### Authentication Not Working

- Check Firestore rules are deployed
- Verify user exists in Firebase Console
- Check browser console for errors

For more troubleshooting, see [FEATURES.md](./docs/FEATURES.md#troubleshooting).

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📃 License

This project is licensed under the MIT License.

---

## 👤 Author

**Viktor Dimitrov (Wickedlolz)**

- GitHub: [@Wickedlolz](https://github.com/Wickedlolz)
- Project Link: [https://github.com/Wickedlolz/work-schedule](https://github.com/Wickedlolz/work-schedule)

---

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!
