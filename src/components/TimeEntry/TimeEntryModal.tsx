import React from 'react';
import { X } from 'lucide-react';

interface TimeEntryModalProps {
  showModal: boolean;
  projects: Array<{ id: string; title: string; }>;
  selectedProject: string;
  description: string;
  onProjectChange: (id: string) => void;
  onDescriptionChange: (desc: string) => void;
  onClose: () => void;
  onStart: () => void;
}

export default function TimeEntryModal({
  showModal,
  projects,
  selectedProject,
  description,
  onProjectChange,
  onDescriptionChange,
  onClose,
  onStart,
}: TimeEntryModalProps) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-md transform transition-all">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">شروع کار جدید</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              پروژه
            </label>
            <select
              value={selectedProject}
              onChange={(e) => onProjectChange(e.target.value)}
              className="w-full rounded-lg border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors text-sm sm:text-base"
              required
            >
              <option value="">انتخاب پروژه</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              توضیحات
            </label>
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="w-full rounded-lg border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors text-sm sm:text-base"
              rows={3}
              placeholder="توضیحات خود را وارد کنید..."
            />
          </div>
        </div>

        <div className="flex justify-end items-center gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-xl sm:rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 transition-colors"
          >
            انصراف
          </button>
          <button
            onClick={onStart}
            className="px-3 sm:px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            شروع
          </button>
        </div>
      </div>
    </div>
  );
}