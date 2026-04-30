import React, { useState } from 'react';
// import type { MemberStatus, MembershipType } from '../../types'; // Not used in implementation

interface MemberFormProps {
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

const MemberForm: React.FC<MemberFormProps> = ({ onSubmit, onCancel }) => {
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
                <label htmlFor="name">Full Name *</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Jane Doe"
                />
            </div>

            <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="010-0000-0000"
                />
            </div>

            <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jane@example.com"
                />
            </div>

            <div className="form-group">
                <label htmlFor="status">Status</label>
                <select name="status" id="status" value={formData.status} onChange={handleChange}>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="PAUSED">Paused</option>
                </select>
            </div>

            <p className="hint text-muted">
                회원권(횟수권)은 회원 등록 후 별도의 Memberships 페이지에서 발급합니다.
            </p>

            <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any health notes or special requirements..."
                />
            </div>

            <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn btn-primary">Register Member</button>
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
