import http from "@/utils/http/requestMyApi.js";
//风资源页面风玫瑰图栏获取站点和高度信息
export const getSiteData = () => {
  return http.get("/wind/getSite.php");
};
export const getHeightData = () => {
  return http.get("/wind/getHeight.php");
};
export const getSiteAndHeight = () => {
  return http.get("/wind/site-and-height");
};
