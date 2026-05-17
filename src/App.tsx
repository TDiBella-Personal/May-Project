import { useEffect, useState } from 'react';
import { ErrorBanner } from './components/ErrorBanner';
import { Loader } from './components/Loader';
import { ScheduleCard, type ScheduleCardProps } from './components/ScheduleCard';
import { parseTeamsMd } from './lib/parseTeamsMd';
import { formatEventDateTime } from './lib/format';
import { findNextEventByTitle, findNextGameForTeam } from './lib/sportsDb';

const TEAMS_MD_URL =
  'https://raw.githubusercontent.com/tdibella-personal/may-project/main/teams.md';

interface Card extends ScheduleCardProps {
  key: string;
  sortKey: string;
}

async function buildTeamCard(name: string, sportHint: string | undefined): Promise<Card> {
  const result = await findNextGameForTeam(name, sportHint);
  if (!result) {
    return {
      key: `team:${name}`,
      sortKey: '9999',
      name,
      subtitle: sportHint,
      eventTitle: 'Team not found in TheSportsDB',
      whenLabel: '—',
      status: 'not-found',
    };
  }
  const { team, event } = result;
  if (!event) {
    return {
      key: `team:${name}`,
      sortKey: '9998',
      name: team.strTeam,
      subtitle: team.strLeague ?? team.strSport,
      badgeUrl: team.strTeamBadge,
      eventTitle: 'No upcoming game found this season',
      whenLabel: '—',
      status: 'no-match',
    };
  }
  return {
    key: `team:${team.idTeam}`,
    sortKey: `${event.dateEvent ?? '9999-12-31'}T${event.strTime ?? '00:00:00'}`,
    name: team.strTeam,
    subtitle: team.strLeague ?? team.strSport,
    badgeUrl: team.strTeamBadge,
    eventTitle: event.strEvent,
    whenLabel: formatEventDateTime(event.dateEvent, event.strTime),
    status: 'ok',
  };
}

async function buildEventCard(title: string): Promise<Card> {
  const result = await findNextEventByTitle(title);
  if (!result.event) {
    return {
      key: `event:${title}`,
      sortKey: '9999',
      name: title,
      eventTitle: 'No upcoming match found',
      whenLabel: '—',
      status: 'no-match',
    };
  }
  const { event, badgeUrl, matchedTeamName } = result;
  return {
    key: `event:${event.idEvent}`,
    sortKey: `${event.dateEvent ?? '9999-12-31'}T${event.strTime ?? '00:00:00'}`,
    name: matchedTeamName ?? title,
    subtitle: matchedTeamName && matchedTeamName !== title ? title : event.strLeague,
    badgeUrl,
    eventTitle: event.strEvent,
    whenLabel: formatEventDateTime(event.dateEvent, event.strTime),
    status: 'ok',
  };
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const res = await fetch(TEAMS_MD_URL, { cache: 'no-store' });
        if (!res.ok) throw new Error(`teams.md fetch failed (${res.status})`);
        const md = await res.text();
        const { teams, events } = parseTeamsMd(md);

        const teamPromises = teams.map((t) => buildTeamCard(t.name, t.sportHint));
        const eventPromises = events.map((e) => buildEventCard(e.title));
        const settled = await Promise.allSettled([...teamPromises, ...eventPromises]);

        const built: Card[] = settled.flatMap((r, idx) => {
          if (r.status === 'fulfilled') return [r.value];
          const isTeam = idx < teams.length;
          const label = isTeam ? teams[idx].name : events[idx - teams.length].title;
          return [
            {
              key: `err:${idx}`,
              sortKey: '9999',
              name: label,
              eventTitle: 'Lookup failed',
              whenLabel: r.reason instanceof Error ? r.reason.message : '—',
              status: 'not-found' as const,
            },
          ];
        });

        built.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
        if (!cancelled) setCards(built);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="app">
      <header className="app__header">
        <h1>Next Games</h1>
        <p className="app__subtitle">
          Edit{' '}
          <a
            href="https://github.com/tdibella-personal/may-project/blob/main/teams.md"
            target="_blank"
            rel="noreferrer"
          >
            teams.md
          </a>{' '}
          to change this list.
        </p>
      </header>

      {error ? <ErrorBanner message={error} /> : null}
      {loading ? <Loader message="Looking up next games…" /> : null}

      {!loading && !error && cards.length === 0 ? (
        <p className="empty">No teams or events found in teams.md.</p>
      ) : null}

      <section className="grid">
        {cards.map((c) => (
          <ScheduleCard
            key={c.key}
            name={c.name}
            subtitle={c.subtitle}
            badgeUrl={c.badgeUrl}
            eventTitle={c.eventTitle}
            whenLabel={c.whenLabel}
            status={c.status}
          />
        ))}
      </section>
    </main>
  );
}
