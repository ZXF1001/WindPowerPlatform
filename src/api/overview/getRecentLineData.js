import http from "../../utils/request.js";
//请求总览页的数据
export const getOverviewRecentLineData = () => {
  // 返回一个promise对象
  return http.get("/time_power_hhmmss");
};
