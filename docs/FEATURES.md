# 🎨 Features in Detail

## 1. Authentication & Security

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

## 2. Schedule Management

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

## 3. Employee Management

- Add employees with custom names (only when authenticated)
- **Configurable Working Hours** - Select 4, 6, or 8 hour work days for each employee
- Each schedule has independent employee list
- Remove employees (minimum 1 required per schedule, only when authenticated)
- Employee shifts are preserved when switching schedules
- **Form validation** with real-time error messages
- **Input sanitization** (trim, normalize spaces, max 100 chars)
- **Backward Compatibility** - Existing employees default to 8-hour days

## 4. Shift Assignment

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

**Weekend & Holiday Highlighting:**

- Saturday and Sunday columns have red tinted background (#FEF2F2)
- Bulgarian national holidays also highlighted in red
- 14 holidays supported (10 fixed + 4 Easter-based movable holidays)

## 5. Work Hours Analytics

**Employee Work Hours Tracking:**

- Click info icon (ℹ️) next to employee name to view detailed work hours
- Modal displays:
  - **Expected Hours**: Calculated based on working days in month (excluding weekends & holidays) × employee's daily hours
  - **Actual Hours**: Sum of all worked shifts for the month
  - **Overwork Alert**: Visual warning if actual hours exceed expected hours

**Hour Calculation Rules:**

- **Morning/Evening**: Uses employee's configured daily working hours (4, 6, or 8)
- **Night Shift**: Always counts as 8 hours regardless of employee's daily hours setting
- **Vacation**: Counts as 8 hours
- **Custom Shifts**: Calculated from time range (e.g., 9:00-17:30 = 8.5 hours)
- **Off/Sick Leave**: 0 hours
- **Expected Hours**: Based on total working days in month (excluding weekends & holidays)
  - Example: December 2025 has 20 working days (31 total - 8 weekends - 3 Christmas holidays)
  - 8-hour employee: 20 × 8 = 160 expected hours
  - 6-hour employee: 20 × 6 = 120 expected hours
  - 4-hour employee: 20 × 4 = 80 expected hours

**Bulgarian National Holidays:**

The system automatically excludes these holidays from expected hours calculation:

- Fixed holidays: New Year's Day, Liberation Day, Labour Day, St. George's Day, Bulgarian Education and Culture Day, Unification Day, Independence Day, Christmas Eve, Christmas Day, Boxing Day
- Movable holidays: Good Friday, Holy Saturday, Easter Sunday, Easter Monday (calculated using Meeus/Jones/Butcher algorithm)

**Visual Indicators:**

- Expected hours shown in gray card
- Actual hours shown in gray (normal) or red (overworked)
- Red alert box appears when employee exceeds expected hours

## 6. Month Navigation

- **Dropdown Selectors** - Choose specific month and year
- **Next/Previous Buttons** - Navigate through months
- **Auto Year Adjustment** - Handles year transitions smoothly
- **Responsive Layout** - Adapts to mobile, tablet, and desktop
- **Timezone Fix** - Corrected date generation to avoid off-by-one errors
- **URL Parameters** - Month and year preserved in URL for sharing and bookmarking

## 7. Export Features

**PDF Export:**

- Includes schedule name and month in title
- Preserves all colors (shifts + weekends + holidays)
- Includes working hours column with blue styling
- Cyrillic support with Open Sans font
- Optimized for A4 landscape printing
- Available to both authenticated and non-authenticated users

**Excel Export:**

- Full color styling matching web interface
- Weekend & holiday column highlighting
- Working hours column included
- Shift color coding
- Professional borders and formatting
- Cell alignment (centered shifts, left-aligned names)
- Available to both authenticated and non-authenticated users

## 8. State Persistence

**URL Parameters:**

- Selected schedule ID preserved in `?schedule=xxx` parameter
- Selected month preserved in `?month=X` parameter
- Selected year preserved in `?year=YYYY` parameter
- Shareable URLs - Send exact view to colleagues
- Bookmarkable - Save specific schedule/month/year combinations
- Works with browser back/forward buttons
