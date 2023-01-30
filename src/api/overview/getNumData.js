import http from "@/utils/http/request.js";
//请求总览页的数据
export const getOverviewNumData = () => http.get("/overview_data");
