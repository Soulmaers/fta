import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTeams } from "../../../context/EntityContext";
import LineupForm from "./LineupForm";

export default function LineupEdit() {
    const nav = useNavigate();
    const location = useLocation();
    const { update } = useTeams();

    const lineup = useMemo(() => location.state?.lineup ?? null, [location.state]);

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        console.log(lineup)
        if (!lineup) nav("/config", { replace: true });
    }, [lineup, nav]);

    if (!lineup) return null;

    return (
        <LineupForm
            title="Редактировать"
            submitText={busy ? "..." : "Сохранить"}
            initial={lineup}
            busy={busy}
            error={error}
            onBack={() => (window.history.length > 1 ? nav(-1) : nav("/config", { replace: true }))}
            onSubmit={async ({ lineupName }) => {
                try {
                    console.log(lineupName)
                    setError("");
                    setBusy(true);
                    await update("lineups", lineup.id, { lineupName });
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
