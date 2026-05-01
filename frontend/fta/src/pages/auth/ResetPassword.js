import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ResetPassword.module.css";
import { requestResetByLogin } from "../../api/auth";
import { setResetToken } from "../../api/resetToken";

export default function ResetPassword() {
    const nav = useNavigate();
    const [login, setLogin] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const submit = async (e) => {
        e.preventDefault();
        setError("");

        if (!login.trim()) {
            setError("Введите логин");
            return;
        }

        try {
            setLoading(true);

            const token = await requestResetByLogin(login.trim());


            if (token) {
                setResetToken(token);
                nav("/auth/change-password");
                return;
            }

            // если бэк токен НЕ возвращает (например, отправляет на почту/смс)
            // то всё равно переходим, но токен нужно будет вводить отдельным шагом
            // пока сделаем так: перейдём и используем токен из sessionStorage (если его нет — покажем ошибку на след. экране)
            nav("/auth/change-password");
        } catch (err) {
            setError(err.message || "Ошибка запроса");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.screen}>
            <button className={styles.back} type="button" onClick={() => nav(-1)}>
                <span className={styles.backArrow}>←</span>
                <span className={styles.backText}>Назад</span>
            </button>

            <div className={styles.title}>Забыли пароль?</div>

            <form className={styles.card} onSubmit={submit}>
                <input
                    className={styles.input}
                    placeholder="Логин"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                />

                {error ? <div className={styles.error}>{error}</div> : null}

                <button className={styles.btn} type="submit" disabled={loading}>
                    {loading ? "Отправка..." : "Сбросить пароль"}
                </button>
            </form>

            <div className={styles.bottomSpacer} />
        </div>
    );
}
