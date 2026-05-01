import { useState, useEffect } from "react";
import { apiFetch } from "../../api/http";

export function useEventForm(editingEvent, isOpen, players, auth, resetTrigger) {
    // Form fields
    const [eventType, setEventType] = useState('TRAINING');
    const [selectedLineupId, setSelectedLineupId] = useState(null);
    const [eventDate, setEventDate] = useState("");
    const [startTime, setStartTime] = useState("18:00");
    const [endTime, setEndTime] = useState("19:30");
    const [location, setLocation] = useState("");

    const [isRepeating, setIsRepeating] = useState(false);
    const [repeatUntil, setRepeatUntil] = useState("");
    const [selectedDays, setSelectedDays] = useState([]);

    const [trainingType, setTrainingType] = useState('MAIN');
    const [isRpeEnabled, setIsRpeEnabled] = useState(true);
    const [selectedTests, setSelectedTests] = useState([]);

    // Interaction fields
    const [attendance, setAttendance] = useState({});
    const [testResults, setTestResults] = useState({});
    const [playerRpe, setPlayerRpe] = useState(0);

    // Bio fields
    const [bioWeight, setBioWeight] = useState("");
    const [bioHeight, setBioHeight] = useState("");
    const [bioSittingHeight, setBioSittingHeight] = useState("");
    const [bioFatherHeight, setBioFatherHeight] = useState("");
    const [bioMotherHeight, setBioMotherHeight] = useState("");
    const [currentPlayerData, setCurrentPlayerData] = useState(null);
    const [playerStatusAtEvent, setPlayerStatusAtEvent] = useState(null);
    const [lastBioData, setLastBioData] = useState(null);

    const updateTestResult = (playerId, testType, value) => {
        setTestResults(prev => ({
            ...prev,
            [playerId]: {
                ...(prev[playerId] || {}),
                [testType]: value
            }
        }));
    };

    const resetForm = () => {
        setEventType('TRAINING');
        setSelectedLineupId(null);
        setEventDate("");
        setStartTime("18:00");
        setEndTime("19:30");
        setLocation("");
        setIsRepeating(false);
        setRepeatUntil("");
        setSelectedDays([]);
        setTrainingType('MAIN');
        setIsRpeEnabled(true);
        setSelectedTests([]);
        setAttendance({});
        setTestResults({});
        setPlayerRpe(0);
        setBioWeight("");
        setBioHeight("");
        setBioSittingHeight("");
        setBioFatherHeight("");
        setBioMotherHeight("");
        setCurrentPlayerData(null);
        setPlayerStatusAtEvent(null);
        setLastBioData(null);
    };

    useEffect(() => {
        if (!isOpen) resetForm();
    }, [isOpen, resetTrigger]);

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (editingEvent && isOpen) {
            setIsLoading(true);
            setEventType(editingEvent.type || 'TRAINING');
            setEventDate(editingEvent.date || '');
            setStartTime(editingEvent.startTime?.substring(0, 5) || '18:00');
            setEndTime(editingEvent.endTime?.substring(0, 5) || '19:30');
            setLocation(editingEvent.location || '');

            if (editingEvent.squads && editingEvent.squads.length > 0) {
                if (editingEvent.squads.length > 1) {
                    setSelectedLineupId(null);
                } else {
                    setSelectedLineupId(editingEvent.squads[0].id);
                }
            } else {
                setSelectedLineupId(editingEvent.lineupId || null);
            }

            setIsRepeating(!!editingEvent.groupId);
            setRepeatUntil(editingEvent.repeatUntil || "");

            let initialDays = editingEvent.daysOfWeek || [];
            if (editingEvent.groupId && initialDays.length === 0 && editingEvent.date) {
                const d = new Date(editingEvent.date);
                const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
                initialDays = [dayNames[d.getDay()]];
            }
            setSelectedDays(initialDays.slice(0, 1)); // Только один день для серии

            if (editingEvent.trainingDetails) {
                setTrainingType(editingEvent.trainingDetails.subtype || 'MAIN');
                setIsRpeEnabled(editingEvent.trainingDetails.rpeEnabled ?? true);
                setSelectedTests(editingEvent.trainingDetails.testTypes || []);
            }

            const fetchPromises = [];

            if (auth?.role === 'PLAYER') {
                fetchPromises.push(
                    apiFetch(`/api/players/profile/${auth.id}`)
                        .then(data => {
                            setCurrentPlayerData(data);
                            if (data.fatherHeight) setBioFatherHeight(data.fatherHeight);
                            if (data.motherHeight) setBioMotherHeight(data.motherHeight);
                        })
                        .catch(e => console.error("Error loading player profile", e))
                );

                if (editingEvent?.date) {
                    fetchPromises.push(
                        apiFetch(`/api/players/profile/${auth.id}/status-at?date=${editingEvent.date}`)
                            .then(data => setPlayerStatusAtEvent(data?.status || null))
                            .catch(e => console.error("Error loading player status for event date", e))
                    );
                }

                fetchPromises.push(
                    apiFetch(`/api/events/bio/last/${auth.id}`)
                        .then(data => setLastBioData(data))
                        .catch(e => console.error("Error loading last bio measurement", e))
                );

                // Fetch data SPECIFIC to this event if it exists
                fetchPromises.push(
                    apiFetch(`/api/events/${editingEvent.id}/bio?playerId=${auth.id}`, { token: auth?.token })
                        .then(data => {
                            if (data) {
                                if (data.weight !== undefined && data.weight !== null) setBioWeight(data.weight);
                                if (data.height !== undefined && data.height !== null) setBioHeight(data.height);
                                if (data.sittingHeight !== undefined && data.sittingHeight !== null) setBioSittingHeight(data.sittingHeight);
                                if (data.fatherHeight) setBioFatherHeight(data.fatherHeight);
                                if (data.motherHeight) setBioMotherHeight(data.motherHeight);
                            }
                        })
                        .catch(e => console.log("No specific bio data for this event yet"))
                );

                fetchPromises.push(
                    apiFetch(`/api/events/${editingEvent.id}/rpe?playerId=${auth.id}`, { token: auth?.token })
                        .then(data => {
                            if (data && (data.rpeValue !== undefined && data.rpeValue !== null)) {
                                setPlayerRpe(Number(data.rpeValue));
                            }
                        })
                        .catch(e => console.log("No ИВН data for this event yet"))
                );
            }

            const cacheKeyAtt = `fta_v2_draft_att_${editingEvent.id}`;
            const cacheKeyTest = `fta_v2_draft_test_${editingEvent.id}`;
            const cachedAtt = localStorage.getItem(cacheKeyAtt);
            const cachedTest = localStorage.getItem(cacheKeyTest);

            let initialAtt = cachedAtt ? JSON.parse(cachedAtt) : {};
            let initialTest = cachedTest ? JSON.parse(cachedTest) : {};

            const eDate = editingEvent.date || '';
            const eTime = editingEvent.startTime?.substring(0, 5) || '18:00';
            const isHappenedThen = new Date(`${eDate}T${eTime}`) <= new Date();

            if (isHappenedThen && !cachedAtt) {
                (players || []).forEach(p => {
                    const isNotReady = p.status === 'INJURED' || p.status === 'SICK' || p.healthStatus === 'INJURED' || p.healthStatus === 'SICK';
                    initialAtt[p.id] = isNotReady ? 2 : 0;
                });
            }

            setAttendance(initialAtt);
            setTestResults(initialTest);

            // Fetch server-side test results
            fetchPromises.push(
                apiFetch(`/api/events/${editingEvent.id}/tests`)
                    .then(data => {
                        if (data && Array.isArray(data)) {
                            setTestResults(prev => {
                                const newTests = { ...prev };
                                data.forEach(item => {
                                    const pId = item.player?.id;
                                    const tType = item.testType;
                                    if (pId && tType) {
                                        if (!newTests[pId]) newTests[pId] = {};
                                        newTests[pId][tType] = item.testValue;
                                    }
                                });
                                return newTests;
                            });
                        }
                    })
                    .catch(e => console.error("Error loading tests from server", e))
            );

            // Fetch server-side attendance
            fetchPromises.push(
                apiFetch(`/api/events/${editingEvent.id}/attendance`)
                    .then(data => {
                        if (data && Array.isArray(data)) {
                            setAttendance(prev => {
                                const newAtt = { ...prev };
                                data.forEach(item => {
                                    const val = item.status === 'LATE' ? 1 : item.status === 'ABSENT' ? 2 : 0;
                                    newAtt[item.playerId] = val;
                                });
                                return newAtt;
                            });
                        }
                    })
                    .catch(e => console.error("Error loading attendance from server", e))
            );

            Promise.allSettled(fetchPromises).finally(() => {
                setIsLoading(false);
            });
        }
    }, [editingEvent, isOpen, players, auth]);

    // Cleanup on close to prevent state leak
    useEffect(() => {
        if (!isOpen) {
            setAttendance({});
            setTestResults({});
            setPlayerRpe(null);
            setBioWeight('');
            setBioHeight('');
            setBioSittingHeight('');
            setBioFatherHeight('');
            setBioMotherHeight('');
            setPlayerStatusAtEvent(null);
            setLastBioData(null);

            // Explicitly clear Drafts from memory (not necessarily from localStorage 
            // yet, unless you want that, but closing without save should keep draft)
        }
    }, [isOpen]);

    // Autosave drafts to localStorage
    useEffect(() => {
        if (isOpen && editingEvent?.id) {
            if (Object.keys(attendance).length > 0) {
                localStorage.setItem(`fta_v2_draft_att_${editingEvent.id}`, JSON.stringify(attendance));
            }
            if (Object.keys(testResults).length > 0) {
                localStorage.setItem(`fta_v2_draft_test_${editingEvent.id}`, JSON.stringify(testResults));
            }
        }
    }, [attendance, testResults, isOpen, editingEvent?.id]);

    const [recurringEventsCount, setRecurringEventsCount] = useState(0);

    // Авто-выбор дня недели при изменении даты (только для новых или при создании серии)
    useEffect(() => {
        if (eventDate && !editingEvent) {
            const d = new Date(eventDate);
            const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
            setSelectedDays([dayNames[d.getDay()]]);
        }
    }, [eventDate, editingEvent]);

    useEffect(() => {
        if (isRepeating && eventDate && repeatUntil && selectedDays.length > 0) {
            let count = 0;
            let current = new Date(eventDate);
            const end = new Date(repeatUntil);
            const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

            // Limit loop to avoid browser hang
            let safety = 0;
            while (current <= end && safety < 1000) {
                if (selectedDays.includes(dayNames[current.getDay()])) {
                    count++;
                }
                current.setDate(current.getDate() + 1);
                safety++;
            }
            setRecurringEventsCount(count);
        } else {
            setRecurringEventsCount(0);
        }
    }, [isRepeating, eventDate, repeatUntil, selectedDays]);

    return {
        eventType, setEventType,
        selectedLineupId, setSelectedLineupId,
        eventDate, setEventDate,
        startTime, setStartTime,
        endTime, setEndTime,
        location, setLocation,
        isRepeating, setIsRepeating,
        repeatUntil, setRepeatUntil,
        selectedDays, setSelectedDays,
        trainingType, setTrainingType,
        isRpeEnabled, setIsRpeEnabled,
        selectedTests, setSelectedTests,
        attendance, setAttendance,
        testResults, setTestResults: updateTestResult,
        playerRpe, setPlayerRpe,
        bioWeight, setBioWeight,
        bioHeight, setBioHeight,
        bioSittingHeight, setBioSittingHeight,
        bioFatherHeight, setBioFatherHeight,
        bioMotherHeight, setBioMotherHeight,
        currentPlayerData, lastBioData,
        playerStatusAtEvent,
        recurringEventsCount,
        isLoading
    };
}