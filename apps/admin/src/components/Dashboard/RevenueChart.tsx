import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import {
    fetchDashboardRevenue,
    type RevenueGranularity,
    type RevenueSeriesResponse,
} from '../../utils/api';

const GRANULARITIES: RevenueGranularity[] = ['DAY', 'WEEK', 'MONTH', 'YEAR'];

// KRW 단위 축약: 100,000,000 → "1.2억", 10,000 → "1.2만"
function formatKRWCompact(value: number): string {
    if (!Number.isFinite(value)) return '₩0';
    const sign = value < 0 ? '-' : '';
    const abs = Math.abs(value);
    if (abs >= 100_000_000) return `${sign}₩${(abs / 100_000_000).toFixed(1)}억`;
    if (abs >= 10_000) return `${sign}₩${(abs / 10_000).toFixed(0)}만`;
    return `${sign}₩${abs.toLocaleString()}`;
}

function formatKRWFull(value: number): string {
    return `₩${value.toLocaleString('ko-KR')}`;
}

const RevenueChart = () => {
    const { t } = useTranslation();
    const [granularity, setGranularity] = useState<RevenueGranularity>('MONTH');
    const [data, setData] = useState<RevenueSeriesResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        fetchDashboardRevenue(granularity)
            .then((res) => {
                if (!cancelled) setData(res);
            })
            .catch((err) => {
                console.error('Failed to load revenue series', err);
                if (!cancelled) setData(null);
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [granularity]);

    const series = data?.series ?? [];
    const hasAny = series.some((s) => s.net !== 0 || s.gross !== 0);

    return (
        <div className="chart-container">
            <header className="chart-header">
                <h3>{t('charts.revenue')}</h3>
                <div className="granularity-tabs">
                    {GRANULARITIES.map((g) => (
                        <button
                            key={g}
                            type="button"
                            className={clsx('granularity-tab', granularity === g && 'active')}
                            onClick={() => setGranularity(g)}
                        >
                            {t(`charts.granularity.${g}`)}
                        </button>
                    ))}
                </div>
            </header>

            <div className="chart-wrapper">
                {isLoading ? (
                    <div className="chart-empty">{t('common.loading')}</div>
                ) : !hasAny ? (
                    <div className="chart-empty">{t('charts.noPaidRevenue')}</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={series} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--color-primary))" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="hsl(var(--color-primary))" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="hsl(var(--color-border))"
                            />
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'hsl(var(--color-text-muted))', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'hsl(var(--color-text-muted))', fontSize: 12 }}
                                tickFormatter={(value) => formatKRWCompact(Number(value))}
                                width={70}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--color-bg-card))',
                                    borderColor: 'hsl(var(--color-border))',
                                    borderRadius: 'var(--radius-md)',
                                }}
                                labelFormatter={(label) => `${label}`}
                                formatter={(value, name) => {
                                    const key = String(name);
                                    const label =
                                        key === 'net' || key === 'gross' || key === 'refunds'
                                            ? t(`charts.labels.${key}`)
                                            : key;
                                    return [formatKRWFull(Number(value)), label];
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="net"
                                name="net"
                                stroke="hsl(var(--color-primary))"
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            <style>{`
                .chart-container {
                    background-color: hsl(var(--color-bg-card));
                    border-radius: var(--radius-lg);
                    padding: var(--space-6);
                    box-shadow: var(--shadow-sm);
                    border: 1px solid hsl(var(--color-border));
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                .chart-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--space-4);
                }
                .chart-header h3 {
                    margin: 0;
                    font-size: 1.1rem;
                    color: hsl(var(--color-text-main));
                }
                .granularity-tabs {
                    display: flex;
                    gap: var(--space-1);
                    background-color: hsl(var(--color-bg-main));
                    padding: 2px;
                    border-radius: var(--radius-md);
                }
                .granularity-tab {
                    padding: 4px 10px;
                    background: none;
                    border: none;
                    border-radius: var(--radius-sm);
                    font-size: 0.8rem;
                    color: hsl(var(--color-text-muted));
                    cursor: pointer;
                    transition: var(--transition-base);
                }
                .granularity-tab:hover {
                    color: hsl(var(--color-text-main));
                }
                .granularity-tab.active {
                    background-color: hsl(var(--color-bg-card));
                    color: hsl(var(--color-primary));
                    box-shadow: var(--shadow-sm);
                    font-weight: 500;
                }
                .chart-wrapper {
                    flex: 1;
                    min-height: 300px;
                }
                .chart-empty {
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: hsl(var(--color-text-muted));
                    font-size: 0.9rem;
                    text-align: center;
                    padding: var(--space-6);
                }
            `}</style>
        </div>
    );
};

export default RevenueChart;
