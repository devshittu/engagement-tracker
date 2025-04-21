// src/components/Buttons/PlusButton.tsx

import React from 'react';
import { BaseIcon } from '../Icons/BaseIcon';

// Extend button HTML attributes and keep custom props
type PlusButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: 'md' | 'lg';
  onClick?: () => void;
  ariaLabel?: string; // Optional: Support legacy ariaLabel prop
};

export const PlusButton: React.FC<PlusButtonProps> = ({
  size = 'md',
  onClick,
  ariaLabel, // Optional: Handle legacy prop
  ...buttonProps // Spread remaining HTML button props
}) => {
  const padding = size === 'lg' ? 'p-4' : 'p-3';
  const iconSize = size === 'lg' ? 24 : 20;

  return (
    <button
      className={`bg-stone-800 rounded-full text-white hover:bg-stone-700 ${padding}`}
      type="button" // Default type, overridable via props
      aria-label={ariaLabel ?? buttonProps['aria-label'] ?? 'Add item'} // Prioritize ariaLabel, then aria-label, then default
      onClick={onClick}
      {...buttonProps} // Spread all other HTML button attributes
    >
      <BaseIcon size={iconSize} viewBox="0 0 24 24">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </BaseIcon>
    </button>
  );
};
