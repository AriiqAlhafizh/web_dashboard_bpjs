// app/page.tsx
"use client";
import { useState } from 'react';

import Header from '../components/Header';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'KEC' | 'KEL' | 'KEPLING'>('KEC');

  return (
    <main className="min-h-screen bg-[#f3f4ec] font-sans overflow-x-auto flex flex-col">
      <div className="min-w-[1500px] mx-auto flex flex-col flex-1 w-full relative">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </main>
  );
}
