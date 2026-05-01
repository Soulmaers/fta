import React, { useEffect, useMemo, useState } from "react";
import styles from "./TeamsList.module.css";
import { FaTrash } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { FaPeopleRoof } from "react-icons/fa6";
import { useTeams } from "../../../context/EntityContext";
import { useAuth } from "../../../context/AuthProvider";
export default function TeamsList() {
    const nav = useNavigate();

    const { data, del } = useTeams();
    const [busyId, setBusyId] = useState(null);
    const { auth } = useAuth();        // где ты хранишь auth
    const userId = auth?.id;

    const handleOpen = (team) => {
        nav(`/config/teams/edit`, { state: { team } });
    };

    const handleDelete = async (teamId) => {
        const ok = window.confirm("Удалить команду?");
        if (!ok) return;

        try {
            setBusyId(teamId);
            await del('teams', teamId, userId); // если бэк готов
        } finally {
            setBusyId(null);
        }
    };


    return (
        <div className={`${styles.screen} page-enter`}>
            {/* Header */}
            <header className={styles.header}>
                <button className={styles.back} type="button" onClick={() => nav("/config")}>
                    <span className={styles.backArrow} aria-hidden="true">‹</span>
                    <span className={styles.backText}>Назад</span>
                </button>
                <div className={styles.sectionTitle}>Команды</div>
            </header>

            <main className={styles.content}>
                <div className={styles.list}>
                    {data.teams.map((t) => (
                        <section key={t.id} className={styles.card}>
                            {/* ЛЕВАЯ ЧАСТЬ: ЛОГО */}
                            <div className={styles.left}>
                                <div className={styles.logo}>
                                    {t.logoUrl ? (
                                        <img className={styles.logoImg} src={t.logoUrl} alt="" />
                                    ) : (
                                        <div className={styles.logoFallback}> <FaPeopleRoof className={styles.emblemIcon} /></div>
                                    )}
                                </div>
                            </div>

                            {/* ПРАВАЯ ЧАСТЬ */}
                            <div className={styles.right}>
                                {/* ВЕРХ: НАЗВАНИЕ + СТРЕЛКА */}
                                <button
                                    className={styles.topRow}
                                    type="button"
                                    onClick={() => handleOpen(t)}
                                    aria-label="Открыть команду"
                                >
                                    <div className={styles.name}>{t.nameTeam}</div>
                                    <div className={styles.chev} aria-hidden="true">›</div>
                                </button>

                                {/* НИЗ: ГОД + УДАЛИТЬ */}
                                <div className={styles.bottomRow}>
                                    <div className={styles.year}>{t.foundedYear}</div>

                                    <button
                                        className={`${styles.deleteBtn} ${busyId === t.id ? styles.deleteBtnBusy : ""}`}
                                        type="button"
                                        onClick={() => handleDelete(t.id)}
                                        disabled={busyId === t.id}
                                    >
                                        <FaTrash className={styles.trashIcon} />
                                        <span>{busyId === t.id ? "..." : "Удалить"}</span>
                                    </button>
                                </div>
                            </div>
                        </section>
                    ))}
                </div>

                {data.teams.length === 0 ? <div className={styles.empty}>Команд пока нет</div> : null}
            </main>
        </div>
    );
}
