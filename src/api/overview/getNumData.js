import http from "../../utils/request.js";
//请求总览页的数据
export const getOverviewNumData = () => {
  // 返回一个promise对象
  return http.get("/overview_data");
  // return http.get("https://windplatform.usemock.com/overview_data");
};
