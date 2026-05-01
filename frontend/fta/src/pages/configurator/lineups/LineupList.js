import React, { useState } from "react";
import styles from "./LineupList.module.css";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { FaLayerGroup } from "react-icons/fa6"; // если нет — возьми другую
import { useTeams } from "../../../context/EntityContext";
import { useAuth } from "../../../context/AuthProvider";

export default function LineupsList() {
    const nav = useNavigate();
    const { auth } = useAuth();
    const userId = auth?.id;

    const { data, del } = useTeams(); // предполагаю data.lineups есть
    const [busyId, setBusyId] = useState(null);


    const handleOpen = (lineup) => {
        console.log(lineup)
        nav("/config/lineups/edit", { state: { lineup } });
    };

    const handleDelete = async (id) => {
        const ok = window.confirm("Удалить состав?");
        if (!ok) return;

        try {
            setBusyId(id);
            await del("lineups", id, userId);
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className={`${styles.screen} page-enter`}>
            <header className={styles.header}>
                <button className={styles.back} type="button" onClick={() => nav("/config")}>
                    <span className={styles.backArrow} aria-hidden="true">‹</span>
                    <span className={styles.backText}>Назад</span>
                </button>
                <div className={styles.title}>Составы</div>
                <div className={styles.headerSpacer} />
            </header>

            <main className={styles.content}>

                <div className={styles.list}>
                    {(data.lineups ?? []).map((l) => (
                        <section key={l.id} className={styles.card}>
                            <div className={styles.row}>
                                {/* LEFT: delete */}
                                <button
                                    className={`${styles.deleteBtn} ${busyId === l.id ? styles.deleteBtnBusy : ""}`}
                                    type="button"
                                    onClick={() => handleDelete(l.id)}
                                    disabled={busyId === l.id}
                                >
                                    <FaTrash className={styles.trashIcon} />
                                    <span>{busyId === l.id ? "..." : "Удалить"}</span>
                                </button>

                                {/* MIDDLE+RIGHT: name + arrow */}
                                <button
                                    className={styles.mainBtn}
                                    type="button"
                                    onClick={() => handleOpen(l)}
                                >
                                    <span className={styles.name}>{l.lineupName}</span>
                                    <span className={styles.chev} aria-hidden="true">›</span>
                                </button>
                            </div>
                        </section>
                    ))}
                </div>

                {(data.lineups?.length ?? 0) === 0 ? (
                    <div className={styles.empty}>Составов пока нет</div>
                ) : null}
            </main>
        </div>
    );
}
