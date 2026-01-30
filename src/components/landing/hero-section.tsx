"use client";

import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
    return (
        <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <img
                    alt="Courtroom Silhouette"
                    className="w-full h-full object-cover opacity-50 grayscale"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMY6mQw4AkycLdQraQo0GRwAraxFcHW_u-qOcIOPMPq2WI8_rrqBkx-17znl2k864MyD_sm1pXaKDOi05ycn8Y9cSr3-rguGrt3h_aGjC7rJF91rC_YCpuKGd_S00gf-UWOdyQgBXAvNUT8RGEOZeIecCVkM47CyOBDFTRJraceRXUbyS_NHVRbvByebSfthuroN39HOb59czemDt4eficpEAD0lm1O_DiY4sGzcKPq74EE-LHgm99DPWUh_pOoZqPdEkUVOJVdRbN"
                />
                <div className="absolute inset-0 hero-gradient"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-[1400px] px-6 text-center">
                <div className="space-y-8">
                    <h1 className="font-cabinet text-6xl md:text-8xl lg:text-[140px] leading-[0.9] tracking-wide uppercase text-[var(--color-text-main)]">
                        Verity: The Truth <br />
                        <span className="text-[var(--color-accent)]">Behind the Clause</span>
                    </h1>

                    <div className="flex flex-col items-center gap-10">
                        <h2 className="font-serif italic text-2xl md:text-4xl text-white/80 max-w-4xl leading-snug">
                            &ldquo;Legalese is designed to obscure. <br className="hidden md:block" />
                            We are designed to reveal.&rdquo;
                        </h2>

                        <div className="flex flex-col items-center gap-8">
                            <Link href="/analyze">
                                <button className="group relative bg-[var(--color-accent)] text-white px-12 py-6 text-xl font-black uppercase tracking-tighter hover:scale-105 transition-all duration-500 overflow-hidden">
                                    <span className="relative z-10 flex items-center gap-4">
                                        Upload Your Contract
                                        <span className="material-symbols-outlined font-bold">arrow_forward</span>
                                    </span>
                                    <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    <span className="absolute inset-0 flex items-center justify-center text-black font-black translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
                                        Get Truth in 10 Seconds
                                    </span>
                                </button>
                            </Link>

                            <div className="flex items-center gap-3 text-white/40 text-[10px] uppercase tracking-[0.4em] font-bold">
                                <span className="material-symbols-outlined text-sm">verified_user</span>
                                Bank-Grade Encryption
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Authority Watermark */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none opacity-10">
                <div className="text-[20vw] font-black font-cabinet text-outline whitespace-nowrap leading-none -mb-8">
                    SUPREME COURT AUTHORITY
                </div>
            </div>
        </section>
    );
}
