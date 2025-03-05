// src/components/Buttons/MenuButton.tsx
import React from 'react';
import { BaseIcon } from '../Icons/BaseIcon';

type MenuButtonProps = {
  onClick: () => void;
};

export const MenuButton: React.FC<MenuButtonProps> = ({ onClick }) => (
  <button
    className="fixed bottom-4 right-4 p-4 bg-stone-800 rounded-full text-white hover:bg-stone-700 sm:hidden"
    onClick={onClick}
    type="button"
    aria-label="Open menu"
  >
    <BaseIcon size={24} viewBox="0 0 24 24">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </BaseIcon>
  </button>
);
