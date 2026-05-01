import React, { useState } from "react";
import styles from "./PersonalList.module.css";
import { FaTrash, FaCopy, FaFileExcel, FaShareAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTeams } from '../../../context/EntityContext'
import { useAuth } from '../../../context/AuthProvider'
import { IoPeopleSharp, IoSearch } from "react-icons/io5";
import { exportToExcel } from "../../../utils/excelExport";

export default function PersonalList() {
    const nav = useNavigate();
    const [busyId, setBusyId] = useState(null);
    const { data, del, load } = useTeams();
    const { auth } = useAuth();        // где ты хранишь auth
    const userId = auth?.id;
    const [searchTerm, setSearchTerm] = useState("");

    React.useEffect(() => {
        if (userId) {
            load('coaches', userId);
        }
    }, [userId, load]);

    const handleOpen = (p) => {
        nav("/config/personal/edit", { state: { coach: p } });
    };

    const handleDelete = async (p) => {
        const ok = window.confirm("Удалить?");
        if (!ok) return;

        try {
            setBusyId(p);
            await del('coaches', p, userId);
        } finally {
            setBusyId(null);
        }
    };


    const copyLogin = async (login, id) => {
        if (!login) return;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: "Логин специалиста",
                    text: login,
                });
            } else {
                // fallback — если share не поддерживается
                await navigator.clipboard.writeText(login);
            }
        } catch (err) {
            console.error("Share canceled or failed", err);
        }
    };

    const coaches = data.coaches || [];

    const filteredCoaches = coaches.filter(c => {
        const term = searchTerm.toLowerCase();
        const nameMatch = c.fullName?.toLowerCase().includes(term);
        const profMatch = c.profession?.toLowerCase().includes(term);
        const yearMatch = c.birthDate ? String(c.birthDate).includes(term) : false;

        return nameMatch || profMatch || yearMatch;
    });

    const handleExportExcel = () => {
        const dataToExport = filteredCoaches.map(c => ({
            "ФИО": c.fullName,
            "Логин": c.login
        }));
        exportToExcel(dataToExport, "Список_специалистов.xlsx", "Специалисты");
    };

    const handleShareList = async () => {
        const text = filteredCoaches
            .map(c => `${c.fullName}: ${c.login}`)
            .join("\n");

        try {
            if (navigator.share) {
                await navigator.share({
                    title: "Логины специалистов",
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

                <div className={styles.title}>Специалисты</div>

                <div className={styles.headerSpacer} />
            </header>

            <div className={styles.searchContainer}>
                <IoSearch className={styles.searchIcon} />
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Поиск..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className={styles.actionContainer}>
                <span className={styles.actionTitle}>Логины специалистов</span>
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
                <div className={styles.list}>
                    {filteredCoaches.map((t) => (
                        <section key={t.id} className={styles.card}>
                            {/* ЛЕВАЯ ЧАСТЬ: ЛОГО */}
                            <div className={styles.left}>
                                <div className={styles.logo}>
                                    {t.photoUrl ? (
                                        <img className={styles.logoImg} src={t.photoUrl} alt="" />
                                    ) : (
                                        <div className={styles.logoFallback}> <IoPeopleSharp className={styles.icon_react} /></div>
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
                                    aria-label="Открыть cпециалиста"
                                >
                                    <div className="container_member"><div className={styles.name}>{t.fullName}</div>
                                        <div className={styles.year}>{t.profession}</div></div>
                                    <div className={styles.chev} aria-hidden="true">›</div>
                                </button>

                                {/* НИЗ: ГОД + УДАЛИТЬ */}
                                <div className={styles.bottomRow}>
                                    <button
                                        className={`${styles.deleteBtn} ${busyId === t.id ? styles.deleteBtnBusy : ""}`}
                                        type="button"
                                        onClick={() => copyLogin(t.login, t.id)}
                                        disabled={busyId === t.id}
                                    >
                                        <FaCopy className={styles.trashIcon} />
                                        <span className="span_btn">{busyId === t.id ? "..." : "Скопировать логин"}</span>
                                    </button>

                                    <button
                                        className={`${styles.deleteBtn_del} ${busyId === t.id ? styles.deleteBtnBusy : ""}`}
                                        type="button"
                                        onClick={() => handleDelete(t.id)}
                                        disabled={busyId === t.id}
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
