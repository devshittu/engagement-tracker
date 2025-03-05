'use client';

import React from 'react';
import { Avatar } from '@/features/Today/components/Avatar';
import { ProfileDetails } from './components/ProfileDetails';
import { ProfileActions } from './components/ProfileActions';

type ProfileProps = {};

export const Profile: React.FC<ProfileProps> = () => {
  return (
    <section className="flex flex-col md:max-xl:flex-row gap-4 items-center p-8 border-stone-300 max-xl:border-t xl:p-10 xl:border-l">
      <div className="relative">
        <Avatar
          src="https://images.generated.photos/rGMY_3FrtnygRiM11hGxFlrOxdwIlMPeUkze0yD1Wig/rs:fit:256:256/czM6Ly9pY29uczgu/Z3Bob3Rvcy1wcm9k/LnBob3Rvcy92M18w/Mzg1NjMxLmpwZw.jpg"
          size="lg"
        />
        <span
          className="absolute top-0 end-0 inline-block border-2 border-white rounded-full w-4 h-4 bg-emerald-400"
          aria-label="available"
        ></span>
      </div>
      <ProfileDetails name="Dr. Riddle" title="Scientist" />
      <ProfileActions />
    </section>
  );
};
