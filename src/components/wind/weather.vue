<template>
  <div>
    <el-card class="now">
      <h2>当前天气</h2>
      <p>{{nowUpdateTime?"最近更新时间："+nowUpdateTime:"更新中"}}</p>
      <div class="weatherdata">
        <span v-if="nowWeather.temp">温度：{{nowWeather.temp}}°C</span>
        <span v-if="nowWeather.humidity">湿度：{{nowWeather.humidity}}%</span>
        <span v-if="nowWeather.windSpeed">风速：{{nowWeather.windSpeed}}m/s</span>
        <span v-if="nowWeather.windDir">风向：{{nowWeather.windDir}}</span>
        <span v-if="nowWeather.wind360">角度：{{nowWeather.wind360}}°</span>
      </div>
    </el-card>
    <el-card>
      <!-- 温湿度折线图 -->
      <div class="linechart"
           ref="THecharts"></div>
    </el-card>
    <el-card>
      <!-- 风速风向折线图 -->
      <div class="linechart"
           ref="WSWDecharts"></div>
    </el-card>

    <el-card class="future">
      <h2>未来24小时天气</h2>
      <p>{{hourlyUpdateTime?"最近更新时间："+hourlyUpdateTime:"更新中"}}</p>
      <div class="hourlyDatas">
        <div v-for="item in hourlyWeather"
             :key="item.fxTime"
             class="hourlyData">
          <span v-if="item.fxTime"
                class="time">时间：{{returnDayHour(item.fxTime)}}</span>
          <span v-if="item.temp">温度：{{item.temp}}°C</span>
          <span v-if="item.humidity">湿度：{{item.humidity}}%</span>
          <span v-if="item.windSpeed">风速：{{item.windSpeed}}m/s</span>
          <span v-if="item.windDir">风向：{{item.windDir}}</span>
          <span v-if="item.wind360">角度：{{item.wind360}}°</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { get24hWeather, getNowWeather } from '../../api/wind/getQweather'
import * as echarts from 'echarts'
export default {
  data() {
    return {
      nowUpdateTime: null,
      hourlyUpdateTime: null,
      nowWeather: {},
      hourlyWeather: [],
    }
  },
  methods: {
    returnDayHour(date) {
      // 输入json日期时间，返回屏幕显示的日期时间
      var dateObj = new Date(date)
      var Day = dateObj.getDay()
      var Hour = dateObj.getHours()
      var returnTime = `${Day}日${Hour < 10 ? '0' + Hour : Hour}时`
      return returnTime
    },
    draw24hWeather(lat, lng) {
      get24hWeather(lat, lng)
        .then((res) => {
          console.log(res)
          if (res.data.code == '200') {
            this.hourlyWeather = res.data.hourly
            this.drawTempAndHumid(res.data.hourly)
            var now = new Date(res.data.updateTime)
            var Month = now.getMonth() + 1
            var Day = now.getDay()
            var Hour = now.getHours()
            var Minute = now.getMinutes()
            var Second = now.getSeconds()
            this.hourlyUpdateTime = `${Month}月${Day}日 ${
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
    fetchNowWeather(lat, lng) {
      getNowWeather(lat, lng)
        .then((res) => {
          if (res.data.code == '200') {
            this.nowWeather = res.data.now
            var now = new Date(res.data.now.obsTime)
            var Month = now.getMonth() + 1
            var Day = now.getDay()
            var Hour = now.getHours()
            var Minute = now.getMinutes()
            var Second = now.getSeconds()
            this.nowUpdateTime = `${Month}月${Day}日 ${
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
    drawTempAndHumid(dataArr) {
      console.log(dataArr)
      const THecharts = echarts.init(this.$refs.THecharts)
    },
  },
  mounted() {
    this.draw24hWeather(121, 30)
    this.fetchNowWeather(121, 30)
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
.linechart {
  height: 300px;
}
.future {
  .hourlyDatas {
    overflow-x: scroll;
    display: flex;
    justify-content: space-between;
    .hourlyData {
      span {
        display: block;
        width: 150px;
      }
    }
  }
}
</style>