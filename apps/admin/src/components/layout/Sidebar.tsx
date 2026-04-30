import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Calendar,
    CalendarClock,
    Settings,
    Dumbbell,
    Ticket,
    Bell,
    HeartPulse
} from 'lucide-react';
import clsx from 'clsx';

const Sidebar = () => {
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Users, label: 'Members', path: '/members' },
        { icon: HeartPulse, label: 'Assessments', path: '/assessments' },
        { icon: Ticket, label: 'Memberships', path: '/memberships' },
        { icon: Calendar, label: 'Classes & Schedule', path: '/classes' },
        { icon: CalendarClock, label: 'Instructor Schedules', path: '/schedules' },
        { icon: Dumbbell, label: 'Reservations', path: '/reservations' },
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="logo-icon">P</div>
                <h1>Pilates<span className="text-accent">Pro</span></h1>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            clsx('nav-item', isActive && 'active')
                        }
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="avatar">A</div>
                    <div className="details">
                        <span className="name">Admin User</span>
                        <span className="role">Manager</span>
                    </div>
                </div>
            </div>

            <style>{`
        .sidebar {
          width: 260px;
          height: 100vh;
          background-color: white;
          border-right: 1px solid hsl(var(--color-border));
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 100;
        }

        .sidebar-logo {
          padding: var(--space-6);
          display: flex;
          align-items: center;
          gap: var(--space-3);
          border-bottom: 1px solid hsl(var(--color-border));
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          background-color: hsl(var(--color-primary));
          color: white;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .sidebar-logo h1 {
          font-size: 1.25rem;
          margin: 0;
          color: hsl(var(--color-text-main));
        }
        .text-accent { color: hsl(var(--color-accent)); }

        .sidebar-nav {
          padding: var(--space-4);
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          color: hsl(var(--color-text-muted));
          text-decoration: none;
          border-radius: var(--radius-md);
          transition: var(--transition-base);
        }

        .nav-item:hover {
          background-color: hsl(var(--color-bg-main));
          color: hsl(var(--color-text-main));
        }

        .nav-item.active {
          background-color: hsl(var(--color-primary) / 0.05);
          color: hsl(var(--color-primary));
          font-weight: 500;
        }

        .sidebar-footer {
          padding: var(--space-4);
          border-top: 1px solid hsl(var(--color-border));
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .avatar {
          width: 40px;
          height: 40px;
          background-color: hsl(var(--color-bg-main));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: hsl(var(--color-text-muted));
          font-weight: 600;
        }

        .details {
          display: flex;
          flex-direction: column;
        }

        .name {
          font-size: 0.9rem;
          font-weight: 500;
          color: hsl(var(--color-text-main));
        }

        .role {
          font-size: 0.8rem;
          color: hsl(var(--color-text-muted));
        }
      `}</style>
        </aside>
    );
};

export default Sidebar;
