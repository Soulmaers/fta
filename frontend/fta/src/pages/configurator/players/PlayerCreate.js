import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthProvider";
import { useTeams } from "../../../context/EntityContext";
import PlayerForm from "./PlayerForm";

export default function PlayerCreate() {
    const nav = useNavigate();
    const { auth } = useAuth();
    const { create } = useTeams();
    const userId = auth?.id;

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    return (
        <PlayerForm
            title="Создать"
            submitText={busy ? "Создается..." : "Создать"}
            initial={{
                fullName: "",
                birthDate: "",
                weight: "",
                height: "",
                number: "",
                position: "",
                foot: "",
                photoUrl: ""
            }}
            busy={busy}
            error={error}
            onBack={() => nav(-1)}
            onSubmit={async (data) => {
                if (!userId) {
                    setError("Ошибка: нет ID пользователя. Перезайдите.");
                    return;
                }
                try {
                    setError("");
                    setBusy(true);

                    let finalData = { ...data };

                    // Если выбран файл, сначала загружаем его
                    if (data.file) {
                        const { uploadFile } = await import("../../../api/http");
                        const uploadedUrl = await uploadFile(data.file);
                        finalData.photoUrl = uploadedUrl;
                        delete finalData.file; // файл на бэк слать не надо в json
                    } else if (data.photoUrl && data.photoUrl.startsWith("blob:")) {
                        // Если blob есть, но файла нет (странно, но бывает), лучше очистить
                        finalData.photoUrl = "";
                    }

                    // Создаем игрока
                    await create("players", userId, finalData);
                    nav("/config");
                } catch (e) {
                    setError(e?.message || "Ошибка при создании игрока");
                } finally {
                    setBusy(false);
                }
            }}
        />
    );
}
