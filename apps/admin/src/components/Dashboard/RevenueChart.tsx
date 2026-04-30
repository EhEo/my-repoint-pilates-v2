import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_REVENUE_DATA } from '../../utils/mockDashboardData';

const RevenueChart: React.FC = () => {
    return (
        <div className="chart-container">
            <h3>Monthly Revenue</h3>
            <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={MOCK_REVENUE_DATA}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--color-surface)',
                                borderColor: 'var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--color-text-primary)'
                            }}
                            itemStyle={{ color: 'var(--color-primary)' }}
                            formatter={(value: number | string | Array<number | string> | undefined) => [`$${value}`, 'Revenue']}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="var(--color-primary)"
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <style>{`
        .chart-container {
            background-color: var(--color-surface);
            border-radius: var(--radius-lg);
            padding: var(--space-6);
            box-shadow: var(--shadow-sm);
            border: 1px solid var(--color-border);
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        .chart-container h3 {
            margin: 0 0 var(--space-4) 0;
            font-size: 1.1rem;
            color: var(--color-text-primary);
        }
        .chart-wrapper {
            flex: 1;
            min-height: 300px;
        }
      `}</style>
        </div>
    );
};

export default RevenueChart;
