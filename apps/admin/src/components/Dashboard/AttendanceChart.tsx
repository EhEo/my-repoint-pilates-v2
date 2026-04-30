import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MOCK_ATTENDANCE_DATA } from '../../utils/mockDashboardData';

const AttendanceChart: React.FC = () => {
    return (
        <div className="chart-container">
            <h3>Weekly Attendance by Type</h3>
            <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={MOCK_ATTENDANCE_DATA}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        barSize={20}
                    >
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
                        />
                        <Tooltip
                            cursor={{ fill: 'var(--color-background)' }}
                            contentStyle={{
                                backgroundColor: 'var(--color-surface)',
                                borderColor: 'var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--color-text-primary)'
                            }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="Group" stackId="a" fill="var(--color-primary)" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="Private" stackId="a" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
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

export default AttendanceChart;
