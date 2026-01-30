"use client";

import { Disclaimer } from "@/components/disclaimer";

export function Footer() {
    return (
        <footer className="w-full bg-black py-32 border-t border-white/5">
            <div className="max-w-[1400px] mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 mb-32">
                    <div className="space-y-12">
                        <div className="flex items-center gap-6">
                            <div className="size-16 flex items-center justify-center bg-white text-black rotate-45">
                                <span className="material-symbols-outlined -rotate-45" style={{ fontSize: '40px', fontWeight: 'bold' }}>gavel</span>
                            </div>
                            <h2 className="text-6xl font-black tracking-tighter uppercase font-cabinet text-[#FAF9F6]">Verity</h2>
                        </div>
                        <p className="text-2xl text-white/40 leading-snug max-w-lg">
                            Democratizing legal intelligence. We bring the scrutiny of the Supreme Court to your everyday agreements.
                        </p>
                        <div className="inline-flex items-center gap-4 px-8 py-4 bg-white/5 border border-white/10 rounded-full group hover:bg-white hover:text-black transition-all">
                            <span className="material-symbols-outlined text-[var(--color-accent)] group-hover:text-black transition-colors">verified</span>
                            <span className="text-sm font-black tracking-[0.2em] uppercase text-[#FAF9F6] group-hover:text-black">Verified by 7 Supreme Court Advocates</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <h4 className="text-[var(--color-accent)] font-black text-xs uppercase tracking-[0.4em]">Product</h4>
                            <ul className="space-y-6">
                                <li><a className="text-xl font-bold hover:text-[var(--color-accent)] transition-colors text-[#FAF9F6]" href="#">The Truth</a></li>
                                <li><a className="text-xl font-bold hover:text-[var(--color-accent)] transition-colors text-[#FAF9F6]" href="#">Pricing</a></li>
                                <li><a className="text-xl font-bold hover:text-[var(--color-accent)] transition-colors text-[#FAF9F6]" href="#">API Access</a></li>
                            </ul>
                        </div>
                        <div className="space-y-8">
                            <h4 className="text-[var(--color-accent)] font-black text-xs uppercase tracking-[0.4em]">Company</h4>
                            <ul className="space-y-6">
                                <li><a className="text-xl font-bold hover:text-[var(--color-accent)] transition-colors text-[#FAF9F6]" href="#">About Us</a></li>
                                <li><a className="text-xl font-bold hover:text-[var(--color-accent)] transition-colors text-[#FAF9F6]" href="#">Legal Team</a></li>
                                <li><a className="text-xl font-bold hover:text-[var(--color-accent)] transition-colors text-[#FAF9F6]" href="#">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Legal Disclaimer */}
                <Disclaimer variant="footer" />

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-white/20 text-xs font-bold uppercase tracking-widest">
                        © 2026 Verity Legal Technologies Pvt Ltd. All rights reserved.
                    </p>
                    <div className="flex gap-12">
                        <a className="text-white/20 text-xs font-bold uppercase tracking-widest hover:text-white" href="#">Privacy Policy</a>
                        <a className="text-white/20 text-xs font-bold uppercase tracking-widest hover:text-white" href="#">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
