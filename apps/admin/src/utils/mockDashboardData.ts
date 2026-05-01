// Phase 5D: RevenueChart 가 실제 API 로 전환되면서 MOCK_REVENUE_DATA /
// MOCK_DASHBOARD_STATS / MOCK_RECENT_ACTIVITY 는 무효화. 현재는 AttendanceChart
// 만 mock 사용 중이므로 그것만 보존. Phase 6 에서 일괄 정리 시 함께 제거 예정.

export const MOCK_ATTENDANCE_DATA = [
    { name: 'Mon', Group: 40, Private: 24 },
    { name: 'Tue', Group: 30, Private: 13 },
    { name: 'Wed', Group: 20, Private: 38 },
    { name: 'Thu', Group: 27, Private: 39 },
    { name: 'Fri', Group: 18, Private: 48 },
    { name: 'Sat', Group: 23, Private: 38 },
    { name: 'Sun', Group: 34, Private: 43 },
];
