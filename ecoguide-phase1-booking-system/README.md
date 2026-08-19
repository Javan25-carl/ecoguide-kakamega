# EcoGuide Kakamega — Phase 1 Delivery: Booking System

## Scope note (read this first)

Your brief covers 17 phases across the whole platform. This delivery is
**Phase 1 (Booking System) only** — that's what's actually in this zip and
what's verified below. I did not attempt all 17 phases in one pass; that
would mean shallow, unverified changes across the whole app rather than a
working, tested Phase 1. Subsequent phases can follow the same pattern:
one phase at a time, audited against the real codebase first, verified
before delivery.

**Before writing any code**, I audited the existing project as instructed
(Phase 0). Key finding: **the backend for Phase 1 and Phase 2 (price
calculation) was already fully built** in a previous session — proper
cancellation policy (24-hour notice window on accepted bookings), a real
`BookingStatusHistory` table for the timeline, rejection reasons, payment
status tracking, and server-side-only price calculation that never trusts
the client. What was missing was entirely on the frontend: no booking
detail page, no timeline UI, no price breakdown display, and the booking
cards didn't surface payment status or link anywhere. This delivery closes
that gap. **No backend files were changed** — everything needed already
existed and is correct.

## What was improved

1. **New booking detail page** (`/bookings/:id`) — full booking info
   (tourist, guide, attraction, date/time/duration/people), status +
   payment badges, notes, rejection reason when applicable, and
   role-aware actions:
   - Guide: accept, reject (with an optional reason prompt), mark
     completed, mark paid
   - Tourist: cancel (subject to the existing backend cancellation
     policy — the button doesn't hide the rule, the API enforces it and
     the page surfaces the resulting error if you try outside the
     window)
   - Admin: mark paid, view everything (read access only, matching the
     backend's existing authorization — admins can view but the write
     actions stay guide/tourist-scoped, same as before this change)
   - Works for all three roles from one page, because the backend's
     `GET /bookings/<id>` already authorizes tourist/guide/admin viewers
     — no need for three separate pages.

2. **New booking timeline component** — renders the *real*
   `BookingStatusHistory` rows from the backend (timestamps, notes like
   rejection reasons or "Rescheduled (date, duration)"), not a guessed
   sequence. Correctly truncates the happy-path steps when a booking was
   rejected or cancelled instead of showing fake "upcoming" steps for a
   trip that isn't happening.

3. **New price breakdown component** — guide rate, duration, subtotal,
   discount (if any), total. Reads the backend's existing
   `price_breakdown()` method output rather than recalculating anything
   client-side.

4. **Booking cards updated** (both guide-side `BookingRequestCard` and
   tourist-side `MyBookings`) — now show a payment status badge
   (unpaid/paid) alongside the existing status badge, a short booking ID,
   and a link through to the new detail page. Guide-side reject was moved
   from an instant one-click action to the detail page, since rejecting
   with a reason needs more room than a list-item card can offer — accept
   and mark-completed stay as quick one-click actions on the card since
   those don't need extra input.

5. **Fixed a stale-navigation bug found along the way**: `Messages.jsx`
   had its own copy of the guide/admin sidebar nav, and that copy still
   pointed at dead links (`/guide/bookings`, `/admin/users`) from before
   those were fixed to hash-anchor links (`/guide/dashboard#booking-requests`,
   etc.) in an earlier round. The actual dashboards were fixed; this one
   copy was missed. Now consistent.

## Files changed

**New:**
- `frontend/src/pages/BookingDetail.jsx`
- `frontend/src/components/booking/BookingTimeline.jsx`
- `frontend/src/components/booking/PriceBreakdown.jsx`

**Modified:**
- `frontend/src/App.jsx` — added the `/bookings/:id` route (shared by any
  authenticated role, matching backend authorization)
- `frontend/src/pages/Messages.jsx` — fixed stale nav paths (see above)
- `frontend/src/components/dashboard/BookingRequestCard.jsx` — payment
  badge, booking ID, detail link, reject now goes through the detail page
- `frontend/src/pages/tourist/MyBookings.jsx` — payment badge, booking ID,
  detail link

**Backend: no files changed.** Audited and confirmed already correct —
see "What was already there" below.

## What was already there (audited, not touched)

- `backend/app/models/booking.py` — `PaymentStatus` enum, `rejection_reason`,
  `price_breakdown()`, `BookingStatusHistory` model + relationship
- `backend/app/routes/booking_routes.py` — `GET /bookings/<id>` with
  `include_breakdown=True`, `PUT /bookings/<id>/payment-status`, the
  24-hour cancellation notice policy, terminal-state guards, rejection
  reason handling, status history logging on every transition

## Database changes

**None.** No models were added or altered this round — the schema
required for this phase (`payment_status`, `rejection_reason`,
`booking_status_history` table) already existed from a previous session.

If your running database predates that work, note that **SQLite does not
support adding columns to an existing table via `create_all()`**. If your
`bookings` table predates `payment_status`/`rejection_reason`, you'll hit
`sqlite3.OperationalError: no such column`. Fastest dev fix: delete
`backend/ecoguide_dev.db` and re-run `python3 seed.py` to recreate it
fresh (you'll lose local dev data — fine for dev, not for production).
For Postgres/production, use a real Alembic migration instead.

## New API endpoints

None new this round. This delivery uses existing endpoints:
- `GET /api/bookings/<id>` (existing)
- `PUT /api/bookings/<id>/status` (existing)
- `PUT /api/bookings/<id>/payment-status` (existing)

## Frontend changes

Covered in "Files changed" above. Summary: one new page, two new
components, four files updated to link to and use them.

## Commands required to run the updated system

```bash
# Backend (unchanged from before - included for completeness)
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

None required (see "Database changes" above for the SQLite caveat if your
dev DB is old enough to predate `payment_status`/`rejection_reason`).

## Testing performed

Given sandbox constraints (no network access, so no `pip install`/
`npm install` on my end), testing this round was static/structural, done
the same way every round in this project has been verified:

- **Backend**: `python3 -m py_compile` across every backend file —
  passes clean. No backend files changed this round, so this just
  reconfirms the existing code (which the new frontend now depends on
  more heavily) hasn't regressed.
- **Frontend**: brace/paren balance check across every `.jsx`/`.js` file
  (structural JSX correctness), full import-resolution check (every
  relative import verified to resolve to a real file), and every new/
  changed `api.*` call cross-referenced against the actual registered
  backend route by name and HTTP method — all matched cleanly on this
  pass.
- **Not done, and you should do this**: actually clicking through the
  flow in a browser. I can't run `npm run dev` or open a browser from my
  environment. Specifically worth checking: the reject-with-reason flow
  end to end, the cancellation-policy error message actually surfacing
  correctly in the UI when you try to cancel an accepted trip inside the
  24-hour window, and that the timeline renders sensibly for a booking
  that's gone through a reschedule (multiple "pending" history rows).

## Remaining issues / not done in this delivery

- **Phases 2–17 not started** except where Phase 2 (price calculation)
  already existed in the backend and is now surfaced by this phase's UI.
- **Search/filtering/sorting/pagination on booking lists** (Phase 3) —
  not built yet. `MyBookings.jsx` has status filter tabs already (from an
  earlier round) but no search box, date filter, or sort.
- **No payment gateway** — `payment_status` is manually toggled by a
  guide/admin ("mark as paid"), not processed. This matches what already
  existed; Phase 2's spec doesn't ask for real payment processing.
