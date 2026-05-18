# Resume Notes — Next-Game Lookup App

_Last session: 2026-05-17. Use this to get back up to speed quickly._

## Where things stand

- App is built and merged to `main` (PR #1).
- Live site: <https://tdibella-personal.github.io/may-project/>
- GitHub Pages is configured to "GitHub Actions" source. Every push to `main` rebuilds and redeploys via `.github/workflows/deploy.yml`.
- `teams.md` at repo root is the single source of truth for the list. Edit it on GitHub; a redeploy kicks off automatically.

## First thing to check on resume

1. Open the **Actions** tab. Confirm the most recent "Deploy to GitHub Pages" run is green.
2. Visit the live site. Confirm cards render with logos + dates.
3. If anything looks broken, scroll to "Troubleshooting" below.

## How to change the list

Edit `teams.md` directly on GitHub (pencil icon → commit to main). Format:

```md
## Teams
- Boston Celtics (NBA)
- Arsenal (English Premier League)

## Events
- Wimbledon Men's Final
- Daughter's piano recital
```

- `(...)` after a team is an optional sport/league hint to disambiguate names.
- Anything not under `## Teams` or `## Events` is ignored, so you can leave notes.

## Architecture (one paragraph)

Static Vite + React + TypeScript app. On load, browser fetches `teams.md` from `raw.githubusercontent.com`, parses it, hits TheSportsDB's free tier (public key `3`) in parallel for each entry, and renders cards sorted by upcoming date. No server, no database.

## Key files

- `teams.md` — your list. Edit here.
- `src/App.tsx` — orchestrates fetch → parse → lookup → render.
- `src/lib/parseTeamsMd.ts` — markdown parser. Pure function.
- `src/lib/sportsDb.ts` — TheSportsDB client. Endpoints: `searchteams.php`, `searchevents.php`, `eventsseason.php`. 10-minute sessionStorage cache.
- `src/lib/format.ts` — date formatting + per-sport season string + future-event filter.
- `src/components/ScheduleCard.tsx` — card UI with logo fallback.
- `vite.config.ts` — `base: '/may-project/'` (required for GH Pages).
- `.github/workflows/deploy.yml` — build + publish on push to main.

## Known constraint

TheSportsDB's `eventsnext.php` is Patreon-only. We use `eventsseason.php` and pick the earliest future game from the current season. The `currentSeasonForSport` helper in `src/lib/format.ts` decides whether the season string is `"2025-2026"` (NBA, NFL, EPL, NHL) or `"2026"` (MLB, F1, cycling, tennis). If you add a sport that doesn't fit either pattern, extend that function.

## Common next tasks (with starting points)

- **Add a new sport that returns no games** → check `currentSeasonForSport` in `src/lib/format.ts:33`. The sport's season string is probably wrong.
- **A team logo isn't showing** → likely the wrong team got picked. In `src/lib/sportsDb.ts:60` `pickTeamByHint` picks the first match if the hint doesn't catch. Try a more specific `(League Name)` in `teams.md`.
- **Want to show 2 upcoming games per team instead of 1** → `findNextGameForTeam` in `src/lib/sportsDb.ts` returns `upcoming[0]`; return `upcoming.slice(0, 2)` and update `App.tsx` to fan out.
- **Want to add styling/theme tweaks** → `src/styles.css`. Dark mode is the default; light mode swaps in via `@media (prefers-color-scheme: light)`.
- **Want a non-sport event to show a custom image** → today there's no hook for that; would need a new optional `image:` field in `teams.md` syntax and parser support.

## Local dev (when you want to test changes before pushing)

```sh
npm install
npm run dev
# open http://localhost:5173/may-project/
```

Production check: `npm run build` (must pass before pushing — the GH Actions workflow runs the same command).

## Branches

- `main` — live, deployed.
- `claude/team-schedule-lookup-app-iPRme` — original feature branch (merged via PR #1, can be deleted).
- No open PRs.

## Troubleshooting

- **Actions run failed in `build`**: open the run, copy the error, share it. Most likely a TypeScript error from an edit.
- **Actions run failed in `deploy` with "Pages not enabled" or environment protection error**: Settings → Pages → Source must be "GitHub Actions". Re-run failed jobs.
- **Site loads but no cards appear**: open browser DevTools → Network. Look for failed calls to `thesportsdb.com`. If 429, you're rate-limited (10-min cache should normally prevent this; clear sessionStorage to retry).
- **Card shows "Team not found"**: TheSportsDB doesn't recognize the spelling. Try the team's full official name (e.g. "Arsenal FC" instead of "Arsenal", or "New York Yankees" instead of "Yankees").
- **Card shows "No upcoming game found this season"**: off-season or the season string is wrong for that sport — see `currentSeasonForSport` notes above.

## Open questions / nice-to-haves (not committed)

- Manual refresh button (currently a hard reload is needed to bypass the 10-min cache).
- Group cards by team vs. event, instead of one flat date-sorted list.
- Show a small "auto-refresh in Nm" countdown.
- Cache `teams.md` parse result for snappier re-renders.

None of these are needed — flag if any sound worth picking up.
