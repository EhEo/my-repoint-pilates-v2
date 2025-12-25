import { Calendar, Clock, User, MapPin, X } from 'lucide-react';
import type { ClassSession } from '../../types';
import Modal from '../common/Modal';

interface ClassDetailModalProps {
    session: ClassSession | null;
    isOpen: boolean;
    onClose: () => void;
}

const ClassDetailModal: React.FC<ClassDetailModalProps> = ({ session, isOpen, onClose }) => {
    if (!session) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Class Details">
            <div className="class-detail">
                <div className="detail-header">
                    <span className="badge level-badge">{session.level}</span>
                    <h2>{session.title}</h2>
                    <p className="text-muted">{session.type === 'private' ? '1:1 Private Session' : 'Group Class'}</p>
                </div>

                <div className="info-grid">
                    <div className="info-item">
                        <Calendar size={18} className="icon" />
                        <div>
                            <label>Date</label>
                            <p>{session.date}</p>
                        </div>
                    </div>
                    <div className="info-item">
                        <Clock size={18} className="icon" />
                        <div>
                            <label>Time</label>
                            <p>{session.startTime} - {session.endTime}</p>
                        </div>
                    </div>
                    <div className="info-item">
                        <User size={18} className="icon" />
                        <div>
                            <label>Instructor</label>
                            <p>{session.instructorName}</p>
                        </div>
                    </div>
                    <div className="info-item">
                        <MapPin size={18} className="icon" />
                        <div>
                            <label>Room</label>
                            <p>{session.room}</p>
                        </div>
                    </div>
                </div>

                <div className="attendees-section">
                    <div className="section-header">
                        <h3>Attendees ({session.enrolled}/{session.capacity})</h3>
                        {session.enrolled < session.capacity && (
                            <button className="btn btn-sm btn-outline">Add Member</button>
                        )}
                    </div>

                    <div className="attendees-list">
                        {session.enrolled === 0 ? (
                            <p className="empty-text">No members registered yet.</p>
                        ) : (
                            // Mock attendees for now
                            Array.from({ length: session.enrolled }).map((_, i) => (
                                <div key={i} className="attendee-row">
                                    <div className="attendee-avatar">
                                        <User size={16} />
                                    </div>
                                    <span>Member {i + 1}</span>
                                    <button className="remove-btn"><X size={14} /></button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="btn btn-danger-outline">Cancel Class</button>
                    <button className="btn btn-primary" onClick={onClose}>Close</button>
                </div>
            </div>

            <style>{`
                .class-detail {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-6);
                }

                .badge {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: var(--radius-full);
                    background-color: var(--color-bg-subtle);
                    color: var(--color-primary);
                    font-size: 0.8rem;
                    text-transform: capitalize;
                    margin-bottom: var(--space-2);
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: var(--space-4);
                    background-color: var(--color-bg-subtle);
                    padding: var(--space-4);
                    border-radius: var(--radius-md);
                }

                .info-item {
                    display: flex;
                    align-items: flex-start;
                    gap: var(--space-3);
                }

                .info-item .icon {
                    color: var(--color-text-muted);
                    margin-top: 2px;
                }

                .info-item label {
                    display: block;
                    font-size: 0.75rem;
                    color: var(--color-text-muted);
                    margin-bottom: 2px;
                }

                .info-item p {
                    font-weight: 500;
                    margin: 0;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--space-3);
                    border-bottom: 1px solid var(--color-border);
                    padding-bottom: var(--space-2);
                }

                .attendees-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-2);
                }

                .attendee-row {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    padding: var(--space-2);
                    background-color: var(--color-background);
                    border-radius: var(--radius-sm);
                }

                .attendee-avatar {
                    width: 24px;
                    height: 24px;
                    background-color: var(--color-primary-light);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .remove-btn {
                    margin-left: auto;
                    background: none;
                    border: none;
                    color: var(--color-text-muted);
                    cursor: pointer;
                }

                .remove-btn:hover { color: var(--color-error); }

                .empty-text {
                    color: var(--color-text-muted);
                    font-style: italic;
                    text-align: center;
                    padding: var(--space-4);
                }

                .modal-actions {
                    display: flex;
                    justify-content: space-between;
                    margin-top: var(--space-2);
                }

                .btn-danger-outline {
                    color: var(--color-error);
                    border: 1px solid var(--color-error);
                    background: none;
                    padding: var(--space-2) var(--space-4);
                    border-radius: var(--radius-md);
                    cursor: pointer;
                }
            `}</style>
        </Modal>
    );
};

export default ClassDetailModal;
