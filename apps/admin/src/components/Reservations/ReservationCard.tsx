import React from 'react';
import { User, Clock, MapPin } from 'lucide-react';
import type { Reservation } from '../../types';

interface ReservationCardProps {
  reservation: Reservation;
  onCancel: (id: string) => void;
}

const ReservationCard: React.FC<ReservationCardProps> = ({ reservation, onCancel }) => {
  const { classSession, status } = reservation;
  // Handle nested instructor object from API or flat property from mock
  const instructorName = (classSession as any).instructor?.name || (classSession as any).instructorName || 'Unknown Instructor';

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED': return 'var(--color-success)';
      case 'WAITLIST': return 'var(--color-warning)';
      case 'CANCELLED': return 'var(--color-text-muted)';
      default: return 'var(--color-text-primary)';
    }
  };

  return (
    <div className="reservation-card">
      <div className="date-col">
        <span className="day">{new Date(classSession.date).getDate()}</span>
        <span className="month">{new Date(classSession.date).toLocaleDateString('en-US', { month: 'short' })}</span>
      </div>

      <div className="info-col">
        <div className="header-row">
          <h3 className="title">{classSession.title}</h3>
          <span
            className="badge status-badge"
            style={{
              backgroundColor: `${getStatusColor(status)}20`,
              color: getStatusColor(status),
              borderColor: getStatusColor(status)
            }}
          >
            {status}
          </span>
        </div>

        <div className="details-grid">
          <div className="detail-item">
            <Clock size={14} />
            <span>{classSession.startTime} - {classSession.endTime}</span>
          </div>
          <div className="detail-item">
            <User size={14} />
            <span>{instructorName}</span>
          </div>
          <div className="detail-item">
            <MapPin size={14} />
            <span>{classSession.room}</span>
          </div>
        </div>
      </div>

      <div className="actions-col">
        {status !== 'CANCELLED' && status !== 'cancelled' && (
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => onCancel(reservation.id)}
          >
            Cancel
          </button>
        )}
      </div>

      <style>{`
        .reservation-card {
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

        .reservation-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .date-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 60px;
          padding-right: var(--space-4);
          border-right: 1px solid var(--color-border);
          margin-right: var(--space-4);
        }

        .day {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text-primary);
          line-height: 1;
        }

        .month {
          font-size: 0.85rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
          font-weight: 600;
        }

        .info-col {
          flex: 1;
        }

        .header-row {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-2);
        }

        .title {
          font-size: 1.1rem;
          margin: 0;
          color: var(--color-text-primary);
        }

        .badge {
          font-size: 0.75rem;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          border: 1px solid transparent;
          text-transform: capitalize;
          font-weight: 500;
        }

        .details-grid {
          display: flex;
          gap: var(--space-4);
          color: var(--color-text-muted);
          font-size: 0.9rem;
          flex-wrap: wrap;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .actions-col {
          margin-left: var(--space-4);
        }

        .btn-outline-danger {
          background: transparent;
          border: 1px solid var(--color-error);
          color: var(--color-error);
        }
        .btn-outline-danger:hover {
          background-color: var(--color-error);
          color: white;
        }
      `}</style>
    </div>
  );
};

export default ReservationCard;
