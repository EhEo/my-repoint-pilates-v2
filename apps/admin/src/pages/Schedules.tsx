import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
    fetchInstructors,
    fetchInstructorSchedules,
    createInstructorSchedule,
    deleteInstructorSchedule,
    fetchInstructorLeaves,
    createInstructorLeave,
    deleteInstructorLeave,
} from '../utils/api';
import type { Instructor, InstructorSchedule, InstructorLeave } from '../types';

const Schedules = () => {
    const { t } = useTranslation();
    const DAY_KEYS = ['0', '1', '2', '3', '4', '5', '6'] as const;
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [selectedId, setSelectedId] = useState<string>('');
    const [schedules, setSchedules] = useState<InstructorSchedule[]>([]);
    const [leaves, setLeaves] = useState<InstructorLeave[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Add-schedule form
    const [newDayOfWeek, setNewDayOfWeek] = useState(1);
    const [newStartTime, setNewStartTime] = useState('09:00');
    const [newEndTime, setNewEndTime] = useState('18:00');
    const [scheduleError, setScheduleError] = useState<string | null>(null);

    // Add-leave form
    const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
    const [leaveStart, setLeaveStart] = useState(today);
    const [leaveEnd, setLeaveEnd] = useState(today);
    const [leaveReason, setLeaveReason] = useState('');
    const [leaveError, setLeaveError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const list = (await fetchInstructors()) as Instructor[];
            setInstructors(list);
            if (list.length > 0 && !selectedId) {
                setSelectedId(list[0].id);
            }
        })().catch((err) => console.error('Failed to load instructors', err));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!selectedId) return;
        loadForInstructor(selectedId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedId]);

    const loadForInstructor = async (instructorId: string) => {
        setIsLoading(true);
        try {
            const [s, l] = await Promise.all([
                fetchInstructorSchedules(instructorId),
                fetchInstructorLeaves(instructorId),
            ]);
            setSchedules(s as InstructorSchedule[]);
            setLeaves(l as InstructorLeave[]);
        } catch (err) {
            console.error('Failed to load schedules/leaves', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSchedule = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedId) return;
        setScheduleError(null);
        try {
            await createInstructorSchedule({
                instructorId: selectedId,
                dayOfWeek: newDayOfWeek,
                startTime: newStartTime,
                endTime: newEndTime,
            });
            await loadForInstructor(selectedId);
        } catch (err) {
            setScheduleError(err instanceof Error ? err.message : t('schedules.weekly.addFailed'));
        }
    };

    const handleDeleteSchedule = async (id: string) => {
        if (!confirm(t('schedules.weekly.deleteConfirm'))) return;
        await deleteInstructorSchedule(id);
        if (selectedId) await loadForInstructor(selectedId);
    };

    const handleAddLeave = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedId) return;
        setLeaveError(null);
        try {
            await createInstructorLeave({
                instructorId: selectedId,
                startDate: leaveStart,
                endDate: leaveEnd,
                reason: leaveReason.trim() || undefined,
            });
            setLeaveReason('');
            await loadForInstructor(selectedId);
        } catch (err) {
            setLeaveError(err instanceof Error ? err.message : t('schedules.leaves.addFailed'));
        }
    };

    const handleDeleteLeave = async (id: string) => {
        if (!confirm(t('schedules.leaves.deleteConfirm'))) return;
        await deleteInstructorLeave(id);
        if (selectedId) await loadForInstructor(selectedId);
    };

    return (
        <div className="schedules-page">
            <header className="page-header">
                <div>
                    <h1>{t('schedules.title')}</h1>
                    <p className="text-muted">{t('schedules.subtitle')}</p>
                </div>
            </header>

            <div className="instructor-picker">
                <label htmlFor="instructor">{t('schedules.instructorLabel')}</label>
                <select
                    id="instructor"
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                >
                    {instructors.length === 0 && <option value="">{t('schedules.noInstructors')}</option>}
                    {instructors.map((i) => (
                        <option key={i.id} value={i.id}>
                            {i.name}
                        </option>
                    ))}
                </select>
            </div>

            {isLoading ? (
                <div className="loading">{t('schedules.loading')}</div>
            ) : (
                <div className="grid">
                    <section className="card panel">
                        <h2>{t('schedules.weekly.title')}</h2>
                        <p className="text-muted hint">{t('schedules.weekly.hint')}</p>

                        {schedules.length === 0 ? (
                            <p className="empty">{t('schedules.weekly.empty')}</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>{t('schedules.weekly.table.day')}</th>
                                        <th>{t('schedules.weekly.table.start')}</th>
                                        <th>{t('schedules.weekly.table.end')}</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schedules.map((s) => (
                                        <tr key={s.id}>
                                            <td>{t(`schedules.days.${DAY_KEYS[s.dayOfWeek]}` as 'schedules.days.0')}</td>
                                            <td>{s.startTime}</td>
                                            <td>{s.endTime}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="icon-btn"
                                                    aria-label={t('schedules.weekly.deleteAria')}
                                                    onClick={() => handleDeleteSchedule(s.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        <form onSubmit={handleAddSchedule} className="add-row">
                            <select
                                value={newDayOfWeek}
                                onChange={(e) => setNewDayOfWeek(Number(e.target.value))}
                                aria-label={t('schedules.weekly.table.day')}
                            >
                                {DAY_KEYS.map((k, i) => (
                                    <option key={i} value={i}>
                                        {t(`schedules.days.${k}` as 'schedules.days.0')}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="time"
                                value={newStartTime}
                                onChange={(e) => setNewStartTime(e.target.value)}
                                aria-label={t('schedules.weekly.table.start')}
                            />
                            <input
                                type="time"
                                value={newEndTime}
                                onChange={(e) => setNewEndTime(e.target.value)}
                                aria-label={t('schedules.weekly.table.end')}
                            />
                            <button type="submit" className="btn btn-primary" disabled={!selectedId}>
                                {t('schedules.addButton')}
                            </button>
                        </form>
                        {scheduleError && <div className="error">{scheduleError}</div>}
                    </section>

                    <section className="card panel">
                        <h2>{t('schedules.leaves.title')}</h2>
                        <p className="text-muted hint">{t('schedules.leaves.hint')}</p>

                        {leaves.length === 0 ? (
                            <p className="empty">{t('schedules.leaves.empty')}</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>{t('schedules.leaves.table.from')}</th>
                                        <th>{t('schedules.leaves.table.to')}</th>
                                        <th>{t('schedules.leaves.table.reason')}</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaves.map((l) => (
                                        <tr key={l.id}>
                                            <td>{new Date(l.startDate).toLocaleDateString()}</td>
                                            <td>{new Date(l.endDate).toLocaleDateString()}</td>
                                            <td>{l.reason || <span className="text-muted">—</span>}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="icon-btn"
                                                    aria-label={t('schedules.leaves.deleteAria')}
                                                    onClick={() => handleDeleteLeave(l.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        <form onSubmit={handleAddLeave} className="add-row">
                            <input
                                type="date"
                                value={leaveStart}
                                onChange={(e) => setLeaveStart(e.target.value)}
                                aria-label={t('schedules.leaves.table.from')}
                            />
                            <input
                                type="date"
                                value={leaveEnd}
                                onChange={(e) => setLeaveEnd(e.target.value)}
                                aria-label={t('schedules.leaves.table.to')}
                            />
                            <input
                                type="text"
                                value={leaveReason}
                                onChange={(e) => setLeaveReason(e.target.value)}
                                placeholder={t('schedules.leaves.reasonPlaceholder')}
                                aria-label={t('schedules.leaves.table.reason')}
                            />
                            <button type="submit" className="btn btn-primary" disabled={!selectedId}>
                                {t('schedules.addButton')}
                            </button>
                        </form>
                        {leaveError && <div className="error">{leaveError}</div>}
                    </section>
                </div>
            )}

            <style>{`
                .page-header { margin-bottom: var(--space-6); }
                .page-header h1 { margin: 0 0 var(--space-2) 0; }

                .instructor-picker {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    margin-bottom: var(--space-6);
                }
                .instructor-picker label {
                    font-size: 0.85rem;
                    color: hsl(var(--color-text-muted));
                }
                .instructor-picker select {
                    padding: var(--space-2) var(--space-3);
                    border: 1px solid hsl(var(--color-border));
                    border-radius: var(--radius-md);
                    min-width: 220px;
                    background-color: white;
                }

                .grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: var(--space-6);
                }
                @media (max-width: 980px) {
                    .grid { grid-template-columns: 1fr; }
                }

                .panel { padding: var(--space-6); }
                .panel h2 { margin: 0 0 var(--space-2) 0; font-size: 1.05rem; }
                .panel .hint { font-size: 0.85rem; margin: 0 0 var(--space-4) 0; }

                table { width: 100%; border-collapse: collapse; margin-bottom: var(--space-4); }
                th, td {
                    padding: var(--space-2) var(--space-3);
                    text-align: left;
                    border-bottom: 1px solid hsl(var(--color-border));
                    font-size: 0.95rem;
                }
                th {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    color: hsl(var(--color-text-muted));
                }
                tbody tr:last-child td { border-bottom: none; }

                .empty {
                    color: hsl(var(--color-text-muted));
                    padding: var(--space-3) 0;
                }

                .add-row {
                    display: flex;
                    gap: var(--space-2);
                    align-items: center;
                    padding-top: var(--space-3);
                    border-top: 1px dashed hsl(var(--color-border));
                    flex-wrap: wrap;
                }
                .add-row > input, .add-row > select {
                    padding: var(--space-2) var(--space-3);
                    border: 1px solid hsl(var(--color-border));
                    border-radius: var(--radius-md);
                    background-color: white;
                    font-size: 0.95rem;
                }
                .add-row > input[type="text"] { flex: 1; min-width: 160px; }

                .btn {
                    padding: var(--space-2) var(--space-4);
                    border: none;
                    border-radius: var(--radius-md);
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: var(--transition-base);
                }
                .btn-primary { background-color: hsl(var(--color-primary)); color: white; }
                .btn-primary:hover:not(:disabled) { background-color: hsl(var(--color-primary-light)); }
                .btn:disabled { opacity: 0.6; cursor: not-allowed; }

                .icon-btn {
                    background: none;
                    border: none;
                    color: hsl(var(--color-text-muted));
                    cursor: pointer;
                    padding: var(--space-1);
                    border-radius: var(--radius-md);
                }
                .icon-btn:hover { color: hsl(var(--color-error)); }

                .error {
                    background-color: hsl(var(--color-error) / 0.1);
                    color: hsl(var(--color-error));
                    padding: var(--space-2) var(--space-3);
                    border-radius: var(--radius-md);
                    font-size: 0.85rem;
                    margin-top: var(--space-3);
                }
                .loading { padding: var(--space-12); text-align: center; color: hsl(var(--color-text-muted)); }
            `}</style>
        </div>
    );
};

export default Schedules;
