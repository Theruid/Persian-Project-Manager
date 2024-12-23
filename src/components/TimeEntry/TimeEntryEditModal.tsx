import React, { useState } from 'react';
import { X } from 'lucide-react';
import { TimeEntry } from '../../types/timeEntry';
import { usePersianFormat } from '../../hooks/usePersianFormat';
import { parsePersianDateTime } from '../../utils/numbers';
import toast from 'react-hot-toast';

interface TimeEntryEditModalProps {
  entry: TimeEntry;
  projects: Array<{ id: string; title: string; }>;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<TimeEntry>) => Promise<boolean>;
}

export default function TimeEntryEditModal({
  entry,
  projects,
  onClose,
  onUpdate,
}: TimeEntryEditModalProps) {
  const [projectId, setProjectId] = useState(entry.project_id);
  const [description, setDescription] = useState(entry.description || '');
  const { formatDate } = usePersianFormat();
  
  // Initialize with Persian formatted dates
  const [startTime, setStartTime] = useState(formatDate(entry.start_time));
  const [endTime, setEndTime] = useState(entry.end_time ? formatDate(entry.end_time) : '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate dates before submitting
      let parsedStartTime: string;
      let parsedEndTime: string | null = null;

      try {
        parsedStartTime = parsePersianDateTime(startTime);
      } catch (error) {
        toast.error('فرمت زمان شروع نادرست است. لطفا به صورت yyyy/MM/dd - HH:mm وارد کنید');
        return;
      }

      if (endTime) {
        try {
          parsedEndTime = parsePersianDateTime(endTime);
        } catch (error) {
          toast.error('فرمت زمان پایان نادرست است. لطفا به صورت yyyy/MM/dd - HH:mm وارد کنید');
          return;
        }
      }

      const success = await onUpdate(entry.id, {
        project_id: projectId,
        description,
        start_time: parsedStartTime,
        end_time: parsedEndTime,
      });

      if (success) {
        onClose();
        toast.success('زمان با موفقیت ویرایش شد');
      }
    } catch (error) {
      console.error('Error updating time entry:', error);
      toast.error('خطا در ویرایش زمان');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">ویرایش زمان</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">
              پروژه
            </label>
            <select
              id="project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              توضیحات
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
              زمان شروع (YYYY/MM/DD - HH:MM)
            </label>
            <input
              id="startTime"
              type="text"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 text-left"
              dir="ltr"
              placeholder="۱۴۰۲/۱۲/۲۲ - ۱۸:۳۰"
            />
          </div>

          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
              زمان پایان (YYYY/MM/DD - HH:MM)
            </label>
            <input
              id="endTime"
              type="text"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 text-left"
              dir="ltr"
              placeholder="۱۴۰۲/۱۲/۲۲ - ۱۸:۳۰"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              ذخیره
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}