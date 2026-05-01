import React, { useState } from "react";
import styles from "./PlayerList.module.css";
import { FaTrash, FaCopy, FaSearch, FaFileExcel, FaShareAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTeams } from '../../../context/EntityContext'
import { useAuth } from '../../../context/AuthProvider'
import { IoPerson } from "react-icons/io5";
import { exportToExcel } from "../../../utils/excelExport";

const POSITION_LABELS = {
    GK: "Goalkeeper",
    DF: "Defender",
    MF: "Midfielder",
    FW: "Forward"
};

export default function PlayerList() {
    const nav = useNavigate();
    const [busyId, setBusyId] = useState(null);
    const { auth } = useAuth();
    const userId = auth?.id;
    const { data, del, load } = useTeams();

    // Стейт для поиска
    const [searchTerm, setSearchTerm] = useState("");

    React.useEffect(() => {
        if (userId) {
            load('players', userId);
        }
    }, [userId, load]);

    const handleOpen = (p) => {
        nav("/config/players/edit", { state: { player: p } });
    };

    const handleDelete = async (pId, e) => {
        e.stopPropagation(); // prevent card click
        console.log("Attempting to delete player with ID:", pId);
        const ok = window.confirm("Удалить игрока?");
        if (!ok) return;

        try {
            setBusyId(pId);
            if (!userId) {
                alert("Ошибка: нет ID пользователя (auth.id). Перезайдите в систему.");
                return;
            }
            await del('players', pId, userId);
        } catch (err) {
            console.error(err);
            alert("Не удалось удалить игрока: " + (err.message || "Unknown error"));
        } finally {
            setBusyId(null);
        }
    };

    const copyLogin = async (login, id) => {
        if (!login) return;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: "Логин игрока",
                    text: login,
                });
            } else {
                await navigator.clipboard.writeText(login);
            }
        } catch (err) {
            console.error("Share failed", err);
        }
    };

    const players = data.players || [];

    // Фильтрация игроков по имени
    // Фильтрация игроков по имени или позиции
    const filteredPlayers = players.filter(p => {
        const term = searchTerm.toLowerCase();
        const nameMatch = p.fullName?.toLowerCase().includes(term);
        const positionLabel = p.position ? (POSITION_LABELS[p.position] || p.position) : "";
        const posMatch = positionLabel.toLowerCase().includes(term);

        // Поиск по году рождения
        const yearMatch = p.birthDate ? String(p.birthDate).includes(term) : false;

        return nameMatch || posMatch || yearMatch;
    });

    const handleExportExcel = () => {
        const dataToExport = filteredPlayers.map(p => ({
            "ФИО": p.fullName,
            "Логин": p.login
        }));
        exportToExcel(dataToExport, "Список_игроков.xlsx", "Игроки");
    };

    const handleShareList = async () => {
        const text = filteredPlayers
            .map(p => `${p.fullName}: ${p.login}`)
            .join("\n");

        try {
            if (navigator.share) {
                await navigator.share({
                    title: "Логины игроков",
                    text: text
                });
            } else {
                await navigator.clipboard.writeText(text);
                alert("Список скопирован в буфер обмена");
            }
        } catch (err) {
            console.error("Share failed", err);
        }
    };

    return (
        <div className={`${styles.screen} page-enter`}>
            <header className={styles.header}>
                <button className={styles.back} type="button" onClick={() => nav(-1)}>
                    <span className={styles.backArrow} aria-hidden="true">‹</span>
                    <span className={styles.backText}>Назад</span>
                </button>

                <div className={styles.title}>Игроки</div>

                <div className={styles.headerSpacer} />
            </header>

            {/* ПОИСК */}
            <div className={styles.searchContainer}>
                <FaSearch className={styles.searchIcon} />
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Поиск игрока..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className={styles.actionContainer}>
                <span className={styles.actionTitle}>Логины игроков</span>
                <div className={styles.actionButtons}>
                    <button className={styles.iconBtn} onClick={handleExportExcel} title="Экспорт в Excel">
                        <FaFileExcel size={20} className={styles.iconSvg} />
                    </button>
                    <button className={styles.iconBtn} onClick={handleShareList} title="Поделиться">
                        <FaShareAlt size={18} className={styles.iconSvg} />
                    </button>
                </div>
            </div>

            <main className={styles.content}>
                {filteredPlayers.length === 0 && (
                    <div className={styles.empty}>
                        {searchTerm ? "Ничего не найдено" : "Список пуст"}
                    </div>
                )}

                <div className={styles.list}>
                    {filteredPlayers.map((p) => (
                        <section key={p.id} className={styles.card}>
                            {/* ЛЕВАЯ ЧАСТЬ: ЛОГО */}
                            <div className={styles.left}>
                                <div className={styles.logo}>
                                    {p.photoUrl ? (
                                        <img className={styles.logoImg} src={p.photoUrl} alt="" />
                                    ) : (
                                        <div className={styles.logoFallback}>
                                            <IoPerson className={styles.icon_react} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ПРАВАЯ ЧАСТЬ */}
                            <div className={styles.right}>
                                {/* ВЕРХ: НАЗВАНИЕ + СТРЕЛКА */}
                                <button
                                    className={styles.topRow}
                                    type="button"
                                    onClick={() => handleOpen(p)}
                                    aria-label="Редактировать игрока"
                                >
                                    <div className={styles.container_member}>
                                        <div className={styles.name}>{p.fullName}</div>
                                        <div className={styles.position}>
                                            {/* Показываем прочерк, если позиции нет */}
                                            {p.position ? (POSITION_LABELS[p.position] || p.position) : "-"}
                                        </div>
                                    </div>
                                    <div className={styles.chev} aria-hidden="true">›</div>
                                </button>

                                {/* НИЗ: УДАЛИТЬ */}
                                <div className={styles.bottomRow}>
                                    <button
                                        className={`${styles.deleteBtn} ${busyId === p.id ? styles.deleteBtnBusy : ""}`}
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); copyLogin(p.login, p.id); }}
                                        disabled={busyId === p.id}
                                    >
                                        <FaCopy className={styles.trashIcon} />
                                        <span className={styles.span_btn}>{busyId === p.id ? "..." : "Скопировать логин"}</span>
                                    </button>

                                    <button
                                        className={`${styles.deleteBtn_del} ${busyId === p.id ? styles.deleteBtnBusy : ""}`}
                                        type="button"
                                        onClick={(e) => handleDelete(p.id, e)}
                                        disabled={busyId === p.id}
                                    >
                                        <FaTrash className={styles.trashIcon} />
                                    </button>
                                </div>
                            </div>
                        </section>
                    ))}
                </div>
            </main>
        </div>
    );
}
