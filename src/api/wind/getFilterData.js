import http from "../../utils/requestMyApi.js";
//风资源页面风玫瑰图栏获取站点和高度信息
export const getSiteData = () => {
  return http.get("/getSite.php");
};
export const getHeightData = () => {
  return http.get("/getHeight.php");
};
