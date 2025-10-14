# User Guide — BC Activity Calendar (Black Cloud)

The **BC Activity Calendar** package adds two components you can place on any record page:

---

## 1. Components Overview

### **Activity Calendar (Black Cloud)**
- Displays a monthly calendar view with coloured dots for each activity type.
- Supports filtering by Task, Event, Call, and Email.
- Clicking a day shows that day's activities in a collapsible panel.

### **Activity List (Black Cloud)**
- Displays a feed-style list of recent activities.
- Shows 5 most recent items by default, with a **Show More / Show Less** button.
- Clicking an item opens the underlying Task, Event, or Email record.

---

## 2. Available Activity Types

- **Task** – includes tasks and logged calls (separate colour).
- **Event** – meetings from Salesforce calendars.
- **Call** – logged calls specifically (separate from generic tasks).
- **Email** – email messages related to the record.

---

## 3. Filters

At the top of each component, use the coloured filter chips to toggle which activity types are shown.  
- Active filters are highlighted.
- Inactive filters are greyed out.
- All filters active by default.

---

## 4. Accessibility

- Keyboard support: Use Tab to focus a filter chip, press Enter/Space to toggle.
- Screen reader support: aria-labels provided for filter controls.

---

## 5. Limitations

- Only displays activities linked via **WhoId** or **WhatId**.
- Requires read access to Task, Event, and EmailMessage objects.
- Currently supports record pages only (not app pages or home pages).

---

## 6. Customisation

- Admins can change the **Card Title** in App Builder for each component.
- The colours used for each activity type can be updated by editing the CSS in the LWC bundle (advanced use).

---

For installation instructions, see [INSTALL.md](./INSTALL.md).
