export function formatEventDateTime(dateEvent: string | null, strTime: string | null): string {
  if (!dateEvent) return 'Date TBD';

  const timePart = strTime && strTime !== '00:00:00' ? strTime : '00:00:00';
  const iso = `${dateEvent}T${timePart}Z`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return dateEvent;

  const hasTime = strTime && strTime !== '00:00:00';
  const dayFmt = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (!hasTime) return dayFmt.format(d);

  const timeFmt = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
  return `${dayFmt.format(d)} · ${timeFmt.format(d)}`;
}

const SUMMER_SPORTS = new Set(['baseball', 'cycling', 'motorsport', 'tennis']);

export function currentSeasonForSport(sport: string | undefined, league: string | undefined): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const s = (sport ?? '').toLowerCase();
  const l = (league ?? '').toLowerCase();

  if (SUMMER_SPORTS.has(s) || l.includes('mlb') || l.includes('formula')) {
    return String(year);
  }

  if (month >= 7) return `${year}-${year + 1}`;
  return `${year - 1}-${year}`;
}

export function isFutureEvent(dateEvent: string | null, strTime: string | null): boolean {
  if (!dateEvent) return false;
  const iso = `${dateEvent}T${strTime && strTime !== '00:00:00' ? strTime : '23:59:59'}Z`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() >= Date.now() - 1000 * 60 * 60 * 3;
}

export function compareEventDates(
  a: { dateEvent: string | null; strTime: string | null },
  b: { dateEvent: string | null; strTime: string | null },
): number {
  const aIso = `${a.dateEvent ?? '9999-12-31'}T${a.strTime ?? '00:00:00'}Z`;
  const bIso = `${b.dateEvent ?? '9999-12-31'}T${b.strTime ?? '00:00:00'}Z`;
  return aIso.localeCompare(bIso);
}
