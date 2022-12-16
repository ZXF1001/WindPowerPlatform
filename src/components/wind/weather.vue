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
    <div class="row">
      <el-card>
        <!-- 温湿度折线图 -->
        <div class="linechart"
             ref="Techarts"></div>
      </el-card>
      <el-card>
        <!-- 温湿度折线图 -->
        <div class="linechart"
             ref="Hecharts"></div>
      </el-card>
    </div>
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
      Techart: null,
      Hechart: null,
      timer: null,
      Htimer: null,
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
          if (res.data.code == '200') {
            this.hourlyWeather = res.data.hourly
            this.drawTemp(res.data.hourly)
            this.drawHumid(res.data.hourly)
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
          } else {
            //执行没得到数据的代码
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
          } else {
            //执行没得到数据的代码
          }
        })
        .catch((e) => {
          console.log(e)
        })
    },
    drawTemp(dataArr) {
      //Echarts绘制温度折线图
      const Techarts = echarts.init(this.$refs.Techarts)
      var tempList = []
      //时间列表获取
      dataArr.forEach((element) => {
        var time = new Date(element.fxTime)
        var chartTime =
          time.getFullYear() +
          '/' +
          (time.getMonth() + 1) +
          '/' +
          time.getDate() +
          ' ' +
          time.getHours() +
          ':' +
          time.getMinutes() +
          ':' +
          time.getSeconds()
        tempList.push({
          name: time.toString(),
          value: [chartTime, element.temp],
        })
      })
      var option = {
        color: '#ee6666',
        title: {
          text: '未来24小时温度预报',
        },
        tooltip: {
          trigger: 'axis',

          // formatter:{}
        },

        grid: {
          containLabel: true,
          left: '2%',
          right: '2%',
          bottom: '2%',
        },
        toolbox: {
          show: true,
          feature: {
            // dataView: { readOnly: false },
            saveAsImage: {},
          },
        },
        xAxis: {
          type: 'time',
          splitNumber: 11,
          // axisTick: {
          //   alignWithLabel: true,
          // },
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value} °C',
          },
        },

        series: {
          name: '温度',
          data: tempList,
          type: 'line',
          smooth: true,
          animationDuration: 0,
          emphasis: {
            focus: 'series',
          },
        },
      }
      Techarts.setOption(option)
      this.Techart = Techarts
      // window.onresize = () => {
      //   Techarts.resize()
      // }
    },
    drawHumid(dataArr) {
      //Echarts绘制湿度折线图
      const Hecharts = echarts.init(this.$refs.Hecharts)
      var humidList = []
      //时间列表获取
      dataArr.forEach((element) => {
        var time = new Date(element.fxTime)
        var chartTime =
          time.getFullYear() +
          '/' +
          (time.getMonth() + 1) +
          '/' +
          time.getDate() +
          ' ' +
          time.getHours() +
          ':' +
          time.getMinutes() +
          ':' +
          time.getSeconds()

        humidList.push({
          name: time.toString(),
          value: [chartTime, element.humidity],
        })
        // timeList.push(time.getHours())
      })
      var option = {
        color: '#5470c6',
        title: {
          text: '未来24小时湿度预报',
        },
        tooltip: {
          trigger: 'axis',
          // formatter:{}
        },

        grid: {
          containLabel: true,
          left: '2%',
          right: '2%',
          bottom: '2%',
        },
        toolbox: {
          show: true,
          feature: {
            // dataView: { readOnly: false },
            saveAsImage: {},
          },
        },
        xAxis: {
          type: 'time',

          splitNumber: 11,
          // axisTick: {
          //   alignWithLabel: true,
          // },
        },
        yAxis: [
          {
            type: 'value',
            axisLabel: {
              formatter: '{value} %',
            },
          },
        ],
        series: [
          {
            name: '湿度',
            data: humidList,
            type: 'line',
            smooth: true,
            animationDuration: 0,
            emphasis: {
              focus: 'series',
            },
          },
        ],
      }
      Hecharts.setOption(option)
      this.Hechart = Hecharts
      // window.onresize = () => {
      //   Hecharts.resize()
      // }
    },
  },
  mounted() {
    this.draw24hWeather(121, 30)
    this.fetchNowWeather(121, 30)
    window.onresize = () => {
      this.Techart.resize()
      this.Hechart.resize()
    }
    this.timer = setInterval(() => {
      this.draw24hWeather(121, 30)
      this.fetchNowWeather(121, 30)
    }, 1000 * 60 * 5)
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
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
.row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  .el-card {
    width: 49.5%;
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