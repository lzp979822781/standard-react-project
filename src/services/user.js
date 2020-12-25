import request from "@/utils/request";

export async function query() {
    return request("/api1/users");
}

export async function queryCurrent() {
    return request("/api1/currentUser");
}
