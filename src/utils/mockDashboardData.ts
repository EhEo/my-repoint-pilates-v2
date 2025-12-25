export const MOCK_REVENUE_DATA = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 5000 },
    { name: 'Apr', revenue: 4500 },
    { name: 'May', revenue: 6000 },
    { name: 'Jun', revenue: 5500 },
    { name: 'Jul', revenue: 7000 },
];

export const MOCK_ATTENDANCE_DATA = [
    { name: 'Mon', Group: 40, Private: 24 },
    { name: 'Tue', Group: 30, Private: 13 },
    { name: 'Wed', Group: 20, Private: 38 },
    { name: 'Thu', Group: 27, Private: 39 },
    { name: 'Fri', Group: 18, Private: 48 },
    { name: 'Sat', Group: 23, Private: 38 },
    { name: 'Sun', Group: 34, Private: 43 },
];

export const MOCK_DASHBOARD_STATS = [
    {
        label: 'Total Members',
        value: '1,248',
        change: '+12%',
        trend: 'positive' as const,
        iconType: 'users' as const
    },
    {
        label: 'Classes Today',
        value: '8',
        change: 'Same as yesterday',
        trend: 'neutral' as const,
        iconType: 'calendar' as const
    },
    {
        label: 'Revenue (Nov)',
        value: '$12,450',
        change: '+8%',
        trend: 'positive' as const,
        iconType: 'dollar' as const
    },
    {
        label: 'Pending Requests',
        value: '5',
        change: 'Requires attention',
        trend: 'negative' as const,
        iconType: 'bell' as const
    }
];

export const MOCK_RECENT_ACTIVITY = [
    {
        id: 1,
        user: 'Sarah Jenkins',
        action: 'booked a class for',
        target: 'Pilates Reformer',
        time: '2 hours ago'
    },
    {
        id: 2,
        user: 'Mike Chen',
        action: 'cancelled reservation for',
        target: 'Mat Pilates',
        time: '3 hours ago'
    },
    {
        id: 3,
        user: 'Jessica Lee',
        action: 'purchased membership',
        target: '10 Group Classes',
        time: '5 hours ago'
    },
    {
        id: 4,
        user: 'Tom Wilson',
        action: 'completed class',
        target: 'Advanced Reformer',
        time: 'Yesterday'
    },
    {
        id: 5,
        user: 'Anna Kim',
        action: 'updated profile',
        target: '',
        time: 'Yesterday'
    }
];
