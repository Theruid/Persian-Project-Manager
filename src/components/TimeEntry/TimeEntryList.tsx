import React, { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { TimeEntry } from '../../types/timeEntry';
import { formatDuration } from '../../utils/time';
import { usePersianFormat } from '../../hooks/usePersianFormat';
import TimeEntryEditModal from './TimeEntryEditModal';
import ConfirmModal from '../shared/ConfirmModal';
import { toPersianNumbers } from '../../utils/numbers';

interface TimeEntryListProps {
  timeEntries: TimeEntry[];
  projects: Array<{ id: string; title: string; }>;
  onUpdate: (id: string, data: Partial<TimeEntry>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export default function TimeEntryList({ timeEntries, projects, onUpdate, onDelete }: TimeEntryListProps) {
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const { formatDate } = usePersianFormat();

  const handleDelete = async (id: string) => {
    await onDelete(id);
    setShowConfirmModal(false);
    setEntryToDelete(null);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  پروژه
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  توضیحات
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  زمان شروع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  زمان پایان
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  مدت زمان
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {timeEntries.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.projects?.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" dir="ltr">
                    {formatDate(entry.start_time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" dir="ltr">
                    {entry.end_time ? formatDate(entry.end_time) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" dir="ltr">
                    {entry.end_time ? toPersianNumbers(formatDuration(entry.start_time, entry.end_time)) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingEntry(entry)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEntryToDelete(entry.id);
                          setShowConfirmModal(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-200">
          {timeEntries.map((entry) => (
            <div key={entry.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-900">{entry.projects?.title}</h3>
                  <p className="text-sm text-gray-500">{entry.description || 'بدون توضیحات'}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingEntry(entry)}
                    className="text-primary-600 hover:text-primary-900 p-1"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEntryToDelete(entry.id);
                      setShowConfirmModal(true);
                    }}
                    className="text-red-600 hover:text-red-900 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">شروع: </span>
                  <span className="text-gray-900" dir="ltr">{formatDate(entry.start_time)}</span>
                </div>
                <div>
                  <span className="text-gray-500">پایان: </span>
                  <span className="text-gray-900" dir="ltr">{entry.end_time ? formatDate(entry.end_time) : '-'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">مدت زمان: </span>
                  <span className="text-gray-900" dir="ltr">
                    {entry.end_time ? toPersianNumbers(formatDuration(entry.start_time, entry.end_time)) : '-'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingEntry && (
        <TimeEntryEditModal
          entry={editingEntry}
          projects={projects}
          onClose={() => setEditingEntry(null)}
          onUpdate={onUpdate}
        />
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        title="حذف زمان"
        message="آیا از حذف این زمان مطمئن هستید؟"
        onConfirm={() => entryToDelete && handleDelete(entryToDelete)}
        onCancel={() => {
          setShowConfirmModal(false);
          setEntryToDelete(null);
        }}
      />
    </>
  );
}