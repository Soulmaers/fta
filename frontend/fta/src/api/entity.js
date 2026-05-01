import { apiFetch } from "./http";



export async function apiCreate(entity, userId, data) {
    console.log(userId, entity)
    console.log(data)
    return apiFetch(`/api/${entity}/create/${userId}`, {
        method: "POST",
        body: data,
    });
}


export async function apiGet(entity, userId) {
    console.log(entity, userId)
    return apiFetch(`/api/${entity}/${userId}`, {
        method: "GET",
    });
}

export async function apiUpdate(entity, entityId, data) {
    console.log(data)
    return apiFetch(`/api/${entity}/${entityId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: data,
    });
}

export async function apiDelete(entity, entityId, userId) {
    console.log(entity, entityId, userId)
    return apiFetch(`/api/${entity}/${entityId}?userId=${userId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        }
    });
}

export async function apiSyncAssignments(entity, userId, data) {
    return apiFetch(`/api/${entity}/sync-assignments/${userId}`, {
        method: "POST",
        body: data,
    });
}






