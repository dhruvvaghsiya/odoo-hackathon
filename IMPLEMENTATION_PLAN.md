# GlobeTrotter — Journey Canvas Frontend Implementation Plan

Build a premium, hackathon-winning React frontend for GlobeTrotter that feels like a travel-planning instrument — not another generic dashboard.

---

## Backend Summary (No Changes)

The backend is **fully built** (Node.js + Express + PostgreSQL) with:
- **Auth**: signup, login, logout, getMe (JWT Bearer tokens)
- **Cities**: list, search, popular, get by ID, city activities (public)
- **Activities**: list, search, popular, get by ID (public)
- **Unified Search**: `GET /api/search?q=` across cities + activities
- **Trips**: CRUD (authenticated, user-scoped)
- **Trip Stops**: CRUD + reorder (city-based stops with dates & ordering)
- **Trip Activities**: CRUD per stop (scheduled to a stop with dates/times)
- **Itinerary**: full trip view with stops, cities, summary
- **Timeline**: day-by-day schedule with activities, costs
- **Expenses**: CRUD per trip (categorized: TRANSPORT, STAY, ACTIVITY, MEAL, OTHER)
- **Budget**: summary + detailed analysis (spending by category/day, projections, recommendations)
- **Sharing**: create/toggle/delete share link, public trip view, copy trip
- **Notifications**: list, mark read, mark all read
- **Admin**: analytics, list users, list trips (admin role)
- **API format**: `{ success, message, data, error }` — consistent everywhere
- **Server**: port 5000, CORS origin `http://localhost:3000`

Demo accounts (password: `password123`): `alice@example.com` (user), `bob@example.com` (user), `charlie@example.com` (admin)

---

## Proposed Changes

### Phase 1 — Project Scaffold & Design System

> This phase establishes the entire visual identity. Every subsequent phase builds on these tokens.

#### [NEW] `client/` — Vite + React project

```
npx -y create-vite@latest ./ --template react
```

Install dependencies:
```
npm i react-router-dom axios lucide-react motion recharts
npm i -D tailwindcss @tailwindcss/vite
```

Configure Vite to proxy `/api` to `http://localhost:5000` so no CORS issues during dev.

#### [NEW] `client/src/styles/index.css`

The Journey Canvas design system as CSS custom properties + Tailwind v4 config:
- **Colors**: warm paper `#FAF7F2`, deep ink/navy `#1B2432`, terracotta/coral `#C4654A`, olive/forest `#5B7553`, warm grays
- **Typography**: Google Fonts — `DM Serif Display` for display headings, `Inter` for body
- **Spacing/shapes**: editorial whitespace, minimal rounding (2px–6px, never pill-shaped)
- **Surface treatments**: subtle grain texture via SVG noise, topographic line patterns as CSS backgrounds
- **Utilities**: `.travel-stamp`, `.route-line`, `.date-label`, `.coordinates`, `.section-label`

#### [NEW] `client/src/main.jsx`

Entry point with `BrowserRouter`, `AuthProvider`, `App` component.

---

### Phase 2 — Core Architecture & Reusable Components

#### [NEW] `client/src/services/api.js`

Axios instance with:
- `baseURL: '/api'` (proxied by Vite)
- Request interceptor: attach `Authorization: Bearer <token>` from localStorage
- Response interceptor: unwrap `response.data.data`, handle 401 → logout

#### [NEW] `client/src/services/auth.js`

`login(email, password)`, `signup(name, email, password)`, `getMe()`, `logout()`

#### [NEW] `client/src/services/trips.js`

All trip CRUD, stops, activities, itinerary, timeline

#### [NEW] `client/src/services/cities.js`

City list, search, popular, get by ID, city activities

#### [NEW] `client/src/services/activities.js`

Activity list, search, popular

#### [NEW] `client/src/services/budget.js`

Budget summary, budget analysis

#### [NEW] `client/src/services/expenses.js`

Expense CRUD

#### [NEW] `client/src/services/share.js`

Share CRUD, public trip, copy trip

#### [NEW] `client/src/services/notifications.js`

List, mark read, mark all read

#### [NEW] `client/src/services/admin.js`

Analytics, list users, list trips

#### [NEW] `client/src/services/search.js`

Unified search

#### [NEW] `client/src/context/AuthContext.jsx`

React Context for auth state: `user`, `token`, `login()`, `signup()`, `logout()`, `loading`. Persists token in localStorage, auto-fetches `/api/auth/me` on mount.

#### [NEW] `client/src/hooks/useAuth.js`

Convenience hook wrapping `useContext(AuthContext)`.

#### [NEW] `client/src/routes/AppRouter.jsx`

React Router v6 with:
- Public routes: `/login`, `/signup`, `/forgot-password`, `/trip/:token` (public itinerary)
- Protected routes (require auth): `/`, `/trips`, `/trips/new`, `/trips/:id`, `/trips/:id/timeline`, `/trips/:id/budget`, `/trips/:id/share`, `/profile`, `/discover`
- Admin routes: `/admin` (require admin role)
- `ProtectedRoute` wrapper component

#### [NEW] `client/src/routes/ProtectedRoute.jsx`

Redirects to `/login` if not authenticated.

#### Reusable Components — `client/src/components/`

| Component | Purpose |
|---|---|
| `AppShell.jsx` | Main layout with header + navigation + content area |
| `Header.jsx` | Top bar: logo, nav links, user avatar, notification bell |
| `Navigation.jsx` | Desktop side nav / mobile bottom nav |
| `PageHeader.jsx` | Section title with coordinates, date labels, travel stamps |
| `SectionLabel.jsx` | Editorial section marker ("YOUR DESTINATIONS", "BUDGET") |
| `Button.jsx` | Primary, secondary, ghost variants with loading state |
| `IconButton.jsx` | Icon-only button with tooltip |
| `Input.jsx` | Text input with label, validation, error state |
| `Select.jsx` | Styled select dropdown |
| `Modal.jsx` | Accessible modal dialog with keyboard trap |
| `Drawer.jsx` | Side/bottom drawer with animation |
| `Toast.jsx` | Notification toast system |
| `EmptyState.jsx` | Meaningful empty state with illustration and action |
| `LoadingState.jsx` | Skeleton loading patterns |
| `ErrorState.jsx` | Error message with retry action |
| `DestinationMarker.jsx` | City marker (● dot + name + country) for route visualization |
| `RouteLine.jsx` | SVG vertical journey line connecting destinations |
| `TripDateLabel.jsx` | Large date range display ("12 JUN — 14 JUN") |
| `TravelStamp.jsx` | Decorative travel stamp label |
| `ImageFrame.jsx` | Image with reveal transition and focal point cropping |

---

### Phase 3 — Authentication Pages

#### [NEW] `client/src/pages/Login.jsx`

- Editorial travel composition layout (NOT a centered card)
- Left: large destination photography with travel metadata, coordinates, tagline ("YOUR NEXT JOURNEY STARTS HERE")
- Right: login form (email, password, submit, link to signup)
- Mobile: intelligently stacked composition
- Real API: `POST /api/auth/login`
- On success: store token, redirect to dashboard
- Validation, loading state, error handling

#### [NEW] `client/src/pages/Signup.jsx`

- Same editorial composition style
- Name, email, password, confirm password
- Real API: `POST /api/auth/signup`
- Tagline: "PLAN • DISCOVER • GO"

#### [NEW] `client/src/pages/ForgotPassword.jsx`

- Simple editorial form (no backend endpoint exists — show "coming soon" or email-sent confirmation UI)

---

### Phase 4 — Dashboard & My Trips

#### [NEW] `client/src/pages/Dashboard.jsx`

- **NOT** a generic SaaS dashboard
- Editorial asymmetric layout with:
  - Hero: "Good morning, Alice" + upcoming trip card with destination photo, route preview, countdown
  - Recent trips: 2–3 trip cards with cover images, route labels, city count, date range
  - New Trip CTA: prominent, editorial
  - Popular Destinations: horizontal scroll of city cards from `GET /api/cities/popular`
  - Quick budget snapshot from most recent trip
- Real APIs: `GET /api/trips`, `GET /api/cities/popular`

#### [NEW] `client/src/pages/MyTrips.jsx`

- Trip archive with editorial card layouts (NOT identical card grid)
- Each trip: cover image, trip name, date range, city sequence labels, city count, stop count
- Empty state: "YOUR FIRST JOURNEY AWAITS" with create action
- Sort/filter controls
- Real API: `GET /api/trips`

#### [NEW] `client/src/pages/CreateTrip.jsx`

- Modal or full-page form: trip name, description, start date, end date, budget, currency
- Clean editorial styling
- Real API: `POST /api/trips`
- On success: redirect to itinerary builder

---

### Phase 5 — Itinerary Builder (Signature Feature)

> This is the hero feature — the Journey Route visualization. Must feel like physically building a journey.

#### [NEW] `client/src/pages/ItineraryBuilder.jsx`

- **Journey Route visualization** as the primary interface:
  ```
  START
    │
    ● PARIS  ─── 15 JUN — 20 JUN
    │
    ● ZURICH ─── 20 JUN — 24 JUN
    │
    ● MILAN  ─── 24 JUN — 27 JUN
    │
    END
  ```
- SVG/CSS route line with destination markers
- Each stop shows: city name, country, dates, activity count, cost summary
- Expandable stops reveal activities inside
- **Add City** button opens city discovery drawer
- **Reorder** via drag-and-drop (or arrow buttons for accessibility)
- Trip header: trip name, total dates, city count, total budget
- Real APIs:
  - `GET /api/trips/:id/itinerary`
  - `POST /api/trips/:tripId/stops` (add city)
  - `DELETE /api/trips/:tripId/stops/:stopId` (remove city)
  - `PATCH /api/trips/:tripId/stops/reorder`
  - `POST /api/trips/:tripId/stops/:stopId/activities` (add activity)
  - `DELETE /api/trips/:tripId/stops/:stopId/activities/:id`

#### [NEW] `client/src/components/JourneyRoute.jsx`

The signature route visualization component:
- Vertical SVG line with animated drawing
- `DestinationMarker` at each stop
- Date labels between stops
- Staggered reveal animation on load
- Adding a city → marker appears → route extends → city info enters

#### [NEW] `client/src/components/CityDiscovery.jsx`

Immersive search drawer/modal:
- Search input with `GET /api/cities/search?q=`
- Filters: country, region, cost range
- City results: image, name, country, cost index, popularity
- "Add to Trip" button per city
- Also accessible from: `GET /api/cities`, `GET /api/cities/popular`

#### [NEW] `client/src/components/ActivityDiscovery.jsx`

Search drawer for activities:
- Triggered from within a stop/city context
- Search with `GET /api/activities/search?q=`
- Filters: type, cost range, duration
- Activity results: image, name, description, type, cost, duration
- "Add" button: `POST /api/trips/:tripId/stops/:stopId/activities`
- Also shows city-specific activities: `GET /api/cities/:cityId/activities`

---

### Phase 6 — Timeline & Budget

#### [NEW] `client/src/pages/Timeline.jsx`

- Day-by-day timeline with journey line visualization:
  ```
  DAY 01 — 15 JUNE — PARIS
  
  09:00 ──● Eiffel Tower          €25    2h
           │
  12:30 ──● Lunch at Café         €35    1h
           │
  15:00 ──● Louvre Museum          €17    3h
  ```
- Strong time typography
- Vertical journey line connecting activities
- Day/destination context header
- Activity cost and duration
- Daily cost summary
- Expandable days
- Real API: `GET /api/trips/:tripId/timeline`

#### [NEW] `client/src/pages/Budget.jsx`

- Travel expense journal feel (NOT analytics wall):
  - Large budget progress bar: total budget → spent → remaining
  - Percentage used with animated counter
  - "₹16,750 REMAINING" with editorial warnings
  - Average daily cost
  - Category breakdown (donut chart via Recharts): TRANSPORT, STAY, ACTIVITY, MEAL, OTHER
  - Spending by day (bar chart)
  - Over-budget day warnings: "DAY 04 IS RUNNING HOT"
  - Projected cost
  - Recommendations from backend
- Add Expense button → modal
- Real APIs: `GET /api/trips/:tripId/budget`, `GET /api/trips/:tripId/budget/analysis`
- Animated progress bar and number transitions

#### [NEW] `client/src/components/ExpenseForm.jsx`

Modal form for adding/editing expenses:
- Category select (TRANSPORT, STAY, ACTIVITY, MEAL, OTHER)
- Amount, currency, date, description
- Real APIs: `POST/PATCH /api/trips/:tripId/expenses`

---

### Phase 7 — Sharing & Public Trip

#### [NEW] `client/src/pages/ShareTrip.jsx`

- Share controls within trip view:
  - Create share link: `POST /api/trips/:tripId/share`
  - Copy URL to clipboard
  - Toggle active/inactive: `PATCH /api/trips/:tripId/share`
  - Delete share: `DELETE /api/trips/:tripId/share`

#### [NEW] `client/src/pages/PublicTrip.jsx`

- Premium digital travel magazine layout (distinct from private dashboard):
  - Large destination photography
  - Route visualization (city sequence)
  - Day-by-day itinerary
  - Activity details
  - Cost summary
  - No editing controls
  - "Copy Trip" button (requires auth): `POST /api/public/trips/:token/copy`
  - Share URL display
- Real API: `GET /api/public/trips/:token`
- Accessible without authentication

---

### Phase 8 — Profile, Admin & Polish

#### [NEW] `client/src/pages/Profile.jsx`

- Profile settings: name, email, photo, language
- Real APIs: `GET /api/users/me`, `PATCH /api/users/me`
- Delete account: `DELETE /api/users/me` with confirmation

#### [NEW] `client/src/pages/Admin.jsx`

- Admin-only page (role check)
- Platform analytics from `GET /api/admin/analytics`
- User list from `GET /api/admin/users`
- Trip list from `GET /api/admin/trips`
- Editorial data presentation (not generic table)

#### [NEW] `client/src/pages/Discover.jsx`

- City + activity discovery page (standalone, not just drawer)
- Popular cities, search, filters
- Browse activities by type
- Real APIs: cities + activities endpoints

---

## Final File Structure

```
client/
├── index.html
├── vite.config.js
├── package.json
├── public/
│   └── fonts/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── styles/
│   │   └── index.css              ← Design system + Tailwind
│   ├── assets/
│   │   └── images/
│   ├── components/
│   │   ├── AppShell.jsx
│   │   ├── Header.jsx
│   │   ├── Navigation.jsx
│   │   ├── PageHeader.jsx
│   │   ├── SectionLabel.jsx
│   │   ├── Button.jsx
│   │   ├── IconButton.jsx
│   │   ├── Input.jsx
│   │   ├── Select.jsx
│   │   ├── Modal.jsx
│   │   ├── Drawer.jsx
│   │   ├── Toast.jsx
│   │   ├── EmptyState.jsx
│   │   ├── LoadingState.jsx
│   │   ├── ErrorState.jsx
│   │   ├── DestinationMarker.jsx
│   │   ├── RouteLine.jsx
│   │   ├── TripDateLabel.jsx
│   │   ├── TravelStamp.jsx
│   │   ├── ImageFrame.jsx
│   │   ├── JourneyRoute.jsx
│   │   ├── CityDiscovery.jsx
│   │   ├── ActivityDiscovery.jsx
│   │   ├── CityCard.jsx
│   │   ├── ActivityCard.jsx
│   │   ├── TripCard.jsx
│   │   ├── BudgetBar.jsx
│   │   ├── ExpenseForm.jsx
│   │   └── NotificationBell.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── Dashboard.jsx
│   │   ├── MyTrips.jsx
│   │   ├── CreateTrip.jsx
│   │   ├── ItineraryBuilder.jsx
│   │   ├── Timeline.jsx
│   │   ├── Budget.jsx
│   │   ├── ShareTrip.jsx
│   │   ├── PublicTrip.jsx
│   │   ├── Profile.jsx
│   │   ├── Discover.jsx
│   │   └── Admin.jsx
│   ├── routes/
│   │   ├── AppRouter.jsx
│   │   └── ProtectedRoute.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── trips.js
│   │   ├── cities.js
│   │   ├── activities.js
│   │   ├── budget.js
│   │   ├── expenses.js
│   │   ├── share.js
│   │   ├── search.js
│   │   ├── notifications.js
│   │   └── admin.js
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   └── useAuth.js
│   └── utils/
│       ├── formatDate.js
│       ├── formatCurrency.js
│       └── constants.js
```

---

## Open Questions

1. **TailwindCSS version**: The spec says "Tailwind CSS". Tailwind v4 (latest) uses CSS-first config with `@import "tailwindcss"` and `@tailwindcss/vite` plugin — no `tailwind.config.js` needed. **I'll use Tailwind v4** unless you prefer v3.

2. **Destination images**: The cities in the seed data have `image: NULL`. For demo purposes, should I:
   - **(a)** Use Unsplash source URLs (free, no API key) like `https://images.unsplash.com/photo-...?w=800`
   - **(b)** Generate images using the image generation tool and bundle as static assets
   - **(c)** Leave images null and show clean placeholder states with city initials

3. **Execution approach**: Given the size (~50+ files), I recommend executing in the 8 phases above, each producing a runnable state. Should I proceed phase-by-phase, or build the entire frontend in one pass?

---

## Verification Plan

### Per-Phase Verification
```bash
cd client && npm run dev    # Verify Vite dev server starts at :3000
```

### Phase-by-Phase Checks
1. **Phase 1**: Dev server starts, design tokens render, fonts load
2. **Phase 2**: Components render in isolation, API service files import correctly
3. **Phase 3**: Login with `alice@example.com` / `password123` succeeds, token stored, redirect works
4. **Phase 4**: Dashboard shows trips from API, popular cities load, create trip works
5. **Phase 5**: Itinerary builder shows journey route, add/remove cities, add activities
6. **Phase 6**: Timeline shows day-by-day schedule, budget shows analysis with charts
7. **Phase 7**: Share link creation, public trip page renders without auth, copy trip works
8. **Phase 8**: Profile update works, admin page shows analytics

### Final Demo Flow
Login → Dashboard → Create 'European Summer' → Add Paris → Add Zurich → Add activities → Reorder → Timeline → Budget → Share → Public itinerary → Copy trip
