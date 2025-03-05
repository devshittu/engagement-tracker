// src/components/ViewToggle.tsx

'use client';

import React from 'react';
import { FiGrid, FiList } from 'react-icons/fi';

type ViewMode = 'grid' | 'list';

type ViewToggleProps = {
  viewMode: ViewMode;
  onToggle: (mode: ViewMode) => void;
};

const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onToggle }) => {
  return (
    <div className="flex items-center space-x-2">
      <button
        className={`view-btn p-2 rounded-md border border-gray-300 flex items-center justify-center ${
          viewMode === 'grid'
            ? 'bg-gray-900 text-white'
            : 'bg-white text-gray-900'
        }`}
        onClick={() => onToggle('grid')}
        title="Grid View"
      >
        <FiGrid className="w-5 h-5" />
      </button>

      <button
        className={`view-btn p-2 rounded-md border border-gray-300 flex items-center justify-center ${
          viewMode === 'list'
            ? 'bg-gray-900 text-white'
            : 'bg-white text-gray-900'
        }`}
        onClick={() => onToggle('list')}
        title="List View"
      >
        <FiList className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ViewToggle;
