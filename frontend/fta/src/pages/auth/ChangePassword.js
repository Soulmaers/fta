import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ChangePassword.module.css";
import { changePassword } from "../../api/auth";
import { getResetToken, clearResetToken } from "../../api/resetToken";

export default function ChangePassword() {
    const nav = useNavigate();
    const [p1, setP1] = useState("");
    const [p2, setP2] = useState("");
    const [show1, setShow1] = useState(false);
    const [show2, setShow2] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const submit = async (e) => {
        e.preventDefault();
        setError("");

        if (!p1 || !p2) {
            setError("Заполните оба поля");
            return;
        }
        if (p1 !== p2) {
            setError("Пароли не совпадают");
            return;
        }

        const token = getResetToken();
        console.log(token)
        if (!token) {
            setError("Нет токена сброса. Повторите сброс пароля.");
            return;
        }

        try {
            setLoading(true);
            await changePassword({ token, password: p1, confirmPassword: p2 });
            clearResetToken();
            nav("/auth/login");
        } catch (err) {
            setError(err.message || "Ошибка запроса");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className={styles.screen}>
            <div className={styles.title}>Смена пароля</div>

            <form className={styles.card} onSubmit={submit}>
                <div className={styles.passwordWrapper}>
                    <input
                        className={`${styles.input} ${styles.inputPassword}`}
                        placeholder="Введите новый пароль"
                        value={p1}
                        onChange={(e) => setP1(e.target.value)}
                        type={show1 ? "text" : "password"}
                    />
                    <button
                        type="button"
                        className={styles.eyeBtn}
                        onClick={() => setShow1(!show1)}
                        aria-label={show1 ? "Скрыть пароль" : "Показать пароль"}
                    >
                        {show1 ? (
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
                        placeholder="Повторите новый пароль"
                        value={p2}
                        onChange={(e) => setP2(e.target.value)}
                        type={show2 ? "text" : "password"}
                    />
                    <button
                        type="button"
                        className={styles.eyeBtn}
                        onClick={() => setShow2(!show2)}
                        aria-label={show2 ? "Скрыть пароль" : "Показать пароль"}
                    >
                        {show2 ? (
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

                <button className={styles.btn} type="submit" disabled={loading}>
                    {loading ? "Смена..." : "Сменить пароль"}
                </button>
            </form>

            <button className={styles.exit} type="button" onClick={() => nav("/auth/login")}>
                Выйти
            </button>
        </div>
    );
}
