import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { isAuthenticated } from '../../utils/auth';

interface Props {
    children: ReactNode;
}

const RequireAuth = ({ children }: Props) => {
    const location = useLocation();
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return <>{children}</>;
};

export default RequireAuth;
