"use client";

import { useState, useEffect } from "react";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { StatusBar } from "@/components/dashboard/status-bar";
import { LoginModal } from "@/components/login-modal";
import { useAuth } from "@/contexts/auth-context";
import {
    Key,
    User,
    Trash2,
    Save,
    CheckCircle,
    AlertCircle,
    Eye,
    EyeOff,
    RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const { isLoggedIn, user, openLoginModal } = useAuth();
    const [apiKey, setApiKey] = useState("");
    const [showApiKey, setShowApiKey] = useState(false);
    const [apiKeyStatus, setApiKeyStatus] = useState<"idle" | "saved" | "error">("idle");
    const [isClearing, setIsClearing] = useState(false);

    // Load API key from localStorage on mount
    useEffect(() => {
        const savedKey = localStorage.getItem("verity_anthropic_api_key");
        if (savedKey) {
            setApiKey(savedKey);
        }
    }, []);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isLoggedIn) {
            openLoginModal();
        }
    }, [isLoggedIn, openLoginModal]);

    const handleSaveApiKey = () => {
        if (apiKey.trim()) {
            localStorage.setItem("verity_anthropic_api_key", apiKey.trim());
            setApiKeyStatus("saved");
            setTimeout(() => setApiKeyStatus("idle"), 3000);
        } else {
            setApiKeyStatus("error");
            setTimeout(() => setApiKeyStatus("idle"), 3000);
        }
    };

    const handleClearHistory = () => {
        setIsClearing(true);
        // Clear all Verity-related localStorage keys
        const keysToRemove = Object.keys(localStorage).filter(key =>
            key.startsWith("verity_") || key === "analysis_results"
        );
        keysToRemove.forEach(key => localStorage.removeItem(key));

        setTimeout(() => {
            setIsClearing(false);
        }, 1000);
    };

    const handleResetSettings = () => {
        localStorage.removeItem("verity_anthropic_api_key");
        setApiKey("");
        setApiKeyStatus("idle");
    };

    const maskApiKey = (key: string) => {
        if (key.length <= 8) return key;
        return key.slice(0, 7) + "•".repeat(Math.min(20, key.length - 11)) + key.slice(-4);
    };

    return (
        <div className="min-h-screen bg-[#f8f6f6]">
            <DashboardNav activeTab="Settings" />
            <LoginModal />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-[#c65316]">
                        Settings
                    </h1>
                    <p className="text-stone-500 mt-2">
                        Manage your preferences and API configuration
                    </p>
                </div>

                <div className="space-y-8">
                    {/* API Configuration */}
                    <div className="bg-white rounded-sm shadow-lg border border-white overflow-hidden">
                        <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#c65316]/5 rounded-sm flex items-center justify-center">
                                <Key className="w-5 h-5 text-[#c65316]" />
                            </div>
                            <div>
                                <h2 className="font-bold text-lg text-stone-800">API Configuration</h2>
                                <p className="text-xs text-stone-400">Connect your Anthropic API key for AI-powered features</p>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                                    Anthropic API Key
                                </label>
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <input
                                            type={showApiKey ? "text" : "password"}
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            placeholder="sk-ant-api03-..."
                                            className="w-full px-4 py-3 pr-12 bg-stone-50 border border-stone-200 rounded-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:border-[#c65316]/30 focus:ring-2 focus:ring-[#c65316]/10 font-mono text-sm"
                                        />
                                        <button
                                            onClick={() => setShowApiKey(!showApiKey)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition"
                                        >
                                            {showApiKey ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleSaveApiKey}
                                        className={cn(
                                            "flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-widest rounded-sm transition",
                                            apiKeyStatus === "saved"
                                                ? "bg-emerald-500 text-white"
                                                : apiKeyStatus === "error"
                                                    ? "bg-red-500 text-white"
                                                    : "bg-[#c65316] text-white hover:bg-[#2A3D36]"
                                        )}
                                    >
                                        {apiKeyStatus === "saved" ? (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                Saved
                                            </>
                                        ) : apiKeyStatus === "error" ? (
                                            <>
                                                <AlertCircle className="w-4 h-4" />
                                                Error
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Save
                                            </>
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-stone-400 mt-2">
                                    Your API key is stored locally in your browser and never sent to our servers.
                                </p>
                            </div>

                            {/* API Status */}
                            <div className="p-4 bg-stone-50 rounded-sm border border-stone-200">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-3 h-3 rounded-full",
                                        apiKey ? "bg-emerald-500 animate-pulse" : "bg-stone-300"
                                    )} />
                                    <span className="text-sm text-stone-600">
                                        {apiKey ? "API Key Configured" : "No API Key Set"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Section */}
                    <div className="bg-white rounded-sm shadow-lg border border-white overflow-hidden">
                        <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#c65316]/5 rounded-sm flex items-center justify-center">
                                <User className="w-5 h-5 text-[#c65316]" />
                            </div>
                            <div>
                                <h2 className="font-bold text-lg text-stone-800">Profile</h2>
                                <p className="text-xs text-stone-400">Your account information</p>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                                        Name
                                    </label>
                                    <div className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-sm text-stone-700">
                                        {user?.name || "Guest User"}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                                        Role
                                    </label>
                                    <div className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-sm text-stone-700 capitalize">
                                        {user?.role || "Freelancer"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Management */}
                    <div className="bg-white rounded-sm shadow-lg border border-white overflow-hidden">
                        <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-50 rounded-sm flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <h2 className="font-bold text-lg text-stone-800">Data Management</h2>
                                <p className="text-xs text-stone-400">Clear your local data and reset settings</p>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleClearHistory}
                                    disabled={isClearing}
                                    className={cn(
                                        "flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-widest rounded-sm border transition",
                                        isClearing
                                            ? "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
                                            : "bg-white text-red-600 border-red-200 hover:bg-red-50"
                                    )}
                                >
                                    {isClearing ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Clearing...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            Clear All History
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleResetSettings}
                                    className="flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-widest rounded-sm bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 transition"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Reset Settings
                                </button>
                            </div>
                            <p className="text-xs text-stone-400 mt-4">
                                Clearing history will remove all saved reports and analysis data from your browser.
                                This action cannot be undone.
                            </p>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="bg-white rounded-sm shadow-lg border border-white overflow-hidden">
                        <div className="p-6 text-center">
                            <div className="size-16 flex items-center justify-center bg-[#c65316] text-white rotate-45 mx-auto mb-4 rounded-sm">
                                <span className="material-symbols-outlined -rotate-45" style={{ fontSize: '32px' }}>
                                    gavel
                                </span>
                            </div>
                            <h3 className="font-bold text-lg text-stone-800 mb-1">Verity</h3>
                            <p className="text-sm text-stone-500 mb-4">
                                AI-Powered Contract Analysis for Indian Law
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                                Version 1.0.0 • Built for Hackathon 2026
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <StatusBar />
        </div>
    );
}
