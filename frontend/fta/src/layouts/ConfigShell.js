import React from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import styles from "./ConfigShell.module.css";
import ImpersonationPanel from "../components/dev/ImpersonationPanel";
import { impersonateUser } from "../api/auth";

export default function ConfigShell() {
    const { auth, isAuthed, isLoading, isImpersonating, stopImpersonating, impersonator } = useAuth();

    const nav = useNavigate();

    if (isLoading) return null;
    if (!isAuthed) return <Navigate to="/auth/login" replace />;

    const handleReturn = async () => {
        try {
            const originalUser = await impersonateUser(impersonator.id);
            stopImpersonating(originalUser);
            nav("/dev/impersonate"); // Быстрый переход без перезагрузки всей страницы
        } catch (e) {
            alert("Ошибка возврата в аккаунт разработчика");
        }
    }

    return (
        <div className={styles.page}>
            {isImpersonating && (
                <div style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    padding: '8px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    position: 'sticky',
                    top: 0,
                    zIndex: 2000
                }}>
                    РЕЖИМ ОТЛАДКИ ({auth?.login}) 
                    <button 
                        onClick={handleReturn}
                        style={{
                            marginLeft: '15px',
                            backgroundColor: 'white',
                            color: '#dc3545',
                            border: 'none',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        ВЕРНУТЬСЯ
                    </button>
                </div>
            )}
            <main className={styles.main}>
                <div className={styles.container}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
