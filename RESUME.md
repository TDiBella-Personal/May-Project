# Where we left off — May 17, 2026

## What you asked for

A small web page that shows you the next game for each of your favorite teams, plus the next date for any one-off events you're tracking (Wimbledon final, a tennis match, your daughter's piano recital, etc.). You wanted to manage the list by editing a markdown file on GitHub, not through a fiddly admin UI.

## What's now live

- **The site**: https://tdibella-personal.github.io/may-project/
- **Your list**: https://github.com/TDiBella-Personal/May-Project/blob/main/teams.md
- Edit `teams.md` on GitHub → push the commit → the site rebuilds itself in ~1 minute → reload to see the change.

Right now `teams.md` has placeholder entries (Celtics, Patriots, Arsenal, Wimbledon, Tour de France, "Daughter's piano recital"). **Swap these for your real list when you come back.**

## What to do first when you resume

1. Open the live site and confirm cards are actually showing up with logos and dates. If it's blank or broken, tell me what you see.
2. Edit `teams.md` and replace the placeholders with the teams and events you actually care about. Commit on GitHub.
3. Wait ~1 minute, refresh the site, confirm your real list appears.

## Format for `teams.md`

```md
## Teams
- Boston Celtics (NBA)
- Arsenal (English Premier League)

## Events
- Wimbledon Men's Final
- Daughter's piano recital
```

The `(...)` after a team name is optional. Use it when a team name is ambiguous (e.g. multiple sports have an "Arsenal").

## Things that might trip you up

- **A non-sport event won't find a match.** The schedule data comes from a sports database, so "Daughter's piano recital" will show as "No upcoming match found." That's expected — it still appears as a reminder it's on your list. (If you want non-sport events to show a date too, that's a future enhancement we didn't build.)
- **A team isn't found.** Try the team's full official name. "Yankees" might miss, "New York Yankees" usually works.
- **Off-season teams** will show "No upcoming game this season" until their next season starts.

## Open questions / decisions we deferred

These came up but weren't built — pick any of them up later if you want:

- Manual refresh button on the site (today you reload the browser).
- Group cards by team vs. event instead of one flat list sorted by date.
- A way to attach a custom image to a non-sport event (e.g. a photo for the recital).
- A way to enter dates manually in `teams.md` for things the sports database doesn't know about.
- The original prompt mentioned an ".md file generator" tool — we never used one; the file is hand-edited. If you have a generator in mind, tell me what it produces and we can wire it in.

## How the GitHub Actions deploy works (quick primer, since you mentioned it was new)

Old way (publish from main): GitHub Pages served your raw files straight from a branch.
New way (GitHub Actions): every push to `main` runs the recipe in `.github/workflows/deploy.yml`, which builds the site and uploads the built version for Pages to serve. You don't have to do anything — just edit `teams.md`, commit, wait a minute.

To check a deploy: **repo → Actions tab → "Deploy to GitHub Pages"**. Green check = live.

## Branches / PRs

- PR #1: the app itself. Merged.
- PR #2: this catch-up note. Merge when you're ready (or just read it from the branch).
- No open work in flight.

---

When you're back, easiest start: open the live site, then `teams.md`. If anything looks off, screenshot it and tell me.
