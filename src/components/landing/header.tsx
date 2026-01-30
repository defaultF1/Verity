"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
    return (
        <header className="fixed top-0 z-[100] w-full bg-black/80 backdrop-blur-xl border-b border-white/10">
            <div className="max-w-[1400px] mx-auto px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="size-10 flex items-center justify-center bg-[var(--color-accent)] text-black rotate-45">
                        <span
                            className="material-symbols-outlined -rotate-45"
                            style={{ fontSize: '24px', fontWeight: 'bold' }}
                        >
                            gavel
                        </span>
                    </div>
                    <h2 className="text-2xl font-black tracking-tighter uppercase font-cabinet text-[#FAF9F6]">Verity</h2>
                </div>

                <nav className="hidden lg:flex items-center gap-12 font-display">
                    <a className="text-xs font-bold tracking-[0.2em] uppercase text-[#FAF9F6] hover:text-[var(--color-accent)] transition-colors" href="#truth">
                        The Truth
                    </a>
                    <a className="text-xs font-bold tracking-[0.2em] uppercase text-[#FAF9F6] hover:text-[var(--color-accent)] transition-colors" href="#pricing">
                        Pricing
                    </a>
                    <button
                        onClick={() => document.dispatchEvent(new CustomEvent('open-login-modal'))}
                        className="text-xs font-bold tracking-[0.2em] uppercase text-[#FAF9F6] hover:text-[var(--color-accent)] transition-colors"
                    >
                        Login
                    </button>
                    <button
                        onClick={() => {
                            const token = localStorage.getItem("verity_auth");
                            if (token && JSON.parse(token).isLoggedIn) {
                                window.location.href = "/analyze";
                            } else {
                                document.dispatchEvent(new CustomEvent('open-login-modal'));
                            }
                        }}
                        className="bg-[var(--color-accent)] text-white px-8 py-3 text-xs font-black tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all duration-300"
                    >
                        Upload Contract
                    </button>
                </nav>
            </div>
        </header>
    );
}
