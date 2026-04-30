import { useState, useEffect } from 'react';
import { Users, Calendar, DollarSign, TrendingUp, Bell, Clock } from 'lucide-react';
import RevenueChart from '../components/Dashboard/RevenueChart';
import AttendanceChart from '../components/Dashboard/AttendanceChart';
import { fetchDashboardStats, fetchRecentActivity } from '../utils/api';
// import { MOCK_DASHBOARD_STATS, MOCK_RECENT_ACTIVITY } from '../utils/mockDashboardData';

const Dashboard = () => {
  const [stats, setStats] = useState<any>({
    totalMembers: 0,
    classesToday: 0,
    revenue: 0,
    pendingRequests: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, activityData] = await Promise.all([
        fetchDashboardStats(),
        fetchRecentActivity()
      ]);
      setStats(statsData);
      setRecentActivity(activityData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'users': return <Users size={24} />;
      case 'calendar': return <Calendar size={24} />;
      case 'dollar': return <DollarSign size={24} />;
      case 'bell': return <Bell size={24} />;
      default: return <TrendingUp size={24} />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'users': return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' };
      case 'calendar': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
      case 'dollar': return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
      case 'bell': return { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' };
      default: return { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' };
    }
  };

  const dashboardStats = [
    {
      label: 'Total Members',
      value: stats.totalMembers,
      change: '+12% from last month',
      trend: 'positive',
      iconType: 'users'
    },
    {
      label: 'Classes Today',
      value: stats.classesToday,
      change: '4 scheduled',
      trend: 'neutral',
      iconType: 'calendar'
    },
    {
      label: 'Revenue (Est.)',
      value: `$${stats.revenue.toLocaleString()}`,
      change: '+8% from last month',
      trend: 'positive',
      iconType: 'dollar'
    },
    {
      label: 'Pending Requests',
      value: stats.pendingRequests,
      change: `${stats.pendingRequests} items need action`,
      trend: stats.pendingRequests > 0 ? 'negative' : 'neutral',
      iconType: 'bell'
    }
  ];

  return (
    <div>
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <button className="btn btn-primary">Download Report</button>
      </header>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>Loading dashboard...</div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="stats-grid">
            {dashboardStats.map((stat, index) => {
              const colors = getIconColor(stat.iconType);
              return (
                <div key={index} className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: colors.bg, color: colors.color }}>
                    {getIcon(stat.iconType)}
                  </div>
                  <div>
                    <p className="stat-label">{stat.label}</p>
                    <p className="stat-value">{stat.value}</p>
                    <p className={`stat-trend ${stat.trend}`}>
                      {stat.trend === 'positive' && <TrendingUp size={16} />}
                      {stat.change}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="charts-grid">
            <RevenueChart />
            <AttendanceChart />
          </div>

          {/* Recent Activity Section */}
          <div className="recent-activity">
            <div className="section-header">
              <h3>Recent Activity</h3>
              <button className="btn btn-ghost btn-sm">View All</button>
            </div>
            <div className="activity-list">
              {recentActivity.length > 0 ? (
                recentActivity.map((item) => (
                  <div key={item.id} className="activity-item">
                    <div className="activity-icon">
                      <Clock size={16} />
                    </div>
                    <div className="activity-content">
                      <p className="activity-text">
                        <span style={{ fontWeight: 600 }}>{item.user}</span> {item.action} {item.target && <span style={{ fontWeight: 600 }}>{item.target}</span>}.
                      </p>
                      <p className="activity-time">{item.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>No recent activity.</p>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--space-8);
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: var(--space-6);
                    margin-bottom: var(--space-8);
                }

                .stat-card {
                    background-color: var(--color-surface);
                    padding: var(--space-6);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-sm);
                    display: flex;
                    align-items: flex-start;
                    gap: var(--space-4);
                    border: 1px solid var(--color-border);
                    transition: var(--transition-base);
                }

                .stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                }

                .stat-icon {
                    padding: var(--space-3);
                    border-radius: var(--radius-md);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .stat-value {
                    font-size: 1.75rem;
                    font-weight: 700;
                    margin: var(--space-1) 0;
                    color: var(--color-text-primary);
                }

                .stat-label {
                    color: var(--color-text-muted);
                    font-size: 0.875rem;
                    margin: 0;
                }

                .stat-trend {
                    font-size: 0.875rem;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    margin: 0;
                    font-weight: 500;
                }

                .stat-trend.positive { color: var(--color-success); }
                .stat-trend.negative { color: var(--color-error); }
                .stat-trend.neutral { color: var(--color-text-muted); }

                .charts-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: var(--space-6);
                    margin-bottom: var(--space-8);
                    height: 400px;
                }

                .recent-activity {
                    background-color: var(--color-surface);
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--color-border);
                    padding: var(--space-6);
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--space-4);
                }

                .section-header h3 {
                    margin: 0;
                    font-size: 1.1rem;
                }

                .activity-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-4);
                }

                .activity-item {
                    display: flex;
                    gap: var(--space-4);
                    padding-bottom: var(--space-4);
                    border-bottom: 1px solid var(--color-border);
                }

                .activity-item:last-child {
                    border-bottom: none;
                    padding-bottom: 0;
                }

                .activity-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background-color: var(--color-background);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--color-text-muted);
                    flex-shrink: 0;
                }

                .activity-time {
                    font-size: 0.85rem;
                    color: var(--color-text-muted);
                    margin: 4px 0 0 0;
                }
                
                .activity-text {
                    margin: 0;
                    font-size: 0.95rem;
                    color: var(--color-text-primary);
                }
                
                @media (max-width: 768px) {
                    .charts-grid {
                        grid-template-columns: 1fr;
                        height: auto;
                    }
                    .chart-container {
                        min-height: 350px;
                    }
                }
            `}</style>
    </div>
  );
};

export default Dashboard;
