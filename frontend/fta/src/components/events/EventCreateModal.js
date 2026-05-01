import React, { useState, useEffect, useRef } from "react";
import { apiFetch } from "../../api/http";
import styles from "./EventCreateModal.module.css";
import { FaCheck, FaEdit, FaTrashAlt, FaMapMarkerAlt, FaRegCalendarAlt, FaRegClock, FaSpinner } from "react-icons/fa";
import { useAuth } from "../../context/AuthProvider";

// Sub-components & Constants
import { TEST_OPTIONS } from "./constants";
import BioHelpModal from "./BioHelpModal";
import AttendanceTab from "./AttendanceTab";
import RpeTab from "./RpeTab";
import BioBandingTab from "./BioBandingTab";
import TestTab from "./TestTab";
import BioStatusTab from "./BioStatusTab";
import EventFormUI from "./EventFormUI";

// Custom Hook
import { useEventForm } from "./useEventForm";

export default function EventCreateModal({ isOpen, onClose, onSave, onDelete, editingEvent, lineups = [], players = [], activeTeam = null }) {
    const { auth } = useAuth();
    const isManager = auth?.role === 'MANAGER';
    const isPlayer = auth?.role === 'PLAYER';

    // UI-only states
    const [isViewMode, setIsViewMode] = useState(false);
    const [activeTab, setActiveTab] = useState(isManager ? 'attendance' : 'info');
    const [toastMessage, setToastMessage] = useState(null);
    const [showHelpModal, setShowHelpModal] = useState(null);
    const [completedTasks, setCompletedTasks] = useState([]);
    const [scopeSelector, setScopeSelector] = useState(null); // { type: 'save' | 'delete', payload: any }
    const [bioResult, setBioResult] = useState(null);
    const [bioStatuses, setBioStatuses] = useState([]);
    const contentRef = useRef(null);

    // All data & business logic in one hook
    const form = useEventForm(editingEvent, isOpen, players, auth);
    const effectivePlayerStatus = form.playerStatusAtEvent || form.currentPlayerData?.status;
    const isPlayerReadyForEvent = effectivePlayerStatus === 'READY';

    // Initial view mode setup
    useEffect(() => {
        if (isOpen) {
            if (editingEvent) {
                setIsViewMode(true);
                const rpeEnabled = editingEvent.trainingDetails?.rpeEnabled ?? true;
                const testTypes = editingEvent.trainingDetails?.testTypes || [];
                if (isPlayer) {
                    const isReady = isPlayerReadyForEvent;
                    if (editingEvent.type === 'BIO') setActiveTab('BIOBANDING');
                    else if (isReady && rpeEnabled) setActiveTab('rpe');
                    else if (isReady && testTypes.includes('BIOBANDING')) setActiveTab('BIOBANDING');
                    else setActiveTab('info'); // Default to info if no tasks or not ready
                } else {
                    setActiveTab(editingEvent.type === 'BIO' ? 'bioStatus' : 'attendance');
                }
            } else {
                setIsViewMode(false);
                setActiveTab('attendance');
            }
        }
    }, [isOpen, editingEvent, isPlayer, form.currentPlayerData, form.playerStatusAtEvent, isPlayerReadyForEvent]);

    useEffect(() => {
        if (!isOpen || !editingEvent?.id) return;
        if (!isManager) return;
        if (editingEvent.type !== 'BIO') return;
        apiFetch(`/api/events/${editingEvent.id}/bio/status`, { token: auth?.token })
            .then(data => setBioStatuses(Array.isArray(data) ? data : []))
            .catch(() => setBioStatuses([]));
    }, [isOpen, editingEvent?.id, editingEvent?.type, isManager, auth?.token]);

    // Track completed tasks (badges) - combined Server + Local
    useEffect(() => {
        const updateTasks = () => {
            if (editingEvent?.id) {
                const tasksKey = `fta_tasks_${auth?.id}_${editingEvent.id}`;
                const local = JSON.parse(localStorage.getItem(tasksKey) || '[]');
                const server = editingEvent.userCompletedTasks || [];
                const combined = Array.from(new Set([...local, ...server]));
                setCompletedTasks(combined);
            } else {
                setCompletedTasks([]);
            }
        };
        updateTasks();
        window.addEventListener('storage', updateTasks);
        return () => window.removeEventListener('storage', updateTasks);
    }, [editingEvent, isOpen, auth]);

    // LocalStorage autosave for manager - removed because we have a backend now
    // and this was causing data leaks between different events.

    const showToast = (msg, type = 'success') => {
        setToastMessage({ text: msg, type });
        setTimeout(() => setToastMessage(null), 3000);
    };

    const isEventHappened = editingEvent
        ? new Date(`${editingEvent.date}T${editingEvent.startTime || '00:00:00'}`) <= new Date()
        : false;

    const isEventFinished = (() => {
        if (!editingEvent?.date) return false;
        const now = new Date();
        if (editingEvent.type === 'BIO') {
            // Для BIO замеры доступны в тот же календарный день (строго по локальному часовому поясу пользователя).
            // Нельзя использовать toISOString() — это UTC: утром 2-го по Москве может быть ещё 1-е по UTC.
            const y = now.getFullYear();
            const m = String(now.getMonth() + 1).padStart(2, '0');
            const d = String(now.getDate()).padStart(2, '0');
            const todayLocal = `${y}-${m}-${d}`;
            return editingEvent.date <= todayLocal;
        }
        const endDateTime = new Date(`${editingEvent.date}T${editingEvent.endTime || '23:59:59'}`);
        return now > endDateTime;
    })();

    const displayedPlayers = (players || []).filter(p => {
        if (activeTeam && p.teamId !== activeTeam.id) return false;
        if (form.selectedLineupId !== null) return p.lineupId === form.selectedLineupId;
        return true;
    });

    const presentPlayers = displayedPlayers.filter(p => {
        if (!isEventHappened) return true;
        const s = form.attendance?.[p.id];
        // 0 = Present, 1 = Late, 2 = Absent. Include 0, 1 and undefined (default present)
        // Explicitly exclude only if status is definitely 2 (Absent/Not present)
        return String(s) !== "2";
    });

    const handleSaveTab = async () => {
        if (!editingEvent?.id) return alert("Сначала создайте событие!");
        try {
            if (activeTab === 'attendance') {
                const mapS = (v) => v === 0 ? 'PRESENT' : v === 1 ? 'LATE' : 'ABSENT';
                const payload = displayedPlayers.map(p => ({ playerId: p.id, status: mapS(form.attendance[p.id] || 0) }));
                await apiFetch(`/api/events/${editingEvent.id}/attendance`, { method: 'POST', body: payload, token: auth?.token });
                showToast("Посещаемость успешно сохранена!");
                localStorage.removeItem(`fta_v2_draft_att_${editingEvent.id}`);
            } else if (activeTab === 'rpe') {
                await apiFetch(`/api/events/${editingEvent.id}/rpe?playerId=${auth.id}`, { method: 'POST', body: { rpeValue: form.playerRpe }, token: auth?.token });
                showToast("ИВН сохранен!");
            } else if (activeTab === 'BIOBANDING') {
                const { bioWeight, bioHeight, bioSittingHeight, bioFatherHeight, bioMotherHeight, lastBioData } = form;
                if (!bioWeight || !bioHeight || !bioSittingHeight || !bioFatherHeight || !bioMotherHeight) return showToast("Заполните все поля!", "error");
                if (lastBioData) {
                    if (Number(bioWeight) < lastBioData.weight) return showToast("Вес меньше предыдущего!", "error");
                    if (Number(bioHeight) < lastBioData.height) return showToast("Рост меньше предыдущего!", "error");
                    if (Number(bioSittingHeight) < lastBioData.sittingHeight) return showToast("Рост сидя меньше предыдущего!", "error");
                }
                const payload = { weight: Number(bioWeight), height: Number(bioHeight), sittingHeight: Number(bioSittingHeight), fatherHeight: Number(bioFatherHeight), motherHeight: Number(bioMotherHeight) };
                const res = await apiFetch(`/api/events/${editingEvent.id}/bio?playerId=${auth.id}`, { method: 'POST', body: payload, token: auth?.token });
                showToast("Замеры сохранены!");
                if (res && res.result && res.result.length > 0) {
                    setBioResult(res.result[0]);
                }
            } else {
                // Generic test save (activeTab is a TestType like JUMP, SPEED_30M, etc.)
                const results = form.testResults || {};
                const payload = presentPlayers
                    .filter(p => results[p.id]?.[activeTab] !== undefined && results[p.id]?.[activeTab] !== '')
                    .map(p => ({
                        playerId: p.id,
                        value: Number(results[p.id][activeTab])
                    }));

                if (payload.length > 0) {
                    await apiFetch(`/api/events/${editingEvent.id}/tests/${activeTab}`, {
                        method: 'POST',
                        body: payload,
                        token: auth?.token
                    });
                    showToast("Результаты тестов сохранены!");
                    // Clear drafts after successful server push
                    localStorage.removeItem(`fta_v2_draft_test_${editingEvent.id}`);
                } else {
                    showToast("Нет данных для сохранения", "warning");
                }
            }

            // Mark task as done
            const tasksKey = `fta_tasks_${auth?.id}_${editingEvent.id}`;
            let completed = JSON.parse(localStorage.getItem(tasksKey) || '[]');
            if (!completed.includes(activeTab)) {
                completed.push(activeTab);
                localStorage.setItem(tasksKey, JSON.stringify(completed));
            }
            window.dispatchEvent(new Event('storage'));
        } catch (e) {
            if (e.message.includes('Failed to fetch') || e.message.includes('Network') || !window.navigator.onLine) {
                showToast("⚠️ Нет интернета! Отметки сохранены на телефоне. Нажмите Сохранить позже.", "error");
            } else {
                showToast("Ошибка: " + e.message, "error");
            }
        }
    };

    const handleSubmit = async (scope = null) => {
        const isBio = form.eventType === 'BIO';
        const payload = {
            id: editingEvent?.id,
            type: form.eventType,
            lineupIds: form.selectedLineupId !== null ? [form.selectedLineupId] : lineups.map(l => l.id),
            date: form.eventDate,
            // Для BIO время/место не обязательны и могут быть null
            startTime: isBio ? null : (form.startTime + ":00"),
            endTime: isBio ? null : (form.endTime + ":00"),
            location: isBio ? null : form.location,
            teamId: activeTeam?.id,
            daysOfWeek: form.isRepeating ? form.selectedDays : null,
            repeatUntil: form.isRepeating ? form.repeatUntil : null,
            trainingDetails: form.eventType === 'TRAINING' ? {
                subtype: form.trainingType,
                rpeEnabled: form.isRpeEnabled,
                // BIO теперь отдельное событие — запрещаем назначать BIOBANDING внутри TRAINING
                testTypes: (form.selectedTests || []).filter(t => t !== 'BIOBANDING')
            } : null,
        };

        if (!form.eventDate) {
            showToast("Укажите дату события", "error");
            return;
        }

        if (!form.location || form.location.trim() === "") {
            if (!isBio) {
                showToast("Укажите место", "error");
                return;
            }
            // Для БИО просто пропускаем, не return
        }

        if (form.isRepeating && !form.repeatUntil) {
            showToast("Укажите дату окончания серии", "error");
            return;
        }

        // ПРОВЕРКА: Если поменяли ПАТТЕРН (день недели или дату финиша) — Окно выбора не показываем,
        // так как расписание всегда обновляется целиком (ALL)
        const isScheduleChanged = editingEvent?.groupId && (
            (editingEvent.daysOfWeek && editingEvent.daysOfWeek[0] !== form.selectedDays[0]) ||
            editingEvent.repeatUntil !== form.repeatUntil
        );

        // Если это серия, ПАТТЕРН НЕ МЕНЯЛСЯ и мы НЕ выбрали область действия — открываем модалку выбора
        if (editingEvent?.groupId && !scope && !isScheduleChanged) {
            setScopeSelector({ type: 'save', payload });
            return;
        }

        try {
            const finalScope = isScheduleChanged ? 'ALL' : (scope || (editingEvent?.groupId ? 'ALL' : 'SINGLE'));
            await onSave(payload, finalScope);
            showToast("Событие сохранено!");
            onClose();
        } catch (e) {
            if (e.message.includes('Failed to fetch') || e.message.includes('Network') || !window.navigator.onLine) {
                showToast("⚠️ Нет интернета! Изменения не сохранены.", "error");
            } else {
                showToast("Ошибка сохранения: " + e.message, "error");
            }
        }
    };

    const confirmDelete = async (scope = 'SINGLE') => {
        if (!editingEvent) return;
        try {
            await onDelete(editingEvent.id, scope);
            showToast("Событие удалено!");
            onClose();
        } catch (e) {
            showToast("Ошибка удаления: " + e.message, "error");
        }
    };

    if (!isOpen) return null;

    if (bioResult) {
        return (
            <div className={styles.overlay} onClick={() => { setBioResult(null); onClose(); }}>
                <div
                    className={styles.card}
                    style={{ maxWidth: '380px', padding: '24px', alignItems: 'center', gap: '16px', background: '#222' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', textAlign: 'center', color: '#fff', marginBottom: '8px', lineHeight: '1.2' }}>
                        Аналитика Atlas API
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', fontSize: '13px', color: '#ccc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Предпологаемый Взрослый Рост:</span>
                            <span style={{ color: '#fff', fontWeight: 'bold' }}>{bioResult['предполагаемый взрослый рост']} см</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Степень достижения:</span>
                            <span style={{ color: '#fff', fontWeight: 'bold' }}>{bioResult['степень достижения взрослого роста, %']}%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Стадия взросления:</span>
                            <span style={{ color: '#fff', fontWeight: 'bold' }}>{bioResult['стадия взросления']}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Темп взросления:</span>
                            <span style={{ color: '#fff', fontWeight: 'bold' }}>{bioResult['темп взросления']}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Возраст PHV и PWV:</span>
                            <span style={{ color: '#fff', fontWeight: 'bold' }}>{bioResult['предполагаемый возраст PHV и PWV']?.join(' / ')} лет</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Темп роста:</span>
                            <span style={{ color: '#fff', fontWeight: 'bold' }}>{bioResult['темп роста, темп веса']?.[0]}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Темп веса:</span>
                            <span style={{ color: '#fff', fontWeight: 'bold' }}>{bioResult['темп роста, темп веса']?.[1]}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Хроно-возраст:</span>
                            <span style={{ color: '#fff', fontWeight: 'bold' }}>{bioResult['хроно-возраст десятичный, био-возраст десятичный']?.[0]} лет</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Биологический возраст:</span>
                            <span style={{ color: '#fff', fontWeight: 'bold' }}>{bioResult['хроно-возраст десятичный, био-возраст десятичный']?.[1]} лет</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                            <span>Риск по темпу роста:</span>
                            <span style={{ color: bioResult['риск по темпу роста, риск по темпу веса']?.[0]?.includes('ВЫСОКИЙ') ? '#ea5455' : '#8bc34a', fontWeight: 'bold', textAlign: 'right', maxWidth: '140px' }}>
                                {bioResult['риск по темпу роста, риск по темпу веса']?.[0]}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Риск по темпу веса:</span>
                            <span style={{ color: bioResult['риск по темпу роста, риск по темпу веса']?.[1]?.includes('ВЫСОКИЙ') ? '#ea5455' : '#8bc34a', fontWeight: 'bold', textAlign: 'right', maxWidth: '140px' }}>
                                {bioResult['риск по темпу роста, риск по темпу веса']?.[1]}
                            </span>
                        </div>
                    </div>

                    <button
                        className={styles.saveBtn}
                        style={{ background: '#8bc34a', color: '#000', marginTop: '16px' }}
                        onClick={() => {
                            setBioResult(null);
                            onClose();
                        }}
                    >
                        ПОНЯТНО
                    </button>
                </div>
            </div>
        );
    }

    const formattedDate = form.eventDate ? form.eventDate.split('-').reverse().join('.') : '';

    return (
        <div className={styles.overlay} onClick={onClose}>
            {toastMessage && (
                <div style={{
                    position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)',
                    background: toastMessage.type === 'error' ? 'rgba(234, 84, 85, 0.85)' : 'rgba(76, 175, 80, 0.85)',
                    color: '#fff', padding: '12px 24px', backdropFilter: 'blur(8px)',
                    borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', zIndex: 9999,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)', pointerEvents: 'none',
                    animation: 'fadeInDownToast 3s ease-in-out', textAlign: 'center',
                    width: 'max-content', maxWidth: '90%',
                    border: `1px solid ${toastMessage.type === 'error' ? 'rgba(234, 84, 85, 0.3)' : 'rgba(76, 175, 80, 0.3)'}`
                }}>
                    {toastMessage.text}
                    <style>{`
                        @keyframes fadeInDownToast {
                            0% { opacity: 0; transform: translate(-50%, -20px); }
                            15% { opacity: 1; transform: translate(-50%, 0); }
                            85% { opacity: 1; transform: translate(-50%, 0); }
                            100% { opacity: 0; transform: translate(-50%, -20px); }
                        }
                    `}</style>
                </div>
            )}
            <div className={styles.card} onClick={e => e.stopPropagation()}>
                {form.isLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '340px' }}>
                        <FaSpinner className={styles.spinIcon} size={36} color="#8bc34a" />
                        <div style={{ marginTop: '16px', fontSize: '13px', fontWeight: 'bold', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>
                            ЗАГРУЗКА ДАННЫХ...
                        </div>
                    </div>
                ) : (
                    <>
                        {isManager && (
                            <div className={styles.header}>
                                <div className={styles.title}>
                                    {editingEvent ? 'РЕДАКТИРОВАНИЕ' : 'НОВОЕ СОБЫТИЕ'}
                                </div>
                                {editingEvent?.groupId && (
                                    <div style={{
                                        fontSize: '10px',
                                        background: 'rgba(139, 195, 74, 0.2)',
                                        color: '#8bc34a',
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        alignSelf: 'center',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        border: '1px solid rgba(139, 195, 74, 0.3)',
                                        marginTop: '-4px'
                                    }}>
                                        ✨ РЕЖИМ СЕРИИ
                                    </div>
                                )}
                            </div>
                        )}
                        <div className={styles.content} ref={contentRef} style={isViewMode ? { overflowY: 'hidden', paddingBottom: 0 } : {}}>
                            <BioHelpModal showHelpModal={showHelpModal} setShowHelpModal={setShowHelpModal} />

                            {isViewMode ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minHeight: 0 }}>
                                    <div style={{ flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '10px' }}>
                                        {form.eventType === 'TRAINING' && (
                                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '6px' }}>
                                                Тип тренировки: <span style={{ color: '#fff', fontWeight: '600' }}>{form.trainingType === 'MAIN' ? 'ОСНОВНАЯ' : 'ОФП'}</span>
                                            </div>
                                        )}
                                        {form.eventType !== 'BIO' && (
                                            <>
                                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '6px' }}>
                                                    Место: <span style={{ color: '#fff', fontWeight: '600' }}>{form.location}</span>
                                                </div>
                                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '6px' }}>
                                                    Дата и время: <span style={{ color: '#8bc34a', fontWeight: '700' }}>{formattedDate} | {form.startTime} – {form.endTime}</span>
                                                </div>
                                            </>
                                        )}
                                        {form.eventType === 'BIO' && (
                                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '6px' }}>
                                                Дата: <span style={{ color: '#8bc34a', fontWeight: '700' }}>{formattedDate}</span>
                                            </div>
                                        )}
                                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '8px' }}>
                                            Состав: <span style={{ color: '#fff', fontWeight: '600' }}>
                                                {editingEvent?.squads?.length > 0
                                                    ? editingEvent.squads.map(s => s.lineupName || s.name).join(', ')
                                                    : 'Все'}
                                            </span>
                                        </div>

                                        {form.selectedTests.filter(t => t !== 'BIOBANDING').length > 0 && (
                                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '6px' }}>
                                                Тесты: <span style={{ color: '#fff', fontWeight: '600' }}>
                                                    {form.selectedTests
                                                        .filter(t => t !== 'BIOBANDING')
                                                        .map(tId => TEST_OPTIONS.find(o => o.id === tId)?.label || tId)
                                                        .join(', ')}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {(() => {
                                        const tabCount = isManager
                                            ? (editingEvent?.type === 'BIO' ? 1 : (1 + form.selectedTests.filter(tId => tId !== 'BIOBANDING').length))
                                            : (form.isRpeEnabled && isPlayerReadyForEvent ? 1 : 0) +
                                            (form.selectedTests.includes('BIOBANDING') && isPlayerReadyForEvent ? 1 : 0);

                                        return (
                                            <div className={`${styles.tabsContainer} ${tabCount > 2 ? styles.tabsOverflow : ''}`}>
                                                {isManager ? (
                                                    editingEvent?.type === 'BIO' ? (
                                                        <button onClick={() => setActiveTab('bioStatus')} className={`${styles.tabButton} ${activeTab === 'bioStatus' ? styles.tabActive : ''}`}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <FaCheck className={styles.taskIconDone} size={12} />
                                                                <span>ЗАМЕРЫ</span>
                                                            </div>
                                                        </button>
                                                    ) : (
                                                    <>
                                                        <button onClick={() => setActiveTab('attendance')} className={`${styles.tabButton} ${activeTab === 'attendance' ? styles.tabActive : ''}`}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <FaCheck className={completedTasks.includes('attendance') ? styles.taskIconDone : styles.taskIconPending} size={12} />
                                                                <span>ПОСЕЩАЕМОСТЬ</span>
                                                            </div>
                                                        </button>
                                                        {form.selectedTests.filter(tId => tId !== 'BIOBANDING').map(tId => {
                                                            const option = TEST_OPTIONS.find(o => o.id === tId);
                                                            const label = option?.label || tId;
                                                            return (
                                                                <button key={tId} onClick={() => setActiveTab(tId)} className={`${styles.tabButton} ${activeTab === tId ? styles.tabActive : ''}`}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                        <FaCheck className={completedTasks.includes(tId) ? styles.taskIconDone : styles.taskIconPending} size={12} />
                                                                        <span style={{ textTransform: 'uppercase' }}>{label}</span>
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </>
                                                    )
                                                ) : (
                                                    <>
                                                        {editingEvent?.type !== 'BIO' && form.isRpeEnabled && isPlayerReadyForEvent && (
                                                            <button onClick={() => setActiveTab('rpe')} className={`${styles.tabButton} ${activeTab === 'rpe' ? styles.tabActive : ''}`}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    <FaCheck className={completedTasks.includes('rpe') ? styles.taskIconDone : styles.taskIconPending} size={12} />
                                                                    <span>ИВН</span>
                                                                </div>
                                                            </button>
                                                        )}
                                                        {(editingEvent?.type === 'BIO' || form.selectedTests.includes('BIOBANDING')) && (
                                                            <button onClick={() => setActiveTab('BIOBANDING')} className={`${styles.tabButton} ${activeTab === 'BIOBANDING' ? styles.tabActive : ''}`}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    <FaCheck className={completedTasks.includes('BIOBANDING') ? styles.taskIconDone : styles.taskIconPending} size={12} />
                                                                    <span>ЗАМЕР (БИО)</span>
                                                                </div>
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    <div style={{ flexShrink: 0, marginBottom: '6px', textAlign: 'center', color: '#8bc34a', fontSize: '13px', textShadow: '0 0 12px rgba(139, 195, 74,0.6)', textTransform: 'uppercase', letterSpacing: '2px' }}>
                                        —— {
                                            activeTab === 'attendance' ? 'ПОСЕЩАЕМОСТЬ' :
                                                activeTab === 'bioStatus' ? 'ЗАМЕРЫ' :
                                                    activeTab === 'rpe' ? 'ОЦЕНКА ИВН' :
                                                        activeTab === 'BIOBANDING' ? 'ЗАМЕР (БИО)' :
                                                            activeTab === 'info' ? 'ДЕТАЛИ' :
                                                                (TEST_OPTIONS.find(t => t.id === activeTab)?.label || 'ТЕСТ')
                                        } ——
                                    </div>

                                    <div className={styles.viewTabsScroll}>
                                        {activeTab === 'info' && (
                                            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                                                {editingEvent?.type === 'BIO'
                                                    ? 'Для этого события доступна задача: Замер (БИО).'
                                                    : 'Для этой тренировки тренер не запланировал индивидуальных задач для вас.'}
                                            </div>
                                        )}
                                        {activeTab === 'attendance' && isManager && <AttendanceTab players={displayedPlayers} attendance={form.attendance} setAttendance={form.setAttendance} isEventHappened={isEventHappened} />}
                                        {activeTab === 'bioStatus' && isManager && editingEvent?.type === 'BIO' && (
                                            <BioStatusTab players={displayedPlayers} statuses={bioStatuses} />
                                        )}
                                        {activeTab === 'rpe' && <RpeTab playerRpe={form.playerRpe} setPlayerRpe={form.setPlayerRpe} isEventFinished={isEventFinished} teamYear={activeTeam?.foundedYear || editingEvent?.teamFoundedYear} />}
                                        {activeTab === 'BIOBANDING' ? (
                                            <BioBandingTab isEventFinished={isEventFinished} {...form} setShowHelpModal={setShowHelpModal} editingEventId={editingEvent?.id} eventDate={form.eventDate} />
                                        ) : (
                                            !['attendance', 'bioStatus', 'rpe', 'info'].includes(activeTab) && isManager && editingEvent?.type !== 'BIO' && (
                                                <TestTab
                                                    activeTab={activeTab}
                                                    testResults={form.testResults || {}}
                                                    setTestResults={form.setTestResults}
                                                    players={presentPlayers}
                                                    isEventHappened={isEventHappened}
                                                />
                                            )
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <EventFormUI
                                    {...form}
                                    isEditMode={!!editingEvent}
                                    lineups={lineups}
                                    handleToggleTest={(id) => form.setSelectedTests(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])}
                                    handleToggleDay={(d) => {
                                        // Режим "Радио": при клике на день недели выбираем только его
                                        form.setSelectedDays([d]);

                                        // УМНАЯ ФИШКА: сразу подтягиваем основную дату к выбранному дню
                                        const baseDate = form.eventDate ? new Date(form.eventDate) : new Date();
                                        const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
                                        const targetIndex = dayNames.indexOf(d);
                                        const currentIndex = baseDate.getDay();

                                        let diff = targetIndex - currentIndex;
                                        if (diff < 0) diff += 7;

                                        if (diff !== 0) {
                                            const newDate = new Date(baseDate);
                                            newDate.setDate(baseDate.getDate() + diff);
                                            form.setEventDate(newDate.toISOString().split('T')[0]);
                                        }
                                    }}
                                />
                            )}
                        </div>

                        <div className={styles.footer}>
                            {isViewMode ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                                    {(() => {
                                        // Manager edit logic (only past events for attendance/tests)
                                        const isManagerEditing = isManager && isEventHappened && editingEvent?.type !== 'BIO';

                                        // Player edit logic (only past events for rpe/bio)
                                        let isPlayerEditing = isPlayer && isEventFinished;

                                        // If player is trying to save bio, ensure it's the latest measurement
                                        if (isPlayerEditing && activeTab === 'BIOBANDING') {
                                            const lastDate = form.lastBioData?.event?.date || form.lastBioData?.date || "0000-00-00";
                                            const isLatest = !form.lastBioData ||
                                                (form.lastBioData.event?.id || form.lastBioData.eventId) === editingEvent?.id ||
                                                (form.eventDate >= lastDate);
                                            if (!isLatest) isPlayerEditing = false;
                                        }

                                        return (isManagerEditing || isPlayerEditing) && (
                                            <button className={styles.saveBtn} onClick={handleSaveTab}>СОХРАНИТЬ</button>
                                        );
                                    })()}
                                    {isManager && !isEventHappened && <button className={styles.saveBtn} style={{ opacity: 0.5 }} onClick={() => setIsViewMode(false)}>ИЗМЕНИТЬ</button>}
                                    {isManager && editingEvent && (
                                        <button
                                            className={styles.saveBtn}
                                            style={{
                                                background: 'rgba(234, 84, 85, 0.1)',
                                                color: '#ea5455',
                                                borderColor: 'rgba(234, 84, 85, 0.3)',
                                                marginTop: '4px'
                                            }}
                                            onClick={() => {
                                                if (editingEvent.groupId) setScopeSelector({ type: 'delete' });
                                                else confirmDelete('SINGLE');
                                            }}
                                        >
                                            УДАЛИТЬ СОБЫТИЕ
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <button className={styles.saveBtn} onClick={() => handleSubmit()}>{editingEvent ? 'ОБНОВИТЬ' : 'СОЗДАТЬ'}</button>
                            )}
                            <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '4px' }}>
                                <button className={styles.cancelBtn} onClick={onClose} style={{ flex: 1 }}>ЗАКРЫТЬ</button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {scopeSelector && (
                <div className={styles.overlay} style={{ zIndex: 3000, background: 'rgba(0,0,0,0.8)' }}>
                    <div className={styles.card} style={{ maxWidth: '320px', padding: '24px', alignItems: 'center', gap: '16px' }}>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center', color: '#fff' }}>
                            {scopeSelector.type === 'delete' ? 'УДАЛИТЬ СОБЫТИЕ?' : 'ОБНОВИТЬ СОБЫТИЕ?'}
                        </div>
                        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
                            {scopeSelector.type === 'delete'
                                ? 'Это событие является частью серии. Выберите область удаления:'
                                : 'Это событие является частью серии. Выберите область обновления:'}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                            <button className={styles.saveBtn} style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} onClick={() => {
                                if (scopeSelector.type === 'delete') confirmDelete('SINGLE');
                                else handleSubmit('SINGLE');
                                setScopeSelector(null);
                            }}>
                                ТОЛЬКО ЭТО
                            </button>

                            <button className={styles.saveBtn} style={{
                                borderColor: scopeSelector.type === 'delete' ? '#ea5455' : '#8bc34a',
                                color: scopeSelector.type === 'delete' ? '#ea5455' : '#8bc34a',
                                background: scopeSelector.type === 'delete' ? 'rgba(234, 84, 85, 0.1)' : 'rgba(139, 195, 74, 0.1)'
                            }} onClick={() => {
                                if (scopeSelector.type === 'delete') confirmDelete('ALL');
                                else handleSubmit('ALL');
                                setScopeSelector(null);
                            }}>
                                ВСЮ СЕРИЮ
                            </button>

                            <button className={styles.cancelBtn} onClick={() => setScopeSelector(null)}>
                                ОТМЕНА
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
}