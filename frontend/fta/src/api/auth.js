import { apiFetch } from "./http";

/**
 * 1) Запрос токена/кода на сброс по логину
 * Ожидаемый ответ (пример):
 * { token: "...." } ИЛИ { resetToken: "...." } ИЛИ { message: "sent" }
 */
export async function requestResetByLogin(login) {
    return apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: { login },
    });
}

/**
 * 2) Смена пароля по токену
 * Ожидаемый ответ (пример):
 * { success: true } или { message: "ok" }
 */
export async function changePassword({ token, password, confirmPassword }) {
    return apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: { token, password, confirmPassword },
    });
}

export async function register(data) {
    console.log(data)
    return apiFetch("/api/auth/register", {
        method: "POST",
        body: data,
    });
}

export async function sing(data) {
    return apiFetch("/api/auth/sing-in", {
        method: "POST",
        body: data,
    });
}

export async function refreshToken() {
    return apiFetch("/api/auth/refresh", {
        method: "POST",
        _isRefresh: true
    });
}

export async function getUsers() {
    return apiFetch("/api/auth/users", { method: "GET" });
}

export async function impersonateUser(userId) {
    return apiFetch(`/api/auth/impersonate/${userId}`, { method: "POST" });
}
