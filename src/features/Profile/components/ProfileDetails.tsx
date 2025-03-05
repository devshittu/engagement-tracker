'use client';

import React from 'react';

type ProfileDetailsProps = {
  name: string;
  title: string;
};

export const ProfileDetails: React.FC<ProfileDetailsProps> = ({
  name,
  title,
}) => {
  return (
    <div className="text-center sm:max-xl:text-left">
      <h3 className="font-bold text-stone-800 min-w-[8ch]">{name}</h3>
      <p className="">{title}</p>
    </div>
  );
};
