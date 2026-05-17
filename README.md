# May-Project

A small web app that reads `teams.md` from this repo and shows the next game or
event for each entry. Edit `teams.md` directly on GitHub — the app re-reads it
on every load.

Live site: <https://tdibella-personal.github.io/may-project/>

## Editing your list

`teams.md` uses two sections. The optional `(...)` next to a team is a sport or
league hint used to disambiguate when several teams share a name.

```md
## Teams
- Boston Celtics (NBA)
- Arsenal (English Premier League)

## Events
- Wimbledon Men's Final
- Daughter's piano recital
```

## How it works

- Source data: `teams.md` (this repo), fetched via `raw.githubusercontent.com`.
- Schedules: [TheSportsDB](https://www.thesportsdb.com/) free tier (public key `3`).
- Stack: Vite + React + TypeScript, deployed to GitHub Pages by Actions.

### Known constraint

TheSportsDB's `eventsnext.php` requires a paid key, so the app uses the free
`eventsseason.php` endpoint and picks the earliest upcoming game from the
current season. Non-sport events (e.g. "Daughter's piano recital") won't match
anything in TheSportsDB and will render with a "No upcoming match found" note —
they're listed as a reminder that they're on your list.

## Local development

```sh
npm install
npm run dev
```

Then open <http://localhost:5173/may-project/>.

## Deploy

Push to `main`. The `.github/workflows/deploy.yml` workflow builds and publishes
to GitHub Pages. One-time: set Repo Settings → Pages → Source to "GitHub Actions".
