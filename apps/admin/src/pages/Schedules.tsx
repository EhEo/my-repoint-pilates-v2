import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
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

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Schedules = () => {
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
            setScheduleError(err instanceof Error ? err.message : 'Failed to add slot');
        }
    };

    const handleDeleteSchedule = async (id: string) => {
        if (!confirm('Delete this slot?')) return;
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
            setLeaveError(err instanceof Error ? err.message : 'Failed to add leave');
        }
    };

    const handleDeleteLeave = async (id: string) => {
        if (!confirm('Delete this leave?')) return;
        await deleteInstructorLeave(id);
        if (selectedId) await loadForInstructor(selectedId);
    };

    return (
        <div className="schedules-page">
            <header className="page-header">
                <div>
                    <h1>Instructor Schedules</h1>
                    <p className="text-muted">강사별 주간 가용 시간과 휴무를 관리합니다.</p>
                </div>
            </header>

            <div className="instructor-picker">
                <label htmlFor="instructor">Instructor</label>
                <select
                    id="instructor"
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                >
                    {instructors.length === 0 && <option value="">— No instructors —</option>}
                    {instructors.map((i) => (
                        <option key={i.id} value={i.id}>
                            {i.name}
                        </option>
                    ))}
                </select>
            </div>

            {isLoading ? (
                <div className="loading">Loading…</div>
            ) : (
                <div className="grid">
                    <section className="card panel">
                        <h2>Weekly Availability</h2>
                        <p className="text-muted hint">반복되는 주간 가용 시간대.</p>

                        {schedules.length === 0 ? (
                            <p className="empty">No availability set.</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Day</th>
                                        <th>Start</th>
                                        <th>End</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schedules.map((s) => (
                                        <tr key={s.id}>
                                            <td>{DAY_LABELS[s.dayOfWeek]}</td>
                                            <td>{s.startTime}</td>
                                            <td>{s.endTime}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="icon-btn"
                                                    aria-label="Delete slot"
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
                                aria-label="Day of week"
                            >
                                {DAY_LABELS.map((label, i) => (
                                    <option key={i} value={i}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="time"
                                value={newStartTime}
                                onChange={(e) => setNewStartTime(e.target.value)}
                                aria-label="Start time"
                            />
                            <input
                                type="time"
                                value={newEndTime}
                                onChange={(e) => setNewEndTime(e.target.value)}
                                aria-label="End time"
                            />
                            <button type="submit" className="btn btn-primary" disabled={!selectedId}>
                                Add
                            </button>
                        </form>
                        {scheduleError && <div className="error">{scheduleError}</div>}
                    </section>

                    <section className="card panel">
                        <h2>Leaves</h2>
                        <p className="text-muted hint">특정 일자/기간 휴무 (주간 가용 시간을 override).</p>

                        {leaves.length === 0 ? (
                            <p className="empty">No leaves.</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>From</th>
                                        <th>To</th>
                                        <th>Reason</th>
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
                                                    aria-label="Delete leave"
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
                                aria-label="Leave start date"
                            />
                            <input
                                type="date"
                                value={leaveEnd}
                                onChange={(e) => setLeaveEnd(e.target.value)}
                                aria-label="Leave end date"
                            />
                            <input
                                type="text"
                                value={leaveReason}
                                onChange={(e) => setLeaveReason(e.target.value)}
                                placeholder="Reason (optional)"
                                aria-label="Leave reason"
                            />
                            <button type="submit" className="btn btn-primary" disabled={!selectedId}>
                                Add
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
