import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Register.module.css";
import { useAuth } from "../../context/AuthProvider";
import { useTeams } from "../../context/EntityContext";
import { register } from "../../api/auth";


export default function Register() {
    const nav = useNavigate();
    const { saveAuth } = useAuth();
    const { clearData } = useTeams();
    const [login, setLogin] = useState("");
    const [pass1, setPass1] = useState("");
    const [pass2, setPass2] = useState("");
    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [error, setError] = useState("");


    const submit = async (e) => {
        e.preventDefault();
        setError("");

        if (!login || !pass1 || !pass2) {
            setError("Заполните все поля");
            return;
        }
        if (pass1 !== pass2) {
            setError("Пароли не совпадают");
            return;
        }


        try {

            const result = await register({ login: login, password: pass1, confirmPassword: pass2 });
            console.log(result)
            clearData(); // Обязательно сбрасываем кэш старого юзера при новой регистрации!
            saveAuth(result)
            result.role === 'MANAGER' ? nav("/config") : nav("/app");


        } catch (err) {
            setError(err.message || "Ошибка запроса");
        } finally {

        }
    };

    return (
        <div className={styles.screen}>
            <button className={styles.back} type="button" onClick={() => nav(-1)}>
                <span className={styles.backArrow}>←</span>
                <span className={styles.backText}>Назад</span>
            </button>
            <div className={styles.title}>Регистрация</div>

            <form className={styles.card} onSubmit={submit}>
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
                        value={pass1}
                        onChange={(e) => setPass1(e.target.value)}
                        type={showPassword1 ? "text" : "password"}
                    />
                    <button
                        type="button"
                        className={styles.eyeBtn}
                        onClick={() => setShowPassword1(!showPassword1)}
                        aria-label={showPassword1 ? "Скрыть пароль" : "Показать пароль"}
                    >
                        {showPassword1 ? (
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

                <div className={styles.passwordWrapper}>
                    <input
                        className={`${styles.input} ${styles.inputPassword}`}
                        placeholder="Повторите пароль"
                        value={pass2}
                        onChange={(e) => setPass2(e.target.value)}
                        type={showPassword2 ? "text" : "password"}
                    />
                    <button
                        type="button"
                        className={styles.eyeBtn}
                        onClick={() => setShowPassword2(!showPassword2)}
                        aria-label={showPassword2 ? "Скрыть пароль" : "Показать пароль"}
                    >
                        {showPassword2 ? (
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
                {error ? <div className={styles.error}>{error}</div> : null}
                <button className={styles.btn} type="submit">
                    Зарегистрироваться
                </button>
            </form>

            <div className={styles.bottomSpacer} />
        </div>
    );
}
