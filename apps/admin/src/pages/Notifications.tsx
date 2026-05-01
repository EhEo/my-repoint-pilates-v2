import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
    fetchNotifications,
    scanMembershipExpiries,
    deleteNotification,
} from '../utils/api';
import type { Notification, NotificationStatus } from '../types';

const STATUS_FILTERS: (NotificationStatus | 'ALL')[] = ['ALL', 'SENT', 'PENDING', 'FAILED'];

const Notifications = () => {
    const { t } = useTranslation();
    const [items, setItems] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<NotificationStatus | 'ALL'>('ALL');
    const [isLoading, setIsLoading] = useState(true);
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);

    const load = async () => {
        setIsLoading(true);
        try {
            const data = (await fetchNotifications(
                filter === 'ALL' ? undefined : { status: filter }
            )) as Notification[];
            setItems(data);
        } catch (err) {
            console.error('Failed to load notifications', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    const handleScan = async () => {
        setScanning(true);
        setScanResult(null);
        try {
            const result = await scanMembershipExpiries();
            setScanResult(t('notifications.scanResult', { count: result.created }));
            await load();
        } catch (err) {
            setScanResult(err instanceof Error ? err.message : t('notifications.scanFailed'));
        } finally {
            setScanning(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('notifications.deleteConfirm'))) return;
        await deleteNotification(id);
        await load();
    };

    return (
        <div className="notifications-page">
            <header className="page-header">
                <div>
                    <h1>{t('notifications.title')}</h1>
                    <p className="text-muted">{t('notifications.subtitle')}</p>
                </div>
                <button type="button" className="btn btn-primary" onClick={handleScan} disabled={scanning}>
                    {scanning ? t('notifications.scanning') : t('notifications.scanButton')}
                </button>
            </header>

            {scanResult && <div className="scan-result">{scanResult}</div>}

            <div className="tabs">
                {STATUS_FILTERS.map((s) => (
                    <button
                        key={s}
                        type="button"
                        className={clsx('tab', filter === s && 'active')}
                        onClick={() => setFilter(s)}
                    >
                        {t(`notifications.tabs.${s}` as 'notifications.tabs.ALL')}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="empty">{t('notifications.loading')}</div>
            ) : items.length === 0 ? (
                <div className="empty">{t('notifications.empty')}</div>
            ) : (
                <div className="card table-card">
                    <table>
                        <thead>
                            <tr>
                                <th>{t('notifications.table.created')}</th>
                                <th>{t('notifications.table.type')}</th>
                                <th>{t('notifications.table.recipient')}</th>
                                <th>{t('notifications.table.channel')}</th>
                                <th>{t('notifications.table.status')}</th>
                                <th>{t('notifications.table.title')}</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((n) => (
                                <tr key={n.id}>
                                    <td className="ts">
                                        {new Date(n.createdAt).toLocaleString(undefined, {
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </td>
                                    <td>{t(`notifications.type.${n.type}` as 'notifications.type.RESERVATION_CONFIRMED', { defaultValue: n.type })}</td>
                                    <td>
                                        <span className="text-muted">
                                            {t(`notifications.recipient.${n.recipientType}` as 'notifications.recipient.MEMBER', { defaultValue: n.recipientType })}
                                        </span>{' '}
                                        <span className="mono">{n.recipientId.slice(0, 8)}</span>
                                    </td>
                                    <td>{n.channel}</td>
                                    <td>
                                        <span className={clsx('status-badge', n.status.toLowerCase())}>
                                            {t(`notifications.status.${n.status}` as 'notifications.status.SENT', { defaultValue: n.status })}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="title">{n.title}</div>
                                        <div className="body text-muted">{n.body}</div>
                                        {n.errorMessage && <div className="error-text">{n.errorMessage}</div>}
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            className="icon-btn"
                                            aria-label={t('notifications.deleteAria')}
                                            onClick={() => handleDelete(n.id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <style>{`
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: var(--space-6);
                    gap: var(--space-4);
                }
                .page-header h1 { margin: 0 0 var(--space-2) 0; }

                .tabs {
                    display: flex;
                    border-bottom: 1px solid hsl(var(--color-border));
                    margin-bottom: var(--space-6);
                }
                .tab {
                    padding: var(--space-3) var(--space-5);
                    background: none;
                    border: none;
                    border-bottom: 2px solid transparent;
                    cursor: pointer;
                    font-weight: 500;
                    color: hsl(var(--color-text-muted));
                    transition: var(--transition-base);
                    font-size: 0.95rem;
                }
                .tab.active {
                    color: hsl(var(--color-primary));
                    border-bottom-color: hsl(var(--color-primary));
                }

                .scan-result {
                    background-color: hsl(var(--color-success) / 0.1);
                    color: hsl(var(--color-success));
                    padding: var(--space-3) var(--space-4);
                    border-radius: var(--radius-md);
                    margin-bottom: var(--space-4);
                    font-size: 0.9rem;
                }

                .table-card { padding: 0; overflow: hidden; }
                table { width: 100%; border-collapse: collapse; }
                th, td {
                    padding: var(--space-3) var(--space-4);
                    text-align: left;
                    border-bottom: 1px solid hsl(var(--color-border));
                    font-size: 0.92rem;
                    vertical-align: top;
                }
                th {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    color: hsl(var(--color-text-muted));
                    background-color: hsl(var(--color-bg-main));
                }
                tbody tr:last-child td { border-bottom: none; }
                .ts { white-space: nowrap; color: hsl(var(--color-text-muted)); font-size: 0.85rem; }
                .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.85rem; }

                .title { font-weight: 500; }
                .body { font-size: 0.85rem; margin-top: 2px; }
                .error-text {
                    margin-top: 4px;
                    color: hsl(var(--color-error));
                    font-size: 0.85rem;
                }

                .status-badge {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: var(--radius-full);
                    font-size: 0.75rem;
                    font-weight: 500;
                }
                .status-badge.sent {
                    background-color: hsl(var(--color-success) / 0.1);
                    color: hsl(var(--color-success));
                }
                .status-badge.pending {
                    background-color: hsl(var(--color-warning) / 0.1);
                    color: hsl(var(--color-warning));
                }
                .status-badge.failed {
                    background-color: hsl(var(--color-error) / 0.1);
                    color: hsl(var(--color-error));
                }

                .empty {
                    text-align: center;
                    padding: var(--space-12);
                    color: hsl(var(--color-text-muted));
                }

                .btn {
                    padding: var(--space-3) var(--space-5);
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
            `}</style>
        </div>
    );
};

export default Notifications;
