import http from "../../utils/request.js";
//请求风资源页的数据
export const getWindRoseData = () => {
  // 获取风玫瑰图数据
  return http.get("/windrose");
};
