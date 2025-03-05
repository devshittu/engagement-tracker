// src/app/page.tsx
import React from 'react';
import { Sidebar } from '@/components/Layout/Sidebar';
import { Today } from '@/features/Today/Today';
import { Pinned } from '@/features/Pinned/Pinned';
import { Profile } from '@/features/Profile/Profile';

const App: React.FC = () => (
  <div className="min-h-screen bg-stone-500 text-stone-500 font-['Work_Sans'] tracking-tight font-regular">
    <div className="max-w-screen-2xl mx-auto bg-[#FBF7F4] p-3 sm:grid sm:grid-cols-[auto_minmax(0,1fr)]">
      <Sidebar />
      <main className="xl:flex">
        <Today />
        <Pinned />
        <Profile />
      </main>
    </div>
    <footer className="text-sm p-12 text-center text-white">
      {/* <DemoPlayground /> */}
      Inspo from{' '}
      <a
        className="underline"
        href="https://dribbble.com/shots/19419939-Admin-dashboard-analytics-UX"
      >
        Halo Lab
      </a>{' '}
      🇺🇦
    </footer>
  </div>
);

export default App;

// src/app/feel/page.tsx
