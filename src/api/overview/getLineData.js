import http from "../../utils/request.js";
//请求总览页的数据

export const getOverviewRecentLineData = () => {
  // 获取初始的折线图数据
  return http.get("/time_power_hhmmss");
};
export const getOverviewTimelyLineData = () => {
  // 获取实时折线图数据
  return http.get("/timely_data");
};
