import httpQweather from "../../utils/requestQweather.js";
//请求和风天气数据
export const get24hWeather = (lat, lng) => {
  var url = [
    "/24h?location=",
    lng,
    ",",
    lat,
    "&key=a1d4666305e340d2949e735377311cca",
  ].join("");
  return httpQweather.get(url);
};
export const getNowWeather = (lat, lng) => {
  var url = [
    "/now?location=",
    lng,
    ",",
    lat,
    "&key=a1d4666305e340d2949e735377311cca",
  ].join("");
  return httpQweather.get(url);
};
