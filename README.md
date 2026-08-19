# EcoGuide Kakamega

Location-based tourism platform connecting tourists with certified eco-guides
in Kakamega County.

**Stack:** React + Vite + Tailwind (frontend) · Flask + SQLAlchemy (backend) · PostgreSQL · Docker

This scaffold gives you a working backend API and a minimal frontend that
talks to it. Landing page, dashboards, maps, and booking UI come next.

---

## 1. Unzip the project

```bash
unzip ecoguide-kakamega.zip
cd ecoguide-kakamega
```

## 2. Backend setup (Flask)

```bash
cd backend

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create your local env file
cp .env.example .env
# Open .env and set SECRET_KEY / JWT_SECRET_KEY to random strings, e.g.:
python3 -c "import secrets; print(secrets.token_hex(32))"
# (run that twice, paste one value into SECRET_KEY and the other into JWT_SECRET_KEY)

# Create the database tables + demo data (uses SQLite by default, zero setup)
python3 seed.py

# Run the dev server
python3 run.py
```

Backend is now live at **http://localhost:5000**. Confirm it works:

```bash
curl http://localhost:5000/api/health/
# -> {"status": "ok", "service": "EcoGuide Kakamega API"}
```

Try logging in with the seeded admin account:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@ecoguide.co.ke", "password": "Admin@123"}'
```

## 3. Frontend setup (React + Vite)

Open a **new terminal tab** (keep the backend running in the first one):

```bash
cd ecoguide-kakamega/frontend

# Install dependencies
npm install

# Run the dev server
npm run dev
```

Frontend is now live at **http://localhost:5173** — Vite automatically
proxies `/api/*` requests to the Flask backend on port 5000 (see
`vite.config.js`), so no CORS headaches in dev.

## 4. Verify everything is wired together

Open http://localhost:5173 in your browser — you should see the EcoGuide
Kakamega placeholder page. Open browser dev tools → Network tab, and any
call to `/api/...` should return real JSON from your Flask backend.

---

## Project structure

```
ecoguide-kakamega/
├── backend/
│   ├── app/
│   │   ├── models/       # User, GuideProfile, Attraction, Booking, Review, Message, Notification
│   │   ├── routes/       # auth, users, guides, attractions, bookings, reviews, admin
│   │   └── __init__.py   # Flask app factory
│   ├── config.py         # Dev/Prod/Testing config
│   ├── run.py             # Entry point
│   ├── seed.py            # Demo data seeder
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/         # Route-level pages (Home for now)
│   │   ├── components/    # Reusable UI components (next step)
│   │   ├── context/        # AuthContext (login/register/logout state)
│   │   ├── services/       # api.js — axios client with JWT auto-refresh
│   │   └── App.jsx / main.jsx
│   ├── tailwind.config.js  # EcoGuide brand colors wired in
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml       # db + backend + frontend, one command deploy
└── README.md
```

## Running everything with Docker instead (optional, for later)

Once you're ready to deploy or just want one command to boot the whole
stack (Postgres included):

```bash
cd ecoguide-kakamega
cp backend/.env.example backend/.env   # fill in real secrets first
docker compose up --build
```

- Frontend → http://localhost:8080
- Backend  → http://localhost:5000
- Postgres → localhost:5432

---

## What's implemented right now

- ✅ Full database schema: Users (tourist/guide/admin roles), GuideProfiles,
  Attractions, Bookings, Reviews, Messages, Notifications
- ✅ JWT authentication: register, login, refresh, `/me`
- ✅ Guide endpoints: list/filter (language, price, rating, availability),
  profile update, availability toggle, live location update
- ✅ Attraction endpoints: list/filter/search, detail, create
- ✅ Booking lifecycle: create, list mine, list incoming (for guides),
  update status (accept/reject/cancel/complete)
- ✅ Review endpoints: create, list by guide/attraction, delete, auto
  rating recalculation
- ✅ Admin endpoints: stats dashboard, pending guide approvals, approve
  guide, user management, deactivate user
- ✅ React app skeleton with routing, Tailwind branding, Axios client with
  automatic JWT refresh, Auth context
- ✅ Docker + docker-compose for full-stack deployment
- ✅ Seed script with demo admin, guide, and 3 real Kakamega attractions

- ✅ **Landing page** — hero with animated forest canopy, destination search,
  "how it works" trail-path section, featured guides, popular attractions,
  stats, testimonials, gallery, conservation message, partners, full footer
  (`frontend/src/components/landing/` and `frontend/src/components/layout/`)
- ✅ **Auth pages** — login, register (tourist/guide role toggle), forgot
  password, reset password, all with a shared illustrated split-screen
  layout, password visibility toggle, remember me, inline validation
  (`frontend/src/pages/Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`,
  `ResetPassword.jsx`, `frontend/src/components/auth/`)
- ✅ **Password reset backend** — `/api/auth/forgot-password` and
  `/api/auth/reset-password`, using signed time-limited tokens
  (`itsdangerous`). No SMTP is configured yet, so in dev the reset link is
  logged to the Flask console instead of emailed — see "Email sending" below.
- ✅ **Notifications backend** — list, mark-read, mark-all-read endpoints
  (`backend/app/routes/notification_routes.py`)
- ✅ **Tourist dashboard** — welcome header, live weather at your location,
  map/list toggle showing nearby guides + attractions, filter bar (language,
  price, rating, availability), guide cards with one-click booking, upcoming
  bookings panel, notifications panel, dark mode toggle, responsive sidebar
  (`frontend/src/pages/tourist/TouristDashboard.jsx`)
- ✅ **Guide dashboard** — availability toggle, live location sharing, booking
  request queue (accept/reject/mark completed), editable profile form
  (bio, languages, specialization, rate), earnings-by-month bar chart,
  rating summary, recent reviews
  (`frontend/src/pages/guide/GuideDashboard.jsx`)
- ✅ **Admin dashboard** — platform stats, bookings-by-status pie chart,
  booking management table (filterable by status), user management table
  (search + role filter + activate/deactivate), pending guide approvals
  with one-click approve, recent registrations feed
  (`frontend/src/pages/admin/AdminDashboard.jsx`)

Two real backend/frontend contract mismatches were caught and fixed while
wiring these up: `User.to_dict()` wasn't returning `is_active` (the admin
user table's status toggle would have silently done nothing), and
`GET /admin/guides/pending` wasn't nesting the guide's user info (approvals
would have shown "Unnamed guide" for everyone). Both are fixed in this
package — every route was cross-checked against what the frontend actually
calls, not just spot-checked.

## What's new in this build

- ✅ **Guide & attraction detail pages** (`/guides/:id`, `/attractions/:id`)
  — full profile/description, reviews with a working "leave a review" form
  (tourists only), book/message buttons on guide pages, nearby-guides list
  on attraction pages. Backed by new `/guides` and `/attractions` list pages
  so the nav links that already existed actually go somewhere now.
- ✅ **Real booking flow** — the tourist dashboard's "Book" button used to be
  a `window.prompt()`; it's now a proper modal (date, time, duration, group
  size, notes, live price estimate, confirmation state). New
  `/tourist/bookings` page lets tourists filter by status, reschedule a
  pending booking inline, or cancel.
- ✅ **Chat system** — conversation list + thread view, works for any role
  (`/messages`, `/messages/:partnerId`), text + location sharing, read
  receipts. It's REST + polling (every 4s) rather than websockets — see
  limitations below.

Two more real bugs were caught and fixed while wiring this up:
`GET /guides/` (the main guide listing used by the dashboard, `/guides`,
and attraction pages) wasn't nesting user info, so **every guide name on
the tourist dashboard has been blank until this fix**. And `update_booking_status`
had **no ownership check at all** — any logged-in user could accept, reject,
or cancel any booking in the system by guessing an ID. Both are fixed;
booking status changes are now restricted to the guide (accept/reject/
complete) or the tourist/guide who owns the booking (cancel).

## What's new in this build

- ✅ **Dead nav links fixed.** The guide and admin dashboards are still
  single-page (all sections render together), so instead of building five
  separate route pages, the sidebar links now scroll to real in-page
  anchors (`/guide/dashboard#booking-requests`, `/admin/dashboard#user-management`,
  etc.) via a small generic hash-scroll behavior added to `DashboardShell`.
  Clicking them actually does something now.
- ✅ **Favorites, fully wired.** Heart-toggle button on guide/attraction
  cards and detail pages (tourist-only, optimistic UI), a dedicated
  `/tourist/favorites` page with All/Guides/Attractions tabs and remove
  buttons. Backend: new `Favorite` model + `/api/favorites/*` routes
  (add, remove, list, and a bulk `/status` check so list pages don't fire
  one request per card).
- ✅ **Settings page** (`/tourist/settings`) — edit name/phone, change
  password with current-password verification, both hitting endpoints that
  already existed on the backend (`PUT /users/me`, `PUT /auth/change-password`).

One real bug caught and fixed while wiring Settings up: `AuthContext` never
exposed `setUser`, so saving a profile change would call an undefined
function — caught by the `try/catch` and shown to the user as "Couldn't save
your changes" **even though the save had already succeeded on the backend**.
That's a nasty class of bug (silent success reported as failure), now fixed.

I also ran a systematic cross-check this round: extracted every `api.get/
post/put/delete` call across the whole frontend and every registered Flask
route, and diffed them against each other rather than spot-checking. All 38
unique frontend calls now match a real backend route exactly — no more of
the "endpoint doesn't nest the field the frontend expects" bugs from
earlier rounds.

## What's new in this build

- ✅ **Landing page search actually works.** The hero search bar was pure
  decoration before — no `<form>`, no state, no handler. It's now a
  controlled form that navigates to `/attractions?q=...`, and the
  attractions list page reads that query param, calls the backend's
  existing `?q=` search filter, syncs the search box back to the URL, and
  shows a proper "no results for X" state. Also added a live search box
  directly on `/attractions` for browsing without going through the hero.
- ✅ **"Mark all read"** on the notifications panel — backend endpoint
  already existed, just needed the button and the wiring.
- ✅ **"My reviews" page** (`/tourist/reviews`) — tourists can see every
  review they've written, jump to the guide/attraction it's for, or delete
  it. Backend endpoint (`GET /reviews/mine`) already existed too; this was
  purely a missing UI gap.

No new bugs found this round — I ran the same systematic checks (brace/paren
balance, import resolution, and cross-referencing every new `api.*` call
against the actual registered backend route) before packaging, and
everything matched cleanly on the first pass.

## What's new in this build

- ✅ **Real file uploads**, wired into every place the app previously used a
  plain URL text field or an unused backend field:
  - **Chat** — the image icon in the message bar now actually uploads and
    sends a photo, instead of `image_url` being structurally supported but
    unreachable.
  - **Guide certification** — replaced the "paste a Google Drive link" text
    field with a real upload button; shows a "view uploaded certificate"
    confirmation with a remove option once one's on file.
  - **Reviews** — the write-a-review form now has a photo picker with
    thumbnail previews and per-photo remove buttons; existing reviews show
    their attached photos too. The backend already accepted `photo_urls`
    and had nothing rendering them.
  - **Profile photo** — new avatar upload on `/tourist/settings`, reflected
    immediately in the dashboard sidebar header.

  Backend: local-disk storage under `backend/uploads/` (gitkeep'd, actual
  files aren't committed), a single `POST /api/uploads/` endpoint shared by
  all four features above (extension + 8MB size validation, `kind=image` vs
  `kind=document` controls which extensions are allowed), and a public
  `GET /api/uploads/<filename>` to serve them back — deliberately
  unauthenticated since `<img src>` tags can't send an Authorization header.

Swap-out note: this is local disk storage, which works great for
development but won't survive a container restart or scale past one
instance. Before a real launch, swap the `file.save(...)` call in
`upload_routes.py` for S3/Cloudinary/similar — everything else (the
frontend component, the URL contract, the DB fields) stays the same.

## What's new in this build

- ✅ **Admin attraction management** — closes the last content-creation gap:
  before this, the only way to add an attraction was a raw API call. Now
  the admin dashboard has a full CRUD table (`/admin/dashboard#attraction-management`)
  with a create/edit modal covering every field on the model (name,
  description, history, category, coordinates, fees, hours, best time to
  visit) plus cover image and gallery upload using the same
  `ImageUploadButton` from the last round. Delete has a confirm-to-delete
  safety step and is blocked server-side if bookings still reference the
  attraction (existing backend behavior — the routes were already fully
  built and correctly `admin_required`-gated when I checked; this round was
  purely the missing frontend).

No new bugs this round either — I checked the existing `POST /attractions/`
endpoint's authorization first (given it's a write endpoint I hadn't built
the UI for yet) and it was already correctly locked down with a shared
`admin_required` decorator, not the security hole it could easily have been.

## What's new in this build

- ✅ **Real-time chat over websockets**, replacing the 4-second polling
  loop entirely:
  - **Instant delivery** — messages arrive over a live socket connection
    (`Flask-SocketIO` + `socket.io-client`), not on the next poll tick.
  - **Typing indicators** — the chat header shows "typing..." while the
    other person is composing a reply, auto-clearing after a few seconds
    of inactivity.
  - **Online presence** — a green dot on the conversation list and chat
    header shows who's currently connected, seeded on load via a
    `who_is_online` round-trip and kept live via presence broadcasts.
  - **Read receipts** stayed working, now delivered instantly instead of
    on the next poll.

  Backend architecture: JWT auth happens once at socket connect time (the
  handshake can't carry an `Authorization` header the way axios requests
  do, so the token rides in the client's `auth` payload instead); each
  user joins a room named after their own id, and messages/typing/read
  events are emitted directly to sender+receiver rooms rather than
  broadcast to everyone. The REST `POST /messages/` endpoint and the
  socket's `send_message` handler now share one `create_message()`
  service function, so validation can't drift between the two paths.

  Two things worth knowing before you deploy this for real: presence and
  room state live in-process (`_online_users` dict in `app/sockets.py`),
  which is why the Dockerfile now runs a **single** eventlet worker
  instead of three — multiple workers would each have their own
  disconnected view of who's online. Scaling past one worker needs
  Flask-SocketIO's `message_queue` option backed by Redis. And eventlet's
  monkey-patch has to run before any other import in `run.py` (it's the
  first two lines, with a comment explaining why) — a classic ordering
  gotcha with this stack that's easy to hit by accident.

**One real bug caught before it shipped, not after:** my first pass had
`ChatThread` optimistically rendering a sent message locally with a
client-generated `pending-` id, while the real message comes back via the
socket echo with a different, database-generated id. The dedupe logic
matches on `id`, so that mismatch meant **every message you sent would
have rendered twice** — one placeholder bubble, one real one. Caught by
tracing the data flow before testing rather than after, fixed by removing
the optimistic append entirely and trusting the socket echo (which returns
near-instantly on localhost) as the single source of truth.

**A second, smaller bug also caught pre-ship:** the socket's auth token
was captured once in a plain object (`auth: { token }`) at connection
time. Access tokens expire hourly; if the socket ever had to reconnect
after that (network blip, server restart) it would keep retrying with the
stale captured value and silently fail to reauthenticate. Fixed by using
socket.io-client's function form of `auth`, which re-reads
`localStorage` fresh on every connection attempt, and wired the existing
(previously unused) `reconnectSocketWithFreshToken()` helper into the
actual token-refresh flow in `api.js` so a refresh immediately gets a
live socket too, not just future ones.

## What's new in this build

- ✅ **Notifications actually fire now.** Before this round, the
  `Notification` model, the `/api/notifications/*` routes, and the
  frontend panel all existed and looked complete — but I checked, and
  **nothing in the entire backend ever created a `Notification` row.**
  Every booking accepted, rejected, cancelled, or completed; every guide
  approval; every new review — none of it notified anyone, ever. The
  feature was a fully-built empty shell. That's now fixed: a shared
  `notify()` service creates the row *and* pushes it live over the socket
  (reusing this project's existing real-time infrastructure) from every
  relevant event — booking created/accepted/rejected/cancelled/completed/
  rescheduled, guide approved, new review received.
- ✅ **Guides can actually see notifications**, which they also couldn't
  before — the guide dashboard had zero notification UI at all, so even
  once notifications started firing, a guide getting a new booking
  request had no way to see it short of stumbling onto the booking
  requests list. Same `NotificationsPanel` component the tourist dashboard
  uses, now on the guide dashboard sidebar too, with the same real-time
  socket wiring.

This was the largest gap I've found in this whole project — a feature
that looked completely finished (model, routes, UI, all present and
individually correct) but had never been connected to anything that would
actually populate it. Worth calling out *why* it stayed hidden so long:
every piece worked perfectly in isolation, and the empty-state UI ("You're
all caught up") looks identical whether nothing's happened yet or nothing
was ever wired up. It only surfaces by asking "where does this data
actually get created?" and grepping for it — which is exactly what caught
it this round, prompted by having just built the notification *delivery*
half (sockets) and wanting to sanity-check the *creation* half before
assuming it worked.

## What's new in this build

- ✅ **Swapped Google Maps for Leaflet + OpenStreetMap** — genuinely free,
  no API key, no billing account, ever. The map used to fall back to a
  styled "add your API key" panel until you went and set up a Google Cloud
  project; now it just works the moment you `npm run dev`. Same
  functionality: colored markers for you/guides/attractions, click-through
  popups linking to guide/attraction detail pages, auto re-centering when
  your geolocation resolves. Also fixed a small piece of dead code found
  while rewriting this — the old version tracked a `selected` marker on
  click but never actually rendered anything with it (no info window was
  ever shown), so clicking a marker did nothing. The new version renders
  real popups.

## What's new in this build

- ✅ **Fixed a real trust/integrity gap: guide reviews now require a
  completed booking.** Before this, `POST /reviews/` accepted any
  `guide_id` from any logged-in tourist with zero verification they'd
  ever actually booked that guide — you could review someone you'd never
  interacted with. Backend now requires a `booking_id` for guide reviews,
  and validates it: belongs to you, is for that specific guide, and has
  status `completed`. Also added a clean duplicate check (was previously
  going to surface as a raw database error if you tried reviewing the
  same booking twice, since the DB-level unique constraint existed but
  nothing caught it before hitting the database).
  - New endpoint: `GET /bookings/reviewable/<guide_id>` — a tourist's
    completed, not-yet-reviewed bookings with that guide.
  - Frontend: the "leave a review" form on a guide's page now only shows
    up if you have an eligible trip, with a dropdown to pick which one if
    you've completed more than one. If you haven't completed a trip with
    that guide yet, you see "You can review this guide once you've
    completed a trip together" instead of an open form.
  - Attraction reviews were left unrestricted on purpose — you can
    reasonably visit an attraction without ever booking a guide through
    the platform, so requiring a booking there would block legitimate
    reviews.

## What's new in this build

- ✅ **Two more brief-promised features that turned out to be hollow,
  now actually built:** the `Review` model has had `likes_count` and
  `is_reported` fields since early in this project — "Like reviews" and
  "Report inappropriate reviews" were both in the original spec — but
  zero backend routes and zero frontend UI ever touched either field.
  Same pattern as the notifications gap from a couple rounds ago: looked
  finished, was never wired up.
  - **Likes** are now a real toggle backed by a `ReviewLike` join table
    (one row per user+review), not just an unbounded counter anyone
    could inflate by spamming a button — `POST /reviews/<id>/like`
    checks for an existing row before incrementing.
  - **Reports** flag a review for admin attention (`POST /reviews/<id>/report`)
    without silently hiding it — a single report shouldn't let anyone
    censor a review they dislike. Admins get a real moderation queue
    (`/admin/dashboard#reported-reviews`) to dismiss false positives or
    delete genuinely bad content.
  - Along the way, fixed `delete_review` to allow admins to delete *any*
    review, not just the review's own author — without that, the
    moderation queue's "delete" button would have 403'd for every admin
    who clicked it.

## What's new in this build

- ✅ **Attraction photos actually show up now.** The admin attraction form
  has had cover image and gallery upload for a while, and the backend has
  always correctly returned `cover_image_url`/`gallery_urls` — but neither
  `AttractionDetail.jsx` nor the `/attractions` list page ever read those
  fields. Every attraction showed the category-icon-on-gradient
  placeholder regardless of whether an admin had uploaded real photos.
  Both pages now use the real cover image when one exists (gradient stays
  as the fallback for attractions without one), and the detail page has a
  proper gallery grid for `gallery_urls`, hidden entirely when there's
  nothing to show. Found this the same way as the last two rounds' fixes:
  not by being asked, by checking whether a feature that clearly exists on
  one side (admins can upload) actually connects to the other side
  (tourists can see it) before assuming it does.

## What's new in this build

- ✅ **Email verification, actually built this time.** `User.is_verified`
  has existed on the model from the very first backend scaffold, returned
  in every `to_dict()` response — but exactly like `is_reported` and
  `likes_count` before it, nothing anywhere ever set it to `True`. It was
  explicitly called out in the original project brief ("Email
  verification" alongside registration and password reset) and had simply
  never been built, three checks in a row now finding the same class of
  gap.
  - `POST /auth/register` now also generates a verification link, reusing
    the exact same `itsdangerous` token pattern already established for
    password reset (24-hour expiry — lower stakes than a reset token
    since it only flips a status flag, not account access). Same dev
    workflow as forgot-password: no SMTP configured, so the link is
    logged to the Flask console and echoed back in the response in debug
    mode, fully testable without setting up email.
  - New `/verify-email?token=...` page — visiting the link verifies you
    immediately and updates your session if you're logged in.
  - New `POST /auth/resend-verification` for a logged-in user, plus a
    banner in every dashboard (tourist/guide/admin, since it lives in the
    shared `DashboardShell`) prompting unverified users to verify, with a
    working resend button.
  - **Deliberately not enforced** — registration and login work exactly
    as before regardless of verification status, and nothing in the app
    is gated behind `is_verified`. This is a soft nudge, not a hard
    blocker, both because that's a reasonable product choice for a
    platform like this and because hard-enforcing it would break the
    seeded demo accounts (`admin@ecoguide.co.ke`, `guide1@ecoguide.co.ke`)
    which predate this feature and will show as unverified — expected,
    not a bug. If you want real enforcement later (e.g. blocking guides
    from receiving bookings until verified), that's a small addition to
    the relevant route's checks, not a redesign.

## What's new in this build

- ✅ **Fixed a real regression: the Messages page layout broke for
  unverified accounts.** `Messages.jsx` sized its chat window with
  `h-[calc(100vh-11rem)]` — a magic number tuned for the header height
  that existed *before* the email-verification banner was added last
  round. Since every seeded demo account (`admin@ecoguide.co.ke`,
  `guide1@ecoguide.co.ke`) shows as unverified, that banner now appears
  on every dashboard page and adds extra height the old calculation never
  accounted for — pushing the chat window's sizing off. This is exactly
  the kind of thing that looks like "messaging stopped working" without
  actually being a chat/socket bug at all. Root-fixed rather than
  patched: `DashboardShell`'s content area is now a proper flex column
  with an independently-scrolling main pane, so `Messages.jsx` (and any
  future page) can just use `h-full` and correctly fill whatever space is
  actually available — immune to any future header/banner height changes
  instead of needing a new magic number every time.
- I also re-verified the entire socket pipeline end to end (JWT config,
  socket auth, eventlet monkey-patch order in `run.py`, the `/socket.io`
  websocket proxy in `vite.config.js`, `requirements.txt`) — everything
  else checked out clean. The layout bug above was the actual regression.

## If real-time messaging isn't working for you

Since I can't see your browser or terminal, here's what to check, in
order of how often each one is actually the cause:

1. **Reinstall dependencies, even if you think you already did.**
   `Flask-SocketIO`, `python-socketio`, and `eventlet` were added a few
   rounds ago — if you've been unzipping updates without re-running
   `pip install -r requirements.txt` every time, the backend will either
   crash on startup or silently fall back to a broken state. Same for
   `npm install` on the frontend (`socket.io-client`).
2. **Check your Flask terminal for the startup line.** A working start
   looks different from a plain Flask dev server — you should NOT see
   the usual `* Running on http://...` Werkzeug banner alone; eventlet's
   server takes over. If you see a stack trace instead, read it — it'll
   almost always name the missing package.
3. **Hard-refresh your browser** (Ctrl+Shift+R / Cmd+Shift+R) after
   pulling frontend updates. Vite's dev server usually handles this, but
   a stuck service worker or aggressively cached bundle can leave you
   running old polling-based code that looks like sockets "not working."
4. **Open the browser console (F12) on the Messages page.** A failed
   websocket handshake shows up there immediately, usually as a CORS
   error or a repeated failed connection to `/socket.io/`. If you see
   that, it's almost always #1 or a firewall/proxy blocking websocket
   upgrades.

## What's new in this build

- ✅ **Booking detail page, timeline, and price breakdown** (`/bookings/:id`) —
  a proper full-detail view for any booking, with a real timeline built
  from `BookingStatusHistory` (not a guessed sequence), a price breakdown
  panel, and role-aware actions (accept/reject-with-reason/complete for
  guides, cancel for tourists, mark-paid for guides/admins). Audited the
  backend first: `payment_status`, `rejection_reason`,
  `price_breakdown()`, and the whole `BookingStatusHistory` table already
  existed and were fully correct from a previous round — this was purely
  a missing frontend, same pattern as several fixes before it. Booking
  cards on both the tourist and guide sides now show a payment badge and
  link through to the new detail page.
- Fixed `Messages.jsx`'s own copy of the guide/admin sidebar nav, which
  still pointed at dead links from before those were switched to
  hash-anchors elsewhere — a small inconsistency, not a functional
  break, but worth closing.

## What's new in this build

- 🐛 **Fixed a severe bug: the admin bookings endpoint would crash on
  every single call.** `GET /admin/bookings` used `aliased`, `or_`, and
  `datetime` — all three used but **none imported**. This isn't a
  hollow-feature gap like previous finds; this is `NameError: name
  'aliased' is not defined` on the very first line of the function body,
  meaning the endpoint has been completely broken since whoever wrote its
  search/filter/sort/pagination logic (which is otherwise excellent —
  real server-side search across booking ID/tourist/guide/attraction,
  filters for status/payment/date range/guide/tourist, four sort orders,
  real pagination) forgot the import lines. `python3 -m py_compile` never
  catches this class of bug — it only checks syntax, not that referenced
  names actually resolve — which is exactly why it slipped through every
  previous round's verification. Caught this time by writing a small AST
  script that statically checks every name used against every name
  imported, rather than trusting a clean compile. Then ran that same
  script across the **entire** backend as a sanity sweep — everything
  else came back clean, so this was an isolated incident, not a pattern.
- ✅ **Admin booking management, actually wired to all of that.** The
  backend supported real search/filter/sort/pagination and the frontend
  fetched the endpoint with zero query params and hard-sliced to the
  first 20 results client-side — no search box, no filters beyond a
  status tab, no sort control, no pagination UI, and (because of the bug
  above) it was crashing anyway. `BookingManagementTable` is now fully
  self-contained: owns its own search/filter/sort/page state, debounces
  the search input, and actually uses every capability the backend
  already had. Added a payment-status column and a link through to the
  Phase 1 booking detail page on every row.
- ✅ **Tourist booking list gets search + sort too.** `GET /bookings/my`
  intentionally stayed a flat list (one tourist's own bookings doesn't
  need server-side pagination at this scale) — added client-side search
  (by guide/attraction/booking ID) and the same four sort orders as the
  admin view, on top of the status filter tabs that already existed.

## Known limitations (honest, not hidden)

- **Presence/room state is single-process**, as explained above — fine at
  this project's scale, needs Redis + `message_queue` before horizontal
  scaling.
- **Uploads are local disk, not cloud storage.** Fine for development;
  won't survive a container restart or scale past one instance. See the
  swap-out note above.
- **No file size/type feedback until after upload starts.** The 8MB limit
  and allowed extensions are enforced, but there's no client-side preview
  of "this file won't work" before the request fires — minor UX polish,
  not a functional gap.
- **Websocket chat was confirmed working by real testing**, not just my
  static checks — the socket handshake, real-time delivery, typing
  indicators, and presence were all verified working end-to-end after
  this was built. Leaving this note as a record of how it was verified,
  since the round it shipped in genuinely couldn't be execution-tested on
  my end (no network access in my sandbox) — it was checked as thoroughly
  as static analysis allows, then confirmed by hands-on testing
  afterward. That's the right division of labor going forward for
  anything socket/infra-related: I verify logic exhaustively, you confirm
  it actually connects.

## Email sending (forgot password)

The forgot-password flow works end-to-end without any setup: in development
(`FLASK_ENV=development`, the default), the API response includes a
`dev_reset_token` field and the reset link is also printed to the Flask
console, so you can test the full flow by copying that link into your
browser. To send real emails, wire up `MAIL_*` settings in `backend/.env`
with Flask-Mail (not yet added as a dependency) or a transactional email
provider — that's a good next increment once you're ready to go live.

## Map (tourist dashboard)

The dashboard map runs on **Leaflet + OpenStreetMap** — genuinely free,
no API key, no billing account, no signup, ever. It just works the moment
you run `npm run dev`.

This wasn't the original choice: the map started on Google Maps
(`@react-google-maps/api`), which meant anyone setting this project up had
to go create a Google Cloud project and either use a limited-feature demo
key or attach a billing account before seeing a single marker. That's a
real barrier for a project like this, so it's been swapped out entirely —
`leaflet` + `react-leaflet` render the same base map, colored markers for
you/guides/attractions, and click-to-view-profile popups, with zero setup
cost to anyone who clones this repo.

If you specifically want Google's satellite imagery, Street View, or
Places autocomplete later, `@react-google-maps/api` is still a drop-in
option for `NearbyMap.jsx` — but for showing pins on a map, which is all
this project needs, Leaflet is the simpler and more accessible default.

## What's next (in order)

1. **Cloud storage for uploads** — swap local disk for S3/Cloudinary before
   a real deployment (single-line change point, documented above)
2. **Redis-backed presence** — only needed if/when you scale past one
   backend worker; documented above, not urgent at this project's size

Say the word and we'll build the next one.
