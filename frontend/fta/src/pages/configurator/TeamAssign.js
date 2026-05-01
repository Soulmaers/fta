import React, { useState, useEffect, useMemo } from "react";
import styles from "./TeamAssign.module.css";
import { useNavigate, useParams } from "react-router-dom";
import { useTeams } from "../../context/EntityContext";
import { useAuth } from "../../context/AuthProvider";
import { FaArrowLeftLong, FaChevronRight, FaCheck, FaUserTie, FaUsers, FaPeopleRoof } from "react-icons/fa6";

export default function TeamAssign() {
    const { teamId } = useParams();
    const nav = useNavigate();
    const { auth } = useAuth();
    const { data, load, syncAssignments } = useTeams();

    const [activeTab, setActiveTab] = useState("players"); // "players" | "coaches"
    const [composition, setComposition] = useState(1); // 1 | 2 for players

    // Local state for assignments (unsaved)
    const [assignedPlayers, setAssignedPlayers] = useState([]);
    const [availablePlayers, setAvailablePlayers] = useState([]);
    const [assignedCoaches, setAssignedCoaches] = useState([]);
    const [availableCoaches, setAvailableCoaches] = useState([]);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDetail, setSelectedDetail] = useState(null); // Item to show in modal

    const currentTeam = useMemo(() =>
        data.teams.find(t => t.id.toString() === teamId),
        [data.teams, teamId]);

    useEffect(() => {
        if (auth?.id) {
            load("teams", auth.id);
            load("players", auth.id);
            load("coaches", auth.id);
            load("lineups", auth.id);
        }
    }, [auth?.id, load]);

    const lineups = data.lineups || [];
    const lineup1 = lineups[0]?.lineupName || "Состав 1";
    const lineup2 = lineups[1]?.lineupName || "Состав 2";
    const showSwitch = activeTab === "players" && lineups.length > 1;

    // Initial split of data
    useEffect(() => {
        // Players logic: Should work even if no lineups exist
        const teamPlayers = data.players.filter(p => p.teamId?.toString() === teamId);
        const mappedPlayers = teamPlayers.map(p => ({
            ...p,
            compositionType: (lineups.length > 1 && p.lineupId === lineups[1]?.id) ? 2 : 1
        }));
        setAssignedPlayers(mappedPlayers);
        setAvailablePlayers(data.players.filter(p => !p.teamId));

        // Coaches logic
        const teamCoaches = data.coaches.filter(c => c.teamId?.toString() === teamId);
        setAssignedCoaches(teamCoaches);
        setAvailableCoaches(data.coaches.filter(c => !c.teamId));
    }, [data.players, data.coaches, teamId, lineups]);

    const handleSave = async () => {
        if (!auth?.id) return;

        try {
            // 1. Prepare players payload
            const playerAssignments = assignedPlayers.map(p => ({
                playerId: p.id,
                lineupId: p.compositionType === 2 ? (lineups[1]?.id || null) : (lineups[0]?.id || null)
            }));

            const playersPayload = {
                teamId: parseInt(teamId),
                assignments: playerAssignments
            };

            // 2. Prepare coaches payload
            const coachIds = assignedCoaches.map(c => c.id);
            const coachesPayload = {
                teamId: parseInt(teamId),
                coachIds: coachIds
            };

            console.log("Saving all assignments...");

            // 3. Send both requests
            await Promise.all([
                syncAssignments("players", auth.id, playersPayload),
                syncAssignments("coaches", auth.id, coachesPayload)
            ]);

            console.log("All assignments saved successfully");
            nav("/config/select-teams");
        } catch (error) {
            console.error("Error saving assignments:", error);
            alert("Ошибка при сохранении состава");
        }
    };

    // Interaction handlers: Click to move (Mobile friendly)
    const toggleAssignment = (item, from) => {
        if (activeTab === "players") {
            if (from === "available") {
                const updatedPlayer = { ...item, compositionType: composition };
                setAssignedPlayers(prev => [...prev, updatedPlayer]);
                setAvailablePlayers(prev => prev.filter(p => p.id !== item.id));
            } else {
                setAvailablePlayers(prev => [...prev, item]);
                setAssignedPlayers(prev => prev.filter(p => p.id !== item.id));
            }
        } else {
            if (from === "available") {
                setAssignedCoaches(prev => [...prev, item]);
                setAvailableCoaches(prev => prev.filter(c => c.id !== item.id));
            } else {
                setAvailableCoaches(prev => [...prev, item]);
                setAssignedCoaches(prev => prev.filter(c => c.id !== item.id));
            }
        }
    };

    const togglePlayerComposition = (playerId) => {
        setAssignedPlayers(prev => prev.map(p =>
            p.id === playerId
                ? { ...p, compositionType: p.compositionType === 1 ? 2 : 1 }
                : p
        ));
    };

    const filterItems = (list) => {
        if (!searchQuery) return list;
        const query = searchQuery.toLowerCase();
        return list.filter(item => {
            const matchesName = item.fullName?.toLowerCase().includes(query);
            const matchesPos = (item.position || item.profession)?.toLowerCase().includes(query);
            const matchesYear = item.birthDate ? item.birthDate.toString().includes(query) : false;

            // Search by lineup name (АПЛ, БЛ, etc.)
            let matchesLineup = false;
            if (item.compositionType) {
                const lineupName = item.compositionType === 1 ? lineup1 : lineup2;
                matchesLineup = lineupName.toLowerCase().includes(query);
            }

            return matchesName || matchesPos || matchesYear || matchesLineup;
        });
    };

    const currentAssigned = filterItems(activeTab === "players" ? assignedPlayers : assignedCoaches);
    const currentAvailable = filterItems(activeTab === "players" ? availablePlayers : availableCoaches);

    return (
        <div className={`${styles.screen} page-enter`}>
            {/* Header section with grey background wrapper */}
            <div className={styles.topSection}>
                <header className={styles.header}>
                    <button className={styles.back} type="button" onClick={() => nav(-1)}>
                        <span className={styles.backArrow}>‹</span>
                        <span className={styles.backText}>Назад</span>
                    </button>
                    <div className={styles.headerTitle}>Настройки команды</div>
                    <div className={styles.headerSpacer} />
                </header>

                <section className={styles.teamHero}>
                    <div className={styles.logoBox}>
                        {currentTeam?.logoUrl ? (
                            <img src={currentTeam.logoUrl} alt="Logo" className={styles.logoImg} />
                        ) : (
                            <div className={styles.logoPlaceholder}>
                                <FaPeopleRoof size={42} />
                            </div>
                        )}
                    </div>
                    <div className={styles.teamDetails}>
                        <h1 className={styles.teamName}>{currentTeam?.nameTeam || "Команда"}</h1>
                        <p className={styles.teamYear}>{currentTeam?.foundedYear}</p>
                    </div>
                </section>

                {/* Composition Switch (iPhone style) - only for players and if more than 1 lineup */}
                {showSwitch && (
                    <div className={styles.switchWrapper}>
                        <span className={`${styles.switchLabel} ${composition === 1 ? styles.switchLabelActive : ""}`}>
                            {lineup1}
                        </span>
                        <label className={styles.switch}>
                            <input
                                type="checkbox"
                                checked={composition === 2}
                                onChange={() => setComposition(prev => prev === 1 ? 2 : 1)}
                            />
                            <span className={styles.slider}></span>
                        </label>
                        <span className={`${styles.switchLabel} ${composition === 2 ? styles.switchLabelActive : ""}`}>
                            {lineup2}
                        </span>
                    </div>
                )}

                {/* Smart Search Bar */}
                <div className={styles.searchSection}>
                    <div className={styles.searchBar}>
                        <div className={styles.searchIcon}>🔍</div>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder={activeTab === "players" ? "Поиск по имени, году или позиции..." : "Поиск по имени или профилю..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button className={styles.clearSearch} onClick={() => setSearchQuery("")}>✕</button>
                        )}
                    </div>
                </div>

                <nav className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === "players" ? styles.tabActive : ""}`}
                        onClick={() => setActiveTab("players")}
                    >
                        Игроки ({availablePlayers.length + assignedPlayers.length})
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === "coaches" ? styles.tabActive : ""}`}
                        onClick={() => setActiveTab("coaches")}
                    >
                        Специалисты ({availableCoaches.length + assignedCoaches.length})
                    </button>
                </nav>

            </div>


            <main className={styles.content}>
                {/* Available Column */}
                <div className={styles.column}>
                    <h2 className={styles.columnTitle}>
                        Доступные ({currentAvailable.length})
                    </h2>
                    <div className={styles.list}>
                        {currentAvailable.map(item => (
                            <div
                                key={item.id}
                                className={styles.card}
                                onClick={() => toggleAssignment(item, "available")}
                            >
                                <div className={styles.cardThumb}>
                                    {item.photoUrl ? (
                                        <img src={item.photoUrl} alt="" className={styles.thumbImg} />
                                    ) : (
                                        <div className={styles.numberCircle}>{item.number || "?"}</div>
                                    )}
                                </div>
                                <div className={styles.cardInfo}>
                                    <div className={styles.cardName}>{item.fullName}</div>
                                    <div className={styles.cardSub}>{item.position || item.profession}</div>
                                </div>
                                <button
                                    className={`${styles.infoBtn} ${styles.infoBtnLeft}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedDetail(item);
                                    }}
                                >
                                    ℹ️
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Assigned Column */}
                <div className={styles.column}>
                    <h2 className={styles.columnTitle}>
                        Команда ({currentAssigned.length})
                    </h2>
                    <div className={`${styles.list} ${styles.listAssigned}`}>
                        {currentAssigned.map(item => (
                            <div
                                key={item.id}
                                className={`${styles.card} ${styles.cardAssigned}`}
                                onClick={() => toggleAssignment(item, "assigned")}
                            >
                                <div className={styles.avatarBox}>
                                    {item.photoUrl ? (
                                        <img src={item.photoUrl} alt="Avatar" className={styles.avatarImg} />
                                    ) : (
                                        <div className={styles.avatarPlaceholder}>
                                            <FaUsers />
                                        </div>
                                    )}
                                </div>
                                <div className={styles.cardInfo}>
                                    <div className={styles.cardName}>{item.fullName}</div>
                                    <div className={styles.cardSub}>{item.position || item.profession}</div>
                                </div>
                                <button
                                    className={`${styles.infoBtn} ${styles.infoBtnRight}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedDetail(item);
                                    }}
                                >
                                    ℹ️
                                </button>
                                {activeTab === "players" && lineups.length > 0 && (
                                    <div
                                        className={`${styles.compBadge} ${lineups.length > 1 ? styles.compBadgeInteractive : ""}`}
                                        onClick={(e) => {
                                            if (lineups.length > 1) {
                                                e.stopPropagation(); // Не убираем из команды
                                                togglePlayerComposition(item.id);
                                            }
                                        }}
                                    >
                                        {item.compositionType === 2 ? lineup2 : lineup1}
                                        {lineups.length > 1 && <span className={styles.syncIcon}>  </span>}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className={styles.footer}>
                <button className={styles.saveBtn} type="button" onClick={handleSave}>
                    Сохранить
                </button>
            </footer>

            {/* Quick Detail Modal */}
            {selectedDetail && (
                <div className={styles.modalOverlay} onClick={() => setSelectedDetail(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div className={styles.modalThumb}>
                                {selectedDetail.photoUrl ? (
                                    <img src={selectedDetail.photoUrl} alt="" className={styles.modalImg} />
                                ) : (
                                    <div className={styles.modalPlaceholder}>
                                        {activeTab === "players" ? <FaUsers size={40} /> : <FaUserTie size={40} />}
                                    </div>
                                )}
                            </div>
                            <div className={styles.modalHeaderInfo}>
                                <h2 className={styles.modalName}>{selectedDetail.fullName}</h2>
                                <p className={styles.modalSub}>{selectedDetail.position || selectedDetail.profession}</p>
                            </div>
                            <button className={styles.closeModal} onClick={() => setSelectedDetail(null)}>✕</button>
                        </div>

                        <div className={styles.modalBody}>
                            {activeTab === "players" ? (
                                <div className={styles.statsGrid}>
                                    <div className={styles.statItem}>
                                        <span className={styles.statLabel}>Год рожд.</span>
                                        <span className={styles.statVal}>{selectedDetail.birthDate ? new Date(selectedDetail.birthDate).getFullYear() : "—"}</span>
                                    </div>
                                    <div className={styles.statItem}>
                                        <span className={styles.statLabel}>Номер</span>
                                        <span className={styles.statVal}>{selectedDetail.number || "—"}</span>
                                    </div>
                                    <div className={styles.statItem}>
                                        <span className={styles.statLabel}>Рост / Вес</span>
                                        <span className={styles.statVal}>{selectedDetail.height || "—"} см / {selectedDetail.weight || "—"} кг</span>
                                    </div>
                                    <div className={styles.statItem}>
                                        <span className={styles.statLabel}>Нога</span>
                                        <span className={styles.statVal}>{selectedDetail.leg === "LEFT" ? "Левая" : selectedDetail.leg === "RIGHT" ? "Правая" : "Обе"}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.coachBio}>
                                    <div className={styles.statItem}>
                                        <span className={styles.statLabel}>Профиль</span>
                                        <span className={styles.statVal}>{selectedDetail.profession || "Специалист"}</span>
                                    </div>
                                    <div className={styles.statItem}>
                                        <span className={styles.statLabel}>Год рожд.</span>
                                        <span className={styles.statVal}>{selectedDetail.birthDate ? new Date(selectedDetail.birthDate).getFullYear() : "—"}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.modalCloseBtn} onClick={() => setSelectedDetail(null)}>Закрыть</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
