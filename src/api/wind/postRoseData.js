import http from "../../utils/requestMyApi.js";

export const post4WDData = (data) => {
  // data格式为
  // {
  //   "site":"0305",
  //   "height":"70m",
  //   "range":[0,3,5,7,9]// 代表0-3，3-5，5-7，7-9，9-inf区间
  //   "dateBegin":"2016-1-10 3:0:0"
  //   "dateEnd":"2016-1-10 13:0:0"
  // }
  return http.post("/wd_static.php", data);
};
export const post4WSData = (data) => {
  // data格式为
  // {
  //   "site":"0305",
  //   "height":"70m",
  //   "dir":1,
  //   "dateBegin":"2016-1-10 3:0:0",
  //   "dateEnd":"2016-1-10 13:0:0",
  // }
  return http.post("/ws_static.php", data);
};
