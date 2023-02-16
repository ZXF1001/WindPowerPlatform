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
                <span class="value">{{(nowWeather.windSpeed/3.6).toFixed(1)}}m/s</span>
              </div>
              <div class="items"
                   v-if="nowWeather.windDir">
                <span class="title">风向</span>
                <span class="value">{{nowWeather.windDir}}</span>
              </div>
              <div class="items"
                   v-if="nowWeather.pressure">
                <span class="title">气压</span>
                <span class="value">{{nowWeather.pressure/10}}kPa</span>
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
                <!-- 通过旋转风icon表示风向 -->
                <div class="value">{{(item.windSpeed/3.6).toFixed(1)}}m/s</div>
              </div>

            </div>

          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-card class="Wecharts">
      <h3 class="weatherTitle">未来24小时风速风向</h3>
      <!-- 风速风向折线图 -->
      <div class="linechart"
           ref="Wecharts"></div>
    </el-card>
    <div class="row">
      <el-card>
        <h3 class="weatherTitle">未来24小时温度</h3>
        <!-- 温湿度折线图 -->
        <div class="linechart"
             ref="Techarts"></div>
      </el-card>
      <el-card>
        <h3 class="weatherTitle">未来24小时湿度</h3>
        <!-- 温湿度折线图 -->
        <div class="linechart"
             ref="Hecharts"></div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { connectWS } from '@/utils/WebSocket/ws'
import 'qweather-icons/font/qweather-icons.css'
import * as echarts from 'echarts'
import dateFormatter from '@/utils/dateFormatter'
export default {
  data() {
    return {
      nowUpdateTime: null,
      hourlyUpdateTime: null,
      nowWeather: {},
      hourlyWeather: [],
      Techart: null,
      Hechart: null,
    }
  },
  computed: {
    returnHour() {
      return function (date) {
        const dateObj = new Date(date)
        return dateObj.getHours()
      }
    },
  },
  methods: {
    draw24hWeather() {
      this.ws2 = connectWS('/weather/get-24h-weather', (res) => {
        this.hourlyWeather = res
        this.drawEcharts('temp')
        this.drawEcharts('humid')
        this.drawWind()
        const now = new Date(this.hourlyWeather[0].updateTime)
        const Hour = now.getHours()
        const Minute = now.getMinutes()
        this.hourlyUpdateTime = `${Hour < 10 ? '0' + Hour : Hour}:${
          Minute < 10 ? '0' + Minute : Minute
        }`
      })
    },
    fetchNowWeather() {
      this.ws1 = connectWS('/weather/get-now-weather', (res) => {
        this.nowWeather = res
        const now = new Date(this.nowWeather.obsTime)
        const Hour = now.getHours()
        const Minute = now.getMinutes()
        this.nowUpdateTime = `${Hour < 10 ? '0' + Hour : Hour}:${
          Minute < 10 ? '0' + Minute : Minute
        }`
      })
    },
    drawEcharts(type) {
      let chartObj, dom, color, unit, name, fieldName
      switch (type) {
        case 'temp':
          chartObj = this.Techart
          dom = this.$refs.Techarts
          color = '#ee6666'
          unit = '°C'
          name = '温度'
          fieldName = 'temp'
          break
        case 'humid':
          chartObj = this.Hechart
          dom = this.$refs.Hecharts
          color = '#5470c6'
          unit = '%'
          name = '湿度'
          fieldName = 'humidity'
          break
        default:
          break
      }
      if (!chartObj) {
        chartObj = echarts.init(dom)
        const option = {
          color: color,

          tooltip: {
            trigger: 'axis',
            // formatter:{}
            valueFormatter: (value) => `${value}${unit}`,
          },

          grid: {
            containLabel: true,
            left: '2%',
            right: '3%',
            top: '10%',
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
                formatter: `{value}${unit}`,
              },
            },
          ],
          series: [
            {
              name: name,
              data: [],
              type: 'line',
              smooth: true,
              emphasis: {
                focus: 'series',
              },
            },
          ],
        }
        chartObj.setOption(option)
      }
      const dataList = []
      //时间列表获取
      for (let i = 0; i < this.hourlyWeather.length; i++) {
        const time = new Date(this.hourlyWeather[i].fxTime)
        const chartTime = dateFormatter(time, 'typical')
        dataList.push({
          name: time.toString(),
          value: [chartTime, this.hourlyWeather[i][fieldName]],
        })
      }
      chartObj.setOption({
        series: {
          data: dataList,
        },
      })
    },
    drawWind() {
      if (!this.Wechart) {
        this.Wechart = echarts.init(this.$refs.Wecharts)
        const option = {
          color: '#73c0de',

          tooltip: {
            trigger: 'axis',
            valueFormatter: (value) => value + ' m/s',
            // formatter:{}
          },

          grid: {
            containLabel: true,
            left: '2%',
            right: '3%',
            top: '10%',
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
              data: [],
              type: 'line',
              smooth: true,
              // animationDuration: 0,
              symbol: 'arrow',
              symbolSize: [8, 15],
              symbolRotate: (value) => 180 - value[2],
            },
          ],
        }
        this.Wechart.setOption(option)
      }

      const windList = []
      for (let i = 0; i < this.hourlyWeather.length; i++) {
        const time = new Date(this.hourlyWeather[i].fxTime)
        const chartTime = dateFormatter(time, 'typical')
        windList.push({
          name: time.toString(),
          value: [
            chartTime,
            (this.hourlyWeather[i].windSpeed / 3.6).toFixed(1),
            this.hourlyWeather[i].wind360,
          ],
        })
      }

      this.Wechart.setOption({
        series: {
          data: windList,
        },
      })
    },
  },
  mounted() {
    this.draw24hWeather()
    this.fetchNowWeather()
    window.onresize = () => {
      this.Techart.resize()
      this.Hechart.resize()
      this.Wechart.resize()
    }
  },
  beforeDestroy() {
    window.onresize = () => {}
    if (this.ws1) {
      this.ws1.close()
      this.ws1 = undefined
    }
    if (this.ws2) {
      this.ws2.close()
      this.ws2 = undefined
    }
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = undefined
    }
  },
}
</script>

<style lang="less" scoped>
.weatherRow {
  height: 250px;
}
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
.now {
  width: 95%;
  .weatherdata {
    .tempAndType {
      display: flex;
      align-items: center;
      margin-top: 10px;
      i {
        font-size: 80px;
        margin-right: 10px;
      }
      .tempNumAndUnit {
        display: flex;
        align-items: center;
        margin-right: 35px;
        .tempNum {
          font-size: 60px;
        }
        .tempUnit {
          font-size: 30px;
          padding-bottom: 15px;
        }
      }
      .weatherType {
        font-size: 25px;
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
          font-size: 16px;
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
      padding: 5px 15px;
      border: solid 1px rgba(0, 0, 0, 0.12);
      border-radius: 4px;
      // height: 135px;
      .time {
        display: block;
        text-align: center;
        margin: 10px 0px;
        font-size: 14px;
      }

      .valueAndIcon {
        display: flex;
        align-items: center;
        i {
          font-size: 30px;
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