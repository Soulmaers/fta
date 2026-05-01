import React from "react";
import styles from "./TeamSelect.module.css";
import { useNavigate } from "react-router-dom";
import { useTeams } from "../../context/EntityContext";
import { useAuth } from "../../context/AuthProvider";
import { FaCheck } from "react-icons/fa";
import { FaUserTie, FaUsers, FaPeopleRoof } from "react-icons/fa6";

export default function TeamSelect() {
    const nav = useNavigate();
    const { auth } = useAuth();
    const { data, load } = useTeams();

    React.useEffect(() => {
        if (auth?.id) {
            load('teams', auth.id);
            load('players', auth.id);
            load('coaches', auth.id);
        }
    }, [auth?.id, load]);

    const teams = data.teams || [];
    const players = data.players || [];
    const coaches = data.coaches || [];

    const handleSave = () => {
        if (teams.length > 0) {
            nav("/app");
        } else {
            nav("/config");
        }
    };

    return (
        <div className={`${styles.screen} page-enter`}>
            {/* Header */}
            <header className={styles.header}>
                <button className={styles.back} type="button" onClick={() => nav(-1)}>
                    <span className={styles.backArrow}>‹</span>
                    <span className={styles.backText}>Назад</span>
                </button>
                <div className={styles.title}>Выберите команду</div>
                <div className={styles.headerSpacer} />
            </header>

            {/* Content */}
            <main className={styles.content}>
                {teams.length === 0 ? (
                    <div className={styles.emptyState}>
                        Нет созданных команд
                    </div>
                ) : (
                    teams.map((team) => {
                        const pCount = players.filter(p => p.teamId === team.id).length;
                        const cCount = coaches.filter(c => c.teamId === team.id).length;

                        return (
                            <div key={team.id} className={styles.card} onClick={() => nav(`/config/assign-team/${team.id}`)}>
                                {/* Logo / Icon */}
                                <div className={styles.logoBox}>
                                    {team.logoUrl ? (
                                        <img src={team.logoUrl} alt="Logo" className={styles.logoImg} />
                                    ) : (
                                        <div className={styles.logoPlaceholder}>
                                            <FaPeopleRoof size={32} />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className={styles.infoBox}>
                                    <div className={styles.teamName}>{team.nameTeam} {team.foundedYear}</div>

                                    <div className={styles.statRow}>
                                        <FaCheck className={styles.checkIcon} />
                                        <span className={styles.statText}>Игроков добавлено: <span className={styles.count}>{pCount}</span></span>
                                    </div>
                                    <div className={styles.statRow}>
                                        <FaUserTie className={styles.smallIcon} />
                                        <span className={styles.statText}>Специалистов добавлено: <span className={styles.count}>{cCount}</span></span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </main>

            {/* Footer */}
            <footer className={styles.footer}>
                <button className={styles.saveBtn} type="button" onClick={handleSave}>
                    Сохранить
                </button>
            </footer>
        </div>
    );
}
