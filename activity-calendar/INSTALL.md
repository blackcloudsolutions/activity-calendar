# Installation Guide — BC Activity Calendar

This guide explains how to install and set up the **BC Activity Calendar (Black Cloud)** package in any Salesforce org.

---

## 1. Install the Package

Use the latest managed package installation link:

[**Install Package (Admins Only)**](<INSTALL_URL_HERE>)

> Replace `<INSTALL_URL_HERE>` with the actual 04t install URL generated when you create and promote a package version.

Choose **Install for Admins Only** to start (you can later extend access using the permission set).

---

## 2. Assign the Permission Set

1. Go to **Setup → Users → Permission Set Assignments**.
2. Assign **BCAC_ActivityCalendar** to any users who should view activities on record pages.

This permission set grants:
- Apex class access (BCAC_ActivityController)
- Read access to Task, Event, EmailMessage

---

## 3. Add the Components to Record Pages

1. Open **App Builder** for a record page (Account, Opportunity, Case, etc.).
2. Drag **BC Activity Calendar (Black Cloud)** or **Activity List (Black Cloud)** from the Components panel onto the layout.
3. (Optional) Set the **Card Title** property to override the default title.
4. Save and Activate the page.

---

## 4. Test the Components

1. Navigate to a record that has Activities (Tasks, Events, Calls, Emails).
2. Verify:
   - Calendar view shows coloured dots per day and toggles filter correctly.
   - List view shows most recent 5 activities, with **Show More / Show Less** working.

---

## 5. (Optional) Roll Out to Users

Once validated, assign the permission set to additional users and activate the page layouts for the right profiles.

---

## Troubleshooting

- **No activities shown?** Confirm the user has access to Task, Event, and EmailMessage objects and fields.
- **Filters not working?** Make sure you deployed all metadata (labels, classes) and assigned the permission set.
- **Component not visible in App Builder?** Check that the user has Lightning App Builder access and that the package is installed successfully.

---
