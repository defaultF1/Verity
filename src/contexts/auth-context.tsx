"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";

interface User {
    name: string;
    email: string;
    role: string;
}

interface AuthContextType {
    isLoggedIn: boolean;
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    openLoginModal: () => void;
    closeLoginModal: () => void;
    isLoginModalOpen: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "verity_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load auth state from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed.user && parsed.isLoggedIn) {
                    setUser(parsed.user);
                    setIsLoggedIn(true);
                }
            } catch {
                localStorage.removeItem(AUTH_STORAGE_KEY);
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

    const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
        // Simulated auth for hackathon demo
        // In production, this would call an API
        await new Promise(resolve => setTimeout(resolve, 500));

        const userName = email.split("@")[0];
        const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);

        setUser({
            name: formattedName,
            email,
            role: "Executive"
        });
        setIsLoggedIn(true);
        setIsLoginModalOpen(false);
        return true;
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setIsLoggedIn(false);
    }, []);

    const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
    const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

    const value = useMemo(() => ({
        isLoggedIn,
        user,
        login,
        logout,
        openLoginModal,
        closeLoginModal,
        isLoginModalOpen
    }), [isLoggedIn, user, login, logout, openLoginModal, closeLoginModal, isLoginModalOpen]);

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
