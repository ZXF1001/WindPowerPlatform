import http from "@/utils/request";

//定义请求首页数据接口
export const getData = () => {
  //返回一个promise对象
  return http.get("/overview/getData");
};
