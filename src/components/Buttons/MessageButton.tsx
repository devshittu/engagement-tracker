// src/components/Buttons/MessageButton.tsx
import React from 'react';
import { BaseIcon } from '../Icons/BaseIcon';

type MessageButtonProps = {
  onClick?: () => void;
};

export const MessageButton: React.FC<MessageButtonProps> = ({ onClick }) => (
  <button
    className="text-stone-800 bg-white rounded-full p-3 hover:bg-gray-50"
    type="button"
    onClick={onClick}
    aria-label="Send message"
  >
    <BaseIcon size={24} viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </BaseIcon>
  </button>
);
