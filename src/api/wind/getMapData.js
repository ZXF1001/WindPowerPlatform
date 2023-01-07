import http from "@/utils/http/requestMyApi.js";
//请求风资源页的地图数据
export const getMyTurbineData = () => {
  // 获取张北县风机点位的GPS经纬度数据
  return http.get("/turbines/position");
};
