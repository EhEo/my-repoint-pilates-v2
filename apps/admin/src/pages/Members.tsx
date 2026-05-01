import { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MemberCard from '../components/Members/MemberCard';
import Modal from '../components/common/Modal';
import MemberForm from '../components/Members/MemberForm';
import { fetchMembers, createMember } from '../utils/api';
import type { MemberStatus } from '../types';

const Members = () => {
    const { t } = useTranslation();
    const [members, setMembers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<MemberStatus | 'all'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
        try {
            const data = await fetchMembers();
            setMembers(data);
        } catch (error) {
            console.error('Failed to load members:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegisterMember = async (data: any) => {
        try {
            await createMember(data);
            await loadMembers(); // Refresh list
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to register member:', error);
            alert(t('members.form.registerFailed'));
        }
    };

    const filteredMembers = members.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase());
        // Backend returns uppercase status (ACTIVE), frontend filter uses lowercase (active) or all
        const memberStatus = member.status.toLowerCase();
        const matchesStatus = statusFilter === 'all' || memberStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="members-page">
            <header className="page-header">
                <div>
                    <h1>{t('members.title')}</h1>
                    <p className="text-muted">{t('members.subtitle')}</p>
                </div>
                <button type="button" className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} style={{ marginRight: '8px' }} />
                    {t('members.addMember')}
                </button>
            </header>

            <div className="filters-bar">
                <div className="search-wrapper">
                    <Search size={20} className="text-muted icon" />
                    <input
                        type="text"
                        placeholder={t('members.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-wrapper">
                    <Filter size={20} className="text-muted icon" />
                    <select
                        aria-label={t('common.status')}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as MemberStatus | 'all')}
                    >
                        <option value="all">{t('members.filter.allStatus')}</option>
                        <option value="active">{t('members.filter.active')}</option>
                        <option value="inactive">{t('members.filter.inactive')}</option>
                        <option value="paused">{t('members.filter.paused')}</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>
                    {t('members.loading')}
                </div>
            ) : (
                <div className="members-grid">
                    {filteredMembers.map(member => (
                        <MemberCard key={member.id} member={member} />
                    ))}
                    {filteredMembers.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>
                            {t('members.empty')}
                        </div>
                    )}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={t('members.registerNew')}
            >
                <MemberForm
                    onSubmit={handleRegisterMember}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>

            <style>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-8);
        }

        .filters-bar {
          display: flex;
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }

        .search-wrapper, .filter-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-wrapper { flex: 1; max-width: 400px; }
        .filter-wrapper { width: 200px; }

        .search-wrapper input, .filter-wrapper select {
          padding-left: 40px;
        }

        .icon {
          position: absolute;
          left: 12px;
          pointer-events: none;
        }

        .members-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--space-6);
        }
      `}</style>
        </div>
    );
};

export default Members;
