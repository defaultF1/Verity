"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Lock, ChevronDown, LayoutDashboard, FileText, Settings, Gavel } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    requiresAuth?: boolean;
}

const navItems: NavItem[] = [
    { label: "Dashboard", href: "/results", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Reports", href: "/reports", icon: <FileText className="w-5 h-5" />, requiresAuth: true },
    { label: "Settings", href: "/settings", icon: <Settings className="w-5 h-5" />, requiresAuth: true },
];

interface DashboardNavProps {
    activeTab?: string;
}

export function DashboardNav({ activeTab = "Dashboard" }: DashboardNavProps) {
    const { isLoggedIn, user, openLoginModal, logout } = useAuth();

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
                                Results Dashboard
                            </span>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="hidden md:flex space-x-1 items-center">
                        {navItems.map((item) => {
                            const isActive = item.label === activeTab;
                            const isLocked = item.requiresAuth && !isLoggedIn;

                            if (isLocked) {
                                return (
                                    <button
                                        key={item.label}
                                        onClick={openLoginModal}
                                        className="text-stone-500 hover:text-[#c65316] font-medium flex items-center gap-2 px-5 py-2.5 transition group relative"
                                        title="Login required"
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
                        {isLoggedIn && user ? (
                            <div
                                className="flex items-center gap-3 cursor-pointer hover:bg-[#c65316]/5 p-2 rounded-sm transition group"
                                onClick={logout}
                                title="Click to logout"
                            >
                                <div className="h-9 w-9 rounded-sm bg-[#5D3D50] text-white flex items-center justify-center font-bold">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-xs font-bold text-[#c65316]">{user.name}</p>
                                    <p className="text-[10px] text-stone-400 uppercase tracking-wider">{user.role}</p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-stone-400" />
                            </div>
                        ) : (
                            <button
                                onClick={openLoginModal}
                                className="flex items-center gap-3 hover:bg-[#c65316]/5 p-2 rounded-sm transition"
                            >
                                <div className="h-9 w-9 rounded-sm bg-stone-300 text-stone-600 flex items-center justify-center font-bold">
                                    ?
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-xs font-bold text-[#c65316]">Login</p>
                                    <p className="text-[10px] text-stone-400 uppercase tracking-wider">Guest</p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-stone-400" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
