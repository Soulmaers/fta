import React, { useState } from "react";
import styles from "./WellnessDiaryModal.module.css";
import { FaTimes, FaBed, FaBolt, FaDumbbell, FaSmile, FaStethoscope, FaFutbol } from "react-icons/fa";

export default function WellnessDiaryModal({ isOpen, onClose, onSave }) {
    const [sleep, setSleep] = useState(3);
    const [energy, setEnergy] = useState(3);
    const [muscle, setMuscle] = useState(3);
    const [mood, setMood] = useState(3);
    const [hasPain, setHasPain] = useState(false);
    const [painLocation, setPainLocation] = useState("");

    const [isMultisport, setIsMultisport] = useState(false);
    const [sportName, setSportName] = useState("");
    const [duration, setDuration] = useState(60);
    const [rpe, setRpe] = useState(5);

    if (!isOpen) return null;

    const RatingBar = ({ value, onChange, icon: Icon, label }) => (
        <div className={styles.ratingRow}>
            <div className={styles.ratingLabel}>
                <Icon className={styles.rowIcon} />
                <span>{label}</span>
            </div>
            <div className={styles.ratingButtons}>
                {[1, 2, 3, 4, 5].map(num => (
                    <button
                        key={num}
                        className={`${styles.rateBtn} ${value === num ? styles.rateBtnActive : ""}`}
                        onClick={() => onChange(num)}
                    >
                        {num}
                    </button>
                ))}
            </div>
        </div>
    );

    const handleSave = () => {
        const payload = {
            sleep,
            energy,
            muscle,
            mood,
            hasPain,
            painLocation: hasPain ? painLocation : "",
            isMultisport,
            sportName: isMultisport ? sportName : "",
            duration: isMultisport ? duration : 0,
            rpe: isMultisport ? rpe : 0,
            date: new Date().toISOString().split('T')[0]
        };
        onSave(payload);
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <div className={styles.mainTitle}>📋 Дневник самочувствия</div>
                        <div className={styles.subTitle}>Сегодня, {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className={styles.content}>
                    <div className={styles.sectionLabel}>САМОЧУВСТВИЕ</div>
                    <RatingBar value={sleep} onChange={setSleep} icon={FaBed} label="Качество сна" />
                    <RatingBar value={energy} onChange={setEnergy} icon={FaBolt} label="Уровень энергии" />
                    <RatingBar value={muscle} onChange={setMuscle} icon={FaDumbbell} label="Усталость мышц" />
                    <RatingBar value={mood} onChange={setMood} icon={FaSmile} label="Настроение" />

                    <div className={styles.toggleRow}>
                        <div className={styles.ratingLabel}>
                            <FaStethoscope className={styles.rowIcon} />
                            <span>Боль / дискомфорт</span>
                        </div>
                        <div className={styles.togglePills}>
                            <button
                                className={`${styles.pill} ${!hasPain ? styles.pillActive : ""}`}
                                onClick={() => setHasPain(false)}
                            >Нет</button>
                            <button
                                className={`${styles.pill} ${hasPain ? styles.pillActiveRed : ""}`}
                                onClick={() => setHasPain(true)}
                            >Да</button>
                        </div>
                    </div>

                    {hasPain && (
                        <input
                            className={styles.input}
                            placeholder="Где именно болит?"
                            value={painLocation}
                            onChange={e => setPainLocation(e.target.value)}
                        />
                    )}

                    <div className={styles.divider} />

                    <div className={styles.sectionLabel}>МУЛЬТИСПОРТ</div>
                    <div className={styles.toggleRow}>
                        <div className={styles.ratingLabel}>
                            <FaFutbol className={styles.rowIcon} />
                            <span>Занимался другим спортом?</span>
                        </div>
                        <div className={styles.togglePills}>
                            <button
                                className={`${styles.pill} ${!isMultisport ? styles.pillActive : ""}`}
                                onClick={() => setIsMultisport(false)}
                            >Нет</button>
                            <button
                                className={`${styles.pill} ${isMultisport ? styles.pillActive : ""}`}
                                onClick={() => setIsMultisport(true)}
                            >Да</button>
                        </div>
                    </div>

                    {isMultisport && (
                        <div className={styles.multisportFields}>
                            <div className={styles.fieldGroup}>
                                <label>Вид спорта</label>
                                <input
                                    className={styles.input}
                                    placeholder="Напр: Плавание, Теннис"
                                    value={sportName}
                                    onChange={e => setSportName(e.target.value)}
                                />
                            </div>
                            <div className={styles.fieldGroup}>
                                <label>Длительность (мин)</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={duration}
                                    onChange={e => setDuration(parseInt(e.target.value))}
                                />
                            </div>
                            <div className={styles.fieldGroup}>
                                <label>Нагрузка ИВН: {rpe}</label>
                                <div className={styles.rpeGrid}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                        <button
                                            key={num}
                                            className={`${styles.rpeBtn} ${rpe === num ? styles.rpeBtnActive : ""}`}
                                            onClick={() => setRpe(num)}
                                        >{num}</button>
                                    ))}
                                </div>
                                <div className={styles.rpeLabels}>
                                    <span>Легко</span>
                                    <span>Тяжело</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    <button className={styles.saveBtn} onClick={handleSave}>
                        Сохранить
                    </button>
                </div>
            </div>
        </div>
    );
}
