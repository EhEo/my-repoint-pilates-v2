import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Instructor } from '../../types';

interface InstructorCardProps {
    instructor: Instructor;
    onEdit?: (id: string) => void;
    onSchedule?: (id: string) => void;
}

const InstructorCard: React.FC<InstructorCardProps> = ({ instructor, onEdit, onSchedule }) => {
    const { t } = useTranslation();
    const statusKey = String(instructor.status).toLowerCase() as 'active' | 'inactive' | 'leave';
    return (
        <div className="card instructor-card">
            <div className="instructor-header">
                <div className="avatar-placeholder">{instructor.name[0]}</div>
                <div>
                    <h3>{instructor.name}</h3>
                    <p className="text-muted text-sm">{instructor.email}</p>
                </div>
                <span className={`status-badge ${instructor.status}`}>
                    {t(`instructors.status.${statusKey}` as 'instructors.status.active', { defaultValue: instructor.status })}
                </span>
            </div>
            <div className="instructor-specialties">
                {instructor.specialties.map(s => (
                    <span key={s} className="specialty-tag">{s}</span>
                ))}
            </div>
            <div className="card-actions">
                <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={() => onEdit?.(instructor.id)}
                >
                    {t('instructors.card.edit')}
                </button>
                <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={() => onSchedule?.(instructor.id)}
                >
                    {t('instructors.card.schedule')}
                </button>
            </div>

            <style>{`
                .instructor-card {
                    padding: var(--space-6);
                }

                .instructor-header {
                    display: flex;
                    align-items: center;
                    gap: var(--space-4);
                    margin-bottom: var(--space-4);
                }

                .avatar-placeholder {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background-color: var(--color-primary);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                    font-weight: 600;
                }

                .status-badge {
                    margin-left: auto;
                    font-size: 0.75rem;
                    padding: 2px 8px;
                    border-radius: var(--radius-full);
                    text-transform: capitalize;
                }

                .status-badge.active {
                    background-color: hsla(var(--color-success) / 0.1);
                    color: hsl(var(--color-success));
                }

                .status-badge.leave {
                    background-color: hsla(var(--color-warning) / 0.1);
                    color: hsl(var(--color-warning));
                }

                .instructor-specialties {
                    display: flex;
                    flex-wrap: wrap;
                    gap: var(--space-2);
                    margin-bottom: var(--space-6);
                    min-height: 24px;
                }

                .specialty-tag {
                    background-color: var(--color-bg-subtle);
                    padding: 2px 8px;
                    border-radius: var(--radius-sm);
                    font-size: 0.85rem;
                    color: var(--color-text-secondary);
                }

                .card-actions {
                    display: flex;
                    gap: var(--space-2);
                    margin-top: auto;
                }
            `}</style>
        </div>
    );
};

export default InstructorCard;
