import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { refreshToken } from "../api/auth";
import { apiFetch } from "../api/http";

const AuthContext = createContext(null);

const STORAGE_KEY = "fta_user_profile";
const IMPERSONATOR_KEY = "fta_impersonator_profile";

export function AuthProvider({ children }) {
    const [auth, setAuth] = useState(null);
    const [impersonator, setImpersonator] = useState(() => {
        const saved = localStorage.getItem(IMPERSONATOR_KEY);
        return saved ? JSON.parse(saved) : null;
    });
    const [isLoading, setIsLoading] = useState(true);

    const saveAuth = (data) => {
        setAuth(data);
        const { accessToken, ...profile } = data;
        if (profile.id) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        }
    };

    const impersonate = (targetUser) => {
        // Сохраняем ТЕКУЩЕГО юзера (тебя) как того, кто вселился
        if (!impersonator) {
            const currentProfile = JSON.parse(localStorage.getItem(STORAGE_KEY));
            localStorage.setItem(IMPERSONATOR_KEY, JSON.stringify(currentProfile));
            setImpersonator(currentProfile);
        }
        saveAuth(targetUser);
    };

    const stopImpersonating = (originalDevAuth) => {
        localStorage.removeItem(IMPERSONATOR_KEY);
        setImpersonator(null);
        saveAuth(originalDevAuth);
    };

    const clearAuth = () => {
        setAuth(null);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(IMPERSONATOR_KEY);
        setImpersonator(null);
    };

    const logout = async () => {
        try {
            await apiFetch("/api/auth/logout", { method: "POST" });
        } catch (e) {
            console.warn("Logout failed", e);
        } finally {
            clearAuth();
        }
    };

    // при старте приложения — пробуем восстановить сессию по Refresh Cookie
    useEffect(() => {
        const recover = async () => {
            try {
                const localProfile = localStorage.getItem(STORAGE_KEY);
                if (localProfile) setAuth(JSON.parse(localProfile));

                const data = await refreshToken();
                if (data) {
                    saveAuth(data);
                } else {
                    clearAuth();
                }
            } catch (e) {
                console.warn("Session expired or no refresh cookie found");
                clearAuth();
            } finally {
                setIsLoading(false);
            }
        };
        recover();
    }, []);

    // Слушаем события от http.js для авто-обновления состояния
    useEffect(() => {
        const onRefreshed = (e) => saveAuth(e.detail);
        const onExpired = () => clearAuth();

        window.addEventListener('auth-refreshed', onRefreshed);
        window.addEventListener('auth-expired', onExpired);

        return () => {
            window.removeEventListener('auth-refreshed', onRefreshed);
            window.removeEventListener('auth-expired', onExpired);
        };
    }, []);

    const value = useMemo(() => {
        return {
            auth,
            impersonator,
            isImpersonating: !!impersonator,
            isAuthed: !!auth?.accessToken, // Валидная сессия только с токеном
            isLoading,
            saveAuth,
            impersonate,
            stopImpersonating,
            clearAuth,
            logout
        };
    }, [auth, isLoading, impersonator]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
}
