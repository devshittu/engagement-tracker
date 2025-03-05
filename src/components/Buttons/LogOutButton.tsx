// src/components/Buttons/LogOutButton.tsx
import React from 'react';
import { BaseIcon } from '../Icons/BaseIcon';

type LogOutButtonProps = {
  onClick?: () => void;
};

export const LogOutButton: React.FC<LogOutButtonProps> = ({ onClick }) => (
  <button
    className="flex items-center gap-3 group"
    type="button"
    onClick={onClick}
  >
    <span className="p-3 rounded-full bg-stone-700 text-white group-hover:bg-stone-600">
      <BaseIcon size={16} viewBox="0 0 24 24">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </BaseIcon>
    </span>
    <span className="text-stone-700 font-bold group-hover:text-stone-600">
      Log out
    </span>
  </button>
);
