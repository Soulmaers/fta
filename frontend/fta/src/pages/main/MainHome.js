import React, { useState, useEffect, useRef, useMemo } from "react";
import styles from "./MainHome.module.css";
import {
    FaUser, FaHome, FaChartBar, FaClipboardList, FaCog, FaPlus,
    FaFutbol, FaHeartbeat, FaCheck, FaRegCalendarAlt, FaTrophy, FaShieldAlt, FaChevronRight, FaChild
} from "react-icons/fa";
import { IoPerson } from 'react-icons/io5';
import { useAuth } from "../../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useTeams } from "../../context/EntityContext";
import CalendarStrip from "../../components/calendar/CalendarStrip";
import EventCreateModal from "../../components/events/EventCreateModal";
import { apiFetch } from "../../api/http";

export default function MainHome() {
    const nav = useNavigate();
    const { auth } = useAuth();
    const { data: entityData, load: loadEntities, selectedTeamId, selectTeam } = useTeams();
    const isManager = auth?.role === 'MANAGER';
    const isPlayer = auth?.role === 'PLAYER';
    console.log('[DEBUG] auth object:', JSON.stringify(auth, null, 2));

    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isTeamSelectorOpen, setTeamSelectorOpen] = useState(false);
    const [events, setEvents] = useState([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);
    const [editingEvent, setEditingEvent] = useState(null);
    const [storageUpdate, setStorageUpdate] = useState(0);
    const [showOnlyPending, setShowOnlyPending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('home'); // 'home', 'team', 'stats', 'reports'
    const [selectedLineupId, setSelectedLineupId] = useState('all');

    const teamsSorted = useMemo(() => {
        if (!entityData?.teams) return [];
        return [...entityData.teams].sort((a, b) => a.id - b.id);
    }, [entityData?.teams]);

    const activeTeam = useMemo(() => {
        if (teamsSorted.length === 0) return null;
        if (!selectedTeamId) {
            const firstId = String(teamsSorted[0].id);
            selectTeam(firstId); // Сразу выбираем первую если нет выбора
            return teamsSorted[0];
        }
        return teamsSorted.find(t => String(t.id) === String(selectedTeamId)) || teamsSorted[0];
    }, [teamsSorted, selectedTeamId, selectTeam]);

    const teamLogo = activeTeam?.logoUrl || null;
    const teamName = activeTeam?.fullName || activeTeam?.nameTeam || activeTeam?.name || (isLoadingEvents ? "Загрузка..." : "Команда");
    const teamAge = activeTeam?.foundedYear || "";

    const stripRef = useRef(null);
    const eventsScrollRef = useRef(null);
    const isFirstStripMount = useRef(true);
    const isFirstEventsMount = useRef(true);

    useEffect(() => {
        const handleStorage = () => setStorageUpdate(prev => prev + 1);
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // Сегодняшняя дата
    const today = useMemo(() => new Date(), []);

    const days = useMemo(() => {
        const start = new Date(2025, 8, 1);
        const end = new Date(2026, 7, 31);
        const arr = [];
        const weekDays = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
        let current = new Date(start);
        let index = 0;
        while (current <= end) {
            arr.push({
                id: index,
                d: current.getDate(),
                m: current.getMonth(),
                w: weekDays[current.getDay()],
                full: new Date(current)
            });
            current.setDate(current.getDate() + 1);
            index++;
        }
        return arr;
    }, []);

    // Вычисляем ID сегодняшней даты в массиве
    const todayId = useMemo(() => {
        const start = new Date(2025, 8, 1);
        const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const diff = Math.floor((t - start) / (1000 * 60 * 60 * 24));
        return Math.max(0, Math.min(diff, days.length - 1));
    }, [today, days]);

    const [selectedDayId, setSelectedDayId] = useState(todayId);

    // Центрируем календарь на выбранном дне
    useEffect(() => {
        if (stripRef.current && selectedDayId !== null) {
            const container = stripRef.current;
            const activeChip = container.children[selectedDayId];
            if (activeChip) {
                const scrollLeft = activeChip.offsetLeft - container.offsetWidth / 2 + activeChip.offsetWidth / 2;
                if (isFirstStripMount.current) {
                    container.scrollLeft = scrollLeft;
                    isFirstStripMount.current = false;
                } else {
                    container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
                }
            }
        }
    }, [selectedDayId]);

    // При возвращении на вкладку "Домой" лента может быть еще не смонтирована в момент клика.
    // Этот эффект безопасно доцентрирует календарь уже после монтирования.
    useEffect(() => {
        if (activeTab !== 'home') return;
        if (!stripRef.current) return;
        const targetDayId = selectedDayId ?? todayId;
        const container = stripRef.current;
        const activeChip = container.children[targetDayId];
        if (!activeChip) return;
        const scrollLeft = activeChip.offsetLeft - container.offsetWidth / 2 + activeChip.offsetWidth / 2;
        container.scrollLeft = scrollLeft;
    }, [activeTab, selectedDayId, todayId]);

    // Скроллим ленту к событиям выбранной даты (внутренний скролл без прыжков всей страницы)
    useEffect(() => {
        if (selectedDayId !== null && events.length > 0 && eventsScrollRef.current) {
            const d = days[selectedDayId].full;
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const container = eventsScrollRef.current;
            const el = container.querySelector(`[data-event-date="${dateStr}"]`);

            if (el) {
                const rect = el.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                // Рассчитываем позицию относительно контейнера
                // С учетом текущего скролла контейнера
                const relativeTop = rect.top - containerRect.top + container.scrollTop;
                const targetScroll = relativeTop - (containerRect.height / 2) + (rect.height / 2);

                const isFirst = isFirstEventsMount.current;
                container.scrollTo({
                    top: Math.max(0, targetScroll),
                    behavior: isFirst ? 'auto' : 'smooth'
                });
                if (isFirst) {
                    isFirstEventsMount.current = false;
                }
            }
        }
    }, [selectedDayId, events, days]);

    useEffect(() => {
        if (auth?.id) {
            loadEvents();
            loadEntities('teams', auth.id);
            loadEntities('lineups', auth.id);
            loadEntities('players', auth.id);
        }
    }, [auth]);

    const loadEvents = async () => {
        if (!auth?.id) return;
        setIsLoadingEvents(true);
        try {
            const data = await apiFetch(`/api/events/${auth.id}`);
            const rawEvents = data || [];

            if (isPlayer && rawEvents.length > 0) {
                const statusDates = Array.from(
                    new Set(
                        rawEvents
                            .filter(ev => ev?.date && (ev.type === 'TRAINING' || ev.type === 'BIO'))
                            .map(ev => ev.date)
                    )
                );

                const statusEntries = await Promise.all(
                    statusDates.map(async (date) => {
                        try {
                            const resp = await apiFetch(`/api/players/profile/${auth.id}/status-at?date=${date}`);
                            return [date, resp?.status || null];
                        } catch {
                            return [date, null];
                        }
                    })
                );

                const statusByDate = Object.fromEntries(statusEntries);
                setEvents(rawEvents.map(ev => ({ ...ev, playerStatusAtDate: statusByDate[ev.date] || null })));
            } else {
                setEvents(rawEvents);
            }
        } catch (e) {
            console.error("Failed to load events", e);
        } finally {
            setIsLoadingEvents(false);
        }
    };

    const handleSaveEvent = async (payload, scope = 'SINGLE') => {
        if (payload.id) {
            await apiFetch(`/api/events/${payload.id}?scope=${scope}`, {
                method: 'PUT',
                body: { ...payload, managerId: auth?.id }
            });
        } else {
            await apiFetch('/api/events', {
                method: 'POST',
                body: { ...payload, managerId: auth?.id }
            });
        }
        loadEvents();
        setCreateModalOpen(false);
        setEditingEvent(null);
    };

    const handleRemoveEvent = async (eventId, scope = 'SINGLE') => {
        await apiFetch(`/api/events/${eventId}?scope=${scope}`, { method: 'DELETE' });
        loadEvents();
    };

    const { sortedEvents, totalPendingTasks } = useMemo(() => {
        let total = 0;

        // Фильтруем события по активной команде и выбранному составу
        let filtered = events;
        if (activeTeam?.id) {
            filtered = filtered.filter(ev => String(ev.teamId) === String(activeTeam.id));
        }

        // Доп. фильтр по составу (если не выбрано "Все")
        if (selectedLineupId !== 'all') {
            filtered = filtered.filter(ev =>
                ev.squads && ev.squads.some(s => String(s.id) === String(selectedLineupId))
            );
        }

        let mapped = filtered.map(ev => {
            let pendingTasks = 0;
            const isEventHappened = ev.date
                ? new Date(`${ev.date}T${(ev.startTime?.substring(0, 5) || '00:00')}`) <= new Date()
                : false;

            if (isEventHappened && (ev.type === 'TRAINING' || ev.type === 'BIO')) {
                let totalTasks = 0;
                const tests = ev.trainingDetails?.testTypes || [];

                if (isManager) {
                    if (ev.type === 'TRAINING') {
                        totalTasks = 1; // Attendance
                        totalTasks += tests.filter(t => t !== 'BIOBANDING').length;
                    } else {
                        totalTasks = 0;
                    }
                } else if (isPlayer) {
                    const wasReadyAtEventDate = (ev.playerStatusAtDate || 'READY') === 'READY';
                    if (ev.type === 'TRAINING' && wasReadyAtEventDate) {
                        if (ev.trainingDetails?.rpeEnabled !== false) totalTasks += 1;
                        if (tests.includes('BIOBANDING')) totalTasks += 1;
                    } else if (ev.type === 'BIO') {
                        // BIO доступен для игрока в любом статусе (READY/SICK/INJURED)
                        totalTasks = 1;
                    }
                }

                // Check server-side completed status
                const serverCompleted = ev.userCompletedTasks || [];
                // Check local storage (for persistence after save or offline)
                const tasksKey = `fta_tasks_${auth?.id}_${ev.id}`;
                const localCompleted = JSON.parse(localStorage.getItem(tasksKey) || '[]');

                const completedSet = new Set([...serverCompleted, ...localCompleted]);

                let completedCount = 0;
                if (isManager) {
                    if (ev.type === 'TRAINING') {
                        if (completedSet.has('attendance')) completedCount++;
                        tests.forEach(t => {
                            if (t !== 'BIOBANDING' && completedSet.has(t)) completedCount++;
                        });
                    }
                } else if (isPlayer) {
                    if (ev.type === 'TRAINING') {
                        if (completedSet.has('rpe')) completedCount++;
                        if (completedSet.has('BIOBANDING')) completedCount++;
                    } else if (ev.type === 'BIO') {
                        if (completedSet.has('BIOBANDING')) completedCount = 1;
                    }
                }

                pendingTasks = Math.max(0, totalTasks - completedCount);
            }
            // Только считаем в ГЛОБАЛЬНЫЙ бейдж задачи за последние 30 дней
            if (pendingTasks > 0 && ev.date) {
                const evDate = new Date(ev.date);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                if (evDate >= thirtyDaysAgo) {
                    total += pendingTasks;
                }
            }

            return { ...ev, computedPending: pendingTasks };
        });

        if (showOnlyPending) {
            mapped = mapped.filter(ev => ev.computedPending > 0);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            mapped = mapped.filter(ev => {
                const title = ev.type === 'MATCH'
                    ? `vs ${ev.opponent || 'Соперник'}`
                    : (ev.type === 'BIO' ? 'Замер (БИО)' : (ev.type === 'MEDICAL' ? 'Медосмотр' : 'Тренировка'));
                const loc = ev.location || '';
                const opp = ev.type === 'MATCH' ? (ev.opponent || '') : '';
                const subtypeName = ev.type === 'TRAINING'
                    ? (ev.trainingDetails?.subtype === 'OFP' ? 'ОФП' : 'Основная')
                    : '';
                const squadNames = ev.squads && ev.squads.length > 0
                    ? ev.squads.map(s => s.lineupName || s.name).join(' ')
                    : 'Все';
                const dateStr = ev.date ? ev.date.split('-').reverse().join('.') : '';

                let extras = '';
                if (ev.trainingDetails) {
                    if (ev.trainingDetails.rpeEnabled) extras += ' rpe рпе ивн';
                    if (ev.trainingDetails.testTypes?.includes('BIOBANDING')) extras += ' bio био замеры';

                    // Add all test types
                    const testMap = {
                        'JUMP': 'прыжок прыжки',
                        'SPEED_30M': 'скорость бег 30м',
                        'YO_YO': 'йо-йо yoyo yo-yo'
                    };
                    ev.trainingDetails.testTypes?.forEach(t => {
                        if (testMap[t]) extras += ` ${testMap[t]} ${t}`;
                        else extras += ` ${t}`;
                    });
                }

                const searchableString = `${title} ${loc} ${opp} ${subtypeName} ${squadNames} ${dateStr} ${extras}`.toLowerCase();
                return searchableString.includes(q);
            });
        }

        mapped.sort((a, b) => {
            const dateDiff = new Date(b.date) - new Date(a.date);
            if (dateDiff === 0) {
                return (b.startTime || '').localeCompare(a.startTime || '');
            }
            return dateDiff;
        });

        return { sortedEvents: mapped, totalPendingTasks: total };
    }, [events, isManager, isPlayer, storageUpdate, showOnlyPending, searchQuery, activeTeam]);

    // Автоматически выключаем фильтр «Задачи», если они кончились
    useEffect(() => {
        if (totalPendingTasks === 0 && showOnlyPending) {
            setShowOnlyPending(false);
        }
    }, [totalPendingTasks, showOnlyPending]);

    // Состав (теперь берём из каждого события в цикле)
    const activeLineup = entityData?.lineups?.[0]; // На будущее, если нужен дефолтный состав

    const renderTeamDashboard = () => {
        // Умный поиск составов: собираем ID всех составов, в которых числятся игроки текущей команды
        const teamLineupIds = new Set(
            entityData?.players
                ?.filter(p => String(p.teamId) === String(activeTeam?.id))
                .map(p => p.lineupId)
                .filter(id => id !== null && id !== undefined)
        );

        // Получаем сами объекты составов из общего списка по найденным ID
        const teamLineups = entityData?.lineups?.filter(l => teamLineupIds.has(l.id)) || [];

        // Фильтруем игроков для детальной статистики
        const teamPlayers = entityData?.players?.filter(p => {
            const isTargetTeam = String(p.teamId) === String(activeTeam?.id);
            const isTargetLineup = selectedLineupId === 'all' || String(p.lineupId) === String(selectedLineupId);
            return isTargetTeam && isTargetLineup;
        }) || [];

        const filteredPlayersCount = teamPlayers.length;

        // Распределение по позициям
        const posMap = { GK: 0, DEF: 0, MID: 0, FWD: 0, NONE: 0 };
        teamPlayers.forEach(p => {
            const pos = (p.position || '').toUpperCase();
            if (pos.includes('GOAL') || pos.includes('ВРТ') || pos === 'GK') posMap.GK++;
            else if (pos.includes('DEF') || pos.includes('ЗАЩ') || pos === 'DF') posMap.DEF++;
            else if (pos.includes('MID') || pos.includes('ПЗ') || pos === 'MF') posMap.MID++;
            else if (pos.includes('FOR') || pos.includes('НАП') || pos === 'FW') posMap.FWD++;
            else posMap.NONE++;
        });

        // Статистика по статусам
        const statusMap = { READY: 0, INJURED: 0, SICK: 0 };
        teamPlayers.forEach(p => {
            if (p.status === 'READY') statusMap.READY++;
            else if (p.status === 'INJURED') statusMap.INJURED++;
            else if (p.status === 'SICK') statusMap.SICK++;
        });

        // Определяем мок-соперников в зависимости от состава
        const currentLineupName = teamLineups.find(l => String(l.id) === selectedLineupId)?.lineupName || '';

        const mockMatches = [
            {
                id: 'mock1',
                opponent: "ФК Звезда",
                date: "2026-04-20",
                startTime: "12:00:00",
                lineupName: "АПЛ",
                lineupId: teamLineups.find(l => (l.lineupName || '').includes('АПЛ'))?.id
            },
            {
                id: 'mock2',
                opponent: "Северный пресс-2",
                date: "2026-04-22",
                startTime: "18:30:00",
                lineupName: "БЛ",
                lineupId: teamLineups.find(l => (l.lineupName || '').includes('БЛ'))?.id
            }
        ];

        // Ищем ближайший матч (БЕЗ фильтра по составу, только по команде)
        let upcomingMatch = events
            .filter(ev => ev.type === 'MATCH' && String(ev.teamId) === String(activeTeam?.id))
            .filter(ev => new Date(ev.date) >= new Date())
            .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

        if (!upcomingMatch) {
            upcomingMatch = mockMatches[0]; // Показываем самый ближайший мок
        }

        const mockForm = ['W', 'L', 'W', 'W', 'D']; // Форма всего клуба

        const aplMatch = mockMatches[0];
        const blMatch = mockMatches[1];

        // Статистика турниров (Моки)
        const tournamentStats = {
            APL: { wins: 14, draws: 2, losses: 1, rank: 3 },
            BL: { wins: 5, draws: 2, losses: 8, rank: 11 }
        };

        // Статистика турниров всегда ОБЩАЯ по клубу
        const currentStats = {
            wins: tournamentStats.APL.wins + tournamentStats.BL.wins,
            draws: tournamentStats.APL.draws + tournamentStats.BL.draws,
            losses: tournamentStats.APL.losses + tournamentStats.BL.losses,
            rank: tournamentStats.APL.rank // Показываем ранг основного состава
        };

        return (
            <div className={styles.teamDashboard}>
                {/* Переключатель составов (Pills) */}
                <div className={styles.lineupSwitcherContainer}>
                    <div className={styles.lineupSwitcher}>
                        <button
                            className={`${styles.lineupPill} ${selectedLineupId === 'all' ? styles.lineupPillActive : ''}`}
                            onClick={() => setSelectedLineupId('all')}
                        >
                            Все
                        </button>
                        {teamLineups.map(l => (
                            <button
                                key={l.id}
                                className={`${styles.lineupPill} ${selectedLineupId === String(l.id) ? styles.lineupPillActive : ''}`}
                                onClick={() => setSelectedLineupId(String(l.id))}
                            >
                                {l.lineupName || l.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.bentoGrid}>
                    {/* КАРТОЧКА: СОСТАВ */}
                    <div className={`${styles.bentoCard} ${styles.cardLarge}`} onClick={() => alert('Список игроков в разработке')}>
                        <div className={styles.cardOverlay} />
                        <div className={styles.cardContent}>
                            <div className={styles.cardHeader}>
                                <FaUser className={styles.cardIcon} />
                                <span className={styles.cardTitle}>СОСТАВ</span>
                                <FaChevronRight className={styles.cardArrow} />
                            </div>
                            <div className={styles.squadPreview}>
                                <div className={styles.squadMainRow}>
                                    <div className={styles.squadCount}>{filteredPlayersCount}</div>
                                    <div className={styles.avatarStack}>
                                        {teamPlayers.slice(0, 8).map((p, i) => (
                                            <div key={p.id} className={styles.miniAvatar} style={{ zIndex: 10 - i, marginLeft: i === 0 ? 0 : -10 }}>
                                                {p.photoUrl ? <img src={p.photoUrl} alt="" /> : <IoPerson />}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.positionGrid}>
                                    <div className={styles.posItem}><span>GK</span> <strong>{posMap.GK}</strong></div>
                                    <div className={styles.posItem}><span>DF</span> <strong>{posMap.DEF}</strong></div>
                                    <div className={styles.posItem}><span>MF</span> <strong>{posMap.MID}</strong></div>
                                    <div className={styles.posItem}><span>FW</span> <strong>{posMap.FWD}</strong></div>
                                    {posMap.NONE > 0 && <div className={styles.posItem}><span>??</span> <strong>{posMap.NONE}</strong></div>}
                                </div>

                                {/* Мини-график ИВН (RPE) - за последние 5 дней */}
                                <div className={styles.rpeTrendContainer}>
                                    <span className={styles.rpeTrendLabel}>ИВН</span>
                                    <svg className={styles.rpeSvg} viewBox="0 0 100 30" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="rpeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#8bc34a" />
                                                <stop offset="40%" stopColor="#ffc107" />
                                                <stop offset="60%" stopColor="#ea5455" />
                                                <stop offset="100%" stopColor="#ffc107" />
                                            </linearGradient>
                                        </defs>
                                        <path
                                            d="M0,25 Q15,5 30,15 T60,10 T100,20"
                                            fill="none"
                                            stroke="url(#rpeGradient)"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </div>

                                {/* Статусы (Готовность) */}
                                <div className={styles.statusSection}>
                                    <span className={styles.statusSectionLabel}>Готовность</span>
                                    <div className={styles.statusRow}>
                                        <div className={styles.statusChip} title="Готовы">
                                            <div className={`${styles.statusDot} ${styles.dotReady}`} />
                                            <span>{statusMap.READY}</span>
                                        </div>
                                        {(statusMap.INJURED > 0 || statusMap.SICK > 0) && (
                                            <>
                                                <div className={styles.statusChip} title="Травмированы">
                                                    <div className={`${styles.statusDot} ${styles.dotInjured}`} />
                                                    <span>{statusMap.INJURED}</span>
                                                </div>
                                                <div className={styles.statusChip} title="Болеют">
                                                    <div className={`${styles.statusDot} ${styles.dotSick}`} />
                                                    <span>{statusMap.SICK}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* КАРТОЧКА: МАТЧИ */}
                    <div className={`${styles.bentoCard} ${styles.cardMedium}`} onClick={() => alert('Календарь матчей в разработке')}>
                        <div className={styles.cardOverlay} />
                        <div className={styles.cardContent}>
                            <div className={styles.cardHeader}>
                                <FaFutbol className={styles.cardIcon} />
                                <span className={styles.cardTitle}>МАТЧИ <span className={styles.mockHint}>(заглушка!)</span></span>
                                <FaChevronRight className={styles.cardArrow} />
                            </div>

                            <div className={styles.matchBrief}>
                                <div className={styles.matchAfisha}>
                                    <div className={styles.matchTeamSide}>
                                        {activeTeam?.logoUrl ? (
                                            <img src={activeTeam.logoUrl} alt="Club" className={styles.afishaLogoBig} />
                                        ) : (
                                            <div className={styles.opponentLogoPlaceholder}>
                                                <FaShieldAlt />
                                            </div>
                                        )}
                                        <div className={styles.afishaTeamName}>{activeTeam?.fullName || activeTeam?.nameTeam || activeTeam?.name || 'Команда'}</div>
                                    </div>

                                    <div className={styles.afishaVsContainer}>
                                        <FaRegCalendarAlt className={styles.matchStatusIcon} />
                                        <div className={styles.afishaVs}>VS</div>
                                    </div>

                                    <div className={styles.matchTeamSide}>
                                        {upcomingMatch.opponentLogo ? (
                                            <img src={upcomingMatch.opponentLogo} alt="Opponent" className={styles.afishaLogoBig} />
                                        ) : (
                                            <div className={styles.opponentLogoPlaceholder}>
                                                <FaShieldAlt />
                                            </div>
                                        )}
                                        <div className={styles.afishaTeamName}>{upcomingMatch.opponent}</div>
                                    </div>
                                </div>
                                <div className={styles.matchInfoRow}>
                                    <div className={styles.matchLeagueLabelBadge}>{(upcomingMatch.league || 'СИЛ АПЛ').replace(' 2024', '')}</div>
                                    <div className={styles.matchDetailsRow}>
                                        <div className={styles.matchDateTime}>
                                            <span className={styles.matchTime}>{upcomingMatch.startTime?.substring(0, 5)}</span>
                                            <span className={styles.matchDateDivider}>/</span>
                                            <span className={styles.matchDayShort}>{new Date(upcomingMatch.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                                        </div>
                                        <div className={styles.matchLocation}>
                                            {upcomingMatch.location || 'Энерджи Арена'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* КАРТОЧКА: ТУРНИРЫ */}
                    <div className={`${styles.bentoCard} ${styles.cardMedium}`} onClick={() => alert('Турнирные таблицы в разработке')}>
                        <div className={styles.cardOverlay} />
                        <div className={styles.cardContent}>
                            <div className={styles.cardHeader}>
                                <FaTrophy className={styles.cardIcon} />
                                <span className={styles.cardTitle}>ТУРНИРЫ <span className={styles.mockHint}>(заглушка!)</span></span>
                                <FaChevronRight className={styles.cardArrow} />
                            </div>

                            <div className={styles.tournamentBrief}>
                                <div className={styles.leagueList}>
                                    {[
                                        { name: 'СИЛ АПЛ', form: ['W', 'W', 'D', 'W', 'W'] },
                                        { name: 'СИЛ БЛ', form: ['L', 'L', 'D', 'W', 'L'] },
                                        { name: 'Лиговская лига', form: ['W', 'D', 'W', 'L', 'W'] }
                                    ].map((league, idx) => (
                                        <div key={idx} className={styles.leagueRow}>
                                            <div className={styles.leagueName}>{league.name}</div>
                                            <div className={styles.leagueFormDots}>
                                                {league.form.map((res, i) => (
                                                    <div key={i} className={`${styles.formDotMini} ${styles['dot' + res]}`} />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div
            className={styles.screen}
            style={activeTab === 'team' ? {
                backgroundImage: 'linear-gradient(rgba(11, 16, 32, 0.85), rgba(11, 16, 32, 0.85)), url(/backgrounds/team_bg.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'background 0.5s ease-in-out'
            } : {}}
        >
            {isLoadingEvents && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: '#1a1a1a', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px'
                }}>
                    <div style={{
                        width: '50px', height: '50px', borderRadius: '50%',
                        border: '3px solid rgba(139, 195, 74, 0.2)',
                        borderTopColor: '#8bc34a',
                        animation: 'fta-spin 1s linear infinite'
                    }} />
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase' }}>
                        Загрузка...
                    </div>
                    <style>{`
                        @keyframes fta-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    `}</style>
                </div>
            )}

            <div className={styles.shell}>

                {/* Хедер */}
                <div
                    className={styles.header}
                    onClick={() => !isPlayer && setTeamSelectorOpen(!isTeamSelectorOpen)}
                    style={{ cursor: isPlayer ? 'default' : 'pointer' }}
                >
                    {activeTeam?.logoUrl ? (
                        <img src={activeTeam.logoUrl} className={styles.logoIconHeader} alt="logo" />
                    ) : (
                        <div className={`${styles.logoIconHeader} ${styles.logoPlaceholderHeader}`}>
                            <FaShieldAlt />
                        </div>
                    )}
                    <div className={styles.title}>
                        <div className={styles.titleMain}>
                            {teamName}
                            {!isPlayer && <span className={styles.chevronIcon}>▼</span>}
                        </div>
                        <div className={styles.titleSub}>{teamAge}</div>
                    </div>
                    <div
                        className={styles.iconBtn}
                        onClick={(e) => { e.stopPropagation(); nav('/profile'); }}
                        style={(auth?.coach?.photoUrl || auth?.player?.photoUrl) ? {
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '50%',
                            padding: 0,
                            width: 'auto',
                            height: 'auto',
                        } : {}}
                    >
                        {(auth?.coach?.photoUrl || auth?.player?.photoUrl) ? (
                            <img
                                src={auth.coach?.photoUrl || auth.player?.photoUrl}
                                alt="Profile"
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '2px solid #8bc34a',
                                    boxShadow: '0 0 8px rgba(139, 195, 74, 0.7), 0 0 16px rgba(139, 195, 74, 0.3)',
                                    display: 'block',
                                }}
                            />
                        ) : (
                            <FaUser size={19} />
                        )}
                    </div>

                    {/* Выпадающий список команд */}
                    {!isPlayer && isTeamSelectorOpen && (
                        <div className={styles.teamDropdown}>
                            <div className={styles.dropdownHeader}>ВАШИ КОМАНДЫ</div>
                            {teamsSorted.map(t => (
                                <div
                                    key={t.id}
                                    className={`${styles.teamOption} ${t.id === activeTeam?.id ? styles.teamOptionActive : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        selectTeam(t.id);
                                        setTeamSelectorOpen(false);
                                    }}
                                >
                                    {t.logoUrl ? (
                                        <img src={t.logoUrl} className={styles.dropdownTeamLogo} alt="" />
                                    ) : (
                                        <div className={`${styles.dropdownTeamLogo} ${styles.dropdownLogoPlaceholder}`}>
                                            <FaShieldAlt />
                                        </div>
                                    )}
                                    <span className={styles.dropdownTeamName}>{t.fullName || t.nameTeam || t.name}</span>
                                    {t.id === activeTeam?.id && <FaCheck className={styles.checkIcon} />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {isTeamSelectorOpen && <div className={styles.dropdownOverlay} onClick={() => setTeamSelectorOpen(false)} />}

                {/* Лента дат (показываем только на вкладке ДОМОЙ) */}
                {activeTab === 'home' && (
                    <CalendarStrip
                        stripRef={stripRef}
                        days={days}
                        selectedDayId={selectedDayId}
                        onSelectDay={setSelectedDayId}
                        events={sortedEvents}
                    />
                )}

                {/* Контент: Переключаемся между ТАБАМИ */}
                <div className={styles.mainContentArea}>
                    {activeTab === 'home' ? (
                        <div className={styles.content}>
                            <div className={styles.searchBar}>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '0 16px', width: '100%', boxSizing: 'border-box' }}>
                                    <input
                                        type="text"
                                        placeholder="Поиск событий..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        style={{
                                            flex: 1, padding: '8px 12px', borderRadius: '12px',
                                            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#fff', fontSize: '16px', outline: 'none'
                                        }}
                                    />
                                    {totalPendingTasks > 0 ? (
                                        <div
                                            className={styles.taskGlobalBadge}
                                            style={{
                                                background: showOnlyPending ? '#fff' : 'darkred',
                                                color: showOnlyPending ? 'darkred' : '#fff',
                                                border: showOnlyPending ? '2px solid darkred' : '1px solid rgba(255,255,255,0.3)',
                                            }}
                                            onClick={() => setShowOnlyPending(!showOnlyPending)}
                                        >
                                            {totalPendingTasks}
                                        </div>
                                    ) : (
                                        <div className={styles.taskDoneBadge}>
                                            <FaCheck color="#28c76f" size={14} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.eventsScrollContainer} ref={eventsScrollRef}>
                                <div className={styles.eventsContainer}>
                                    {sortedEvents.length === 0 ? (
                                        <div className={styles.emptyState}>
                                            <FaRegCalendarAlt size={48} className={styles.emptyIcon} />
                                            <div className={styles.emptyTitle}>У вас пока нет событий</div>
                                            <div className={styles.emptySub}>
                                                {searchQuery || showOnlyPending ? 'Попробуйте изменить фильтры или поиск' : 'Запланированные тренировки и матчи появятся здесь'}
                                            </div>
                                        </div>
                                    ) : sortedEvents.map(ev => {
                                        const evDateStr = ev.date;
                                        const d = days[selectedDayId]?.full;
                                        const selDateStr = d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : null;
                                        const isSelected = evDateStr === selDateStr;
                                        const dayNum = ev.date?.split('-')[2] || '??';
                                        const monthNum = ev.date?.split('-')[1];
                                        const monthName = monthNum ? ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК'][parseInt(monthNum, 10) - 1] : '';

                                        let icon = <img src="/icons/boot.png" style={{ width: 28 }} alt="boot" />;
                                        let title = 'Тренировка';
                                        let subtypeLabel = null;

                                        if (ev.type === 'MATCH') {
                                            icon = <FaFutbol size={24} color="#fff" />;
                                            title = `vs ${ev.opponent || 'Соперник'}`;
                                        } else if (ev.type === 'MEDICAL') {
                                            icon = <FaHeartbeat size={24} color="#ff3b30" />;
                                            title = 'Медосмотр';
                                        } else if (ev.type === 'BIO') {
                                            icon = <FaChild size={24} color="#fff" />;
                                            title = 'Замер (БИО)';
                                        } else if (ev.type === 'TRAINING') {
                                            subtypeLabel = ev.trainingDetails?.subtype === 'OFP' ? 'ОФП' : 'ОСНОВНАЯ';
                                        }

                                        const evLineupLabel = (() => {
                                            if (!ev.squads || ev.squads.length === 0) return 'Все';
                                            // BIO: при выборе нескольких составов не перечислять — одна пометка «Все»
                                            if (ev.type === 'BIO' && ev.squads.length > 1) return 'Все';
                                            return ev.squads.map(s => s.lineupName || s.name).join(', ');
                                        })();
                                        let pendingTasks = ev.computedPending;

                                        return (
                                            <div key={ev.id} className={`${styles.eventCard} ${isSelected ? styles.eventCardActive : ''}`} data-event-date={ev.date} onClick={() => setEditingEvent(ev)}>
                                                <div className={styles.eventTimeCol}>
                                                    <div className={styles.monthText}>{monthName}</div>
                                                    <div className={`${styles.dateText} ${isSelected ? styles.dateTextActive : ''}`}>{dayNum}</div>
                                                    {ev.type !== 'BIO' ? (
                                                        <div className={styles.timeRange}>
                                                            <div className={styles.timeText}>{ev.startTime?.substring(0, 5)}</div>
                                                            <div className={styles.timeDivider} />
                                                            <div className={styles.timeText}>{ev.endTime?.substring(0, 5)}</div>
                                                        </div>
                                                    ) : (
                                                        <div className={styles.timeRange}>
                                                            <div className={styles.timeText} style={{ opacity: 0.6 }}>—</div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={styles.eventIconWrap}>{icon}</div>
                                                <div className={styles.eventDetails}>
                                                    <div className={styles.eventTitle}>{title}</div>
                                                    <div className={styles.eventSub}>
                                                        {ev.type === 'BIO' ? 'Замеры' : (ev.location || 'Место не указано')}
                                                    </div>
                                                </div>
                                                <div className={styles.squadIndicator}>{evLineupLabel}</div>
                                                {subtypeLabel && <div className={styles.eventSubtype}>{subtypeLabel}</div>}
                                                {pendingTasks > 0 && <div className={styles.taskBadge}>{pendingTasks}</div>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'team' ? (
                        renderTeamDashboard()
                    ) : (
                        <div className={styles.emptyTab}>
                            <div className={styles.emptyTitle}>Раздел "{activeTab.toUpperCase()}"</div>
                            <div className={styles.emptySub}>Скоро здесь будет статистика и отчеты</div>
                        </div>
                    )}
                </div>

                {/* FAB */}
                {isManager && (
                    <button className={styles.fabBtn} onClick={() => setCreateModalOpen(true)}>
                        <FaPlus />
                    </button>
                )}

                <EventCreateModal
                    isOpen={isCreateModalOpen || !!editingEvent}
                    onClose={() => {
                        setCreateModalOpen(false);
                        setEditingEvent(null);
                    }}
                    onSave={handleSaveEvent}
                    onDelete={handleRemoveEvent}
                    editingEvent={editingEvent}
                    lineups={entityData?.lineups || []}
                    players={entityData?.players || []}
                    activeTeam={activeTeam}
                />

                {/* Нижняя навигация */}
                <div className={styles.bottomNav}>
                    <div className={`${styles.navItem} ${activeTab === 'home' ? styles.navActive : ''}`} onClick={() => {
                        setActiveTab('home');
                        setSelectedDayId(todayId);
                        setShowOnlyPending(false);
                        setSearchQuery('');
                        if (stripRef.current) {
                            const container = stripRef.current;
                            const activeChip = container.children[todayId];
                            if (activeChip) {
                                const scrollLeft = activeChip.offsetLeft - container.offsetWidth / 2 + activeChip.offsetWidth / 2;
                                container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
                            }
                        }
                    }}>
                        <FaHome className={styles.navIcon} />
                        <span className={styles.navText}>ДОМОЙ</span>
                    </div>
                    <div className={`${styles.navItem} ${activeTab === 'team' ? styles.navActive : ''}`} onClick={() => setActiveTab('team')}>
                        <FaShieldAlt className={styles.navIcon} style={{ opacity: activeTab === 'team' ? 1 : 0.5 }} />
                        <span className={styles.navText} style={{ opacity: activeTab === 'team' ? 1 : 0.5 }}>КОМАНДА</span>
                    </div>
                    <div className={`${styles.navItem} ${activeTab === 'stats' ? styles.navActive : ''}`} onClick={() => setActiveTab('stats')}>
                        <FaChartBar className={styles.navIcon} style={{ opacity: activeTab === 'stats' ? 1 : 0.5 }} />
                        <span className={styles.navText} style={{ opacity: activeTab === 'stats' ? 1 : 0.5 }}>АНАЛИТИКА</span>
                    </div>
                    <div className={`${styles.navItem} ${activeTab === 'reports' ? styles.navActive : ''}`} onClick={() => setActiveTab('reports')}>
                        <FaClipboardList className={styles.navIcon} style={{ opacity: activeTab === 'reports' ? 1 : 0.5 }} />
                        <span className={styles.navText} style={{ opacity: activeTab === 'reports' ? 1 : 0.5 }}>ОТЧЕТЫ</span>
                    </div>
                    {auth?.role === 'MANAGER' && (
                        <div className={styles.navItem} onClick={() => nav('/config')}>
                            <FaCog className={styles.navIcon} />
                            <span className={styles.navText}>КОНФИГ</span>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}