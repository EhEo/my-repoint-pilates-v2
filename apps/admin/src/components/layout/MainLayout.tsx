import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="page-container">
          <Outlet />
        </main>
      </div>

      <style>{`
        .app-layout {
          display: flex;
          min-height: 100vh;
        }

        .main-content {
          flex: 1;
          margin-left: 260px;
          display: flex;
          flex-direction: column;
          background-color: hsl(var(--color-bg-main));
        }

        .page-container {
          padding: var(--space-6);
          flex: 1;
        }
      `}</style>
    </div>
  );
};

export default MainLayout;
