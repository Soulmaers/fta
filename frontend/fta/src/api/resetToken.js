const KEY = "reset_token";

export function setResetToken(token) {
    sessionStorage.setItem(KEY, token);
}

export function getResetToken() {
    return sessionStorage.getItem(KEY);
}

export function clearResetToken() {
    sessionStorage.removeItem(KEY);
}
