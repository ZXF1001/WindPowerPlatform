import httpOpenWeather from "@/utils/requestOpenWeather.js";
import httpQweather from "@/utils/requestQweather.js";
//*请求和风天气数据grid-weather/now?
export const getQ24hWeather = (lat, lng) => {
  var url = `/24h?location=${lng},${lat}&key=a1d4666305e340d2949e735377311cca`;
  return httpQweather.get(url);
};
export const getQNowWeather = (lat, lng) => {
  var url = `/now?location=${lng},${lat}&key=a1d4666305e340d2949e735377311cca`;
  return httpQweather.get(url);
};
//请求openweather天气数据
export const getOpen5DayWeather = (lat, lon) => {
  var url = `forecast?lat=${lat}&lon=${lon}&units=metric&appid=085fd907491d01041328b45abec2f7ac`;
  return httpOpenWeather.get(url);
};
export const getOpenNowWeather = (lat, lon) => {
  var url = `weather?lat=${lat}&lon=${lon}&units=metric&appid=085fd907491d01041328b45abec2f7ac`;
  return httpOpenWeather.get(url);
};
