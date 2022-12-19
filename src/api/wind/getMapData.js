import http from "../../utils/requestMyApi.js";
//请求总览页的数据
export const getMyTurbineData = () => {
  // 获取总览页的数字和表格数据
  return http.get("/get_zb_position.php");
};
