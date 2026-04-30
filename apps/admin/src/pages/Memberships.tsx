import { useEffect, useState, type FormEvent } from 'react';
import clsx from 'clsx';
import {
    fetchMemberships,
    createMembership,
    updateMembership,
    fetchMembers,
} from '../utils/api';
import Modal from '../components/common/Modal';
import type { Member, Membership } from '../types';

const toDateInput = (iso: string) => new Date(iso).toISOString().slice(0, 10);

const Memberships = () => {
    const [memberships, setMemberships] = useState<Membership[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'ACTIVE' | 'ALL'>('ACTIVE');

    // Issue (create) modal
    const [isIssueOpen, setIsIssueOpen] = useState(false);
    const [issueMemberId, setIssueMemberId] = useState('');
    const [issueTotalCount, setIssueTotalCount] = useState(10);
    const [issueEndDate, setIssueEndDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 90);
        return d.toISOString().slice(0, 10);
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Edit (endDate) modal
    const [editing, setEditing] = useState<Membership | null>(null);
    const [editEndDate, setEditEndDate] = useState('');

    const load = async () => {
        setIsLoading(true);
        try {
            const [m, mem] = await Promise.all([
                fetchMemberships(filter === 'ACTIVE' ? { status: 'ACTIVE' } : undefined),
                fetchMembers(),
            ]);
            setMemberships(m as Membership[]);
            setMembers(mem as Member[]);
        } catch (err) {
            console.error('Failed to load memberships', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    const handleIssue = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await createMembership({
                memberId: issueMemberId,
                totalCount: Number(issueTotalCount),
                endDate: issueEndDate,
            });
            setIsIssueOpen(false);
            setIssueMemberId('');
            setIssueTotalCount(10);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to issue membership');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveEndDate = async () => {
        if (!editing) return;
        try {
            await updateMembership(editing.id, { endDate: editEndDate });
            setEditing(null);
            await load();
        } catch (err) {
            console.error(err);
            alert('Failed to update expiry');
        }
    };

    const startEdit = (m: Membership) => {
        setEditing(m);
        setEditEndDate(toDateInput(m.endDate));
    };

    return (
        <div className="memberships-page">
            <header className="page-header">
                <div>
                    <h1>Memberships</h1>
                    <p className="text-muted">횟수권 발급·관리. 만료기간은 언제든 수정할 수 있습니다.</p>
                </div>
                <button type="button" className="btn btn-primary" onClick={() => setIsIssueOpen(true)}>
                    Issue Membership
                </button>
            </header>

            <div className="tabs">
                <button
                    type="button"
                    className={clsx('tab', filter === 'ACTIVE' && 'active')}
                    onClick={() => setFilter('ACTIVE')}
                >
                    Active
                </button>
                <button
                    type="button"
                    className={clsx('tab', filter === 'ALL' && 'active')}
                    onClick={() => setFilter('ALL')}
                >
                    All
                </button>
            </div>

            {isLoading ? (
                <div className="loading">Loading…</div>
            ) : memberships.length === 0 ? (
                <div className="empty-state">No memberships found.</div>
            ) : (
                <div className="card table-card">
                    <table>
                        <thead>
                            <tr>
                                <th>Member</th>
                                <th>Remaining</th>
                                <th>Total</th>
                                <th>Start</th>
                                <th>Expires</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {memberships.map((m) => (
                                <tr key={m.id}>
                                    <td>{m.member?.name ?? m.memberId.slice(0, 8)}</td>
                                    <td>{m.remainingCount}</td>
                                    <td>{m.totalCount}</td>
                                    <td>{new Date(m.startDate).toLocaleDateString()}</td>
                                    <td>{new Date(m.endDate).toLocaleDateString()}</td>
                                    <td>
                                        <span className={clsx('status-badge', m.status.toLowerCase())}>
                                            {m.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => startEdit(m)}>
                                            Edit Expiry
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={isIssueOpen} onClose={() => setIsIssueOpen(false)} title="Issue Membership">
                <form onSubmit={handleIssue} className="issue-form">
                    <div className="form-group">
                        <label htmlFor="member">Member *</label>
                        <select
                            id="member"
                            required
                            value={issueMemberId}
                            onChange={(e) => setIssueMemberId(e.target.value)}
                        >
                            <option value="">Select member…</option>
                            {members.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name} ({m.email})
                                </option>
                            ))}
                        </select>
                        <p className="hint text-muted">
                            기존 활성 회원권이 있으면 자동으로 취소되고 새 회원권이 발급됩니다.
                        </p>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="totalCount">Total Sessions *</label>
                            <input
                                id="totalCount"
                                type="number"
                                min={1}
                                required
                                value={issueTotalCount}
                                onChange={(e) => setIssueTotalCount(Number(e.target.value))}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="endDate">Expiry Date *</label>
                            <input
                                id="endDate"
                                type="date"
                                required
                                value={issueEndDate}
                                onChange={(e) => setIssueEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                    {error && <div className="error">{error}</div>}
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setIsIssueOpen(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Issuing…' : 'Issue'}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Edit Expiry">
                {editing && (
                    <div className="edit-form">
                        <p>
                            <strong>{editing.member?.name}</strong> 의 회원권 만료일을 수정합니다.
                        </p>
                        <div className="form-group">
                            <label htmlFor="editEndDate">Expiry Date</label>
                            <input
                                id="editEndDate"
                                type="date"
                                value={editEndDate}
                                onChange={(e) => setEditEndDate(e.target.value)}
                            />
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>
                                Cancel
                            </button>
                            <button type="button" className="btn btn-primary" onClick={handleSaveEndDate}>
                                Save
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            <style>{`
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: var(--space-6);
                }
                .page-header h1 { margin: 0 0 var(--space-2) 0; }
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
                    font-size: 1rem;
                }
                .tab.active {
                    color: hsl(var(--color-primary));
                    border-bottom-color: hsl(var(--color-primary));
                }
                .table-card { padding: 0; overflow: hidden; }
                table { width: 100%; border-collapse: collapse; }
                th, td {
                    padding: var(--space-3) var(--space-4);
                    text-align: left;
                    border-bottom: 1px solid hsl(var(--color-border));
                    font-size: 0.95rem;
                }
                th {
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    color: hsl(var(--color-text-muted));
                    background-color: hsl(var(--color-bg-main));
                }
                tbody tr:last-child td { border-bottom: none; }
                .status-badge {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: var(--radius-full);
                    font-size: 0.75rem;
                    font-weight: 500;
                }
                .status-badge.active {
                    background-color: hsl(var(--color-success) / 0.1);
                    color: hsl(var(--color-success));
                }
                .status-badge.expired,
                .status-badge.cancelled {
                    background-color: hsl(var(--color-text-muted) / 0.1);
                    color: hsl(var(--color-text-muted));
                }
                .empty-state, .loading {
                    text-align: center;
                    padding: var(--space-12);
                    color: hsl(var(--color-text-muted));
                }
                .issue-form, .edit-form {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-4);
                }
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: var(--space-4);
                }
                .form-group { display: flex; flex-direction: column; gap: var(--space-2); }
                .form-group label { font-size: 0.875rem; color: hsl(var(--color-text-muted)); }
                .form-group input, .form-group select {
                    padding: var(--space-3);
                    border: 1px solid hsl(var(--color-border));
                    border-radius: var(--radius-md);
                    font-size: 1rem;
                }
                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: var(--space-3);
                }
                .btn {
                    padding: var(--space-3) var(--space-5);
                    border: none;
                    border-radius: var(--radius-md);
                    font-size: 1rem;
                    cursor: pointer;
                    transition: var(--transition-base);
                }
                .btn-sm { padding: var(--space-1) var(--space-3); font-size: 0.875rem; }
                .btn-primary { background-color: hsl(var(--color-primary)); color: white; }
                .btn-primary:hover:not(:disabled) { background-color: hsl(var(--color-primary-light)); }
                .btn-secondary {
                    background-color: white;
                    color: hsl(var(--color-text-main));
                    border: 1px solid hsl(var(--color-border));
                }
                .btn:disabled { opacity: 0.6; cursor: not-allowed; }
                .error {
                    background-color: hsl(var(--color-error) / 0.1);
                    color: hsl(var(--color-error));
                    padding: var(--space-3);
                    border-radius: var(--radius-md);
                    font-size: 0.875rem;
                }
                .hint { font-size: 0.8rem; }
            `}</style>
        </div>
    );
};

export default Memberships;
