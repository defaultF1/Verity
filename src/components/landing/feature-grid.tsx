"use client";

import Link from "next/link";

export function FeatureGrid() {
    return (
        <section className="w-full py-40 bg-[var(--color-accent)] text-white">
            <div className="max-w-[1400px] mx-auto px-6">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-24 border-b-8 border-black pb-12">
                    <div className="space-y-4">
                        <h2 className="font-cabinet text-7xl md:text-9xl leading-[0.9] tracking-wide text-black uppercase">
                            The Truth <br />Hurts
                        </h2>
                        <p className="font-serif italic text-2xl md:text-3xl text-black/80">
                            Real traps. Real consequences. Real Supreme Court citations.
                        </p>
                    </div>
                    <div className="text-black font-black text-xl tracking-tighter uppercase border-4 border-black px-6 py-2">
                        LEGAL BRIEF #2026-V
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Card 1 */}
                    <div className="space-y-8 bg-black p-12 hover:-translate-y-4 transition-transform duration-500">
                        <div className="flex flex-wrap items-center gap-4">
                            <span className="bg-[var(--color-accent)] text-white font-black px-4 py-1 text-xs uppercase tracking-[0.2em]">Void Clause</span>
                            <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Section 27, Indian Contract Act</span>
                        </div>
                        <h3 className="text-4xl font-black uppercase">Restraint of Trade</h3>
                        <p className="text-white/60 text-xl leading-relaxed">
                            &ldquo;Post-termination non-compete clauses are widely unenforceable in India, yet they appear in 80% of employment contracts.&rdquo;
                        </p>
                        <div className="font-serif text-[var(--color-accent)] text-lg italic border-l-4 border-[var(--color-accent)] pl-6">
                            — Percept D&apos;Mark (India) Pvt. Ltd. v. Zaheer Khan (2006)
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="space-y-8 bg-black p-12 hover:-translate-y-4 transition-transform duration-500">
                        <div className="flex flex-wrap items-center gap-4">
                            <span className="bg-[var(--color-accent)] text-white font-black px-4 py-1 text-xs uppercase tracking-[0.2em]">Unfair Term</span>
                            <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Unilateral Modification</span>
                        </div>
                        <h3 className="text-4xl font-black uppercase">Arbitrary Changes</h3>
                        <p className="text-white/60 text-xl leading-relaxed">
                            Clauses allowing one party to unilaterally alter contract terms without notice have been struck down as unconscionable.
                        </p>
                        <div className="font-serif text-[var(--color-accent)] text-lg italic border-l-4 border-[var(--color-accent)] pl-6">
                            — Central Inland Water Transport Corp v. Brojo Nath Ganguly (1986)
                        </div>
                    </div>
                </div>

                {/* CTA Banner */}
                <div className="mt-24 p-12 bg-black flex flex-col lg:flex-row items-center justify-between gap-12 group">
                    <div className="space-y-4">
                        <h4 className="text-4xl font-black uppercase">Don&apos;t sign blindly.</h4>
                        <p className="text-white/40 text-xl">Upload your document now to see if these clauses are hiding in your fine print.</p>
                    </div>
                    <Link href="/analyze">
                        <button className="w-full lg:w-auto px-12 py-8 bg-white text-black font-black text-2xl uppercase tracking-tighter hover:bg-[var(--color-accent)] hover:text-white transition-colors">
                            Check My Contract
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
