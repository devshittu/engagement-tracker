// src/components/Buttons/PlusButton.tsx
import React from 'react';
import { BaseIcon } from '../Icons/BaseIcon';

type PlusButtonProps = {
  size?: 'md' | 'lg';
  onClick?: () => void;
};

export const PlusButton: React.FC<PlusButtonProps> = ({
  size = 'md',
  onClick,
}) => {
  const padding = size === 'lg' ? 'p-4' : 'p-3';
  const iconSize = size === 'lg' ? 24 : 20;

  return (
    <button
      className={`bg-stone-800 rounded-full text-white hover:bg-stone-700 ${padding}`}
      type="button"
      aria-label="Add item"
      onClick={onClick}
    >
      <BaseIcon size={iconSize} viewBox="0 0 24 24">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </BaseIcon>
    </button>
  );
};
