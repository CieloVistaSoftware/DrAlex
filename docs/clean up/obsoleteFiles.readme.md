# Obsolete Files Report

This document lists files and folders in the DrAlex repository that appear to be obsolete, unused, or candidates for removal as part of the cleanup process (Step 1).

---

## Potentially Obsolete or Unused Files

- `html-validator.ps1` — Old validation script, not referenced in docs or build.
- `test-chat-widget.ps1` — Legacy test script, may be replaced by Playwright or other tests.
- `placeholder.html` — Placeholder file, not linked from navigation or app logic.
- `new-page-template.html` — Template file, not used in production.
- `example-js.html` — Example/demo file, not part of main app.
- `traditional-import.html` — Legacy import demo, not referenced.
- `module-import.html` — Legacy import demo, not referenced.
- `zzz/` — Appears to be a scratch or backup folder.
- `coverage/`, `playwright-report/`, `test-results/` — Generated test output, should be in `.gitignore`.
- `imagesave.py` — Standalone script, not integrated with main app.
- `VSCodeInsidersSetup.md` — Setup doc, may be outdated.
- `examples/` — Contains many timestamped HTML files, likely old demos or exports.
- `docs/image.png` — Unused image in docs.
- Any files with timestamps or backup suffixes in `examples/` or other folders.

---

## To Review Before Deletion
- Confirm with the team if any of the above files are still needed for reference, migration, or documentation.
- Check for any scripts or assets referenced in deployment, CI/CD, or documentation.
- Archive (move to `archive/` or similar) before permanent deletion if unsure.

---

*Prepared by: GitHub Copilot*
*Date: July 30, 2025*
