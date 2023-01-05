import http from "@/utils/requestMyApi.js";

export const post4SpeedTimeData = (data, abortController) => {
  // data格式为
  // {
  //   "site":"0305",
  //   "height":"70m",
  //   "type":"1m",
  //   "dateBegin":"2016-1-10 3:0:0",
  //   "dateEnd":"2016-2-1 13:0:0",
  //   "granularity":"hour"
  // }
  // 如果type不为"user-defined",dateBegin和detaEnd为空
  return http.post("/wind/ws-time", data, {
    signal: abortController.signal,
  });
};
