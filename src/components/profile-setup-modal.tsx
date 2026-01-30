"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { X, User, Calendar, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfileSetupModal() {
    const { isProfileModalOpen, closeProfileModal, saveProfile, user } = useAuth();
    const [name, setName] = useState(user?.name || "");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [gender, setGender] = useState<"male" | "female" | "other" | "prefer_not_to_say">("prefer_not_to_say");
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError("Please enter your name");
            return;
        }
        if (!dateOfBirth) {
            setError("Please enter your date of birth");
            return;
        }

        saveProfile({ name: name.trim(), dateOfBirth, gender });
    };

    if (!isProfileModalOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-sm shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#c65316] to-[#a84513] p-6 text-white relative">
                    <button
                        onClick={closeProfileModal}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="size-16 bg-white/20 rounded-sm flex items-center justify-center mb-4 rotate-3">
                        <User className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold">Complete Your Profile</h2>
                    <p className="text-white/80 text-sm mt-1">
                        Help us personalize your experience
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-sm text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                            <User className="w-3 h-3 inline mr-1" />
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:border-[#c65316]/30 focus:ring-2 focus:ring-[#c65316]/10"
                        />
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            Date of Birth
                        </label>
                        <input
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-sm text-stone-700 focus:outline-none focus:border-[#c65316]/30 focus:ring-2 focus:ring-[#c65316]/10"
                        />
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                            <Users className="w-3 h-3 inline mr-1" />
                            Gender
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { value: "female", label: "Female", icon: "♀" },
                                { value: "male", label: "Male", icon: "♂" },
                                { value: "other", label: "Other", icon: "⚧" },
                                { value: "prefer_not_to_say", label: "Prefer not to say", icon: "—" }
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setGender(option.value as typeof gender)}
                                    className={cn(
                                        "p-3 border rounded-sm text-sm font-medium transition flex items-center justify-center gap-2",
                                        gender === option.value
                                            ? "border-[#c65316] bg-[#c65316]/5 text-[#c65316]"
                                            : "border-stone-200 text-stone-600 hover:border-stone-300"
                                    )}
                                >
                                    <span className="text-lg">{option.icon}</span>
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Shield Info for Women */}
                    {gender === "female" && (
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-sm">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">🛡️</span>
                                <div>
                                    <p className="font-bold text-purple-800 text-sm">Women Freelancer Shield</p>
                                    <p className="text-purple-600 text-xs mt-1">
                                        You&apos;ll get access to our Shield Mode, which detects clauses that disproportionately affect women freelancers.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full py-4 bg-[#c65316] text-white font-bold uppercase tracking-wider rounded-sm hover:bg-[#a84513] transition"
                    >
                        Save Profile
                    </button>

                    <p className="text-xs text-stone-400 text-center">
                        Your data is stored locally and never sent to our servers.
                    </p>
                </form>
            </div>
        </div>
    );
}
