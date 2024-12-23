import React, { useState } from 'react';
import { Plus, UserMinus, LogOut } from 'lucide-react';
import { useTeam } from '../hooks/useTeam';
import { usePersianFormat } from '../hooks/usePersianFormat';
import ConfirmModal from '../components/shared/ConfirmModal';

export default function Teams() {
  const { team, members, isLeader, createTeam, addMember, removeMember, leaveTeam } = useTeam();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [teamName, setTeamName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const { formatDate } = usePersianFormat();

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTeam(teamName);
      setShowCreateModal(false);
      setTeamName('');
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMember(memberEmail);
      setShowAddMemberModal(false);
      setMemberEmail('');
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  const handleRemoveMember = async () => {
    if (memberToRemove) {
      await removeMember(memberToRemove);
      setShowConfirmModal(false);
      setMemberToRemove(null);
    }
  };

  if (!team) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-4">به تیمی ملحق نشده‌اید</h1>
            <p className="text-gray-600 mb-6">
              شما می‌توانید یک تیم جدید ایجاد کنید یا منتظر دعوت از طرف یک تیم باشید.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-5 h-5 ml-2" />
              ایجاد تیم جدید
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{team.name}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {isLeader ? 'شما رهبر تیم هستید' : 'شما عضو تیم هستید'}
          </p>
        </div>
        {isLeader ? (
          <button
            onClick={() => setShowAddMemberModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-4 h-4 ml-2" />
            افزودن عضو
          </button>
        ) : (
          <button
            onClick={() => setShowConfirmModal(true)}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <LogOut className="w-4 h-4 ml-2" />
            خروج از تیم
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {members.map((member) => (
            <div key={member.id} className="p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  {member.profiles?.full_name || member.profiles?.email}
                </h3>
                <p className="text-sm text-gray-500">{member.profiles?.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  عضو از {formatDate(member.joined_at)}
                </p>
              </div>
              {isLeader && member.user_id !== team.leader_id && (
                <button
                  onClick={() => {
                    setMemberToRemove(member.id);
                    setShowConfirmModal(true);
                  }}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <UserMinus className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">ایجاد تیم جدید</h2>
            <form onSubmit={handleCreateTeam}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نام تیم
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                >
                  ایجاد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">افزودن عضو جدید</h2>
            <form onSubmit={handleAddMember}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ایمیل کاربر
                </label>
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                >
                  افزودن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title={memberToRemove ? 'حذف عضو' : 'خروج از تیم'}
        message={
          memberToRemove
            ? 'آیا از حذف این عضو از تیم مطمئن هستید؟'
            : 'آیا از خروج از تیم مطمئن هستید؟'
        }
        onConfirm={memberToRemove ? handleRemoveMember : leaveTeam}
        onCancel={() => {
          setShowConfirmModal(false);
          setMemberToRemove(null);
        }}
      />
    </div>
  );
}