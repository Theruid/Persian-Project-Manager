import React from 'react';
import { Square } from 'lucide-react';
import { TimeEntry } from '../../types/timeEntry';

interface ActiveTimeEntryProps {
  entry: TimeEntry;
  onStop: () => void;
}

export default function ActiveTimeEntry({ entry, onStop }: ActiveTimeEntryProps) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold">کار در حال انجام</h3>
          <p className="text-sm text-gray-600">{entry.description}</p>
        </div>
        <button
          onClick={onStop}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          <Square className="w-4 h-4 ml-2" />
          پایان
        </button>
      </div>
    </div>
  );
}