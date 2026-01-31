"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export function LoginModal() {
    const router = useRouter();
    const { isLoginModalOpen, closeLoginModal, login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState("");

    if (!isLoginModalOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        setIsLoading(true);
        try {
            // Both login and signup use the same mock function for now as requested
            const success = await login(email, password);
            if (!success) {
                setError("Invalid credentials");
            } else {
                router.push("/reports");
            }
        } catch {
            setError(isSignUp ? "Registration failed. Please try again." : "Login failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            closeLoginModal();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className="relative w-full max-w-md mx-4 bg-[#FDFDFD] rounded-sm shadow-2xl border border-[#c65316]/10 overflow-hidden">
                {/* Header gradient */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#c65316] via-[#5D3D50] to-[#c65316]" />

                {/* Close button */}
                <button
                    onClick={closeLoginModal}
                    className="absolute top-4 right-4 p-2 text-stone-400 hover:text-[#c65316] transition"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-[#c65316]/10 flex items-center justify-center">
                            <Lock className="w-8 h-8 text-[#c65316]" />
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-center text-[#c65316] mb-2">
                        {isSignUp ? "Create an Account" : "Sign In to Verity"}
                    </h2>
                    <p className="text-sm text-center text-stone-500 mb-8">
                        {isSignUp ? "Join Verity for full contract protection" : "Access full reports and settings"}
                    </p>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@company.com"
                                    className="w-full pl-12 pr-4 py-3 bg-stone-100 border border-stone-200 rounded-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c65316] focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-3 bg-stone-100 border border-stone-200 rounded-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c65316] focus:border-transparent transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#c65316] transition"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-3 bg-red-100 text-red-600 text-sm rounded-sm animate-in fade-in zoom-in duration-200">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-[#c65316] text-white font-bold uppercase tracking-widest rounded-sm hover:bg-[#2A3D36] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#c65316]/20"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {isSignUp ? "Creating Account..." : "Signing In..."}
                                </>
                            ) : (
                                isSignUp ? "Sign Up" : "Sign In"
                            )}
                        </button>
                    </form>

                    {/* Switch between Login and SignUp */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError("");
                            }}
                            className="text-sm font-medium text-[#c65316] hover:underline transition"
                        >
                            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-stone-200" />
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Demo</span>
                        <div className="flex-1 h-px bg-stone-200" />
                    </div>

                    {/* Demo hint */}
                    <p className="text-xs text-center text-stone-400">
                        Enter any email and password for demo access
                    </p>
                </div>
            </div>
        </div>
    );
}
