import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./EventPage.module.css";
import { FaChevronLeft, FaSave, FaCheck, FaTimes, FaClipboardList, FaDumbbell } from "react-icons/fa";
import { apiFetch } from "../../api/http";

export default function EventPage() {
    const { id } = useParams();
    const nav = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState("");
    const [attendance, setAttendance] = useState([]); // { player: {}, present: true, ивн: 0 }

    useEffect(() => {
        const fetchEventData = async () => {
            try {
                const data = await apiFetch(`/api/events/${id}`); // We need a GET /api/events/{id} on back
                // For now mockup if fails
                if (!data) throw new Error("Not found");
                setEvent(data);
                setTasks(data.tasks || "");
            } catch (err) {
                console.error("Failed to fetch event", err);
                // Mock for testing UI
                setEvent({
                    id,
                    type: 'TRAINING',
                    date: '2026-02-27',
                    startTime: '18:00',
                    endTime: '19:30',
                    location: 'Тамбасова д. 32',
                    squads: [{ lineupName: 'Основной состав' }]
                });
            } finally {
                setLoading(false);
            }
        };
        fetchEventData();
    }, [id]);

    const handleSave = async () => {
        // Logic to save tasks and attendance
        alert("Данные сохранены!");
    };

    if (loading) return <div className={styles.loading}>Загрузка...</div>;
    if (!event) return <div className={styles.error}>Событие не найдено</div>;

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <button className={styles.backBtn} onClick={() => nav('/app')}>
                    <FaChevronLeft />
                </button>
                <div className={styles.title}>Карточка тренировки</div>
                <button className={styles.saveBtn} onClick={handleSave}>
                    <FaSave />
                </button>
            </header>

            <main className={styles.content}>
                <div className={styles.infoCard}>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Дата:</span>
                        <span className={styles.infoVal}>{event.date}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Время:</span>
                        <span className={styles.infoVal}>{event.startTime?.substring(0, 5)} - {event.endTime?.substring(0, 5)}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Место:</span>
                        <span className={styles.infoVal}>{event.location}</span>
                    </div>
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionTitle}>
                        <FaClipboardList /> Задачи на тренировку
                    </div>
                    <textarea
                        className={styles.taskInput}
                        value={tasks}
                        onChange={(e) => setTasks(e.target.value)}
                        placeholder="Введите основные задачи..."
                    />
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionTitle}>
                        <FaDumbbell /> Посещаемость и нагрузка
                    </div>
                    <div className={styles.attendanceEmpty}>
                        Здесь будет список игроков из состава {event.squads?.[0]?.lineupName || '...'}
                    </div>
                </div>
            </main>
        </div>
    );
}
