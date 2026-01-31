"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { Lock, ChevronDown, LayoutDashboard, FileText, Settings, Zap, BarChart, LifeBuoy, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageToggle } from "@/components/language-toggle";

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    requiresAuth?: boolean;
}

interface DashboardNavProps {
    activeTab?: string;
}

export function DashboardNav({ activeTab = "Dashboard" }: DashboardNavProps) {
    const { isLoggedIn, user, openLoginModal, logout, openProfileModal } = useAuth();
    const { t } = useLanguage();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const navItems: NavItem[] = [
        { label: t("Dashboard"), href: "/results", icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: t("Reports"), href: "/reports", icon: <FileText className="w-5 h-5" />, requiresAuth: true },
    ];

    return (
        <nav className="sticky top-0 z-50 bg-[#FDFDFD] border-b border-[#c65316]/10 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    {/* Logo */}
                    <div className="flex items-center gap-4">
                        <div className="size-10 flex items-center justify-center bg-[#c65316] text-white rotate-45 rounded-sm shadow-lg shadow-[#c65316]/20">
                            <span
                                className="material-symbols-outlined -rotate-45"
                                style={{ fontSize: '24px', fontWeight: 'bold' }}
                            >
                                gavel
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-2xl tracking-tight text-[#c65316] leading-none font-cabinet uppercase">
                                Verity
                            </span>
                            <span className="text-[10px] font-bold text-[#c65316]/60 uppercase tracking-[0.2em] mt-1">
                                {t("Results Dashboard")}
                            </span>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="hidden md:flex space-x-1 items-center">
                        {navItems.map((item) => {
                            const isActive = item.label === t(activeTab); // Compare translated label or original
                            const isLocked = item.requiresAuth && !isLoggedIn;

                            if (isLocked) {
                                return (
                                    <button
                                        key={item.label}
                                        onClick={openLoginModal}
                                        className="text-stone-500 hover:text-[#c65316] font-medium flex items-center gap-2 px-5 py-2.5 transition group relative"
                                        title={t("Login required")}
                                    >
                                        {item.icon}
                                        {item.label}
                                        <Lock className="w-3 h-3 ml-1 opacity-60" />
                                    </button>
                                );
                            }

                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={cn(
                                        "font-medium flex items-center gap-2 px-5 py-2.5 transition",
                                        isActive
                                            ? "text-[#c65316] font-bold bg-[#c65316]/5 border border-[#c65316]/10 rounded-sm"
                                            : "text-stone-500 hover:text-[#c65316]"
                                    )}
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* User Profile / Login */}
                    <div className="flex items-center gap-4">
                        {/* Language Toggle */}
                        <LanguageToggle variant="minimal" className="text-stone-500 hover:text-[#c65316]" />

                        <div className="relative">
                            {isLoggedIn && user ? (
                                <div
                                    className="flex items-center gap-3 cursor-pointer hover:bg-[#c65316]/5 p-2 rounded-sm transition group"
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                >
                                    <div className="h-9 w-9 rounded-sm bg-[#5D3D50] text-white flex items-center justify-center font-bold uppercase transition-transform group-hover:scale-105">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="hidden sm:block">
                                        <p className="text-xs font-bold text-[#c65316]">{user.name}</p>
                                        <p className="text-[10px] text-stone-400 uppercase tracking-wider">{user.role}</p>
                                    </div>
                                    <ChevronDown className={cn("w-4 h-4 text-stone-400 transition-transform duration-300", isProfileOpen && "rotate-180")} />
                                </div>
                            ) : (
                                <button
                                    onClick={openLoginModal}
                                    className="flex items-center gap-3 hover:bg-[#c65316]/5 p-2 rounded-sm transition group"
                                >
                                    <div className="h-9 w-9 rounded-sm bg-stone-300 text-stone-600 flex items-center justify-center font-bold transition-transform group-hover:scale-105">
                                        ?
                                    </div>
                                    <div className="hidden sm:block text-left">
                                        <p className="text-xs font-bold text-[#c65316]">{t("Login")}</p>
                                        <p className="text-[10px] text-stone-400 uppercase tracking-wider">{t("Guest")}</p>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-stone-400" />
                                </button>
                            )}

                            {/* Standard Dropdown Menu */}
                            {isProfileOpen && isLoggedIn && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setIsProfileOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-64 bg-white border border-stone-200 rounded-sm shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        {/* User Identity Header */}
                                        <div className="px-5 py-4 border-b border-stone-100 bg-stone-50/50">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{t("Signed in as")}</p>
                                                {user?.usage?.plan && (
                                                    <span className="bg-[#c65316]/10 text-[#c65316] text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-[#c65316]/20">
                                                        {user.usage.plan}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm font-bold text-stone-800 truncate">{user?.email}</p>
                                        </div>

                                        {/* Usage / Credits Section */}
                                        {user?.usage && (
                                            <div className="px-5 py-3.5 border-b border-stone-100 bg-white">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <BarChart className="w-3.5 h-3.5 text-[#c65316]" />
                                                        <span className="text-xs font-bold text-stone-600">{t("Usage Details")}</span>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-stone-400">
                                                        {user.usage.scansUsed}/{user.usage.scansTotal} {t("Scans")}
                                                    </span>
                                                </div>
                                                <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#c65316] transition-all duration-1000"
                                                        style={{ width: `${(user.usage.scansUsed / user.usage.scansTotal) * 100}%` }}
                                                    />
                                                </div>
                                                <button className="mt-3 w-full flex items-center justify-center gap-2 py-1.5 bg-[#c65316]/5 hover:bg-[#c65316]/10 text-[#c65316] text-[10px] font-bold uppercase tracking-wider rounded-sm transition">
                                                    <Zap className="w-3 h-3 fill-current" />
                                                    {t("Upgrade Limit")}
                                                </button>
                                            </div>
                                        )}

                                        {/* Account Actions */}
                                        <div className="py-1.5 border-b border-stone-100">
                                            <Link
                                                href="/profile"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-stone-600 hover:bg-[#c65316]/5 hover:text-[#c65316] transition"
                                            >
                                                <span className="material-symbols-outlined text-[20px] opacity-70">account_circle</span>
                                                {t("My Profile")}
                                            </Link>
                                            <Link
                                                href="/settings"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-stone-600 hover:bg-[#c65316]/5 hover:text-[#c65316] transition"
                                            >
                                                <Settings className="w-4 h-4 opacity-70" />
                                                {t("Account Settings")}
                                            </Link>
                                        </div>

                                        {/* Support Section */}
                                        <div className="py-1.5 border-b border-stone-100">
                                            <button className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-stone-600 hover:bg-stone-50 transition">
                                                <LifeBuoy className="w-4 h-4 opacity-70" />
                                                {t("Help Center")}
                                            </button>
                                            <button className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-stone-600 hover:bg-stone-50 transition">
                                                <MessageSquare className="w-4 h-4 opacity-70" />
                                                {t("Send Feedback")}
                                            </button>
                                        </div>

                                        {/* Logout Zone */}
                                        <div className="py-1.5 bg-stone-50/30">
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setIsProfileOpen(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">logout</span>
                                                <span className="font-medium">{t("Sign Out")}</span>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
