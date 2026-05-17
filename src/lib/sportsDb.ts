import { compareEventDates, currentSeasonForSport, isFutureEvent } from './format';

const API_KEY = '3';
const BASE = `https://www.thesportsdb.com/api/v1/json/${API_KEY}/`;

const CACHE_PREFIX = 'sportsdb:';
const CACHE_TTL_MS = 10 * 60 * 1000;

export interface SportsDbTeam {
  idTeam: string;
  strTeam: string;
  strSport?: string;
  strLeague?: string;
  strTeamBadge?: string;
}

export interface SportsDbEvent {
  idEvent: string;
  strEvent: string;
  dateEvent: string | null;
  strTime: string | null;
  strHomeTeam?: string;
  strAwayTeam?: string;
  strLeague?: string;
  strSport?: string;
}

export interface NextGame {
  team: SportsDbTeam;
  event: SportsDbEvent | null;
}

export interface NextEvent {
  event: SportsDbEvent | null;
  badgeUrl?: string;
  matchedTeamName?: string;
}

async function cachedJson(url: string): Promise<any> {
  const key = CACHE_PREFIX + url;
  try {
    const raw = sessionStorage.getItem(key);
    if (raw) {
      const { at, data } = JSON.parse(raw);
      if (Date.now() - at < CACHE_TTL_MS) return data;
    }
  } catch {
    // ignore cache read errors
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`API ${res.status} on ${url}`);
  const data = await res.json();

  try {
    sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data }));
  } catch {
    // storage full or unavailable; not fatal
  }
  return data;
}

function pickTeamByHint(teams: SportsDbTeam[], sportHint?: string): SportsDbTeam | null {
  if (teams.length === 0) return null;
  if (!sportHint) return teams[0];
  const hint = sportHint.toLowerCase();
  const match = teams.find((t) => {
    const sport = (t.strSport ?? '').toLowerCase();
    const league = (t.strLeague ?? '').toLowerCase();
    return sport.includes(hint) || league.includes(hint) || hint.includes(sport) || hint.includes(league);
  });
  return match ?? teams[0];
}

export async function findTeamByName(name: string, sportHint?: string): Promise<SportsDbTeam | null> {
  const url = `${BASE}searchteams.php?t=${encodeURIComponent(name)}`;
  const data = await cachedJson(url);
  const teams: SportsDbTeam[] = data?.teams ?? [];
  return pickTeamByHint(teams, sportHint);
}

export async function findNextGameForTeam(name: string, sportHint?: string): Promise<NextGame | null> {
  const team = await findTeamByName(name, sportHint);
  if (!team) return null;

  const season = currentSeasonForSport(team.strSport, team.strLeague);
  const url = `${BASE}eventsseason.php?id=${team.idTeam}&s=${encodeURIComponent(season)}`;
  let data: any = null;
  try {
    data = await cachedJson(url);
  } catch {
    return { team, event: null };
  }

  const events: SportsDbEvent[] = data?.events ?? [];
  const upcoming = events
    .filter((e) => isFutureEvent(e.dateEvent, e.strTime))
    .sort(compareEventDates);

  return { team, event: upcoming[0] ?? null };
}

export async function findNextEventByTitle(title: string): Promise<NextEvent> {
  const url = `${BASE}searchevents.php?e=${encodeURIComponent(title)}`;
  let data: any = null;
  try {
    data = await cachedJson(url);
  } catch {
    return { event: null };
  }

  const events: SportsDbEvent[] = data?.event ?? data?.events ?? [];
  const upcoming = events
    .filter((e) => isFutureEvent(e.dateEvent, e.strTime))
    .sort(compareEventDates);
  const next = upcoming[0] ?? null;

  let badgeUrl: string | undefined;
  let matchedTeamName: string | undefined;

  if (next?.strHomeTeam) {
    const home = await findTeamByName(next.strHomeTeam).catch(() => null);
    if (home?.strTeamBadge) {
      badgeUrl = home.strTeamBadge;
      matchedTeamName = home.strTeam;
    }
  }

  if (!badgeUrl) {
    const candidate = await findTeamByName(title).catch(() => null);
    if (candidate?.strTeamBadge && titleMentionsTeam(title, candidate.strTeam)) {
      badgeUrl = candidate.strTeamBadge;
      matchedTeamName = candidate.strTeam;
    }
  }

  return { event: next, badgeUrl, matchedTeamName };
}

function titleMentionsTeam(title: string, teamName: string): boolean {
  const t = title.toLowerCase();
  const name = teamName.toLowerCase();
  if (t.includes(name)) return true;
  const tokens = name.split(/\s+/).filter((w) => w.length >= 4);
  return tokens.some((tok) => t.includes(tok));
}
