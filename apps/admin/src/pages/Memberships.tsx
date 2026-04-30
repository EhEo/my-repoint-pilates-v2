import { useEffect, useState, type FormEvent } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
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

    // Edit modal — endDate + payment/refund flags (Phase 4 mini)
    const [editing, setEditing] = useState<Membership | null>(null);
    const [editEndDate, setEditEndDate] = useState('');
    const [editPaid, setEditPaid] = useState(false);
    const [editPaidAt, setEditPaidAt] = useState('');
    const [editRefundedAt, setEditRefundedAt] = useState('');
    const [editNote, setEditNote] = useState('');

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
            setError(err instanceof Error ? err.message : t('memberships.form.issueFailed'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveEdit = async () => {
        if (!editing) return;
        try {
            await updateMembership(editing.id, {
                endDate: editEndDate,
                paid: editPaid,
                paidAt: editPaidAt ? new Date(editPaidAt).toISOString() : null,
                refundedAt: editRefundedAt ? new Date(editRefundedAt).toISOString() : null,
                paymentNote: editNote.trim() ? editNote.trim() : null,
            });
            setEditing(null);
            await load();
        } catch (err) {
            console.error(err);
            alert(t('memberships.edit.saveFailed'));
        }
    };

    const startEdit = (m: Membership) => {
        setEditing(m);
        setEditEndDate(toDateInput(m.endDate));
        setEditPaid(m.paid);
        setEditPaidAt(m.paidAt ? toDateInput(m.paidAt) : '');
        setEditRefundedAt(m.refundedAt ? toDateInput(m.refundedAt) : '');
        setEditNote(m.paymentNote ?? '');
    };

    const markRefundedNow = () => {
        const today = new Date().toISOString().slice(0, 10);
        setEditRefundedAt(today);
    };

    const markPaidNow = () => {
        const today = new Date().toISOString().slice(0, 10);
        setEditPaid(true);
        setEditPaidAt(today);
    };

    return (
        <div className="memberships-page">
            <header className="page-header">
                <div>
                    <h1>{t('memberships.title')}</h1>
                    <p className="text-muted">{t('memberships.subtitle')}</p>
                </div>
                <button type="button" className="btn btn-primary" onClick={() => setIsIssueOpen(true)}>
                    {t('memberships.issueButton')}
                </button>
            </header>

            <div className="tabs">
                <button
                    type="button"
                    className={clsx('tab', filter === 'ACTIVE' && 'active')}
                    onClick={() => setFilter('ACTIVE')}
                >
                    {t('memberships.tabs.active')}
                </button>
                <button
                    type="button"
                    className={clsx('tab', filter === 'ALL' && 'active')}
                    onClick={() => setFilter('ALL')}
                >
                    {t('memberships.tabs.all')}
                </button>
            </div>

            {isLoading ? (
                <div className="loading">{t('memberships.loading')}</div>
            ) : memberships.length === 0 ? (
                <div className="empty-state">{t('memberships.empty')}</div>
            ) : (
                <div className="card table-card">
                    <table>
                        <thead>
                            <tr>
                                <th>{t('memberships.table.member')}</th>
                                <th>{t('memberships.table.remaining')}</th>
                                <th>{t('memberships.table.total')}</th>
                                <th>{t('memberships.table.start')}</th>
                                <th>{t('memberships.table.expires')}</th>
                                <th>{t('memberships.table.status')}</th>
                                <th>{t('memberships.table.payment')}</th>
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
                                            {t(`memberships.status.${m.status}` as 'memberships.status.ACTIVE', { defaultValue: m.status })}
                                        </span>
                                    </td>
                                    <td>
                                        {m.refundedAt ? (
                                            <span className="status-badge refunded">
                                                {t('memberships.paymentBadge.refunded', { date: new Date(m.refundedAt).toLocaleDateString() })}
                                            </span>
                                        ) : m.paid ? (
                                            <span className="status-badge paid">{t('memberships.paymentBadge.paid')}</span>
                                        ) : (
                                            <span className="status-badge unpaid">{t('memberships.paymentBadge.unpaid')}</span>
                                        )}
                                    </td>
                                    <td>
                                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => startEdit(m)}>
                                            {t('memberships.table.edit')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={isIssueOpen} onClose={() => setIsIssueOpen(false)} title={t('memberships.issueModalTitle')}>
                <form onSubmit={handleIssue} className="issue-form">
                    <div className="form-group">
                        <label htmlFor="member">{t('memberships.form.memberLabel')}</label>
                        <select
                            id="member"
                            required
                            value={issueMemberId}
                            onChange={(e) => setIssueMemberId(e.target.value)}
                        >
                            <option value="">{t('memberships.form.memberPlaceholder')}</option>
                            {members.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name} ({m.email})
                                </option>
                            ))}
                        </select>
                        <p className="hint text-muted">{t('memberships.issueHint')}</p>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="totalCount">{t('memberships.form.totalCount')}</label>
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
                            <label htmlFor="endDate">{t('memberships.form.expiryDate')}</label>
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
                            {t('common.cancel')}
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? t('memberships.form.issuing') : t('memberships.form.issue')}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={!!editing} onClose={() => setEditing(null)} title={t('memberships.edit.title')}>
                {editing && (
                    <div className="edit-form">
                        <p>{t('memberships.edit.intro', { name: editing.member?.name ?? '' })}</p>

                        <fieldset>
                            <legend>{t('memberships.edit.expiryLegend')}</legend>
                            <div className="form-group">
                                <label htmlFor="editEndDate">{t('memberships.edit.expiryDate')}</label>
                                <input
                                    id="editEndDate"
                                    type="date"
                                    value={editEndDate}
                                    onChange={(e) => setEditEndDate(e.target.value)}
                                />
                            </div>
                        </fieldset>

                        <fieldset>
                            <legend>{t('memberships.edit.paymentLegend')}</legend>
                            <p className="hint text-muted">{t('memberships.edit.paymentHint')}</p>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={editPaid}
                                            onChange={(e) => setEditPaid(e.target.checked)}
                                        />
                                        {t('memberships.edit.paid')}
                                    </label>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="editPaidAt">{t('memberships.edit.paidDate')}</label>
                                    <input
                                        id="editPaidAt"
                                        type="date"
                                        value={editPaidAt}
                                        onChange={(e) => setEditPaidAt(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={markPaidNow}>
                                {t('memberships.edit.markPaidToday')}
                            </button>
                        </fieldset>

                        <fieldset>
                            <legend>{t('memberships.edit.refundLegend')}</legend>
                            <div className="form-group">
                                <label htmlFor="editRefundedAt">{t('memberships.edit.refundedDate')}</label>
                                <input
                                    id="editRefundedAt"
                                    type="date"
                                    value={editRefundedAt}
                                    onChange={(e) => setEditRefundedAt(e.target.value)}
                                />
                                <p className="hint text-muted">{t('memberships.edit.refundHint')}</p>
                            </div>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={markRefundedNow}>
                                {t('memberships.edit.markRefundedToday')}
                            </button>
                        </fieldset>

                        <fieldset>
                            <legend>{t('memberships.edit.noteLegend')}</legend>
                            <div className="form-group">
                                <label htmlFor="editNote">{t('memberships.edit.noteLabel')}</label>
                                <textarea
                                    id="editNote"
                                    rows={3}
                                    value={editNote}
                                    onChange={(e) => setEditNote(e.target.value)}
                                    placeholder={t('memberships.edit.notePlaceholder')}
                                />
                            </div>
                        </fieldset>

                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>
                                {t('common.cancel')}
                            </button>
                            <button type="button" className="btn btn-primary" onClick={handleSaveEdit}>
                                {t('common.save')}
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
                .status-badge.cancelled,
                .status-badge.unpaid {
                    background-color: hsl(var(--color-text-muted) / 0.1);
                    color: hsl(var(--color-text-muted));
                }
                .status-badge.paid {
                    background-color: hsl(var(--color-success) / 0.1);
                    color: hsl(var(--color-success));
                }
                .status-badge.refunded {
                    background-color: hsl(var(--color-warning) / 0.1);
                    color: hsl(var(--color-warning));
                }
                fieldset {
                    border: 1px solid hsl(var(--color-border));
                    border-radius: var(--radius-md);
                    padding: var(--space-4);
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-3);
                }
                fieldset legend {
                    font-size: 0.85rem;
                    color: hsl(var(--color-text-muted));
                    padding: 0 var(--space-2);
                }
                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    color: hsl(var(--color-text-main));
                }
                .checkbox-label input[type="checkbox"] {
                    width: 18px;
                    height: 18px;
                }
                .form-group textarea {
                    padding: var(--space-3);
                    border: 1px solid hsl(var(--color-border));
                    border-radius: var(--radius-md);
                    font-size: 0.95rem;
                    font-family: inherit;
                    resize: vertical;
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
