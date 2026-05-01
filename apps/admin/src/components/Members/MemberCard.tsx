import { MoreHorizontal, Calendar } from 'lucide-react';
import type { Member } from '../../types';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

interface MemberCardProps {
    member: Member;
}

const MemberCard = ({ member }: MemberCardProps) => {
    const { t } = useTranslation();
    const activeMembership = member.memberships?.[0];
    const statusKey = (member.status || '').toString().toLowerCase();
    const statusUpper = (member.status || '').toString().toUpperCase();

    return (
        <div className="card member-card">
            <div className="card-header">
                <div className="member-info">
                    <div className="avatar details" style={{ width: '48px', height: '48px' }}>
                        {member.name.charAt(0)}
                    </div>
                    <div>
                        <h3>{member.name}</h3>
                        <span className={clsx('status-badge', statusKey)}>
                            {t(`members.status.${statusUpper}` as 'members.status.ACTIVE', { defaultValue: member.status })}
                        </span>
                    </div>
                </div>
                <button type="button" className="icon-btn" aria-label={t('members.card.actions')}>
                    <MoreHorizontal size={20} />
                </button>
            </div>

            <div className="card-body">
                <div className="stat-row">
                    <div className="stat-item">
                        <span className="label">{t('members.card.sessions')}</span>
                        <span className="value">
                            {activeMembership ? (
                                <>
                                    {activeMembership.remainingCount}{' '}
                                    <span className="text-muted">/ {activeMembership.totalCount}</span>
                                </>
                            ) : (
                                <span className="text-muted">{t('members.card.noActiveMembership')}</span>
                            )}
                        </span>
                    </div>
                    <div className="stat-item right">
                        <span className="label">{t('members.card.expires')}</span>
                        <span className="value">
                            {activeMembership
                                ? new Date(activeMembership.endDate).toLocaleDateString()
                                : '—'}
                        </span>
                    </div>
                </div>

                <div className="divider" />

                <div className="next-session">
                    <div className="icon-wrapper">
                        <Calendar size={16} />
                    </div>
                    <div className="session-info">
                        <span className="label">{t('members.card.lastVisit')}</span>
                        <span className="value">
                            {member.lastVisit
                                ? new Date(member.lastVisit).toLocaleDateString()
                                : t('members.card.never')}
                        </span>
                    </div>
                </div>
            </div>

            <div className="card-footer">
                <button type="button" className="btn btn-secondary full-width">{t('members.card.viewProfile')}</button>
            </div>

            <style>{`
        .member-card {
          padding: 0;
          overflow: hidden;
          transition: var(--transition-base);
        }
        .member-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .card-header {
          padding: var(--space-6);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: var(--space-4);
        }

        .member-info {
          display: flex;
          gap: var(--space-4);
          align-items: center;
        }

        .member-info h3 {
          font-size: 1.1rem;
          margin: 0;
          margin-bottom: var(--space-1);
        }

        .status-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .status-badge.active {
          background-color: hsl(var(--color-success) / 0.1);
          color: hsl(var(--color-success));
        }
        .status-badge.inactive {
          background-color: hsl(var(--color-text-muted) / 0.1);
          color: hsl(var(--color-text-muted));
        }
        .status-badge.paused {
          background-color: hsl(var(--color-warning) / 0.1);
          color: hsl(var(--color-warning));
        }

        .card-body {
          padding: 0 var(--space-6);
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--space-4);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
        }
        .stat-item.right {
          align-items: flex-end;
        }

        .label {
          font-size: 0.8rem;
          color: hsl(var(--color-text-muted));
          margin-bottom: var(--space-1);
        }
        .value {
          font-weight: 600;
          font-size: 0.95rem;
        }
        .capitalize { text-transform: capitalize; }

        .divider {
          height: 1px;
          background-color: hsl(var(--color-border));
          margin: var(--space-4) 0;
        }

        .next-session {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-4);
        }

        .icon-wrapper {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          background-color: hsl(var(--color-primary) / 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: hsl(var(--color-primary));
        }

        .session-info {
          display: flex;
          flex-direction: column;
        }

        .card-footer {
          padding: var(--space-4) var(--space-6);
          background-color: hsl(var(--color-bg-main));
          border-top: 1px solid hsl(var(--color-border));
        }

        .full-width { width: 100%; }
      `}</style>
        </div>
    );
};

export default MemberCard;
