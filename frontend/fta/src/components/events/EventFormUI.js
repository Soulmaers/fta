import React from "react";
import { FaRegCalendarAlt, FaCheck } from "react-icons/fa";
import styles from "./EventCreateModal.module.css";
import { DAYS_MAP, TEST_OPTIONS } from "./constants";

export default function EventFormUI({
    eventType, setEventType,
    trainingType, setTrainingType,
    lineups, selectedLineupId, setSelectedLineupId,
    eventDate, setEventDate,
    startTime, setStartTime,
    endTime, setEndTime,
    location, setLocation,
    selectedTests, handleToggleTest,
    isRpeEnabled, setIsRpeEnabled,
    isRepeating, setIsRepeating,
    selectedDays, handleToggleDay,
    setSelectedDays,
    repeatUntil, setRepeatUntil,
    recurringEventsCount,
    isEditMode
}) {
    const formatRuDate = (dateStr) => {
        if (!dateStr) return "";
        return dateStr.split("-").reverse().join(".");
    };

    const isBioMode = eventType === 'BIO';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Тип события */}
            <div className={styles.field}>
                <label>Тип события</label>
                <div className={styles.typeToggle}>
                    <button
                        className={`${styles.typeBtn} ${eventType === 'TRAINING' ? styles.typeBtnActive : ''}`}
                        onClick={() => setEventType('TRAINING')}
                    >
                        Тренировка
                    </button>
                    <button
                        className={`${styles.typeBtn} ${eventType === 'BIO' ? styles.typeBtnActive : ''}`}
                        onClick={() => setEventType('BIO')}
                    >
                        БИО
                    </button>
                </div>
            </div>

            {/* Состав */}
            {lineups.length > 1 && (
                <div className={styles.field}>
                    <label>Состав</label>
                    <div className={styles.typeToggle}>
                        <button className={`${styles.typeBtn} ${selectedLineupId === null ? styles.typeBtnActive : ''}`} onClick={() => setSelectedLineupId(null)}>Все</button>
                        {lineups.map(l => (
                            <button key={l.id} className={`${styles.typeBtn} ${selectedLineupId === l.id ? styles.typeBtnActive : ''}`} onClick={() => setSelectedLineupId(l.id)}>{l.lineupName}</button>
                        ))}
                    </div>
                </div>
            )}

            {/* Режим: Одиночное / Серия (всегда) */}
            <div className={styles.field}>
                <label>Режим</label>
                <div className={styles.typeToggle} style={{ opacity: isEditMode ? 0.7 : 1 }}>
                    <button
                        className={`${styles.typeBtn} ${!isRepeating ? styles.typeBtnActive : ''}`}
                        onClick={() => !isEditMode && setIsRepeating(false)}
                    >
                        Одиночное
                    </button>
                    <button
                        className={`${styles.typeBtn} ${isRepeating ? styles.typeBtnActive : ''}`}
                        onClick={() => !isEditMode && setIsRepeating(true)}
                    >
                        Серия
                    </button>
                </div>
            </div>

            {/* Дата */}
            <div className={styles.field}>
                <label>{isRepeating && !isEditMode ? 'Дата начала серии' : 'Дата'}</label>
                <div className={styles.inputWrap} style={{ opacity: (isEditMode && isRepeating) ? 0.6 : 1 }}>
                    <input
                        className={styles.input}
                        value={formatRuDate(eventDate)}
                        readOnly
                        placeholder="Выберите дату"
                        style={{ color: eventDate ? '#fff' : 'rgba(255,255,255,0.3)' }}
                        disabled={isEditMode && isRepeating}
                    />
                    <label className={styles.dateIconBtn} style={{ pointerEvents: (isEditMode && isRepeating) ? 'none' : 'auto' }}>
                        <FaRegCalendarAlt size={16} />
                        <input
                            className={styles.dateNativeIcon}
                            type="date"
                            value={eventDate}
                            onChange={e => setEventDate(e.target.value)}
                            disabled={isEditMode && isRepeating}
                        />
                    </label>
                </div>
            </div>

            {/* Параметры серии (всегда если isRepeating) */}
            {isRepeating && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '12px' }}>
                    <div className={styles.field}>
                        <label>Дни недели</label>
                        <div className={styles.daysRow}>
                            {DAYS_MAP.map(d => (
                                <button
                                    key={d.value}
                                    className={`${styles.dayCircle} ${selectedDays.includes(d.value) ? styles.dayCircleActive : ''}`}
                                    onClick={() => handleToggleDay(d.value)}
                                >
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className={styles.field}>
                        <label>Повторять до</label>
                        <div className={styles.inputWrap}>
                            <input
                                className={styles.input}
                                value={formatRuDate(repeatUntil)}
                                readOnly
                                placeholder="Выберите дату"
                                style={{ color: repeatUntil ? '#fff' : 'rgba(255,255,255,0.3)' }}
                            />
                            <label className={styles.dateIconBtn}>
                                <FaRegCalendarAlt size={16} />
                                <input className={styles.dateNativeIcon} type="date" value={repeatUntil} onChange={e => setRepeatUntil(e.target.value)} />
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* === БЛОК ТРЕНИРОВКИ (скрыт в БИО) === */}
            {!isBioMode && (
                <>
                    {/* Подтип тренировки */}
                    {eventType === 'TRAINING' && (
                        <div className={styles.field}>
                            <label>Тип тренировки</label>
                            <div className={styles.typeToggle}>
                                <button className={`${styles.typeBtn} ${trainingType === 'MAIN' ? styles.typeBtnActive : ''}`} onClick={() => setTrainingType('MAIN')}>Основная</button>
                                <button className={`${styles.typeBtn} ${trainingType === 'OFP' ? styles.typeBtnActive : ''}`} onClick={() => setTrainingType('OFP')}>ОФП</button>
                            </div>
                        </div>
                    )}

                    {/* Время */}
                    <div className={styles.formRow}>
                        <div className={styles.field}><label>Начало</label><input type="time" className={styles.input} value={startTime} onChange={e => setStartTime(e.target.value)} /></div>
                        <div className={styles.field}><label>Конец</label><input type="time" className={styles.input} value={endTime} onChange={e => setEndTime(e.target.value)} /></div>
                    </div>

                    {/* Место */}
                    <div className={styles.field}>
                        <label>Место проведения</label>
                        <input type="text" className={styles.input} value={location} onChange={e => setLocation(e.target.value)} placeholder="Введите адрес" />
                    </div>

                    {/* Тесты и RPE */}
                    {eventType === 'TRAINING' && (
                        <>
                            <div className={styles.field}>
                                <label>Тесты</label>
                                <div className={styles.testsGrid}>
                                    {TEST_OPTIONS.filter(t => t.id !== 'BIOBANDING').map(t => {
                                        const isActive = selectedTests.includes(t.id);
                                        return (
                                            <button
                                                key={t.id}
                                                className={`${styles.testBtn} ${isActive ? styles.testBtnActive : ''}`}
                                                onClick={() => handleToggleTest(t.id)}
                                            >
                                                {isActive && <FaCheck size={10} style={{ marginRight: '4px', color: '#8bc34a' }} />}
                                                {t.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className={styles.switchRow}>
                                <span style={{ color: '#fff' }}>ИВН</span>
                                <label className={styles.switch}>
                                    <input type="checkbox" checked={isRpeEnabled} onChange={e => setIsRpeEnabled(e.target.checked)} />
                                    <span className={styles.slider}></span>
                                </label>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}