import React, { useEffect, useState } from "react";
import styles from "./ConfigHome.module.css";
import { FaPeopleGroup, FaTeamspeak } from "react-icons/fa6";
import { IoPeopleSharp } from "react-icons/io5";
import { FaPeopleRoof } from "react-icons/fa6";
import { FaArrowsDownToPeople } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { useTeams } from "../../context/EntityContext";

export default function ConfigHome({
    onBack,
    onNext,
    counts = { teams: 0, players: 0, specialists: 0, lineups: 0 }
}) {

    const nav = useNavigate()

    const { auth, logout, isImpersonating } = useAuth();
    const { data, load, create } = useTeams();
    const [isLoad, setIsLoad] = useState(false)

    useEffect(() => {
        if (!auth?.id) return;

        (async () => {
            try {
                setIsLoad(false);

                await Promise.all([
                    load("teams", auth.id, true),
                    load("players", auth.id, true),
                    load("coaches", auth.id, true),
                    load("lineups", auth.id, true),
                ]);
                setIsLoad(true);
            } catch (error) {
                console.error('Ошибка загрузки команд:', error);
            }
        })(); // ← вызов через ()
    }, [auth?.id]);

    const onOpenTeams = () => {
        if (data.teams.length === 0) return;
        nav("/config/teams/list");
    };

    const onOpenCoaches = () => {
        if (data.coaches.length === 0) return;
        nav("/config/personal/list");
    };

    const onOpenPlayers = () => {
        if (data.players.length === 0) return;
        nav("/config/players/list");
    };

    const onOpenLineups = () => {
        if (data.lineups.length === 0) return;
        nav("/config/lineups/list");
    };

    const handleBack = async () => {
        // Творец всегда возвращается в свою консоль
        if (auth?.role === 'DEVELOPER' && !isImpersonating) {
            nav("/dev/impersonate");
            return;
        }

        // Если команд нет — выходим (т.к. смотреть в приложении нечего)
        if (data.teams.length === 0) {
            await logout();
            nav("/auth/login");
        } else {
            // Если команды есть — идем в главное приложение
            nav("/app");
        }
    };

    if (!isLoad) {
        return (
            <div className={styles.screen}>
                <div className={styles.loaderContainer}>
                    <div className={styles.spinner}></div>
                    <div>Загрузка...</div>
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.screen} page-enter`}>
            {/* Header */}
            <header className={styles.header}>
                <button className={styles.back} type="button" onClick={handleBack}>
                    <span className={styles.backArrow} aria-hidden="true">‹</span>
                    <span className={styles.backText}>Назад</span>
                </button>

                <div className={styles.title}>Конфигуратор</div>

                <div className={styles.headerSpacer} />
            </header>

            {/* Content */}
            <main className={styles.content}>
                {/* Card 1 */}
                <section className={styles.card} role="button" tabIndex={0}>
                    <div className={styles.cardHead}>
                        <div className={styles.iconBox} aria-hidden="true"><FaPeopleRoof className={styles.icon_react} /></div>
                        <div
                            className={styles.entityBtn}
                            onClick={onOpenTeams}
                            disabled={data.teams.length === 0}
                        >
                            <div className={styles.cardTitle}>Команды ({data.teams.length})</div>
                            {data.teams.length > 0 && <div className={styles.chev} aria-hidden="true">›</div>}
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button className={styles.actionBtn} type="button" onClick={() => nav("/config/teams/create")}>
                            Создать команду
                        </button>
                    </div>
                </section>

                {/* Card 2 */}
                <section className={styles.card} role="button" tabIndex={0}>
                    <div className={styles.cardHead}>
                        <div className={styles.iconBox} aria-hidden="true"><FaPeopleGroup className={styles.icon_react} /></div>
                        <div
                            className={styles.entityBtn}
                            onClick={onOpenPlayers}
                            disabled={data.players.length === 0}
                        >
                            <div className={styles.cardTitle}>Игроки ({data.players.length})</div>
                            {data.players.length > 0 && <div className={styles.chev} aria-hidden="true">›</div>}
                        </div></div>

                    <div className={styles.actions}>
                        <button className={styles.actionBtn} type="button" onClick={() => nav("/config/players/create")}>
                            Создать игрока
                        </button>
                        <button className={styles.actionBtn} type="button" onClick={() => nav("/config/players/import")}>
                            Загрузить список игроков
                        </button>
                    </div>
                </section>

                {/* Card 3 */}
                <section className={styles.card} role="button" tabIndex={0}>
                    <div className={styles.cardHead}>
                        <div className={styles.iconBox} aria-hidden="true"><IoPeopleSharp className={styles.icon_react} /></div>
                        <div
                            className={styles.entityBtn}
                            onClick={onOpenCoaches}
                            disabled={data.coaches.length === 0}
                        >
                            <div className={styles.cardTitle}>Специалисты ({data.coaches.length})</div>
                            {data.coaches.length > 0 && <div className={styles.chev} aria-hidden="true">›</div>}
                        </div></div>

                    <div className={styles.actionsAlt}>
                        <button className={styles.actionBtn} type="button" onClick={() => nav("/config/personal/create")}>
                            Создать специалиста
                        </button>
                    </div>
                </section>
                <section className={styles.card} role="button" tabIndex={0}>
                    <div className={styles.cardHead}>
                        <div className={styles.iconBox} aria-hidden="true"><FaArrowsDownToPeople className={styles.icon_react} /></div>
                        <div
                            className={styles.entityBtn}
                            onClick={onOpenLineups}
                            disabled={data.lineups.length === 0}
                        >
                            <div className={styles.cardTitle}>Составы ({data.lineups.length})</div>
                            {data.lineups.length > 0 && <div className={styles.chev} aria-hidden="true">›</div>}
                        </div></div>

                    <div className={styles.actions}>
                        <button
                            className={`${styles.actionBtn} ${data.lineups.length >= 2 ? styles.actionBtnDisabled : ""}`}
                            type="button"
                            onClick={() => nav("/config/lineups/create")}
                            disabled={data.lineups.length >= 2}
                        >
                            {data.lineups.length >= 2 ? "Лимит составов достигнут" : "Создать состав"}
                        </button>
                    </div>
                </section>
            </main>

            {/* Bottom button */}
            <footer className={styles.footer}>
                <button className={styles.nextBtn} type="button" onClick={() => nav("/config/select-teams")}>
                    Далее
                </button>
            </footer>
        </div >
    );
}
