<template>
  <div>
    <el-card class="now">
      <h2>当前天气</h2>
      <p>{{updateTime?"最近更新时间："+updateTime:"更新中"}}
      </p>
      <div class="weatherdata">
        <span v-if="weatherNow.temp">温度：{{weatherNow.temp}}°C</span>
        <span v-if="weatherNow.humidity">湿度：{{weatherNow.humidity}}%</span>
        <span v-if="weatherNow.windSpeed">风速：{{weatherNow.windSpeed}}m/s</span>
        <span v-if="weatherNow.windDir">风向：{{weatherNow.windDir}}</span>
        <span v-if="weatherNow.wind360">角度：{{weatherNow.wind360}}°</span>
      </div>
    </el-card>
    <el-card class="
              future">
      <h2>未来24小时天气</h2>
    </el-card>
  </div>
</template>

<script>
import { get24hWeather, getNowWeather } from '../../api/wind/getQweather'
import * as echarts from 'echarts'
export default {
  data() {
    return {
      updateTime: null,
      weatherNow: {},
    }
  },
  methods: {
    draw24hWeather(lat, lng) {
      get24hWeather(lat, lng)
        .then((res) => {
          console.log(res)
        })
        .catch((e) => {
          console.log(e)
        })
    },
    drawNowWeather(lat, lng) {
      getNowWeather(lat, lng)
        .then((res) => {
          if (res.data.code == '200') {
            console.log(res.data.now)
            this.weatherNow = res.data.now
            var now = new Date(res.data.now.obsTime)
            var Month = now.getMonth() + 1
            var Day = now.getDay()
            var Hour = now.getHours()
            var Minute = now.getMinutes()
            var Second = now.getSeconds()
            this.updateTime = `${Month}月${Day}日 ${
              Hour < 10 ? '0' + Hour : Hour
            }:${Minute < 10 ? '0' + Minute : Minute}:${
              Second < 10 ? '0' + Second : Second
            }`
          }
        })
        .catch((e) => {
          console.log(e)
        })
    },
  },
  mounted() {
    this.draw24hWeather(121, 30)
    this.drawNowWeather(121, 30)
  },
}
</script>

<style lang="less" scoped>
.now {
  width: 30%;
  margin-bottom: 10px;
  .weatherdata {
    span {
      display: block;
    }
  }
}
h2 {
  margin-top: 0px;
}
</style>