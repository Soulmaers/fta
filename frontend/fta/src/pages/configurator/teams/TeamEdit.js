import React, { useMemo, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import TeamForm from "./TeamForm";
import { useTeams } from "../../../context/EntityContext";

export default function TeamEdit() {
    const nav = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const { update } = useTeams();
    const team = useMemo(() => location.state?.team ?? null, [location.state]);

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!team) nav("/app", { replace: true });
    }, [team, nav]);
    if (!team) return null;

    console.log(team)
    return (
        <TeamForm
            title="Редактировать"
            submitText={busy ? "..." : "Сохранить"}
            initial={team}
            busy={busy}
            error={error}
            onBack={() => {
                // идеальный back: вернуться на предыдущий экран
                if (window.history.length > 1) nav(-1);
                else nav("/app", { replace: true });
            }}
            onSubmit={async (data) => {
                try {
                    setError("");
                    setBusy(true);

                    let finalData = { ...data };

                    if (data.file) {
                        const { uploadFile } = await import("../../../api/http");
                        const uploadedUrl = await uploadFile(data.file);
                        finalData.logoUrl = uploadedUrl;
                        delete finalData.file;
                    } else if (data.logoUrl && data.logoUrl.startsWith("blob:")) {
                        finalData.logoUrl = "";
                    }

                    await update('teams', team.id, finalData);
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
