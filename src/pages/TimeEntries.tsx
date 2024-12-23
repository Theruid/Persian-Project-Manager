import React, { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import TimeEntryList from '../components/TimeEntry/TimeEntryList';
import TimeEntryModal from '../components/TimeEntry/TimeEntryModal';
import ActiveTimeEntry from '../components/TimeEntry/ActiveTimeEntry';
import { useTimeEntries } from '../hooks/useTimeEntries';
import { useProjects } from '../hooks/useProjects';
import ConfirmModal from '../components/shared/ConfirmModal';
import toast from 'react-hot-toast';

export default function TimeEntries() {
  const { timeEntries, activeEntry, startTimer, stopTimer, updateTimeEntry, deleteTimeEntry, resetAllTimeEntries } = useTimeEntries();
  const { projects } = useProjects();
  const [showModal, setShowModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [description, setDescription] = useState('');

  const handleStart = async () => {
    if (!selectedProject) {
      toast.error('لطفاً یک پروژه انتخاب کنید');
      return;
    }

    const success = await startTimer(selectedProject, description);
    if (success) {
      setShowModal(false);
      setSelectedProject('');
      setDescription('');
    }
  };

  const handleReset = async () => {
    const success = await resetAllTimeEntries();
    if (success) {
      setShowResetConfirm(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">ثبت زمان</h1>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center px-3 py-1 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
            title="پاک کردن تمام زمان‌ها"
          >
            <RefreshCw className="w-4 h-4 ml-1" />
            پاک کردن همه
          </button>
        </div>
        <button
          onClick={() => setShowModal(true)}
          disabled={!!activeEntry}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
        >
          <Plus className="w-4 h-4 ml-2" />
          شروع کار جدید
        </button>
      </div>

      {activeEntry && (
        <ActiveTimeEntry entry={activeEntry} onStop={stopTimer} />
      )}

      <TimeEntryList 
        timeEntries={timeEntries} 
        projects={projects}
        onUpdate={updateTimeEntry}
        onDelete={deleteTimeEntry}
      />

      <TimeEntryModal
        showModal={showModal}
        projects={projects}
        selectedProject={selectedProject}
        description={description}
        onProjectChange={setSelectedProject}
        onDescriptionChange={setDescription}
        onClose={() => {
          setShowModal(false);
          setSelectedProject('');
          setDescription('');
        }}
        onStart={handleStart}
      />

      <ConfirmModal
        isOpen={showResetConfirm}
        title="پاک کردن تمام زمان‌ها"
        message="آیا از پاک کردن تمام زمان‌ها مطمئن هستید؟ این عمل قابل بازگشت نیست و تمام زمان‌های ثبت شده حذف خواهند شد."
        onConfirm={handleReset}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
}