import http from "@/utils/requestMyApi.js";

export const createTable = (data) => {
  //上传风资源数据时建表的请求
  return http.post("/wind/createWindDataTable.php", data);
};
export const upload2DB = (data) => {
  //上传风资源数据到数据表中
  return http.post("/wind/uploadWindData.php", data);
};
