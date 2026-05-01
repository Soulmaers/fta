import React, { createContext, useContext, useMemo, useState, useCallback } from "react";

import { apiGet, apiCreate, apiUpdate, apiDelete, apiSyncAssignments } from "../api/entity";

const TeamsContext = createContext(null);

export function EntityProvider({ children }) {
    const [data, setData] = useState({
        teams: [],
        players: [],
        coaches: [],
        lineups: [],
    });
    const [loaded, setLoaded] = useState({
        teams: false,
        players: false,
        coaches: false,
        lineups: false,
    });

    const clearData = useCallback(() => {
        setData({
            teams: [],
            players: [],
            coaches: [],
            lineups: [],
        });
        setLoaded({
            teams: false,
            players: false,
            coaches: false,
            lineups: false,
        });
    }, []);

    // Use refs to keep load constant but still have access to latest data
    const dataRef = React.useRef(data);
    const loadedRef = React.useRef(loaded);

    React.useEffect(() => {
        dataRef.current = data;
        loadedRef.current = loaded;
    }, [data, loaded]);

    const load = useCallback(async (entity, userId, forceRefresh = false) => {
        if (!forceRefresh && loadedRef.current[entity]) return dataRef.current[entity];
        const list = await apiGet(entity, userId);
        setData(prev => ({ ...prev, [entity]: list }));
        setLoaded(prev => ({ ...prev, [entity]: true }));
        return list;
    }, []);

    const create = useCallback(async (entity, userId, payload) => {
        const created = await apiCreate(entity, userId, payload)       // обновляем локально список
        setData(prev => ({
            ...prev,
            [entity]: [created, ...prev[entity]],
        }));

        return created;
    }, []);

    const update = useCallback(async (entity, id, payload) => {
        const updated = await apiUpdate(entity, id, payload);

        setData(prev => ({
            ...prev,
            [entity]: prev[entity].map(x => x.id === id ? updated : x),
        }));

        return updated;
    }, []);

    const del = useCallback(async (entity, id, userId) => {
        console.log(entity, id, userId)
        const del = await apiDelete(entity, id, userId);
        setData(prev => ({
            ...prev,
            [entity]: prev[entity].filter(x => x.id !== id),
        }));

        return del;
    }, []);

    const [selectedTeamId, setSelectedTeamId] = useState(() => {
        return localStorage.getItem('fta_selected_team_id') || null;
    });

    const selectTeam = useCallback((id) => {
        setSelectedTeamId(id);
        if (id) {
            localStorage.setItem('fta_selected_team_id', id);
        } else {
            localStorage.removeItem('fta_selected_team_id');
        }
    }, []);

    const syncAssignments = useCallback(async (entity, userId, payload) => {
        const updatedList = await apiSyncAssignments(entity, userId, payload);
        setData(prev => ({
            ...prev,
            [entity]: updatedList,
        }));
        return updatedList;
    }, []);

    const value = useMemo(() => {
        return {
            data,
            loaded,
            setData,
            load,
            create,
            update,
            del,
            syncAssignments,
            clearData,
            selectedTeamId,
            selectTeam
        };
    }, [data, loaded, load, create, update, del, syncAssignments, clearData, selectedTeamId, selectTeam]);

    return <TeamsContext.Provider value={value}>{children}</TeamsContext.Provider>;
}

export function useTeams() {
    const ctx = useContext(TeamsContext);
    if (!ctx) throw new Error("useTeams must be used inside <TeamsProvider>");
    return ctx;
}
