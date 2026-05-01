import React, { useState } from "react";
import styles from "./LoginCard.module.css";
import { sing } from '../../api/auth'
import { apiGet } from "../../api/entity";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { useTeams } from "../../context/EntityContext";

export default function LoginCard({ onSubmit, onForgot, onRegister }) {
    const nav = useNavigate()
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(true);
    const [error, setError] = useState("");
    const { saveAuth } = useAuth();
    const { clearData } = useTeams();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!login || !password) {
            setError("Заполните все поля");
            return;
        }

        try {
            const user = await sing({ login: login, password: password, remember: remember });
            console.log("LOGIN RESPONSE USER:", user); // ОТЛАДКА
            clearData(); // Сбрасываем кэш предыдущего юзера!
            saveAuth(user);

            if (user.role === 'DEVELOPER') {
                nav("/dev/impersonate");
            } else if (user.role === 'MANAGER') {
                // Check if manager has any teams
                try {
                    const teams = await apiGet("teams", user.id);
                    if (teams && teams.length > 0) {
                        nav("/app");
                    } else {
                        nav("/config");
                    }
                } catch (err) {
                    // If team check fails, fallback to config for manager
                    nav("/config");
                }
            } else {
                nav("/app");
            }
        } catch (error) {
            setError(error.message || "Ошибка запроса");
        }
    };

    return (
        <div className={styles.screen}>
            <div className={styles.title}>Football Teams App</div>

            <form className={styles.card} onSubmit={handleSubmit}>
                <input
                    className={styles.input}
                    placeholder="Логин"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                />

                <div className={styles.passwordWrapper}>
                    <input
                        className={`${styles.input} ${styles.inputPassword}`}
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type={showPassword ? "text" : "password"}
                    />
                    <button
                        type="button"
                        className={styles.eyeBtn}
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                    >
                        {showPassword ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        )}
                    </button>
                </div>

                <label className={styles.remember}>
                    <input
                        className={styles.checkbox}
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                    />
                    <span className={styles.checkUi} aria-hidden="true" />
                    <span className={styles.rememberText}>Запомнить меня</span>
                </label>

                {error ? <div className={styles.error}>{error}</div> : null}

                <button className={styles.loginBtn} type="submit">
                    Войти
                </button>
            </form>

            <div className={styles.links}>
                <button className={styles.linkBtn} type="button" onClick={onForgot}>
                    Забыли пароль?
                </button>
                <button className={styles.linkBtn} type="button" onClick={onRegister}>
                    Регистрация
                </button>
            </div>
        </div>
    );
}
