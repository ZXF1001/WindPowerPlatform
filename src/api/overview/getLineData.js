import http from "@/utils/http/request.js";
//请求总览页的数据

export const getOverviewRecentLineData = () => http.get("/time_power_hhmmss");
export const getOverviewTimelyLineData = () => http.get("/timely_data");
