import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PersonalForm from "./PersonalForm";
import { useTeams } from "../../../context/EntityContext";

export default function PersonalEdit() {
    const nav = useNavigate();
    const location = useLocation();
    const { update } = useTeams();

    const coach = useMemo(() => location.state?.coach ?? null, [location.state]);

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!coach) nav("/config", { replace: true });
    }, [coach, nav]);

    if (!coach) return null;

    return (
        <PersonalForm
            title="Редактировать"
            submitText={busy ? "..." : "Сохранить"}
            initial={coach}
            busy={busy}
            error={error}
            onBack={() => (window.history.length > 1 ? nav(-1) : nav("/config", { replace: true }))}
            onSubmit={async (data) => {
                try {
                    setError("");
                    setBusy(true);

                    let finalData = { ...data };

                    if (data.file) {
                        const { uploadFile } = await import("../../../api/http");
                        const uploadedUrl = await uploadFile(data.file);
                        finalData.photoUrl = uploadedUrl;
                        delete finalData.file;
                    } else if (data.photoUrl && data.photoUrl.startsWith("blob:")) {
                        finalData.photoUrl = "";
                    }

                    await update("coaches", coach.id, finalData);
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
