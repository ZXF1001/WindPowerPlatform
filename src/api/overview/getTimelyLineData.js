import http from "../../utils/request.js";
//请求总览页的数据
export const getOverviewTimelyLineData = () => {
  // 返回一个promise对象
  return http.get("/timely_data");
};
