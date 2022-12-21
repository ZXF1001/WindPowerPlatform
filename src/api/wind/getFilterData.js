import http from "../../utils/requestMyApi.js";

export const getSiteData = () => {
  return http.get("/getSite.php");
};
export const getHeightData = () => {
  return http.get("/getHeight.php");
};
