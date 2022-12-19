import httpOpenWeather from "../../utils/requestOpenWeather.js";
//请求openweather天气数据
export const get5DayWeather = (lat, lon) => {
  var url = `forecast?lat=${lat}&lon=${lon}&units=metric&appid=085fd907491d01041328b45abec2f7ac`;
  return httpOpenWeather.get(url);
};
export const getNowWeather = (lat, lon) => {
  var url = `weather?lat=${lat}&lon=${lon}&units=metric&appid=085fd907491d01041328b45abec2f7ac`;
  return httpOpenWeather.get(url);
};
