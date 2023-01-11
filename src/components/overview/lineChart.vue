<template>
  <el-card v-loading="loading">
    <h3 class="title">时变数据折线图</h3>
    <div class="linechart"
         ref="echarts1"></div>
  </el-card>
</template>

<script>
import * as echarts from 'echarts'
import dateFormatter from '@/utils/dateFormatter'
import { connectWS } from '@/utils/WebSocket/ws'
export default {
  data() {
    return {
      loading: true,
    }
  },
  methods: {
    fetchLinedata() {
      //先创建空数据的echarts，在ws持续更新数据
      const echarts1 = echarts.init(this.$refs.echarts1)
      var option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            animation: false,
          },
        },
        xAxis: {
          type: 'time',
        },
        yAxis: {
          type: 'value',
          boundaryGap: [0, '100%'],
        },
        legend: {},
        grid: {
          left: '3%',
          right: '3%',
          bottom: '2%',
          top: '30px',
          containLabel: true,
        },
        series: [],
      }
      echarts1.setOption(option)
      window.onresize = () => {
        echarts1.resize()
      }

      //创建完echarts后建立ws连接
      this.ws = connectWS('/turbines/get-powers', (res) => {
        let chartOption = echarts1.getOption()
        if (chartOption.series.length === 0) {
          // 如果是第一次收到数据，全部更新到echarts上
          let seriesData = new Array(res.length)
          for (let i = 0; i < res.length; i++) {
            var lineData = new Array(res[0].data.length)
            for (let j = 0; j < res[i].data.length; j++) {
              lineData[j] = {
                name: new Date(res[i].data[j].date),
                value: [
                  dateFormatter(new Date(res[i].data[j].date), 'typical'),
                  res[i].data[j].power,
                ],
              }
            }

            seriesData[i] = {
              animationDuration: 0,
              name: res[i].cluster_id,
              type: 'line',
              showSymbol: false,
              data: lineData,
              smooth: true,
            }
          }
          chartOption.series = seriesData

          this.loading = false
        } else {
          // 如果不是第一次收到数据，把最新一组数据更新到echarts上
          for (let i = 0; i < chartOption.series.length; i++) {
            chartOption.series[i].data.shift()
            var latestData = res[i].data[res[i].data.length - 1]
            chartOption.series[i].data.push({
              name: new Date(latestData.date),
              value: [
                dateFormatter(new Date(latestData.date), 'typical'),
                latestData.power,
              ],
            })
          }
        }
        echarts1.setOption(chartOption)
      })
    },
  },
  mounted() {
    this.fetchLinedata()
  },
  beforeDestroy() {
    if (this.ws) {
      this.ws.close()
    }
  },
}
</script>

<style lang="less" scoped>
.title {
  margin-top: 0px;
  margin-bottom: 0px;
  font-size: 15px;
}
.linechart {
  height: calc(0.4 * (100vh - 290px));
}
</style>