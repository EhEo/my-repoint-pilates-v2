import { Bell, LogOut, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clearSession, getUser } from '../../utils/auth';
import LanguageToggle from './LanguageToggle';

const Header = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const user = getUser();

    const handleLogout = () => {
        clearSession();
        navigate('/login', { replace: true });
    };

    return (
        <header className="header">
            <div className="header-search">
                <Search size={20} className="text-muted" />
                <input type="text" placeholder={t('header.searchPlaceholder')} className="search-input" />
            </div>

            <div className="header-actions">
                {user && <span className="user-email">{user.email}</span>}
                <LanguageToggle />
                <button type="button" className="icon-btn" aria-label={t('header.notifications')}>
                    <Bell size={20} />
                    <span className="badge">2</span>
                </button>
                <button type="button" className="icon-btn" aria-label={t('header.signOut')} onClick={handleLogout}>
                    <LogOut size={20} />
                </button>
            </div>

            <style>{`
        .header {
          height: 70px;
          background-color: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid hsl(var(--color-border));
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 var(--space-6);
          position: sticky;
          top: 0;
          z-index: 90;
        }

        .header-search {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          background-color: hsl(var(--color-bg-main));
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-full);
          width: 300px;
          border: 1px solid transparent;
          transition: var(--transition-base);
        }

        .header-search:focus-within {
          border-color: hsl(var(--color-primary));
          background-color: white;
        }

        .search-input {
          border: none;
          background: transparent;
          padding: 0;
          box-shadow: none;
        }
        .search-input:focus {
          box-shadow: none;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .user-email {
          font-size: 0.875rem;
          color: hsl(var(--color-text-muted));
        }

        .icon-btn {
          background: none;
          border: none;
          color: hsl(var(--color-text-muted));
          cursor: pointer;
          position: relative;
          padding: 4px;
        }
        .icon-btn:hover {
          color: hsl(var(--color-text-main));
        }

        .badge {
          position: absolute;
          top: 0;
          right: 0;
          width: 8px;
          height: 8px;
          background-color: hsl(var(--color-accent));
          border-radius: 50%;
        }
      `}</style>
        </header>
    );
};

export default Header;
