import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface MemberFormProps {
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

const MemberForm: React.FC<MemberFormProps> = ({ onSubmit, onCancel }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        status: 'ACTIVE',
        notes: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="member-form">
            <div className="form-group">
                <label htmlFor="name">{t('members.form.name')} *</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('members.form.namePlaceholder')}
                />
            </div>

            <div className="form-group">
                <label htmlFor="phone">{t('members.form.phone')} *</label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t('members.form.phonePlaceholder')}
                />
            </div>

            <div className="form-group">
                <label htmlFor="email">{t('members.form.email')}</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('members.form.emailPlaceholder')}
                />
            </div>

            <div className="form-group">
                <label htmlFor="status">{t('members.form.status')}</label>
                <select name="status" id="status" value={formData.status} onChange={handleChange}>
                    <option value="ACTIVE">{t('members.status.ACTIVE')}</option>
                    <option value="INACTIVE">{t('members.status.INACTIVE')}</option>
                    <option value="PAUSED">{t('members.status.PAUSED')}</option>
                </select>
            </div>

            <p className="hint text-muted">{t('members.form.membershipHint')}</p>

            <div className="form-group">
                <label htmlFor="notes">{t('members.form.notes')}</label>
                <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder={t('members.form.notesPlaceholder')}
                />
            </div>

            <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>{t('common.cancel')}</button>
                <button type="submit" className="btn btn-primary">{t('members.form.submit')}</button>
            </div>

            <style>{`
                .member-form {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-4);
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-2);
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: var(--space-4);
                }

                label {
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: var(--color-text-secondary);
                }

                input, select, textarea {
                    padding: var(--space-3);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    font-size: 1rem;
                    font-family: inherit;
                    background-color: var(--color-background);
                    color: var(--color-text-primary);
                }

                input:focus, select:focus, textarea:focus {
                    outline: 2px solid var(--color-primary);
                    border-color: transparent;
                }

                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: var(--space-4);
                    margin-top: var(--space-4);
                }

                .btn-secondary {
                    background-color: var(--color-background);
                    color: var(--color-text-primary);
                    border: 1px solid var(--color-border);
                }
                
                .btn-secondary:hover {
                    background-color: var(--color-border);
                }
            `}</style>
        </form>
    );
};

export default MemberForm;
