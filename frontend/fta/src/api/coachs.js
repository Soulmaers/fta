import { apiFetch } from "./http";



export async function createCoach(userId, data) {
    console.log(userId)
    console.log(data)
    return apiFetch(`/api/coach/create/${userId}`, {
        method: "POST",
        body: data,
    });
}