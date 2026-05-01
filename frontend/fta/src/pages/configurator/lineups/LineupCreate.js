import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthProvider";
import { useTeams } from "../../../context/EntityContext";
import LineupForm from "./LineupForm";

export default function LineupCreate() {
    const nav = useNavigate();
    const { auth } = useAuth();
    const { create, data } = useTeams();
    const userId = auth?.id;

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    return (
        <LineupForm
            title="Создать"
            submitText={busy ? "..." : "Создать"}
            initial={{ lineupName: "" }}
            busy={busy}
            error={error}
            onBack={() => nav(-1)}
            onSubmit={async ({ lineupName }) => {
                try {
                    setError("");
                    if (data.lineups?.length >= 2) {
                        setError("Лимит составов (2) уже достигнут");
                        return;
                    }
                    setBusy(true);
                    await create("lineups", userId, { lineupName });
                    nav("/config");
                } catch (e) {
                    setError(e?.message || "Ошибка запроса");
                } finally {
                    setBusy(false);
                }
            }}
        />
    );
}
