"use client";

export function HowItWorks() {
    return (
        <section className="w-full py-32 bg-black text-[var(--color-text-main)]">
            <div className="max-w-[1400px] mx-auto px-6">
                <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-24">
                    <div className="max-w-xl">
                        <h2 className="font-cabinet text-6xl md:text-8xl uppercase leading-[0.9] tracking-wide">
                            How It <br /><span className="text-[var(--color-accent)]">Works</span>
                        </h2>
                    </div>
                    <p className="text-white/40 text-xl font-bold uppercase tracking-[0.2em]">
                        Three steps to absolute clarity
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                    {[
                        { num: "01", title: "Upload Contract", desc: "Securely upload your PDF. Your data is encrypted and processed in a private sandbox environment." },
                        { num: "02", title: "AI Analysis", desc: "Our engine scans the document against 50 years of Indian Case Law and Supreme Court Rulings." },
                        { num: "03", title: "Uncover Risks", desc: "Receive a detailed report highlighting void clauses, risky terms, and actionable advice." },
                    ].map((step, i) => (
                        <div
                            key={i}
                            className="group relative bg-[#0a0a0a] p-16 border border-white/5 hover:bg-[var(--color-accent)] transition-all duration-500 overflow-hidden h-[450px] flex flex-col justify-end"
                        >
                            <span className="absolute top-10 right-10 text-8xl font-black font-cabinet opacity-10 group-hover:opacity-30 group-hover:scale-125 transition-all">
                                {step.num}
                            </span>
                            <div className="relative z-10 space-y-6">
                                <h3 className="text-3xl font-black uppercase group-hover:text-black">
                                    {step.title}
                                </h3>
                                <p className="text-white/50 group-hover:text-black/80 text-lg leading-relaxed">
                                    {step.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
