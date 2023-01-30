import http from "@/utils/http/requestMyApi.js";

export const createTable = (data) => http.post("/wind/create-table", data);
export const upload2DB = (data) => http.post("/wind/insert-data", data);
