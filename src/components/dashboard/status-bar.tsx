"use client";

export function StatusBar() {
    return (
        <div className="fixed bottom-0 w-full bg-white border-t border-[#c65316]/10 py-3 px-8 text-[10px] font-bold uppercase tracking-[0.15em] flex justify-between items-center z-50">
            <div className="flex items-center gap-6">
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-stone-400">
                        System Status: <span className="text-[#c65316] font-bold">Optimal</span>
                    </span>
                </span>
                <span className="text-stone-200">|</span>
                <span className="text-stone-400">
                    Last Sync: <span className="text-[#c65316] font-bold">Just Now</span>
                </span>
            </div>
            <div className="text-stone-300">
                Verity Analytics v2.4.1 — Enterprise Edition
            </div>
        </div>
    );
}
