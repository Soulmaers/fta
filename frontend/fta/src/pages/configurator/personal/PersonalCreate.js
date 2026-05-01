import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthProvider";
import { useTeams } from "../../../context/EntityContext";
import PersonalForm from "./PersonalForm";

export default function PersonalCreate() {
    const nav = useNavigate();
    const { auth } = useAuth();
    const { create } = useTeams();
    const userId = auth?.id;

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    return (
        <PersonalForm
            title="Создать"
            submitText={busy ? "..." : "Создать"}
            initial={{ fullName: "", profession: "", birthDate: "", photoUrl: "" }}
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
                        finalData.photoUrl = uploadedUrl;
                        delete finalData.file;
                    } else if (data.photoUrl && data.photoUrl.startsWith("blob:")) {
                        finalData.photoUrl = "";
                    }

                    await create("coaches", userId, finalData);
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
