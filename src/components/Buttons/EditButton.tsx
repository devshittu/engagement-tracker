// src/components/Buttons/EditButton.tsx
import React from 'react';
import { BaseIcon } from '../Icons/BaseIcon';

type EditButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  onClick?: () => void;
  ariaLabel?: string; // Optional: Support legacy ariaLabel prop
};

export const EditButton: React.FC<EditButtonProps> = ({ onClick, 
  ariaLabel, // Optional: Handle legacy prop
  ...buttonProps // Spread remaining HTML button props
 }) => (
  <button
    className="text-stone-800 bg-white rounded-full p-3 hover:bg-gray-50"
    type="button"// Default type, overridable via props
      aria-label={ariaLabel ?? buttonProps['aria-label'] ?? 'Edit item'} // Prioritize ariaLabel, then aria-label, then default
      onClick={onClick}
      {...buttonProps} // Spread all other HTML button attributes
  >
    <BaseIcon size={24} viewBox="0 0 24 24">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </BaseIcon>
  </button>
);
