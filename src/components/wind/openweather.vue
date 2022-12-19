<template>
  <div>
    <el-row>
      <!-- 左栏 -->
      <el-col :span="5">
        <el-card class="now">
          <h2>当前天气</h2>
          <p>{{nowUpdateTime?"最近更新时间："+nowUpdateTime:"更新中"}}</p>
          <div class="weatherdata">
            <span v-if="nowWeather.temp">温度：{{nowWeather.temp}}°C</span>
            <span v-if="nowWeather.humidity">湿度：{{nowWeather.humidity}}%</span>
            <span v-if="nowWeather.windSpeed">风速：{{nowWeather.windSpeed}}m/s</span>
            <span v-if="nowWeather.windDir">风向：{{nowWeather.windDir}}风</span>
            <span v-if="nowWeather.wind360">角度：{{nowWeather.wind360}}°</span>
          </div>
        </el-card>
      </el-col>
      <!-- 右栏 -->
      <el-col :span="19">
        <el-card class="future">
          <h2>未来五天天气</h2>
          <div class="hourlyDatas scroller">
            <div v-for="item in hourlyWeather"
                 :key="item.dt"
                 class="hourlyData">
              <span v-if="item.dt"
                    class="time">时间：{{returnDayHour(1000*item.dt)}}</span>
              <span v-if="item.main.temp">温度：{{item.main.temp}}°C</span>
              <span v-if="item.main.humidity">湿度：{{item.main.humidity}}%</span>
              <span v-if="item.wind.speed">风速：{{item.wind.speed}}m/s</span>
              <span v-if="item.wind.Dir">风向：{{item.wind.Dir}}风</span>
              <span v-if="item.wind.deg">角度：{{item.wind.deg}}°</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

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
           ref="Wecharts"></div>
    </el-card>

  </div>
</template>

<script>
import { get5DayWeather, getNowWeather } from '../../api/wind/getOpenWeather'
import * as echarts from 'echarts'
export default {
  data() {
    return {
      nowUpdateTime: null,
      nowWeather: {},
      hourlyWeather: [],
      Techart: null,
      Hechart: null,
      Wechart: null,
      timer: null,
    }
  },
  methods: {
    returnDayHour(date) {
      // 输入json日期时间，返回屏幕显示的日期时间
      var dateObj = new Date(date)
      var Day = dateObj.getDate()
      var Hour = dateObj.getHours()
      var returnTime = `${Day}日${Hour < 10 ? '0' + Hour : Hour}时`
      return returnTime
    },
    draw5DayWeather(lat, lng) {
      get5DayWeather(lat, lng)
        .then((res) => {
          if (res.data.cod == '200') {
            this.hourlyWeather = res.data.list
            res.data.list.forEach((timeData) => {
              timeData.wind.Dir = [
                '北',
                '东北',
                '东',
                '东南',
                '南',
                '西南',
                '西',
                '西北',
                '北',
              ][Math.round(timeData.wind.deg / 45)]
            })
            this.drawTemp(res.data.list)
            this.drawHumid(res.data.list)
            this.drawWind(res.data.list)
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
          if (res.data.cod == '200') {
            this.nowWeather = {
              temp: res.data.main.temp,
              humidity: res.data.main.humidity,
              windSpeed: res.data.wind.speed,
              wind360: res.data.wind.deg,
              windGust: res.data.wind.gust,
              windDir: [
                '北',
                '东北',
                '东',
                '东南',
                '南',
                '西南',
                '西',
                '西北',
                '北',
              ][Math.round(res.data.wind.deg / 45)],
            }
            var now = new Date(1000 * res.data.dt)
            var Month = now.getMonth() + 1
            var Day = now.getDate()
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
      console.log(dataArr)
      //Echarts绘制温度折线图
      const Techarts = echarts.init(this.$refs.Techarts)
      var tempList = []
      //时间列表获取
      dataArr.forEach((element) => {
        var time = new Date(1000 * element.dt)
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
          value: [chartTime, element.main.temp],
        })
      })
      var option = {
        color: '#ee6666',
        title: {
          text: '未来五天温度',
        },
        tooltip: {
          trigger: 'axis',

          // formatter:{}
        },

        grid: {
          containLabel: true,
          left: '2%',
          right: '3%',
          bottom: '2%',
        },

        xAxis: {
          type: 'time',
          splitNumber: 9,
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
          // animationDuration: 0,
        },
      }
      Techarts.setOption(option)
      this.Techart = Techarts
    },
    drawHumid(dataArr) {
      //Echarts绘制湿度折线图
      const Hecharts = echarts.init(this.$refs.Hecharts)
      var humidList = []
      //时间列表获取
      dataArr.forEach((element) => {
        var time = new Date(1000 * element.dt)
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
          value: [chartTime, element.main.humidity],
        })
      })
      var option = {
        color: '#5470c6',
        title: {
          text: '未来五天湿度',
        },
        tooltip: {
          trigger: 'axis',
          // formatter:{}
        },

        grid: {
          containLabel: true,
          left: '2%',
          right: '3%',
          bottom: '2%',
        },
        // toolbox: {
        //   show: true,
        //   feature: {
        //     // dataView: { readOnly: false },
        //     saveAsImage: {},
        //   },
        // },
        xAxis: {
          type: 'time',

          splitNumber: 9,
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
          },
        ],
      }
      Hecharts.setOption(option)
      this.Hechart = Hecharts
      // window.onresize = () => {
      //   Hecharts.resize()
      // }
    },
    drawWind(dataArr) {
      const Wecharts = echarts.init(this.$refs.Wecharts)
      var windList = []
      dataArr.forEach((element) => {
        var time = new Date(1000 * element.dt)
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

        windList.push({
          name: time.toString(),
          value: [chartTime, element.wind.speed, element.wind.deg],
        })
      })
      var option = {
        color: '#73c0de',
        title: {
          text: '未来五天风速风向',
        },
        tooltip: {
          trigger: 'axis',
          // formatter:{}
        },

        grid: {
          containLabel: true,
          left: '2%',
          right: '3%',
          bottom: '2%',
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
              formatter: '{value} m/s',
            },
          },
        ],
        series: [
          {
            name: '风速',
            data: windList,
            type: 'line',
            smooth: true,
            animationDuration: 0,
            symbol: 'arrow',
            symbolSize: [8, 15],
            symbolRotate: (value) => 180 - value[2],
          },
        ],
      }
      Wecharts.setOption(option)
      this.Wechart = Wecharts
      // window.onresize = () => {
      //   Hecharts.resize()
      // }
    },
  },
  mounted() {
    const latlng = [31.906801, 121.182329]
    this.draw5DayWeather(latlng[0], latlng[1])
    this.fetchNowWeather(latlng[0], latlng[1])
    window.onresize = () => {
      this.Techart.resize()
      this.Hechart.resize()
      this.Wechart.resize()
    }
    this.timer = setInterval(() => {
      this.draw24hWeather(latlng[0], latlng[1])
      this.fetchNowWeather(latlng[0], latlng[1])
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
  width: 95%;
  height: 260px;
  .weatherdata {
    span {
      display: block;
    }
  }
}
.future {
  height: 260px;
  .hourlyDatas {
    overflow-x: auto;
    display: flex;

    justify-content: space-between;
    .hourlyData {
      margin-bottom: 10px;
      span {
        display: block;
        width: 180px;
      }
    }
  }
  .scroller::-webkit-scrollbar {
    width: 8px;
    height: 9px;
  }

  .scroller::-webkit-scrollbar-track {
    background-color: #f9f9f9;
    -webkit-border-radius: 2em;
    -moz-border-radius: 2em;
    border-radius: 2em;
  }
  .scroller::-webkit-scrollbar-thumb {
    background-color: #dedede;
    -webkit-border-radius: 2em;
    -moz-border-radius: 2em;
    border-radius: 2em;
  }
}

.row {
  margin-top: 10px;
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
  height: 280px;
}
</style>