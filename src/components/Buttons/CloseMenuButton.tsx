// src/components/Buttons/CloseMenuButton.tsx
import React from 'react';
import { BaseIcon } from '../Icons/BaseIcon';

type CloseMenuButtonProps = {
  onClick: () => void;
};

export const CloseMenuButton: React.FC<CloseMenuButtonProps> = ({
  onClick,
}) => (
  <button
    className="text-stone-800 justify-self-end sm:hidden"
    onClick={onClick}
    type="button"
    aria-label="Close menu"
  >
    <BaseIcon size={24} viewBox="0 0 24 24">
      <polyline points="15 18 9 12 15 6" />
    </BaseIcon>
  </button>
);
