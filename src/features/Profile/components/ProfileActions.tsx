'use client';

import React from 'react';
import { EditButton } from '../../../components/Buttons/EditButton';
import { MessageButton } from '../../../components/Buttons/MessageButton';
import { PlusButton } from '../../../components/Buttons/PlusButton';

type ProfileActionsProps = {};

export const ProfileActions: React.FC<ProfileActionsProps> = () => {
  return (
    <div className="flex gap-3 items-center xl:flex-col xl:mt-auto md:max-xl:ml-auto">
      <EditButton />
      <MessageButton />
      <PlusButton />
    </div>
  );
};
