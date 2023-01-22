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
      const option = {
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
      // echarts1.setOption(option)
      window.onresize = () => {
        echarts1.resize()
      }

      //创建完echarts后建立ws连接
      this.ws = connectWS('/turbines/get-powers', (res) => {
        const seriesData = new Array(res.length)
        if (res[0].data.length > 1) {
          //表示接收到的是整个序列数据
          for (let i = 0; i < res.length; i++) {
            const lineData = new Array(res[0].data.length)
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
          option.series = seriesData
        } else {
          //表示接收到的是更新的单条数据
          for (let i = 0; i < res.length; i++) {
            option.series[i].data.shift()
            option.series[i].data.push({
              name: new Date(res[i].data[0].date),
              value: [
                dateFormatter(new Date(res[i].data[0].date), 'typical'),
                res[i].data[0].power,
              ],
            })
          }
        }
        echarts1.setOption(option)
        this.loading = false
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
  height: calc(0.4 * (100vh - 300px));
}
</style>