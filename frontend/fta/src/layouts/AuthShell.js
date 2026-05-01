import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import styles from "./AuthShell.module.css";

export default function AuthShell() {
    const { auth, isAuthed, isLoading } = useAuth();

    if (isLoading) return null;
    if (isAuthed) {
        if (auth?.role === 'MANAGER') return <Navigate to="/config" replace />;
        return <Navigate to="/app" replace />;
    }

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <div className={styles.container}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
