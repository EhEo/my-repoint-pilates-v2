import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Instructor } from '../../types';

interface InstructorFormProps {
    onSubmit: (data: Omit<Instructor, 'id'>) => void;
    onCancel: () => void;
}

const InstructorForm: React.FC<InstructorFormProps> = ({ onSubmit, onCancel }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        specialties: '', // Comma separated string for input
        status: 'active' as Instructor['status']
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            name: formData.name,
            email: formData.email,
            status: formData.status,
            specialties: formData.specialties.split(',').map(s => s.trim()).filter(Boolean)
        });
    };

    return (
        <form onSubmit={handleSubmit} className="instructor-form">
            <div className="form-group">
                <label htmlFor="name">{t('instructors.form.name')}</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('instructors.form.namePlaceholder')}
                />
            </div>

            <div className="form-group">
                <label htmlFor="email">{t('instructors.form.email')}</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('instructors.form.emailPlaceholder')}
                />
            </div>

            <div className="form-group">
                <label htmlFor="specialties">{t('instructors.form.specialties')}</label>
                <input
                    type="text"
                    id="specialties"
                    name="specialties"
                    value={formData.specialties}
                    onChange={handleChange}
                    placeholder={t('instructors.form.specialtiesPlaceholder')}
                />
            </div>

            <div className="form-group">
                <label htmlFor="status">{t('instructors.form.status')}</label>
                <select name="status" id="status" value={formData.status} onChange={handleChange}>
                    <option value="active">{t('instructors.status.active')}</option>
                    <option value="inactive">{t('instructors.status.inactive')}</option>
                    <option value="leave">{t('instructors.status.leave')}</option>
                </select>
            </div>

            <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>{t('common.cancel')}</button>
                <button type="submit" className="btn btn-primary">{t('instructors.form.submit')}</button>
            </div>

            <style>{`
                .instructor-form {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-4);
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-2);
                }

                label {
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: var(--color-text-secondary);
                }

                input, select {
                    padding: var(--space-3);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    font-size: 1rem;
                    font-family: inherit;
                    background-color: var(--color-background);
                    color: var(--color-text-primary);
                }

                input:focus, select:focus {
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

export default InstructorForm;
