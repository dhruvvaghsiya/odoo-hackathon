# GlobeTrotter Frontend — Task Tracker

## Phase 1 — Project Scaffold & Design System
- [x] Initialize Vite + React project structure
- [x] Configure package.json with dependencies
- [x] Configure Vite (proxy to :5000, React, Tailwind v4)
- [x] Create design system CSS (tokens, paper/ink/terracotta/olive palette, fonts, utilities)
- [x] Create main.jsx entry point and HTML head with typography links

## Phase 2 — Core Architecture & Reusable Components
- [x] API services (api, auth, trips, cities, activities, budget, expenses, share, search, notifications, admin, users)
- [x] AuthContext & ToastContext + useAuth hook
- [x] AppRouter + ProtectedRoute
- [x] AppShell layout + Header + Navigation
- [x] Reusable visual components (DestinationMarker, RouteLine, TripDateLabel, PageHeader, SectionLabel, Modal, Drawer, EmptyState, LoadingState, ErrorState, NotificationBell, BudgetBar, CityCard, ActivityCard, TripCard, ExpenseForm)

## Phase 3 — Authentication Pages
- [x] Login page with editorial travel layout & quick demo persona selector
- [x] Signup page with passport creation
- [x] ForgotPassword page

## Phase 4 — Dashboard & My Trips
- [x] Dashboard page with upcoming expedition hero, countdown, recent journeys, curated cities
- [x] MyTrips archive with search and date sorting
- [x] CreateTrip page with date, budget, currency, and public sharing toggle

## Phase 5 — Itinerary Builder (Signature Feature)
- [x] ItineraryBuilder (Journey Canvas) page with real backend APIs
- [x] JourneyRoute signature vertical route visualization with markers & reordering
- [x] CityDiscovery drawer with search and region filters
- [x] ActivityDiscovery drawer with type categories and instant add

## Phase 6 — Timeline & Budget
- [x] Timeline page with time typography and chronological flow
- [x] Budget Journal page with Recharts category donut & daily spending charts
- [x] Intelligent deterministic recommendations & over-budget alerts
- [x] Expense ledger table & ExpenseForm modal

## Phase 7 — Sharing & Public Trip
- [x] Share story modal with copyable public URL
- [x] PublicTrip digital magazine view with destination spreads and real backend trip cloning

## Phase 8 — Profile, Admin & Polish
- [x] Profile page for passport management
- [x] Admin console with platform analytics, user registry, and system-wide trips ledger
- [x] Discover standalone search page
