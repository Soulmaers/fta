import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthProvider";
import { useTeams } from "../../../context/EntityContext";
import TeamForm from "./TeamForm";

export default function TeamCreate() {
    const nav = useNavigate();
    const { auth } = useAuth();
    const { create } = useTeams();
    const userId = auth?.id;

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    console.log(userId)
    return (
        <TeamForm
            title="Создать"
            submitText={busy ? "..." : "Создать"}
            initial={{ nameTeam: "", foundedYear: "", logoUrl: "" }}
            busy={busy}
            error={error}
            onBack={() => nav(-1)}
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

                    await create('teams', userId, finalData);
                    nav("/config"); // или nav(-1)
                } catch (e) {
                    setError(e?.message || "Ошибка запроса");
                } finally {
                    setBusy(false);
                }
            }}
        />
    );
}
