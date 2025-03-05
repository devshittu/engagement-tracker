// src/components/Collapsible.tsx
import React from 'react';
import { BaseIcon } from '../Icons/BaseIcon';

type CollapsibleProps = {
  trigger: React.ReactNode;
  children: React.ReactNode;
};

export const Collapsible: React.FC<CollapsibleProps> = ({
  trigger,
  children,
}) => {
  const [open, setOpen] = React.useState(true);

  return (
    <div>
      <button
        className="font-bold p-2 hover:bg-black/10 flex w-full gap-3 text-stone-700"
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        {trigger}
        <BaseIcon
          size={24}
          className={`ml-auto transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </BaseIcon>
      </button>
      <div
        className={`grid transition-[grid-template-rows] [&>*]:overflow-hidden ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        {children}
      </div>
    </div>
  );
};
