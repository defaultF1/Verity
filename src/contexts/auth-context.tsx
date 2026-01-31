"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";

interface UserProfile {
    name: string;
    dateOfBirth: string;
    gender: "male" | "female" | "other" | "prefer_not_to_say";
}

interface User {
    name: string;
    email: string;
    role: string;
    usage?: {
        scansUsed: number;
        scansTotal: number;
        plan: string;
    };
}

interface AuthContextType {
    isLoggedIn: boolean;
    user: User | null;
    profile: UserProfile | null;
    isProfileComplete: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    openLoginModal: () => void;
    closeLoginModal: () => void;
    isLoginModalOpen: boolean;
    openProfileModal: () => void;
    closeProfileModal: () => void;
    isProfileModalOpen: boolean;
    saveProfile: (profile: UserProfile) => void;
    setUser: (user: User | null) => void;
    updateProfile: (profile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "verity_auth";
const PROFILE_STORAGE_KEY = "verity_user_profile";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load auth and profile state from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        const storedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);

        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed.user && parsed.isLoggedIn) {
                    // eslint-disable-next-line react-hooks/set-state-in-effect
                    setUser(parsed.user);
                    setIsLoggedIn(true);
                }
            } catch {
                localStorage.removeItem(AUTH_STORAGE_KEY);
            }
        }

        if (storedProfile) {
            try {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setProfile(JSON.parse(storedProfile));
            } catch {
                localStorage.removeItem(PROFILE_STORAGE_KEY);
            }
        }

        setIsInitialized(true);
    }, []);

    // Persist auth state to localStorage
    useEffect(() => {
        if (!isInitialized) return;

        if (isLoggedIn && user) {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ isLoggedIn, user }));
        } else {
            localStorage.removeItem(AUTH_STORAGE_KEY);
        }
    }, [isLoggedIn, user, isInitialized]);

    // Open profile modal for first-time users after login
    useEffect(() => {
        if (isInitialized && isLoggedIn && !profile) {
            setIsProfileModalOpen(true);
        }
    }, [isInitialized, isLoggedIn, profile]);

    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        void password;
        await new Promise(resolve => setTimeout(resolve, 500));

        const userName = email.split("@")[0];
        const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);

        setUser({
            name: formattedName,
            email,
            role: "Freelancer",
            usage: {
                scansUsed: 8,
                scansTotal: 10,
                plan: "Freelancer Pro"
            }
        });
        setIsLoggedIn(true);
        setIsLoginModalOpen(false);
        return true;
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setIsLoggedIn(false);
        setProfile(null);
        localStorage.removeItem(PROFILE_STORAGE_KEY);
    }, []);

    const saveProfile = useCallback((newProfile: UserProfile) => {
        setProfile(newProfile);
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
        setIsProfileModalOpen(false);
    }, []);

    const updateProfile = useCallback((newProfile: UserProfile) => {
        setProfile(newProfile);
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
    }, []);

    const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
    const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);
    const openProfileModal = useCallback(() => setIsProfileModalOpen(true), []);
    const closeProfileModal = useCallback(() => setIsProfileModalOpen(false), []);

    const isProfileComplete = profile !== null;

    const value = useMemo(() => ({
        isLoggedIn,
        user,
        profile,
        isProfileComplete,
        login,
        logout,
        openLoginModal,
        closeLoginModal,
        isLoginModalOpen,
        openProfileModal,
        closeProfileModal,
        isProfileModalOpen,
        saveProfile,
        setUser,
        updateProfile
    }), [isLoggedIn, user, profile, isProfileComplete, login, logout, openLoginModal, closeLoginModal, isLoginModalOpen, openProfileModal, closeProfileModal, isProfileModalOpen, saveProfile, updateProfile]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
