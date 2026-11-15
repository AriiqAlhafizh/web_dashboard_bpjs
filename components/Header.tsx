const Header = () => {
  return (
    <div className="w-full shadow-sm">
      <header className="relative min-h-[100px] overflow-hidden flex justify-center items-end pb-3 gap-4 xl:gap-12 transition-colors duration-300 bg-gradient-to-r from-[#f1f8e9] via-[#f9fbe7] to-[#fffde7]">
        <div className="text-center pb-3 z-10 shrink-0 px-4">
          <h1 className="text-[34px] xl:text-[40px] font-black leading-none tracking-tight transition-colors duration-300 text-[#000000]">DASHBOARD UCJ</h1>
        </div>
      </header>
    </div>
  );
};

export default Header;
