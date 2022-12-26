<template>
  <div>
    <el-row>
      <!-- 左栏 -->
      <el-col :span="6">
        <el-card class="now weatherRow">
          <h3 class="weatherTitle">当前天气</h3>
          <p class="weatherTime">{{nowUpdateTime?nowUpdateTime+"更新":"更新中"}}</p>
          <div class="weatherdata">
            <div class="tempAndType">
              <i :class="'qi-'+nowWeather.icon"></i>
              <div class="tempNumAndUnit"
                   v-if="nowWeather.temp">
                <span class="tempNum">{{nowWeather.temp}}</span>
                <span class="tempUnit">°C</span>
              </div>
              <p class="weatherType">{{nowWeather.text}}</p>
            </div>
            <div class="otherWeather">
              <div class="items"
                   v-if="nowWeather.humidity">
                <span class="title">湿度</span>
                <span class="value">{{nowWeather.humidity}}%</span>
              </div>
              <div class="items"
                   v-if="nowWeather.windSpeed">
                <span class="title">风速</span>
                <span class="value">{{(nowWeather.windSpeed/3.6).toFixed(2)}} m/s</span>
              </div>
              <div class="items"
                   v-if="nowWeather.windDir">
                <span class="title">风向</span>
                <span class="value">{{nowWeather.windDir}}</span>
              </div>
              <div class="items"
                   v-if="nowWeather.pressure">
                <span class="title">气压</span>
                <span class="value">{{nowWeather.pressure/10}} kPa</span>
              </div>
            </div>

          </div>
        </el-card>
      </el-col>
      <!-- 右栏 -->
      <el-col :span="18">
        <el-card class="future weatherRow">
          <h3 class="weatherTitle">未来24小时天气</h3>
          <p class="weatherTime">{{hourlyUpdateTime?hourlyUpdateTime+"更新":"更新中"}}</p>

          <div class="hourlyDatas scroller">
            <div v-for="item in hourlyWeather"
                 :key="item.fxTime"
                 class="hourlyData">
              <span class="time">{{returnHour(item.fxTime)}} 时</span>

              <div class="valueAndIcon">
                <i :class="'qi-'+item.icon" />
                <div class="value">{{item.temp}}°C</div>
              </div>
              <div class="valueAndIcon">
                <i class="qi-wind" />
                <div class="value">{{item.windSpeed}}m/s</div>
              </div>

            </div>

          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-card class="Wecharts">
      <!-- 风速风向折线图 -->
      <div class="linechart"
           ref="Wecharts"></div>
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

  </div>
</template>

<script>
import { getQ24hWeather, getQNowWeather } from '../../api/wind/getWeather'
import 'qweather-icons/font/qweather-icons.css'
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
      Wechart: null,
      timer: null,
    }
  },
  methods: {
    returnHour(date) {
      // 输入json日期时间，返回今天/明天+时间
      var dateObj = new Date(date)
      var returnTime = dateObj.getHours()
      return returnTime
    },
    draw24hWeather(lat, lng) {
      getQ24hWeather(lat, lng)
        .then((res) => {
          if (res.data.code == '200') {
            this.hourlyWeather = res.data.hourly
            this.drawTemp(res.data.hourly)
            this.drawHumid(res.data.hourly)
            this.drawWind(res.data.hourly)
            var now = new Date(res.data.updateTime)
            var Month = now.getMonth() + 1
            var Day = now.getDate()
            var Hour = now.getHours()
            var Minute = now.getMinutes()
            var Second = now.getSeconds()
            this.hourlyUpdateTime = `${Hour < 10 ? '0' + Hour : Hour}:${
              Minute < 10 ? '0' + Minute : Minute
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
      getQNowWeather(lat, lng)
        .then((res) => {
          if (res.data.code == '200') {
            this.nowWeather = res.data.now
            var now = new Date(res.data.now.obsTime)
            // var Month = now.getMonth() + 1
            // var Date = now.getDate()
            var Hour = now.getHours()
            var Minute = now.getMinutes()
            // var Second = now.getSeconds()
            this.nowUpdateTime = `${Hour < 10 ? '0' + Hour : Hour}:${
              Minute < 10 ? '0' + Minute : Minute
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
          text: '未来24小时温度',
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
          emphasis: {
            focus: 'series',
          },
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
          text: '未来24小时湿度',
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
    drawWind(dataArr) {
      const Wecharts = echarts.init(this.$refs.Wecharts)
      var windList = []
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

        windList.push({
          name: time.toString(),
          value: [
            chartTime,
            (element.windSpeed / 3.6).toFixed(2),
            element.wind360,
          ],
        })
      })
      var option = {
        color: '#73c0de',
        title: {
          text: '未来24小时风速风向',
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
            // animationDuration: 0,
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
    this.draw24hWeather(latlng[0], latlng[1])
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
.weatherRow {
  height: 250px;
  .weatherTitle {
    margin-top: 0px;
    margin-bottom: 0px;
    font-size: 15px;
  }
  .weatherTime {
    margin: 5px 0px;
    font-size: 8px;
    color: #333;
  }
}
.now {
  width: 95%;
  .weatherdata {
    .tempAndType {
      display: flex;
      align-items: center;
      margin-top: 10px;
      i {
        font-size: 80px;
        margin-right: 5px;
      }
      .tempNumAndUnit {
        display: flex;
        align-items: center;
        margin-right: 40px;
        .tempNum {
          font-size: 60px;
        }
        .tempUnit {
          font-size: 30px;
          padding-bottom: 15px;
        }
      }
      .weatherType {
        font-size: 20px;
        font-weight: bold;
      }
    }
    .otherWeather {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      // border-top: 1px solid rgba(0, 0, 0, 0.12);

      .items {
        .title {
          font-size: 12px;
          display: block;
        }
        .value {
          display: block;
        }
      }
    }
  }
}
.future {
  .hourlyDatas {
    overflow-x: scroll;
    display: flex;
    justify-content: space-between;
    position: absolute;
    bottom: 7px;
    width: calc(
      18 / 24 * 100% - 40px
    ); // 这是因为右边列的span为19，所以width=19/24*100%-2*20px（padding=20px）
    .hourlyData {
      margin-bottom: 5px;
      margin-right: 8px;
      padding: 5px 20px;
      border: solid 1px rgba(0, 0, 0, 0.12);
      border-radius: 4px;
      // height: 135px;
      .time {
        display: block;
        text-align: center;
        margin: 10px 0px;
      }

      .valueAndIcon {
        display: flex;
        align-items: center;
        i {
          font-size: 35px;
        }
        .value {
          margin-left: 10px;
        }
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
.Wecharts {
  margin-top: 10px;
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

.linechart {
  height: 280px;
}
</style>