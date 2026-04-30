import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import {
    fetchMembers,
    fetchAssessments,
    createAssessment,
    deleteAssessment,
} from '../utils/api';
import type { Member, Assessment } from '../types';

const todayInput = () => new Date().toISOString().slice(0, 10);

const Assessments = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [selectedId, setSelectedId] = useState<string>('');
    const [items, setItems] = useState<Assessment[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Add form
    const [date, setDate] = useState(todayInput());
    const [heightCm, setHeightCm] = useState('');
    const [weightKg, setWeightKg] = useState('');
    const [bodyFatPct, setBodyFatPct] = useState('');
    const [muscleMassKg, setMuscleMassKg] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const list = (await fetchMembers()) as Member[];
            setMembers(list);
            if (list.length > 0 && !selectedId) {
                setSelectedId(list[0].id);
            }
        })().catch((err) => console.error('Failed to load members', err));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!selectedId) return;
        loadFor(selectedId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedId]);

    const loadFor = async (memberId: string) => {
        setIsLoading(true);
        try {
            const data = (await fetchAssessments(memberId)) as Assessment[];
            setItems(data);
        } catch (err) {
            console.error('Failed to load assessments', err);
        } finally {
            setIsLoading(false);
        }
    };

    const chartData = useMemo(
        () =>
            items.map((a) => ({
                date: new Date(a.date).toLocaleDateString('ko-KR', {
                    month: '2-digit',
                    day: '2-digit',
                }),
                weight: a.weightKg ?? null,
                bmi: a.bmi ?? null,
                bodyFat: a.bodyFatPct ?? null,
            })),
        [items]
    );
    const hasNumeric = chartData.some((d) => d.weight !== null || d.bmi !== null || d.bodyFat !== null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedId) return;
        setError(null);
        setSubmitting(true);
        try {
            await createAssessment({
                memberId: selectedId,
                date,
                heightCm: heightCm ? Number(heightCm) : null,
                weightKg: weightKg ? Number(weightKg) : null,
                bodyFatPct: bodyFatPct ? Number(bodyFatPct) : null,
                muscleMassKg: muscleMassKg ? Number(muscleMassKg) : null,
                notes: notes.trim() || undefined,
            });
            setHeightCm('');
            setWeightKg('');
            setBodyFatPct('');
            setMuscleMassKg('');
            setNotes('');
            setDate(todayInput());
            await loadFor(selectedId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add assessment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('이 측정 기록을 삭제하시겠습니까?')) return;
        await deleteAssessment(id);
        if (selectedId) await loadFor(selectedId);
    };

    return (
        <div className="assessments-page">
            <header className="page-header">
                <div>
                    <h1>Body Assessments</h1>
                    <p className="text-muted">
                        회원별 신체 측정 기록과 추이. 최소 범위(키/체중/BMI/체지방/근육량)만 다루며 자세·유연성·운동
                        처방·사진은 미도입.
                    </p>
                </div>
            </header>

            <div className="member-picker">
                <label htmlFor="member">Member</label>
                <select
                    id="member"
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                >
                    {members.length === 0 && <option value="">— No members —</option>}
                    {members.map((m) => (
                        <option key={m.id} value={m.id}>
                            {m.name}
                        </option>
                    ))}
                </select>
            </div>

            {isLoading ? (
                <div className="empty">Loading…</div>
            ) : (
                <div className="grid">
                    <section className="card panel">
                        <h2>Trend</h2>
                        <p className="text-muted hint">체중(kg) · BMI · 체지방률(%)</p>
                        <div className="chart-wrapper">
                            {!hasNumeric ? (
                                <div className="empty">기록이 없거나 수치 데이터가 없습니다.</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--color-border))" />
                                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                        <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="weight"
                                            name="체중 (kg)"
                                            stroke="hsl(var(--color-primary))"
                                            connectNulls
                                            dot
                                        />
                                        <Line
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="bmi"
                                            name="BMI"
                                            stroke="hsl(var(--color-accent))"
                                            connectNulls
                                            dot
                                        />
                                        <Line
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="bodyFat"
                                            name="체지방 (%)"
                                            stroke="hsl(var(--color-warning))"
                                            connectNulls
                                            dot
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </section>

                    <section className="card panel">
                        <h2>Add Measurement</h2>
                        <p className="text-muted hint">BMI 는 키와 체중이 함께 입력되면 자동 계산됩니다.</p>
                        <form onSubmit={handleSubmit} className="add-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="date">Date</label>
                                    <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="heightCm">Height (cm)</label>
                                    <input
                                        id="heightCm"
                                        type="number"
                                        min={0}
                                        step="0.1"
                                        value={heightCm}
                                        onChange={(e) => setHeightCm(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="weightKg">Weight (kg)</label>
                                    <input
                                        id="weightKg"
                                        type="number"
                                        min={0}
                                        step="0.1"
                                        value={weightKg}
                                        onChange={(e) => setWeightKg(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="bodyFatPct">Body Fat (%)</label>
                                    <input
                                        id="bodyFatPct"
                                        type="number"
                                        min={0}
                                        step="0.1"
                                        value={bodyFatPct}
                                        onChange={(e) => setBodyFatPct(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="muscleMassKg">Muscle Mass (kg)</label>
                                    <input
                                        id="muscleMassKg"
                                        type="number"
                                        min={0}
                                        step="0.1"
                                        value={muscleMassKg}
                                        onChange={(e) => setMuscleMassKg(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="notes">Notes</label>
                                <textarea
                                    id="notes"
                                    rows={2}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="특이사항, 통증 부위 등..."
                                />
                            </div>
                            {error && <div className="error">{error}</div>}
                            <button type="submit" className="btn btn-primary" disabled={submitting || !selectedId}>
                                {submitting ? 'Saving…' : 'Add measurement'}
                            </button>
                        </form>
                    </section>
                </div>
            )}

            <section className="card panel history">
                <h2>History</h2>
                {items.length === 0 ? (
                    <div className="empty">기록이 없습니다.</div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Height</th>
                                <th>Weight</th>
                                <th>BMI</th>
                                <th>Body Fat</th>
                                <th>Muscle</th>
                                <th>Notes</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...items].reverse().map((a) => (
                                <tr key={a.id}>
                                    <td className="ts">{new Date(a.date).toLocaleDateString('ko-KR')}</td>
                                    <td>{fmt(a.heightCm, 'cm')}</td>
                                    <td>{fmt(a.weightKg, 'kg')}</td>
                                    <td>{fmt(a.bmi, '')}</td>
                                    <td>{fmt(a.bodyFatPct, '%')}</td>
                                    <td>{fmt(a.muscleMassKg, 'kg')}</td>
                                    <td className="notes-cell">{a.notes || <span className="text-muted">—</span>}</td>
                                    <td>
                                        <button
                                            type="button"
                                            className="icon-btn"
                                            aria-label="Delete assessment"
                                            onClick={() => handleDelete(a.id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            <style>{`
                .page-header { margin-bottom: var(--space-6); }
                .page-header h1 { margin: 0 0 var(--space-2) 0; }

                .member-picker {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    margin-bottom: var(--space-6);
                }
                .member-picker label {
                    font-size: 0.85rem;
                    color: hsl(var(--color-text-muted));
                }
                .member-picker select {
                    padding: var(--space-2) var(--space-3);
                    border: 1px solid hsl(var(--color-border));
                    border-radius: var(--radius-md);
                    min-width: 220px;
                    background-color: white;
                }

                .grid {
                    display: grid;
                    grid-template-columns: 1.4fr 1fr;
                    gap: var(--space-6);
                    margin-bottom: var(--space-6);
                }
                @media (max-width: 980px) {
                    .grid { grid-template-columns: 1fr; }
                }

                .panel { padding: var(--space-6); }
                .panel h2 { margin: 0 0 var(--space-2) 0; font-size: 1.05rem; }
                .panel .hint { font-size: 0.85rem; margin: 0 0 var(--space-4) 0; }

                .chart-wrapper { height: 300px; }
                .empty {
                    text-align: center;
                    padding: var(--space-8);
                    color: hsl(var(--color-text-muted));
                }

                .add-form { display: flex; flex-direction: column; gap: var(--space-3); }
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: var(--space-3);
                }
                .form-group { display: flex; flex-direction: column; gap: var(--space-1); }
                .form-group label { font-size: 0.8rem; color: hsl(var(--color-text-muted)); }
                .form-group input, .form-group textarea {
                    padding: var(--space-2) var(--space-3);
                    border: 1px solid hsl(var(--color-border));
                    border-radius: var(--radius-md);
                    font-size: 0.95rem;
                    font-family: inherit;
                    background-color: white;
                }
                .form-group textarea { resize: vertical; }

                .btn {
                    padding: var(--space-2) var(--space-4);
                    border: none;
                    border-radius: var(--radius-md);
                    font-size: 0.95rem;
                    cursor: pointer;
                    align-self: flex-start;
                }
                .btn-primary { background-color: hsl(var(--color-primary)); color: white; }
                .btn-primary:hover:not(:disabled) { background-color: hsl(var(--color-primary-light)); }
                .btn:disabled { opacity: 0.6; cursor: not-allowed; }

                .error {
                    background-color: hsl(var(--color-error) / 0.1);
                    color: hsl(var(--color-error));
                    padding: var(--space-2) var(--space-3);
                    border-radius: var(--radius-md);
                    font-size: 0.85rem;
                }

                .history { padding: 0; overflow: hidden; }
                .history h2 { padding: var(--space-6) var(--space-6) var(--space-2); }
                .history table { width: 100%; border-collapse: collapse; }
                .history th, .history td {
                    padding: var(--space-2) var(--space-4);
                    text-align: left;
                    border-bottom: 1px solid hsl(var(--color-border));
                    font-size: 0.92rem;
                }
                .history th {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    color: hsl(var(--color-text-muted));
                    background-color: hsl(var(--color-bg-main));
                }
                .history tbody tr:last-child td { border-bottom: none; }
                .ts { white-space: nowrap; }
                .notes-cell {
                    max-width: 280px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .icon-btn {
                    background: none;
                    border: none;
                    color: hsl(var(--color-text-muted));
                    cursor: pointer;
                    padding: var(--space-1);
                    border-radius: var(--radius-md);
                }
                .icon-btn:hover { color: hsl(var(--color-error)); }
            `}</style>
        </div>
    );
};

function fmt(value: number | null | undefined, unit: string): string {
    if (value === null || value === undefined) return '—';
    return unit ? `${value} ${unit}` : `${value}`;
}

export default Assessments;
