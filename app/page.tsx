// app/page.tsx

"use client";
import { useState, useEffect } from 'react';

import Header from '../components/Header';
import KpiCards from '../components/KpiCards';
import KecamatanTables from '../components/KecamatanTables';
import KelurahanTables from '../components/KelurahanTables'; 
import { dataKeplingDummy } from '../Utils/DummyData';


export default function Home() {
  const [activeTab, setActiveTab] = useState<'KEC' | 'KEL' | 'KEPLING'>('KEC');
  const [filterKec, setFilterKec] = useState<string[]>(['ALL']);
  const [filterKel, setFilterKel] = useState<string[]>(['ALL']);

  const dataKepling = dataKeplingDummy;

  const [mountedTabs, setMountedTabs] = useState<Record<string, boolean>>({
    KEC: true,
    KEL: false,
    KEPLING: false
  });

  useEffect(() => {
    if (!mountedTabs[activeTab]) {
      setMountedTabs(prev => ({ ...prev, [activeTab]: true }));
    }
  }, [activeTab, mountedTabs]);

  const handleTabChange = (tab: 'KEC' | 'KEL' | 'KEPLING') => {
    setActiveTab(tab);
    setFilterKec(['ALL']);
    setFilterKel(['ALL']);
  };

  return (
    <main className="min-h-screen bg-[#f3f4ec] font-sans overflow-x-auto flex flex-col transition-colors duration-300">
      <div className="min-w-[1500px] mx-auto flex flex-col flex-1 w-full relative">

        <Header activeTab={activeTab} setActiveTab={handleTabChange} />
        
        <div className="p-4 flex gap-4 mt-2 flex-1">
          <div className="flex-none">
                        <KpiCards 
              data={dataKepling} 
              activeTab={activeTab} 
              filterKec={filterKec} 
              filterKel={filterKel} 
            />
          </div>
          
          <div className="flex-1 flex min-w-0 relative">
            {mountedTabs.KEC && (
              <div className={`flex-1 flex min-w-0 ${activeTab === 'KEC' ? '' : 'hidden'}`}>
                <KecamatanTables data={dataKepling} />
              </div>
            )}
            {mountedTabs.KEL && (
              <div className={`flex-1 flex min-w-0 ${activeTab === 'KEL' ? '' : 'hidden'}`}>
                <KelurahanTables 
                  data={dataKepling} 
                  filterKec={filterKec} 
                  setFilterKec={setFilterKec} 
                  filterKel={filterKel} 
                  setFilterKel={setFilterKel} 
                />
              </div>
            )}

          </div>
        </div>

        <footer className="bg-[#2F97FF] text-white text-center py-4 mt-2 w-full shadow-inner transition-colors duration-300">
          <h1 className="font-bold text-[16px] tracking-wider uppercase mt-0.5">BPJS Ketenagakerjaan</h1>
        </footer>
      </div>
    </main>
  );
}
