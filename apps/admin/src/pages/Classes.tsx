import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ClassCard from '../components/Classes/ClassCard';
import ClassDetailModal from '../components/Classes/ClassDetailModal';
import InstructorCard from '../components/Instructors/InstructorCard';
import InstructorForm from '../components/Instructors/InstructorForm';
import Modal from '../components/common/Modal';
import { fetchClasses, fetchInstructors, createInstructor } from '../utils/api';
import type { ClassSession } from '../types';
import clsx from 'clsx';

const Classes = () => {
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState<'schedule' | 'instructors'>('schedule');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSession, setSelectedSession] = useState<ClassSession | null>(null);
    const [isInstructorModalOpen, setIsInstructorModalOpen] = useState(false);

    // Data states
    const [classes, setClasses] = useState<ClassSession[]>([]);
    const [instructors, setInstructors] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch classes when date changes
    useEffect(() => {
        if (activeTab === 'schedule') {
            loadClasses(selectedDate);
        }
    }, [selectedDate, activeTab]);

    // Fetch instructors when tab changes
    useEffect(() => {
        if (activeTab === 'instructors') {
            loadInstructors();
        }
    }, [activeTab]);

    const loadClasses = async (date: string) => {
        setIsLoading(true);
        try {
            const data = await fetchClasses(date);
            setClasses(data);
        } catch (error) {
            console.error('Failed to load classes', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadInstructors = async () => {
        setIsLoading(true);
        try {
            const data = await fetchInstructors();
            setInstructors(data);
        } catch (error) {
            console.error('Failed to load instructors', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Generate next 7 days dynamically
    const getNextSevenDays = () => {
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date.toISOString().split('T')[0]);
        }
        return dates;
    };

    const dates = getNextSevenDays();

    // With API, filtering is done on backend by date, but we might want to sort here
    const sortedClasses = [...classes].sort((a, b) => a.startTime.localeCompare(b.startTime));

    const handleRegisterInstructor = async (data: any) => {
        try {
            await createInstructor(data);
            await loadInstructors();
            setIsInstructorModalOpen(false);
        } catch (error) {
            alert(t('instructors.form.registerFailed'));
        }
    };

    return (
        <div className="classes-page">
            <header className="page-header">
                <div>
                    <h1>{t('classes.title')}</h1>
                    <p className="text-muted">{t('classes.subtitle')}</p>
                </div>
                {activeTab === 'instructors' && (
                    <button type="button" className="btn btn-primary" onClick={() => setIsInstructorModalOpen(true)}>
                        <Plus size={20} style={{ marginRight: '8px' }} />
                        {t('classes.addInstructor')}
                    </button>
                )}
            </header>

            <div className="tabs">
                <button
                    type="button"
                    className={clsx('tab', activeTab === 'schedule' && 'active')}
                    onClick={() => setActiveTab('schedule')}
                >
                    {t('classes.tabs.schedule')}
                </button>
                <button
                    type="button"
                    className={clsx('tab', activeTab === 'instructors' && 'active')}
                    onClick={() => setActiveTab('instructors')}
                >
                    {t('classes.tabs.instructors')}
                </button>
            </div>

            {activeTab === 'schedule' && (
                <div className="schedule-view">
                    <div className="date-nav">
                        <div className="date-list">
                            {dates.map(date => {
                                const d = new Date(date);
                                return (
                                    <button
                                        type="button"
                                        key={date}
                                        className={clsx('date-chip', selectedDate === date && 'active')}
                                        onClick={() => setSelectedDate(date)}
                                    >
                                        <span className="day-name">{d.toLocaleDateString(i18n.language, { weekday: 'short' })}</span>
                                        <span className="day-num">{d.getDate()}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            className="btn btn-secondary today-btn"
                            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                        >
                            <CalendarIcon size={16} style={{ marginRight: 6 }} />
                            {t('common.today')}
                        </button>
                    </div>

                    <div className="classes-list">
                        {isLoading ? (
                            <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>{t('classes.loadingClasses')}</div>
                        ) : sortedClasses.length > 0 ? (
                            sortedClasses.map(session => (
                                <ClassCard
                                    key={session.id}
                                    session={session}
                                    onClick={() => setSelectedSession(session)}
                                />
                            ))
                        ) : (
                            <div className="empty-state">
                                <p>{t('classes.emptyDay')}</p>
                                <button type="button" className="btn btn-primary mt-4">{t('classes.scheduleClass')}</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'instructors' && (
                <div className="instructors-view">
                    <div className="instructors-grid">
                        {isLoading ? (
                            <div>{t('classes.loadingInstructors')}</div>
                        ) : instructors.map(instructor => (
                            <InstructorCard
                                key={instructor.id}
                                instructor={instructor}
                                onEdit={(id) => console.log('Edit', id)}
                                onSchedule={(id) => console.log('Schedule', id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            <ClassDetailModal
                session={selectedSession}
                isOpen={!!selectedSession}
                onClose={() => setSelectedSession(null)}
            />

            <Modal
                isOpen={isInstructorModalOpen}
                onClose={() => setIsInstructorModalOpen(false)}
                title={t('classes.registerInstructorTitle')}
            >
                <InstructorForm
                    onSubmit={handleRegisterInstructor}
                    onCancel={() => setIsInstructorModalOpen(false)}
                />
            </Modal>

            <style>{`
        .page-header { 
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--space-6); 
        }
        
        .tabs {
          display: flex;
          border-bottom: 1px solid hsl(var(--color-border));
          margin-bottom: var(--space-6);
        }

        .tab {
          padding: var(--space-3) var(--space-6);
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          font-weight: 500;
          color: hsl(var(--color-text-muted));
          transition: var(--transition-base);
        }

        .tab.active {
          color: hsl(var(--color-primary));
          border-bottom-color: hsl(var(--color-primary));
        }

        .date-nav {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          margin-bottom: var(--space-6);
          background-color: white;
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          border: 1px solid hsl(var(--color-border));
        }

        .date-list {
          flex: 1;
          display: flex;
          gap: var(--space-2);
          overflow-x: auto;
          justify-content: center;
        }

        .date-chip {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--space-2) var(--space-4);
          min-width: 60px;
          border-radius: var(--radius-md);
          border: 1px solid transparent;
          background: none;
          cursor: pointer;
          transition: var(--transition-base);
        }

        .date-chip:hover {
          background-color: hsl(var(--color-bg-main));
        }

        .date-chip.active {
          background-color: hsl(var(--color-primary));
          color: white;
        }

        .day-name { font-size: 0.8rem; text-transform: uppercase; font-weight: 600; opacity: 0.8;}
        .day-num { font-size: 1.2rem; font-weight: 600; }

        .empty-state {
          text-align: center;
          padding: var(--space-12);
          color: hsl(var(--color-text-muted));
          background-color: hsl(var(--color-bg-card));
          border-radius: var(--radius-lg);
          border: 1px dashed hsl(var(--color-border));
        }

        .today-btn { margin-left: auto; }

        /* Instructor Styles */
        .instructors-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: var(--space-6);
        }
      `}</style>
        </div>
    );
};

export default Classes;
