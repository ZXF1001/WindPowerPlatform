import httpQweather from "@/utils/http/requestQweather.js";
//*请求和风天气数据grid-weather/now?
export const getQ24hWeather = (lat, lng) => {
  const url = `/24h?location=${lng},${lat}&key=a1d4666305e340d2949e735377311cca`;
  return httpQweather.get(url);
};
export const getQNowWeather = (lat, lng) => {
  const url = `/now?location=${lng},${lat}&key=a1d4666305e340d2949e735377311cca`;
  return httpQweather.get(url);
};
