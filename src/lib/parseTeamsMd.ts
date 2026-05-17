export interface TeamEntry {
  name: string;
  sportHint?: string;
}

export interface EventEntry {
  title: string;
}

export interface ParsedList {
  teams: TeamEntry[];
  events: EventEntry[];
}

type Section = 'teams' | 'events' | null;

const sectionFromHeading = (heading: string): Section => {
  const h = heading.trim().toLowerCase();
  if (h.startsWith('teams')) return 'teams';
  if (h.startsWith('events')) return 'events';
  return null;
};

const splitNameAndHint = (raw: string): { name: string; sportHint?: string } => {
  const match = raw.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (!match) return { name: raw.trim() };
  return { name: match[1].trim(), sportHint: match[2].trim() };
};

export function parseTeamsMd(md: string): ParsedList {
  const teams: TeamEntry[] = [];
  const events: EventEntry[] = [];
  let section: Section = null;

  for (const rawLine of md.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('## ')) {
      section = sectionFromHeading(line.slice(3));
      continue;
    }

    if (!section) continue;
    if (!line.startsWith('-')) continue;

    const entry = line.replace(/^-\s*/, '').trim();
    if (!entry) continue;

    if (section === 'teams') {
      teams.push(splitNameAndHint(entry));
    } else {
      events.push({ title: entry });
    }
  }

  return { teams, events };
}
