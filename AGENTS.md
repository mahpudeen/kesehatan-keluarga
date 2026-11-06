# AGENTS.md — Catatan Kesehatan Keluarga

Instructions for AI coding agents (Codex, Claude Code, etc.) working in this repo.
Read this whole file before touching code. UI text is Indonesian; code, comments and commits are English.

## 1. What this app is

A mobile-first PWA for tracking family health day by day.

- Per member, per day: `sehat` or `sakit`. If sick: severity (`ringan` / `sedang` / `parah`), symptoms, note.
- A run of sick days belongs to an **episode** (illness name, start/end date, doctor visits, medications).
- Several people (e.g. husband and wife) log into the same **family** with their own Google accounts, via a one-time invite code.
- Data lives in Firestore; the app works offline.

Stack: Vite + React + TypeScript, Tailwind CSS v4, Firebase (Auth with Google, Firestore), vite-plugin-pwa, date-fns.

## 2. Your mission

Refactor the code to **clean, feature-based architecture**, split the navigation into real pages, and upgrade the visual design. **Behavior must not change** unless this file says so.

Today `App.tsx` mixes auth gating, onboarding, layout and every section. Types, Firestore calls, hooks and UI are tangled. Fix that.

## 3. Hard invariants (never break these)

1. **Do not change the Firestore data model**: collection names, field names, and document ID formats stay exactly as they are (see section 4).
2. **Do not edit `firestore.rules`** and never loosen security. Health data is sensitive.
3. **Dates are local strings `YYYY-MM-DD`.** Never use `toISOString()` or UTC for dates. Use the helpers in `shared/lib/date.ts`.
4. **`dayLogs` document ID is `${memberId}_${date}`** (one log per member per day). Writes use `setDoc` on that ID.
5. **Offline-first writes are not awaited by the UI.** Firestore write promises only resolve after the server acknowledges, so offline they stay pending. UI must close sheets and update instantly from the local cache. Pass writes through `fireAndForget(promise)` (logs/reports errors) instead of `await` in event handlers.
6. **Episode semantics**: an episode is open when `endDate === null`. Recording a sick day attaches to the member's open episode, or to an episode covering that date, otherwise creates a new one. "Sembuh" sets `endDate` and marks that day `sehat`. Backdated sick days create an episode with `endDate = that date`.
7. **Invite flow** relies on `joinCode` being written to the family doc together with the `invites/{code}` update in one batch (the rules check it). Keep that batch.
8. **Members are archived, never deleted** (`archived: true`), so history is preserved.
9. Never commit `.env.local`. Never hard-code Firebase config. Env vars keep the `VITE_FB_*` names.
10. Do not `console.log` health data (names, illnesses, symptoms, medications).

## 4. Data model (reference)

```
families/{familyId}              name, ownerUid, memberUids[], joinCode?, createdAt, schemaVersion
  members/{memberId}             name, relation, color, archived, order
  dayLogs/{memberId_YYYY-MM-DD}  memberId, date, status, severity?, symptoms?, note?, episodeId?, updatedBy, updatedAt
  episodes/{episodeId}           memberId, illness, startDate, endDate|null, visits: DoctorVisit[], createdAt
  medications/{medicationId}     episodeId, memberId, name, dose, frequency, startDate, prescribedByDoctor, note, createdAt
invites/{code}                   familyId, createdBy, used, usedBy?, expiresAt, createdAt
```

## 5. Target architecture

Feature-first folders. Path alias `@/` points to `src/` (add it to `tsconfig.app.json` and `vite.config.ts`).

```
src/
  main.tsx                     # mount only
  app/
    App.tsx                    # composes providers + router only (< 40 lines)
    providers.tsx              # AuthProvider > FamilyProvider > MembersProvider
    router.tsx                 # route table
    AppShell.tsx               # page frame: <Outlet/> + <BottomNav/>
    gates.tsx                  # AuthGate (login) and FamilyGate (onboarding)
  features/
    auth/        types.ts · service.ts · AuthContext.tsx · LoginScreen.tsx
    family/      types.ts · service.ts · FamilyContext.tsx · Onboarding.tsx · InvitePanel.tsx
    members/     types.ts · constants.ts · service.ts · MembersContext.tsx · MemberList.tsx · AddMemberForm.tsx
    daylog/      types.ts · constants.ts · service.ts · hooks.ts · TodayPage.tsx
                 components/ MemberDayCard.tsx · StatusButtons.tsx · SickSheet.tsx
    history/     HistoryPage.tsx · components/ CalendarGrid.tsx · MonthHeader.tsx · DayDetailSheet.tsx · calendar.ts (pure)
    episodes/    types.ts · service.ts · hooks.ts · utils.ts (pure) · EpisodeListView.tsx · EpisodeDetailPage.tsx
                 components/ VisitList.tsx · VisitForm.tsx
    medications/ types.ts · service.ts · hooks.ts · components/ MedicationList.tsx · MedicationForm.tsx
    account/     AccountPage.tsx
  shared/
    firebase/    client.ts (init, offline cache) · useCollection.ts · fireAndForget.ts
    ui/          Button · IconButton · Card · Chip · Sheet · ConfirmDialog · EmptyState · Field (Input/Textarea/Select) · Segmented · Avatar · SeverityBadge · Toast · PageHeader · BottomNav
    lib/         date.ts · cn.ts
    constants/   labels.ts (shared Indonesian strings, month/weekday names)
  styles/        index.css (Tailwind import + @theme tokens + base styles)
```

### Layering rules

| Layer | Contains | May import | Must NOT |
|---|---|---|---|
| `types.ts` | interfaces and type aliases only | nothing from React/Firebase | contain logic or JSX |
| `service.ts` | Firestore reads/writes, pure async functions | `shared/firebase`, own `types` | import React |
| `hooks.ts` | React hooks wrapping subscriptions | services, types | render JSX |
| components | presentation and wiring | hooks, `shared/ui`, types | call `firebase/firestore` directly |
| `utils.ts`, `calendar.ts`, `date.ts` | pure functions | types | have side effects |

- **Interfaces live only in `types.ts`** (one per feature). Never define domain interfaces inside component or service files. Component prop types may stay next to their component.
- Features import each other only through public exports of their `index.ts`. No deep imports across features.
- No prop drilling of `familyId` or `uid`: read them from `useFamily()` and `useAuth()`.
- Constants (colors, symptom list, severity config, month names) live in `constants.ts`. No magic strings in JSX.
- One exported component per file. Components over ~120 lines must be split. Functions over ~40 lines must be split.
- Strict TypeScript. No `any`, no `@ts-ignore`, no non-null `!` without a comment. No unused imports or variables.
- Named exports for everything except route-level pages and `App`.

### Patterns to introduce

- `useCollection<T>(query)` in `shared/firebase`: one generic subscription hook returning `{ data, loading, error }`. Replace the copy-pasted `onSnapshot` effects in `useMembers`, `useDayLogs`, `useMonthLogs`, `useOpenEpisodes`, `useAllEpisodes`, `useMedications`.
- `MembersProvider`: subscribe to members once, not in every screen.
- Services take a single **object parameter** when they have more than 3 arguments. Example: `saveSickDay({ familyId, memberId, date, uid, input, episodeId, newEpisodeEndDate })` instead of positional args.
- `findEpisodeForDate(episodes, memberId, date)` lives in `episodes/utils.ts` and is shared by Today and History (currently duplicated).
- Replace `window.confirm` with `<ConfirmDialog>`. Replace silent `console.error` with a toast through `fireAndForget`.
- Forms: keep state in a small hook per form (`useVisitForm`, `useMedicationForm`) rather than 6 `useState` calls inside one big component.

## 6. Navigation (separate pages, not one long scroll)

Use `react-router-dom` with `BrowserRouter`. A fixed **bottom tab bar** with four tabs:

| Tab | Route | Content |
|---|---|---|
| Hari ini | `/` | One `MemberDayCard` per active member with Sehat / Sakit; open sick episode with "Sembuh" |
| Riwayat | `/riwayat` | Segmented control **Kalender \| Penyakit**. Calendar with member filter and day detail sheet; list of episodes |
| Keluarga | `/keluarga` | Member list, add and archive member, invite partner (owner only) |
| Akun | `/akun` | Signed-in user, family name, sign out, JSON export (leave a clearly marked TODO if not implemented) |

- Episode detail is its own page: `/riwayat/penyakit/:episodeId` with a back button (deep-linkable, easier than a modal on mobile). Doctor visits and medications are sections on that page.
- Sick form (`SickSheet`) and day detail (`DayDetailSheet`) are **bottom sheets**.
- `AppShell` renders the page and the tab bar. Respect the device safe area: `padding-bottom: env(safe-area-inset-bottom)` on the bar, and leave scroll room so content is never hidden behind it.
- Gating order: `AuthGate` (not signed in → `LoginScreen`) → `FamilyGate` (no family → `Onboarding`) → `AppShell`.
- Firebase Hosting must rewrite all paths to `/index.html` (`firebase.json`, `"rewrites": [{ "source": "**", "destination": "/index.html" }]`). Keep the PWA `navigateFallback` working.

## 7. Visual design

Goal: calm, trustworthy, easy to use one-handed at 2 a.m. with a sick child. Not a generic SaaS template.

### Rules

- **Tailwind v4 tokens in `src/styles/index.css` via `@theme`.** Components use token-based utilities (`bg-surface`, `text-ink-muted`, `bg-sev-sedang`), not raw hex values or one-off arbitrary values.
- Extract repeated class strings into `shared/ui` components. If the same long class list appears twice, make a component. Use a small `cn()` helper (`clsx` + `tailwind-merge`) for conditional classes.
- Mobile-first. Content column `max-w-md mx-auto`. Touch targets at least 44×44 px; primary actions (Sehat / Sakit) are large.
- **Do not make everything an identical white rounded card.** Use hierarchy: a member row has a colored `Avatar` (initial on the member's color) and a thin member-color accent; sheets use larger radius than cards; chips are fully rounded; use dividers or spacing where a card isn't needed.
- No gradient washes, no decorative blobs, no emoji as UI (replace 🟩🟨🟧🟥 legend with real colored dots), no ALL-CAPS tracked labels, no motion except responses to taps (sheet slide-up, button press). Respect `prefers-reduced-motion`.
- Icons: `lucide-react`, consistent 20–24 px stroke icons. Every icon-only button has an `aria-label`.
- Accessibility: visible `:focus-visible` ring, color is never the only signal (severity always has a text label too), contrast AA, form inputs have labels, sheets trap focus and close on Escape and backdrop tap.
- Empty and error states tell the user what to do ("Belum ada anggota. Tambahkan anggota pertama di tab Keluarga.").
- Copy: sentence case, plain Indonesian, active verbs ("Simpan", "Tandai sembuh"). The same action keeps the same name everywhere.

### Starting token set (adjust only with good reason)

```css
@import "tailwindcss";

@theme {
  --font-sans: "Plus Jakarta Sans Variable", system-ui, sans-serif;

  --color-bg: #f4f8f6;
  --color-surface: #ffffff;
  --color-line: #dde7e2;
  --color-ink: #14231d;
  --color-ink-muted: #5b6b63;

  --color-primary: #0f766e;
  --color-primary-strong: #0b5a54;
  --color-primary-soft: #d9f0ec;

  --color-sev-sehat: #3ba776;
  --color-sev-ringan: #f2c230;
  --color-sev-sedang: #f08a24;
  --color-sev-parah: #d93b3b;
  --color-unrecorded: #e6ece9;

  --radius-control: 0.875rem;
  --radius-card: 1rem;
  --radius-sheet: 1.5rem;
}
```

- Typeface: **Plus Jakarta Sans** (Indonesian-designed), self-hosted for offline PWA use: `npm i @fontsource-variable/plus-jakarta-sans` and import it in `main.tsx`. One family only; hierarchy through size and weight (400 / 600 / 700).
- Severity colors are the single source of truth for the calendar, badges and buttons. Define the severity → token mapping once in `daylog/constants.ts` and reuse it.
- Member colors (`members/constants.ts`) stay a fixed palette, chosen to remain distinguishable from the severity colors.
- Set `<meta name="theme-color">` and the manifest `theme_color` to the primary color if it changes.

## 8. Known smells to fix

- `App.tsx` contains gating, onboarding, layout and every section.
- Domain interfaces are declared inside service/hook files (`Family`, `Member`, `DayLog`, `Episode`, ...). Move to each feature's `types.ts`.
- `History.tsx` is huge (calendar math, filtering, day editor, sick form wiring). Split: pure grid builder in `calendar.ts`, `CalendarGrid`, `MonthHeader`, `DayDetailSheet`.
- `EpisodeDetail.tsx` has ~14 `useState` calls and two forms. Split into `VisitList` / `VisitForm` / `MedicationList` / `MedicationForm` with form hooks.
- `Today` and `History` both render Sehat / Sakit buttons and duplicate episode lookup. Share `StatusButtons` and `findEpisodeForDate`.
- Repeated `onSnapshot` boilerplate in six hooks (use `useCollection`).
- Long repeated Tailwind class strings (inputs, buttons, chips). Move into `shared/ui`.
- Hard-coded Indonesian strings, month names, symptom list and color arrays inside components.
- `confirm()` calls; `console.error` as the only error handling.

## 9. Workflow

Work in **small phases**. After each phase run the checks (section 10), then commit. Do not start the next phase with a broken build. Do not mix a refactor and a redesign in one commit.

1. **Baseline**: confirm `npm run build` and `npm run lint` pass. Add `@/` alias, Prettier config (single quotes, semicolons, 2 spaces, 100 cols), and fix lint/format only.
2. **Types and services**: create per-feature `types.ts` and `service.ts`; move interfaces and Firestore calls out of components and hooks. Add `shared/firebase` (`client`, `useCollection`, `fireAndForget`) and `shared/lib/date.ts`. No UI change.
3. **Contexts and hooks**: `AuthContext`, `FamilyContext`, `MembersContext`; remove `familyId` / `uid` prop drilling.
4. **Design system**: add tokens, font, `cn()`, and the `shared/ui` components. Restyle existing screens with them. Layout stays as is for now.
5. **Navigation**: router, gates, `AppShell`, `BottomNav`, and the four pages; move sections into their pages. Add Hosting rewrite.
6. **Split big components**: History, EpisodeDetail (now a page), Today, forms. Sheets and `ConfirmDialog`.
7. **Polish and a11y**: empty/error states, toasts, focus handling, reduced motion, safe-area spacing, PWA icon/theme color check.
8. **Optional**: Vitest unit tests for pure functions (`date.ts`, `calendar.ts`, `episodes/utils.ts`).

Commit messages: Conventional Commits (`refactor(daylog): extract service and types`, `feat(ui): add bottom navigation`).

At the end of each phase, report: what moved, what changed, and anything you deliberately left alone. If a request in this file conflicts with an invariant in section 3, the invariant wins; say so.

## 10. Definition of done (every phase)

- `npm run build` succeeds with no TypeScript errors; `npm run lint` is clean.
- Manual smoke test still passes:
  1. Google sign-in and sign-out; refresh keeps the session.
  2. Create a family (new account) and join with an invite code (second account).
  3. Add, list and archive members.
  4. Today: mark Sehat; mark Sakit with severity, symptoms and illness; second Sakit continues the open episode; Sembuh closes it.
  5. Calendar: colors by severity; member filter; open a past day and record Sehat / Sakit; future days are not editable.
  6. Episode: add and remove a doctor visit and a medication (resep dokter / beli sendiri).
  7. Offline (DevTools → Network → Offline): app loads; logging works; data syncs when back online.
  8. `npm run build && npm run preview`: PWA installable, service worker active.
- No Firestore schema or rules changes. No new `any`. No new console noise.
