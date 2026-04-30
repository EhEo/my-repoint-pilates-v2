import React from 'react';
import { User, Users, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ClassSession } from '../../types';

interface ClassCardProps {
  session: ClassSession;
  onClick?: () => void;
}

const ClassCard: React.FC<ClassCardProps> = ({ session, onClick }) => {
  const { t } = useTranslation();
  const isFull = session.enrolled >= session.capacity;
  const levelKey = String(session.level).toLowerCase() as 'beginner' | 'intermediate' | 'advanced' | 'all';

  // Level badge color
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'var(--color-success)';
      case 'advanced': return 'var(--color-error)';
      default: return 'var(--color-info)'; // intermediate/all
    }
  };

  return (
    <div className="class-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="time-col">
        <span className="start-time">{session.startTime}</span>
        <span className="duration">{t('classes.card.duration', { count: 50 })}</span>
      </div>

      <div className="info-col">
        <div className="header-row">
          <h3 className="title">{session.title}</h3>
          <span className="badge level-badge" style={{ borderColor: getLevelColor(session.level), color: getLevelColor(session.level) }}>
            {t(`classes.card.level.${levelKey}` as 'classes.card.level.beginner', { defaultValue: session.level })}
          </span>
        </div>

        <div className="details-row">
          <div className="detail-item">
            <User size={14} />
            <span>{session.instructorName}</span>
          </div>
          <div className="detail-item">
            <MapPin size={14} />
            <span>{session.room}</span>
          </div>
        </div>
      </div>

      <div className="status-col">
        <div className={`capacity-indicator ${isFull ? 'full' : ''}`}>
          <Users size={16} />
          <span>{session.enrolled}/{session.capacity}</span>
        </div>
        <button type="button" className="btn btn-sm btn-outline" onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}>{t('classes.card.detail')}</button>
      </div>

      <style>{`
                .class-card {
                    display: flex;
                    align-items: center;
                    background-color: var(--color-surface);
                    border-radius: var(--radius-md);
                    padding: var(--space-4);
                    margin-bottom: var(--space-3);
                    box-shadow: var(--shadow-sm);
                    border: 1px solid var(--color-border);
                    transition: var(--transition-base);
                }

                .class-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                    border-color: var(--color-primary-light);
                }

                .time-col {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding-right: var(--space-4);
                    border-right: 1px solid var(--color-border);
                    min-width: 80px;
                }

                .start-time {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: var(--color-text-primary);
                }

                .duration {
                    font-size: 0.8rem;
                    color: var(--color-text-muted);
                }

                .info-col {
                    flex: 1;
                    padding: 0 var(--space-4);
                }

                .header-row {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    margin-bottom: var(--space-2);
                }

                .title {
                    font-size: 1rem;
                    margin: 0;
                    color: var(--color-text-primary);
                }

                .badge {
                    font-size: 0.7rem;
                    padding: 2px 6px;
                    border-radius: var(--radius-full);
                    border: 1px solid currentColor;
                    text-transform: capitalize;
                }

                .details-row {
                    display: flex;
                    gap: var(--space-4);
                    color: var(--color-text-muted);
                    font-size: 0.9rem;
                }

                .detail-item {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .status-col {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: var(--space-2);
                }

                .capacity-indicator {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: var(--color-primary);
                }

                .capacity-indicator.full {
                    color: var(--color-text-muted);
                }

                .btn-sm {
                    padding: 4px 12px;
                    font-size: 0.85rem;
                }
            `}</style>
    </div>
  );
};

export default ClassCard;
