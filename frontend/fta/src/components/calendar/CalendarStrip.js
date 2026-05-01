import React from "react";
import styles from "./CalendarStrip.module.css";

const MONTHS = ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК'];

export default function CalendarStrip({ days, selectedDayId, onSelectDay, stripRef, events = [] }) {
    const scrollStrip = (direction) => {
        if (stripRef.current) {
            const scrollAmount = direction === 'left' ? -150 : 150;
            stripRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section className={styles.strip}>
            <button className={styles.scrollBtn} onClick={() => scrollStrip('left')}>&lt;</button>
            <div className={styles.stripDays} ref={stripRef}>
                {days.map((x) => {
                    // Ищем события, которые попадают на этот день
                    const dStr = `${x.full.getFullYear()}-${String(x.full.getMonth() + 1).padStart(2, '0')}-${String(x.full.getDate()).padStart(2, '0')}`;
                    const dayEvents = events.filter(ev => ev.date === dStr);
                    // Максимум 3 точки, чтобы не перегружать дизайн
                    const dotsToShow = dayEvents.slice(0, 3);
                    const hasMore = dayEvents.length > 3;

                    return (
                        <button
                            key={x.id}
                            className={`${styles.dayChip} ${selectedDayId === x.id ? styles.dayChipActive : ""}`}
                            type="button"
                            onClick={() => onSelectDay(x.id)}
                        >
                            <div className={styles.dayW} style={{ fontSize: '8px', marginBottom: '1px' }}>{MONTHS[x.m]}</div>
                            <div className={styles.dayD}>{x.d}</div>
                            <div className={styles.dayW}>{x.w}</div>
                            
                            {/* Контейнер для точек событий */}
                            <div className={styles.dotsContainer}>
                                {dotsToShow.map((ev, idx) => {
                                    // Цвет точки зависит от типа события
                                    let dotColor = '#fff';
                                    if (ev.type === 'MATCH') dotColor = '#ea5455';       // Красный для матчей
                                    if (ev.type === 'MEDICAL') dotColor = '#ff3b30';     // Ярко красный
                                    if (ev.type === 'TRAINING') dotColor = '#8bc34a';    // Салатовый для трень
                                    
                                    return (
                                        <div key={idx} className={styles.eventDot} style={{ backgroundColor: dotColor }} />
                                    );
                                })}
                                {hasMore && <div className={styles.eventDotMore}>+</div>}
                            </div>
                        </button>
                    );
                })}
            </div>
            <button className={styles.scrollBtn} onClick={() => scrollStrip('right')}>&gt;</button>
        </section>
    );
}
