# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [unreleased] - 2024-09-xx
- (Console + Engine) Resource Attributes; Country, White|Black list, submission, IP, notes
- (Console + Engine) Image hashing
- Threat AI/LLM


## [v0.3.1] - 2024-09-24

### Changed
- (Console/API) Swagger OpenAPI docs
- (Console) Simple UI button color changes



## [v0.3.0] - 2024-09-20

### Added
- (Console) Threat AI/LLM


---

## [v0.2.5] - 2024-09-06

### Added
- (Console) Added scan button to table rows, on the fly scanning
- (Console) Domain Dialogue
- (Console) Server Dialogue

### Changed
- (Console) Tooltip for Console/Local toggle on scan page


---
## [v0.2.4] - 2024-09-05
### Added
- (Console) Loading indicators where required on UI
- (Console) Expand/Click icons where required on UI
### Fixed
- (API) /feeds?feed=all_domains was pointing to wrong backend db location
### Changed
- (Console) MAP - Better
---
## [v0.2.3] - 2024-09-04

### Fixed
- (Console) - XTend Feed page - Click on row did not load report
### Added
- (Console) Clear filters button
### Changed
- (Console) Navbar now static
- (Console) UI Changes
- (API) Returns latest by default
---
## [v0.2.2] - 2024-09-01

### Fixed
- (Console) - XTend Feed page - Table was not populating with results

---
## [v0.2.1] - 2024-09-01

### Fixed
- (Sandbox) - Handle checking certs for http 

---
## [v0.2.0] - 2024-08-31

### Added
- (Console) Added all available domains/zone_files feed 266million + known issue (duplicates)
- (Console) Added version# display on console navbar
- (Console) Added cloud/local sandbox toggle. Allows for running scans on Webamon cloud sandbox or local
- (Sandbox) Added config['source'] == 'openphish' option - pulls and scans current public feed

### Changed
- Changed login page & link to gitHub repo

### Fixed
- setLoading(false) feeds pages + scans + resources loading wheel continued when results returned

---
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
