# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v0.1.2] - 2024-08-30

### Removed
- Removed google tracking, was included 1+ year ago for web hosted stale/old/different version/solution

### Fixed
- API, incorrect reply for /domains was a 200 when no results, caused incorrect frontend update logic
- API, incorrect reply for /servers was a 200 when no results, caused incorrect frontend update logic
- Frontend change to handle above, 400 returned, result tables is cleared
- setLoading(false) domains page, loading wheel continued when results returned
- setLoading(false) servers page, loading wheel continued when results returned
---
## [v0.1.1] - 2024-08-30

### Fixed
- Fixed Signup (worked for hosted)
- Fixed feedback & bug reporting page
- Fixed auth for feeds page from oauth to apikey, now working

### Removed
- Removed unused and stale code
- Removed Status Indicator, returns false positives, debug and re-add

---

## [v0.1.0] - 2024-08-25
### Added
- Initial Public Commit
