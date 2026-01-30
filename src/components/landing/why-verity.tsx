"use client";

import Link from "next/link";

export function WhyVerity() {
    return (
        <section className="w-full py-32 bg-[var(--color-background-light)] text-black">
            <div className="max-w-[1400px] mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-24">
                    {/* X-Ray Container */}
                    <div className="w-full lg:w-1/2">
                        <div className="xray-container relative aspect-[3/4] p-12 shadow-2xl overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-accent)]/30 shadow-[0_0_15px_rgba(211,84,0,0.5)] z-20 animate-[scan-line_3s_ease-in-out_infinite]"></div>

                            <div className="relative z-10 h-full flex flex-col justify-between opacity-40 mix-blend-screen grayscale">
                                <div className="space-y-4 font-serif text-[10px] text-white leading-relaxed text-justify">
                                    <p>TERMS AND CONDITIONS OF SERVICE. NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, THE PARTIES AGREE THAT ANY DISPUTE ARISING UNDER THIS AGREEMENT SHALL BE SUBJECT TO THE EXCLUSIVE JURISDICTION OF THE COURTS OF COMPETENT AUTHORITY. THE COMPANY RESERVES THE RIGHT TO AMEND, MODIFY, OR TERMINATE THE PROVISIONS WITHOUT PRIOR NOTICE AT ITS SOLE DISCRETION. LIABILITY IS LIMITED TO THE MAXIMUM EXTENT PERMITTED BY LAW.</p>
                                    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis.</p>
                                    <div className="h-24"></div>
                                    <p>ARTICLE 27: RESTRAINT OF TRADE. ANY AGREEMENT BY WHICH ANYONE IS RESTRAINED FROM EXERCISING A LAWFUL PROFESSION, TRADE OR BUSINESS OF ANY KIND, IS TO THAT EXTENT VOID. EXCEPTIONS APPLY ONLY IN SPECIFIC CASES OF GOODWILL SALE OR PARTNERSHIP DISSOLUTION AS PER THE INDIAN CONTRACT ACT, 1872.</p>
                                </div>
                            </div>

                            <div className="absolute inset-0 flex items-center justify-center z-30">
                                <div className="w-full h-[2px] bg-red-600 fault-line rotate-[-15deg] scale-110 flex items-center justify-center">
                                    <div className="bg-red-600 text-white text-[10px] font-black uppercase px-4 py-1 tracking-widest absolute -top-8 animate-bounce">
                                        VOID UNDER SECTION 27
                                    </div>
                                </div>
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                        </div>
                    </div>

                    {/* Why Verity Content */}
                    <div className="w-full lg:w-1/2 space-y-10">
                        <h2 className="font-cabinet text-6xl md:text-8xl leading-none uppercase">Why Verity?</h2>
                        <div className="space-y-6 text-xl md:text-2xl font-medium leading-tight text-black/70">
                            <p>
                                Hidden clauses trap users in voidable agreements. From non-competes to unfair liabilities,
                                legal jargon is often weaponized against you.
                            </p>
                            <p>
                                We don&apos;t just read contracts. We cross-reference every line against{" "}
                                <span className="text-[var(--color-accent)] font-black">Supreme Court rulings</span> to highlight risks instantly.
                            </p>
                        </div>
                        <div className="pt-6">
                            <Link
                                href="/analyze"
                                className="group inline-flex items-center gap-4 text-[var(--color-accent)] font-black text-lg uppercase tracking-widest border-b-4 border-[var(--color-accent)] pb-2 hover:gap-8 transition-all"
                            >
                                See sample analysis <span className="material-symbols-outlined">north_east</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
