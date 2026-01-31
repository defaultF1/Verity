"use client";

import { useState, useEffect } from "react";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { StatusBar } from "@/components/dashboard/status-bar";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import {
    User,
    Mail,
    Calendar,
    Shield,
    Save,
    CheckCircle,
    AlertCircle,
    UserCircle,
    Key,
    Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
    const { isLoggedIn, user, profile, openLoginModal, setUser, updateProfile } = useAuth();
    const { t } = useLanguage();

    // Form states
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [dob, setDob] = useState("");
    const [gender, setGender] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

    // Password reset states
    const [isResetting, setIsResetting] = useState(false);
    const [resetStep, setResetStep] = useState<"initial" | "sent">("initial");

    // Initialize states from user and profile object
    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
        if (profile) {
            if (profile.dateOfBirth) setDob(profile.dateOfBirth);
            if (profile.gender) setGender(profile.gender);
        }
    }, [user, profile]);

    // Redirect if not logged in
    useEffect(() => {
        if (!isLoggedIn) {
            openLoginModal();
        }
    }, [isLoggedIn, openLoginModal]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveStatus("idle");

        // Simulate API call
        setTimeout(() => {
            if (user) {
                const updatedUser = {
                    ...user,
                    name,
                    email
                };
                setUser(updatedUser);

                // Also update the detailed profile if it exists
                updateProfile({
                    name,
                    dateOfBirth: dob,
                    gender: gender as any || "prefer_not_to_say"
                });
            }
            setIsSaving(false);
            setSaveStatus("success");
            setTimeout(() => setSaveStatus("idle"), 3000);
        }, 1000);
    };

    const handlePasswordReset = () => {
        setIsResetting(true);
        // Simulate email sending
        setTimeout(() => {
            setIsResetting(false);
            setResetStep("sent");
        }, 1500);
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-[#f8f6f6] flex items-center justify-center p-4 text-center">
                <div className="bg-white p-12 rounded-sm shadow-xl border border-stone-100 max-w-md w-full">
                    <div className="size-16 bg-[#c65316]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-8 h-8 text-[#c65316]" />
                    </div>
                    <h2 className="text-2xl font-bold text-stone-800 mb-2">{t("Access Restricted")}</h2>
                    <p className="text-stone-500 mb-8">{t("Please sign in to view and manage your profile.")}</p>
                    <button
                        onClick={openLoginModal}
                        className="w-full py-4 bg-[#c65316] text-white font-bold uppercase tracking-widest rounded-sm hover:bg-[#2A3D36] transition shadow-lg"
                    >
                        {t("Sign In")}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f6f6]">
            <DashboardNav activeTab="Profile" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="h-24 w-24 bg-[#5D3D50] text-white flex items-center justify-center text-4xl font-bold uppercase rounded-sm shadow-xl ring-4 ring-white">
                                {user?.name?.charAt(0) || "U"}
                            </div>
                            <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-[#c65316] rounded-sm flex items-center justify-center border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition">
                                <span className="material-symbols-outlined text-white text-sm">edit</span>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-stone-900 leading-tight">
                                {t("My Profile")}
                            </h1>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-stone-500 font-medium">{user?.email}</span>
                                <span className="h-1 w-1 bg-stone-300 rounded-full"></span>
                                <span className="text-[#c65316] font-bold text-xs uppercase tracking-widest">{user?.role}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-widest rounded-sm border border-emerald-100 flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5" />
                            {t("Verified Account")}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Form */}
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-white rounded-sm shadow-lg border border-white overflow-hidden">
                            <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-3 bg-stone-50/50">
                                <UserCircle className="w-5 h-5 text-[#c65316]" />
                                <h2 className="font-bold text-stone-800 uppercase tracking-widest text-xs">{t("Personal Information")}</h2>
                            </div>

                            <form onSubmit={handleSaveProfile} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {/* Name Field */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                                            {t("Full Name")}
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-sm focus:border-[#c65316]/30 focus:ring-4 focus:ring-[#c65316]/5 transition text-stone-700"
                                            />
                                        </div>
                                    </div>

                                    {/* Email Field */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                                            {t("Email Address")}
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-sm focus:border-[#c65316]/30 focus:ring-4 focus:ring-[#c65316]/5 transition text-stone-700"
                                            />
                                        </div>
                                    </div>

                                    {/* DOB Field */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                                            {t("Date of Birth")}
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                            <input
                                                type="date"
                                                value={dob}
                                                onChange={(e) => setDob(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-sm focus:border-[#c65316]/30 focus:ring-4 focus:ring-[#c65316]/5 transition text-stone-700"
                                            />
                                        </div>
                                    </div>

                                    {/* Gender Field */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                                            {t("Gender")}
                                        </label>
                                        <select
                                            value={gender}
                                            onChange={(e) => setGender(e.target.value)}
                                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-sm focus:border-[#c65316]/30 focus:ring-4 focus:ring-[#c65316]/5 transition text-stone-700"
                                        >
                                            <option value="">{t("Select Gender")}</option>
                                            <option value="male">{t("Male")}</option>
                                            <option value="female">{t("Female")}</option>
                                            <option value="other">{t("Other")}</option>
                                            <option value="prefer_not">{t("Prefer not to say")}</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-between">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className={cn(
                                            "flex items-center gap-2 px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] rounded-sm transition shadow-lg",
                                            saveStatus === "success"
                                                ? "bg-emerald-500 text-white"
                                                : "bg-[#c65316] text-white hover:bg-[#2A3D36]"
                                        )}
                                    >
                                        {isSaving ? (
                                            <span className="animate-pulse">{t("Saving...")}</span>
                                        ) : saveStatus === "success" ? (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                {t("Profile Updated")}
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                {t("Save Changes")}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Account Security & UI Details */}
                    <div className="space-y-8">
                        {/* Password Reset Section */}
                        <div className="bg-white rounded-sm shadow-lg border border-white overflow-hidden p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-stone-50 rounded-sm flex items-center justify-center">
                                    <Key className="w-5 h-5 text-stone-400" />
                                </div>
                                <h2 className="font-bold text-stone-800 uppercase tracking-widest text-[10px]">{t("Security")}</h2>
                            </div>

                            {resetStep === "initial" ? (
                                <div className="space-y-4">
                                    <p className="text-xs text-stone-500 leading-relaxed">
                                        {t("Keep your account secure by updating your password regularly.")}
                                    </p>
                                    <button
                                        onClick={handlePasswordReset}
                                        disabled={isResetting}
                                        className="w-full py-3 bg-stone-50 border border-stone-200 text-stone-600 font-bold text-[10px] uppercase tracking-widest rounded-sm hover:bg-stone-100 transition"
                                    >
                                        {isResetting ? t("Preparing Link...") : t("Reset Password")}
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-sm">
                                    <div className="flex gap-3">
                                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                        <p className="text-xs font-medium text-emerald-800">
                                            {t("Reset instructions sent to your email!")}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setResetStep("initial")}
                                        className="mt-3 text-[10px] font-bold text-emerald-700 hover:underline uppercase"
                                    >
                                        {t("Resend Link")}
                                    </button>
                                </div>
                            )}
                        </div>


                    </div>
                </div>
            </div>

            <StatusBar />
        </div>
    );
}
