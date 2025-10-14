# BC Activity Calendar — Changelog

All notable changes to this project will be documented in this file.  
This project uses [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

---

## [1.1.0] - 2025-09-16
### Changed
- Renamed LWC display label from **"BC Activity List (Black Cloud)"** → **"Activity List (Black Cloud)"** for a cleaner App Builder palette.
- Internal code unchanged (API name still `bcActivityList` so existing pages keep working).

### Notes
- Minor version bump because this is a non-breaking UI/UX improvement.
- Safe to install over 1.0.0 — no migration required.

---

## [1.0.0] - 2025-09-15
### Added
- Initial Managed Package release with namespace **blackcloud**.
- **BC Activity Calendar (Black Cloud)** component (month view + collapsible list).
- **BC Activity List (Black Cloud)** component (feed view with show more/less).
- Permission set `BCAC_ActivityCalendar` with read access to Task, Event, EmailMessage.
- Apex class `BCAC_ActivityController` with `WITH SECURITY_ENFORCED` queries.
- Apex tests & test data factory for ≥75% coverage.
- Custom labels for activity types and UI text (namespaced).
- Package-safe architecture (no hardcoded IDs, recordId auto-wiring).

### Notes
- This is the first GA version submitted for Security Review.
- Future versions will use `MINOR` bump for new features and `PATCH` for bug fixes.
