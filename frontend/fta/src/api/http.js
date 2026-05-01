const API_BASE = process.env.REACT_APP_API_BASE_URL || "";

async function parseJsonSafe(res) {
    const text = await res.text();
    try {
        return text ? JSON.parse(text) : null;
    } catch {
        return text || null;
    }
}

let refreshPromise = null;

export async function apiFetch(path, { method = "GET", body, token, _isRefresh = false } = {}) {
    const headers = {
        "Content-Type": "application/json",
    };

    if (token) headers.Authorization = `Bearer ${token}`;

    console.log(body)
    const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
    const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include'
    });

    const data = await parseJsonSafe(res);

    if (!res.ok) {
        // Если 401 и это НЕ сам запрос на обновление
        if (res.status === 401 && !_isRefresh) {
            try {
                const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
                    method: 'POST',
                    credentials: 'include'
                });
                if (refreshRes.ok) {
                    const newData = await refreshRes.json();
                    window.dispatchEvent(new CustomEvent('auth-refreshed', { detail: newData }));
                    return apiFetch(path, { method, body, token: newData.accessToken });
                }
            } catch (e) {
                console.error("Refresh failed", e);
            }

            // Сразу сообщаем приложению о разлогине (если рефреш не удался)
            window.dispatchEvent(new CustomEvent('auth-expired'));
        }

        const message =
            (data && (data.message || data.error || data.detail)) ||
            `HTTP ${res.status}`;
        const err = new Error(message);
        err.status = res.status;
        err.data = data;
        throw err;
    }
    return data;
}

export async function uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/files/upload`, {
        method: "POST",
        body: formData,
        // Content-Type: multipart/form-data ставится браузером автоматически (boundary)
    });

    if (!res.ok) {
        throw new Error("Ошибка загрузки файла");
    }

    const json = await res.json();
    return json.url; // вернет строку вида "/uploads/uuid.jpg"
}
