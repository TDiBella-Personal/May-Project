import { useState } from 'react';

export interface ScheduleCardProps {
  name: string;
  subtitle?: string;
  badgeUrl?: string;
  eventTitle: string;
  whenLabel: string;
  status: 'ok' | 'no-match' | 'not-found';
}

export function ScheduleCard({ name, subtitle, badgeUrl, eventTitle, whenLabel, status }: ScheduleCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = badgeUrl && !imgFailed;

  return (
    <article className={`card card--${status}`}>
      <div className="card__header">
        {showImage ? (
          <img
            className="card__badge"
            src={badgeUrl}
            alt={`${name} logo`}
            onError={() => setImgFailed(true)}
            loading="lazy"
          />
        ) : (
          <div className="card__badge card__badge--placeholder" aria-hidden="true" />
        )}
        <div className="card__heading">
          <h2 className="card__name">{name}</h2>
          {subtitle ? <p className="card__subtitle">{subtitle}</p> : null}
        </div>
      </div>
      <div className="card__body">
        <p className="card__event">{eventTitle}</p>
        <p className="card__when">{whenLabel}</p>
      </div>
    </article>
  );
}
