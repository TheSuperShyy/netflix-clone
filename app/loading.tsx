export default function Loading() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 overflow-hidden">
      <div className="relative">
        <div className="text-brand-red font-black text-[8rem] md:text-[12rem] leading-none tracking-tighter animate-logo-pulse select-none">
          N
        </div>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-y-0 -inset-x-1/2 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-sheen" />
        </div>
      </div>
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-zinc-500 text-[10px] md:text-xs uppercase tracking-[0.5em] animate-fade-in">
        Netflix ni Yul
      </div>
    </div>
  );
}
