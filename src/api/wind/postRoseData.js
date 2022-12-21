import http from "../../utils/requestMyApi.js";

export const postData = (data) => {
  // data格式为
  // {
  //   "site":"0305",
  //   "height":70,
  //   "range":[0,3,5,7,9]// 代表0-3，3-5，5-7，7-9，9-inf区间
  // }
  return http.post("/wd_static.php", data);
};
