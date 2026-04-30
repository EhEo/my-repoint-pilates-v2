import React, { useState } from 'react';
import type { Instructor } from '../../types';

interface InstructorFormProps {
    onSubmit: (data: Omit<Instructor, 'id'>) => void;
    onCancel: () => void;
}

const InstructorForm: React.FC<InstructorFormProps> = ({ onSubmit, onCancel }) => {
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
                <label htmlFor="name">Full Name *</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                />
            </div>

            <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                />
            </div>

            <div className="form-group">
                <label htmlFor="specialties">Specialties (comma separated)</label>
                <input
                    type="text"
                    id="specialties"
                    name="specialties"
                    value={formData.specialties}
                    onChange={handleChange}
                    placeholder="e.g. Reformer, Cadillac, Rehab"
                />
            </div>

            <div className="form-group">
                <label htmlFor="status">Status</label>
                <select name="status" id="status" value={formData.status} onChange={handleChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="leave">On Leave</option>
                </select>
            </div>

            <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn btn-primary">Register Instructor</button>
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
