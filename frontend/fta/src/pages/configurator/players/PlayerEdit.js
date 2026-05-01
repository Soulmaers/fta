import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PlayerForm from "./PlayerForm";
import { useTeams } from "../../../context/EntityContext";
import { useAuth } from "../../../context/AuthProvider";

export default function PlayerEdit() {
    const nav = useNavigate();
    const location = useLocation();
    const { update } = useTeams();
    const { auth } = useAuth(); // We might need auth info if update requires userId

    const player = useMemo(() => location.state?.player ?? null, [location.state]);

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!player) nav("/config", { replace: true });
    }, [player, nav]);

    if (!player) return null;

    return (
        <PlayerForm
            title="Редактировать"
            submitText={busy ? "Сохранить..." : "Сохранить"}
            initial={player}
            busy={busy}
            error={error}
            onBack={() => (window.history.length > 1 ? nav(-1) : nav("/config", { replace: true }))}
            onSubmit={async (data) => {
                try {
                    setError("");
                    setBusy(true);

                    let finalData = { ...data };

                    // Если был выбран новый файл
                    if (data.file) {
                        const { uploadFile } = await import("../../../api/http");
                        const uploadedUrl = await uploadFile(data.file);
                        finalData.photoUrl = uploadedUrl;
                        delete finalData.file;
                    } else if (data.photoUrl && data.photoUrl.startsWith("blob:")) {
                        // Если есть blob-ссылка, но нет файла — очищаем, чтобы не слать мусор
                        finalData.photoUrl = "";
                    }

                    // Обновляем игрока
                    // Не забываем передать userId, если update его требует (в текущем контексте update(entity, id, payload, userId?))
                    // Но по коду EntityContext update(entity, id, data) -> apiPut(entity, id, data)
                    // Сервер возьмет менеджера из базы или текущего контекста?
                    // apiPut шлет PUT /api/players/{id}. Контроллер просто обновляет поля.

                    await update("players", player.id, finalData);
                    nav(-1);
                } catch (e) {
                    setError(e?.message || "Ошибка сохранения");
                } finally {
                    setBusy(false);
                }
            }}
        />
    );
}
