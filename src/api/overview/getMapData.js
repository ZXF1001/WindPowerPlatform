import http from "../../utils/request.js";
//请求总览页的数据
export const getOverviewTurbineData = () => {
  // 获取总览页的数字和表格数据
  return http.get("/zb_position");
};
