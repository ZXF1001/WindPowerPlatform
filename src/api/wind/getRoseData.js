import http from "../../utils/request.js";
//请求风资源页的数据
export const getWindRoseData = () => {
  // 返回一个promise对象
  return http.get("/windrose");
};
