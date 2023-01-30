import http from "@/utils/http/requestMyApi.js";

export const post4WDData = (data) => http.post("/wind/wd-stat", data);
// data格式为
// {
//   "site":"0305",
//   "height":"70m",
//   "range":[0,3,5,7,9]// 代表0-3，3-5，5-7，7-9，9-inf区间
//   "dateBegin":"2016-1-10 3:0:0"
//   "dateEnd":"2016-1-10 13:0:0"
// }
export const post4WSData = (data) => http.post("/wind/ws-stat", data);
// data格式为
// {
//   "site":"0305",
//   "height":"70m",
//   "dir":1,
//   "dateBegin":"2016-1-10 3:0:0",
//   "dateEnd":"2016-1-10 13:0:0",
// }
