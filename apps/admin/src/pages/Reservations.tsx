import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import ReservationCard from '../components/Reservations/ReservationCard';
import Modal from '../components/common/Modal';
import { fetchReservations, cancelReservation } from '../utils/api';
// import { MOCK_RESERVATIONS } from '../utils/mockReservationData';

const Reservations = () => {
    const { t } = useTranslation();
    const [reservations, setReservations] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadReservations();
    }, []);

    const loadReservations = async () => {
        setIsLoading(true);
        try {
            const data = await fetchReservations();
            setReservations(data);
        } catch (error) {
            console.error('Failed to load reservations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingReservations = reservations.filter(r => {
        const sessionDate = new Date(r.classSession.date);
        return sessionDate >= today && r.status !== 'CANCELLED';
    });

    const historyReservations = reservations.filter(r => {
        const sessionDate = new Date(r.classSession.date);
        return sessionDate < today || r.status === 'CANCELLED';
    });

    const displayedReservations = activeTab === 'upcoming' ? upcomingReservations : historyReservations;

    const initiateCancel = (id: string) => {
        setSelectedReservationId(id);
        setIsCancelModalOpen(true);
    };

    const confirmCancel = async () => {
        if (selectedReservationId) {
            try {
                await cancelReservation(selectedReservationId);
                await loadReservations(); // Refresh list
                alert(t('reservations.cancelModal.success'));
            } catch (error) {
                console.error('Failed to cancel reservation:', error);
                alert(t('reservations.cancelModal.failed'));
            } finally {
                setIsCancelModalOpen(false);
                setSelectedReservationId(null);
            }
        }
    };

    return (
        <div className="reservations-page">
            <header className="page-header">
                <h1>{t('reservations.title')}</h1>
                <p className="text-muted">{t('reservations.subtitle')}</p>
            </header>

            <div className="tabs">
                <button
                    type="button"
                    className={clsx('tab', activeTab === 'upcoming' && 'active')}
                    onClick={() => setActiveTab('upcoming')}
                >
                    {t('reservations.tabs.upcoming')}
                </button>
                <button
                    type="button"
                    className={clsx('tab', activeTab === 'history' && 'active')}
                    onClick={() => setActiveTab('history')}
                >
                    {t('reservations.tabs.history')}
                </button>
            </div>

            <div className="reservations-list">
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>{t('reservations.loading')}</div>
                ) : displayedReservations.length > 0 ? (
                    displayedReservations.map(reservation => (
                        <ReservationCard
                            key={reservation.id}
                            reservation={reservation}
                            onCancel={initiateCancel}
                        />
                    ))
                ) : (
                    <div className="empty-state">
                        <p>{t('reservations.empty', { tab: t(`reservations.tabs.${activeTab}` as 'reservations.tabs.upcoming') })}</p>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                title={t('reservations.cancelModal.title')}
            >
                <div className="cancel-modal-content">
                    <p>{t('reservations.cancelModal.confirmQuestion')}</p>
                    <p className="text-muted text-sm mt-2">{t('reservations.cancelModal.warning')}</p>

                    <div className="modal-actions mt-6">
                        <button type="button" className="btn btn-secondary" onClick={() => setIsCancelModalOpen(false)}>{t('reservations.cancelModal.keep')}</button>
                        <button type="button" className="btn btn-danger" onClick={confirmCancel}>{t('reservations.cancelModal.confirm')}</button>
                    </div>
                </div>
            </Modal>

            <style>{`
                .page-header { margin-bottom: var(--space-6); }
                
                .tabs {
                    display: flex;
                    border-bottom: 1px solid var(--color-border);
                    margin-bottom: var(--space-6);
                }

                .tab {
                    padding: var(--space-3) var(--space-6);
                    background: none;
                    border: none;
                    border-bottom: 2px solid transparent;
                    cursor: pointer;
                    font-weight: 500;
                    color: var(--color-text-muted);
                    transition: var(--transition-base);
                    font-size: 1rem;
                }

                .tab.active {
                    color: var(--color-primary);
                    border-bottom-color: var(--color-primary);
                }

                .empty-state {
                    text-align: center;
                    padding: var(--space-12);
                    color: var(--color-text-muted);
                    background-color: var(--color-surface);
                    border-radius: var(--radius-lg);
                    border: 1px dashed var(--color-border);
                }
            `}</style>
        </div>
    );
};

export default Reservations;
