# EcoGuide Kakamega — Phase 3 Delivery: Search, Filtering & Sorting

## Scope note

This is **Phase 3 only**, continuing from the Phase 1 (Booking System)
delivery. Same approach: audit the real codebase before writing code,
build one phase at a time, verify before shipping.

## The headline finding: a severe, previously-undiscovered bug

Before building anything, I audited `GET /admin/bookings` (the endpoint
Phase 3's admin search/filter/sort/pagination needs). It already had a
genuinely excellent implementation — real server-side search across
booking ID/tourist name/guide name/attraction name, filters for status,
payment status, date range, guide, and tourist, four sort orders, and
real pagination.

**It was also completely broken.** `aliased`, `or_`, and `datetime` are
all used in the function body — none of the three were imported. This
means the endpoint has been throwing `NameError` on literally every call
since it was written, in every previous round, without being caught.

**Why previous verification missed this**: every round's testing (mine
included) relied on `python3 -m py_compile`, which only validates syntax.
`aliased`, `or_`, and `datetime` are all valid Python identifiers as far
as the parser is concerned — the error only happens at runtime when the
function actually executes and Python tries to resolve those names and
fails. A syntax check can never catch this class of bug.

**How I caught it this time**: while auditing this endpoint for the
Phase 3 build, I noticed the missing imports by inspection, then wrote a
small AST-based static analysis script (included in the testing section
below) that walks every backend `.py` file and cross-references every
name *used* against every name *imported* or *locally assigned*. Ran it
against this one file to confirm, then ran it across the **entire**
backend as a sanity sweep. Everything else came back clean — this was an
isolated incident in one file, not a systemic pattern.

**Fixed**: added the three missing imports
(`from datetime import datetime`, `from sqlalchemy import or_`,
`from sqlalchemy.orm import aliased`) to `admin_routes.py`. No logic
changed — the search/filter/sort/pagination implementation itself was
already correct, it just couldn't run.

## What was improved

1. **Fixed the crash** described above (`backend/app/routes/admin_routes.py`).

2. **Admin booking management is now fully wired to real search/filter/
   sort/pagination.** Previously `AdminDashboard.jsx` called
   `GET /admin/bookings` with zero query parameters and
   `BookingManagementTable` hard-sliced the result to the first 20 rows
   client-side — no search box, no filters beyond a status tab, no sort
   control, no pagination UI existed at all, and (per the bug above) the
   whole thing was crashing anyway.

   `BookingManagementTable` is now a fully self-contained component: it
   owns its own search/filter/sort/page state and calls the backend
   directly with real query params. Specifically:
   - Debounced search box (booking ID, tourist name, guide name, attraction)
   - Status filter (existing tabs, kept)
   - Payment status filter (new)
   - Date range filter — from/to (new)
   - Sort dropdown: newest, oldest, highest price, lowest price (new)
   - Real prev/next pagination reflecting the backend's actual page count
     (new) — no more silent 20-row cap
   - Payment status column and a link to the Phase 1 booking detail page
     on every row (new)

   `AdminDashboard.jsx` had its own `bookings` state and fetch effect
   removed, since the table manages its own now — verified nothing else
   in that file depended on that state (the booking status pie chart
   reads from `stats`, not the raw booking list).

3. **Tourist booking list gets search + sort.** `GET /bookings/my`
   deliberately stayed a flat, unpaginated list — a single tourist's own
   booking count doesn't justify server-side pagination the way the
   platform-wide admin view does. Added client-side search (matches
   guide name, attraction name, or booking ID) and the same four sort
   orders as the admin table, layered on top of the status filter tabs
   that already existed from an earlier round.

## Files changed

**Modified (4 files, 0 new):**
- `backend/app/routes/admin_routes.py` — added 3 missing imports (the
  crash fix)
- `frontend/src/components/dashboard/BookingManagementTable.jsx` —
  rebuilt as self-contained with real search/filter/sort/pagination
- `frontend/src/pages/admin/AdminDashboard.jsx` — removed now-redundant
  `bookings` state and fetch effect
- `frontend/src/pages/tourist/MyBookings.jsx` — added search box and
  sort dropdown

## Database changes

None.

## New API endpoints

None new. This delivery makes real use of an existing endpoint
(`GET /api/admin/bookings`) that was previously called but non-functional.

## Commands required to run the updated system

```bash
# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
python3 run.py

# Frontend
cd frontend
npm install
npm run dev
```

## Migration commands

None required.

## Testing performed

- **Backend syntax**: `python3 -m py_compile` across every file — clean.
- **Backend undefined-name sweep** (the check that actually caught this
  round's bug): a small AST script that parses every backend `.py` file,
  collects every imported name and every locally-assigned name (function
  params, loop variables, etc.), and flags any `Name` node in "load"
  context that isn't accounted for by either. Ran against the fixed file
  to confirm zero remaining undefined names, then across the whole
  `app/` tree — clean everywhere else. Worth keeping in your own CI if
  you have one; this is the exact class of bug a linter like `pyflakes`
  or `ruff` would also catch for free, and I'd recommend adding one of
  those to this project going forward rather than relying on ad hoc
  scripts like the one I wrote for this check.
- **Frontend**: brace/paren balance across every `.jsx`/`.js` file,
  full import-resolution check, every new/changed `api.*` call
  cross-referenced against the actual registered backend route.
- **Not done**: actually calling the fixed endpoint and clicking through
  the search/filter/sort/pagination UI in a browser. I can't run
  `npm run dev`, start the Flask server, or open a browser from my
  sandbox. Given this round fixed a bug that would have caused an
  immediate, obvious 500 error, **this is the single most important
  thing to verify** — open the admin dashboard's Bookings section and
  confirm it loads without error before assuming this fix is complete.

## Remaining issues / not done in this delivery

- Guide-side booking list (on `GuideDashboard.jsx`) doesn't have its own
  search/sort yet — lower priority since a guide's booking-request queue
  is naturally small and time-bounded (pending + accepted only), but
  could be added on the same pattern as the tourist list if useful.
- Phases 4–17 not started.
