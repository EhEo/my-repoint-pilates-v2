import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import RequireAuth from './components/auth/RequireAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Assessments from './pages/Assessments';
import Memberships from './pages/Memberships';
import Classes from './pages/Classes';
import Schedules from './pages/Schedules';
import Reservations from './pages/Reservations';
import Notifications from './pages/Notifications';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="members" element={<Members />} />
          <Route path="assessments" element={<Assessments />} />
          <Route path="memberships" element={<Memberships />} />
          <Route path="classes" element={<Classes />} />
          <Route path="schedules" element={<Schedules />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<div>Settings Page (Coming Soon)</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
