import http from "@/utils/http/request.js";
//请求总览页的数据
export const getOverviewNumData = () => {
  // 获取总览页的数字和表格数据
  return http.get("/overview_data");
};
