# 🗓️ Work Schedule Web App

A mobile-friendly and printable web application for managing employee work schedules. Built with **Vite + React**, styled using **TailwindCSS v4** and **Shadcn UI**, and designed for full offline/local use with **localStorage** as data persistence.

---

## 📌 Features

- ✅ View & edit monthly work schedules for multiple employees
- ✅ Color-coded shift types: Morning, Evening, Night, Off
- ✅ Add & remove employees
- ✅ Save schedule to `localStorage` (no backend required)
- ✅ Navigate across different months/years
- ✅ Weekend columns are highlighted
- ✅ Export to:
  - 🧾 **PDF** (print-optimized layout)
  - 📊 **Excel** (.xlsx format)
- ✅ Fully **responsive** for mobile, tablet & desktop
- ✅ Print-friendly layout (fits to single page)

---

## ⚙️ Tech Stack

- **Vite** – Fast frontend tooling
- **React** – UI library
- **TypeScript** – Type safety
- **TailwindCSS v4** – Utility-first styling
- **Shadcn UI** – Accessible, styled UI components
- **jsPDF + jspdf-autotable** – **Robust PDF export** with manual style control
- **xlsx** – For Excel export
- **localStorage** – Lightweight data persistence

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

### 3. Run the app locally

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
├── hooks/              # Custom Base64 fonts for jsPDF (e.g., OpenSans-Regular-normal.js)
├── utils/              # Date + Excel + PDF utils (Handles color extraction and custom font application)
├── pages/              # Main Schedule view
├── App.tsx             # Root App
└── main.tsx            # Entry point
```

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

- **PDF**: Uses **`jsPDF`** and **`jspdf-autotable`** to generate a vector PDF directly from the HTML table structure. This ensures high quality and reliably avoids CSS rendering issues.
  - **Cyrillic Support**: Custom TTF fonts (e.g., Open Sans) are converted to Base64, registered with `jsPDF`, and manually applied in `autoTable` to ensure proper Bulgarian rendering and accurate bold/normal styling.
  - **Weekend Styling**: The PDF utility function actively extracts the calculated background color of the weekend columns from the visible HTML table and applies it to the corresponding columns in the PDF using the `didParseCell` hook.
- **Excel**: Export table content with employee name, shift, and dates

---

## ⚠️ Tailwind `oklch()` Issue

If you're using Tailwind v4, `html2canvas` may throw an error with `oklch()` colors. To fix:

```ts
// tailwind.config.ts
export default {
  experimental: {
    optimizeUniversalDefaults: true,
    disableColorOpacityUtilitiesByDefault: true, // 👈 add this
  },
};
```

---

## 📱 Mobile UI

The table becomes horizontally scrollable with sticky headers and controls optimized for smaller screens.

---

## 📦 Future Ideas

- Drag-to-fill shifts
- Dark mode toggle
- Supabase or Firebase support for real-time sharing
- User auth (admin vs. viewer)
- Export to CSV

---

## 📃 License

This project is open-source and MIT licensed.

---

## 🙋‍♂️ Author

Made by [Viktor Dimitrov](https://github.com/Wickedlolz)
