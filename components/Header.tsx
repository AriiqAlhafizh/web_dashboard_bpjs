const Header = ({ 
  activeTab, 
  setActiveTab
}: { 
  activeTab: string, 
  setActiveTab: (tab: 'KEC' | 'KEL' | 'KEPLING') => void
}) => {
  return (
    <div className="w-full shadow-sm">
      <header className="relative min-h-[100px] overflow-hidden flex justify-center items-end pb-3 gap-4 xl:gap-12 transition-colors duration-300 bg-[#ffffff]">
        <div className="text-center pb-3 z-10 shrink-0 px-4">
          <h1 className="text-[34px] xl:text-[40px] font-black leading-none tracking-tight transition-colors duration-300 text-[#000000]">DASHBOARD UCJ</h1>
        </div>
      </header>
        <div className="text-white min-h-[50px] px-6 py-2.5 flex justify-between items-center relative border-t z-30 transition-colors duration-300 bg-[#00C8FF] border-blue-400">
        
        <div className="absolute left-1/2 -translate-x-1/2 flex gap-2 xl:gap-4">
          <button onClick={() => setActiveTab('KEC')} className={`px-8 xl:px-10 py-1.5 text-sm font-bold rounded-md transition-all ${activeTab === 'KEC' ? 'bg-white text-[#000000] shadow-md' : 'bg-[#46A3FF] text-white hover:bg-[#1565c0]'}`}>Kecamatan</button>
          <button onClick={() => setActiveTab('KEL')} className={`px-8 xl:px-10 py-1.5 text-sm font-bold rounded-md transition-all ${activeTab === 'KEL' ? 'bg-white text-[#000000] shadow-md' : 'bg-[#46A3FF] text-white hover:bg-[#1565c0]'}`}>Kelurahan</button>
          <button onClick={() => setActiveTab('KEPLING')} className={`px-8 xl:px-10 py-1.5 text-sm font-bold rounded-md transition-all ${activeTab === 'KEPLING' ? 'bg-white text-[#000000] shadow-md' : 'bg-[#46A3FF] text-white hover:bg-[#1565c0]'}`}>Kepala Lingkungan</button>
        </div>
      </div>
    </div>
  );
};

export default Header;
