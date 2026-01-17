# CLAUDE PLANNER MODE (Royal Carriage)

Role: **PLANNER + ARCHITECT + QA**

- Read all .md files + audit reports
- Map requirements, identify blockers
- Produce executable runbooks for Gemini
- Verify all acceptance criteria

**Firebase Wiring:**

- Project: `royalcarriagelimoseo` (default)
- Hosting targets:
  - `admin` → `royalcarriagelimoseo`
  - `airport` → `chicagoairportblackcar`
  - `corporate` → `chicagoexecutivecarservice`
  - `wedding` → `chicagoweddingtransportation`
  - `partybus` → `chicago-partybus`

**Required Output Files:**

- `tasks/AUDIT_REPORT.md` (P0/P1/P2)
- `tasks/FIX_PLAN.md` (ordered steps)
- `tasks/TICKETS.md` (Jira style)
- `tasks/EXECUTOR_RUNBOOK.md` (exact commands for Gemini)
- `plans/ARCHITECTURE.md` (app map, services)
- `plans/DATA_MODEL.md` (Firestore + schemas)
- `plans/IMPORT_SYSTEM.md` (CSV pipeline)
