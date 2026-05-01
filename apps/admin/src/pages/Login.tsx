import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { login } from '../utils/api';

interface LocationState {
    from?: { pathname?: string };
}

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const from = (location.state as LocationState | null)?.from?.pathname ?? '/';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await login(email, password);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : t('auth.loginFailed'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="login-page">
            <form className="login-card" onSubmit={handleSubmit}>
                <h1>{t('auth.title')}</h1>
                <p className="text-muted">{t('auth.subtitle')}</p>

                <label>
                    {t('auth.email')}
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                    />
                </label>

                <label>
                    {t('auth.password')}
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                    />
                </label>

                {error && <div className="error">{error}</div>}

                <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? t('auth.signingIn') : t('auth.signIn')}
                </button>
            </form>

            <style>{`
                .login-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: hsl(var(--color-bg-main));
                    padding: var(--space-6);
                }
                .login-card {
                    width: 100%;
                    max-width: 380px;
                    background-color: hsl(var(--color-bg-card));
                    border: 1px solid hsl(var(--color-border));
                    border-radius: var(--radius-lg);
                    padding: var(--space-8);
                    box-shadow: var(--shadow-md);
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-4);
                }
                .login-card h1 {
                    margin: 0;
                    font-size: 1.5rem;
                }
                .login-card label {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-2);
                    font-size: 0.875rem;
                    color: hsl(var(--color-text-muted));
                }
                .login-card input {
                    padding: var(--space-3) var(--space-4);
                    border: 1px solid hsl(var(--color-border));
                    border-radius: var(--radius-md);
                    font-size: 1rem;
                }
                .login-card input:focus {
                    outline: none;
                    border-color: hsl(var(--color-primary));
                }
                .error {
                    background-color: hsl(var(--color-error) / 0.1);
                    color: hsl(var(--color-error));
                    border: 1px solid hsl(var(--color-error) / 0.3);
                    padding: var(--space-3);
                    border-radius: var(--radius-md);
                    font-size: 0.875rem;
                }
                .btn {
                    padding: var(--space-3) var(--space-4);
                    border: none;
                    border-radius: var(--radius-md);
                    font-size: 1rem;
                    cursor: pointer;
                    transition: var(--transition-base);
                }
                .btn-primary {
                    background-color: hsl(var(--color-primary));
                    color: white;
                }
                .btn-primary:hover:not(:disabled) {
                    background-color: hsl(var(--color-primary-light));
                }
                .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default Login;
