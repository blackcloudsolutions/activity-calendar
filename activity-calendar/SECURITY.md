# Security Notes for BCAC Activity Calendar

**Package Overview:**  
This package provides a read-only Lightning Web Component calendar + list view to display Tasks, Calls, Events, and EmailMessages related to a record.

## Security Measures

- **CRUD/FLS Enforcement:**  
  All SOQL queries use `WITH SECURITY_ENFORCED`.  
  A dedicated Permission Set (`BCAC_ActivityCalendar`) grants only read access on required objects/fields.

- **Principle of Least Privilege:**  
  No Create/Edit/Delete permissions are granted.  
  Apex methods are `@AuraEnabled(cacheable=true)` and read-only.

- **UI Safety:**  
  No use of `innerHTML`, `eval`, or unsafe dynamic script injection.  
  All navigation uses `NavigationMixin.Navigate` (console-safe).

- **No External Callouts:**  
  No HTTP callouts or external libraries are used.  
  No secrets or sensitive data stored in custom settings.

- **No Hard-Coded IDs:**  
  Components use `@api recordId` and metadata queries; no environment-specific IDs.

- **Namespace Isolation:**  
  All Apex classes, labels, and components are namespaced (`bcac__`) once packaged.

## Security Review Artifacts

- **Test Classes:**  
  `BCAC_ActivityControllerTest` provides >75% coverage with positive/negative cases.

- **Installation Instructions:**  
  1. Install package
  2. Assign Permission Set `BCAC_ActivityCalendar`
  3. Add component(s) to record pages via Lightning App Builder

- **Sample Data:**  
  Script provided (`scripts/apex/seedSampleData.apex`) for quick verification.

No third-party libraries, analytics, or tracking are included.
