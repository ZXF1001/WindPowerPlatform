<template>
  <el-card v-loading="loading">
    <div class="linechart"
         ref="echarts1"></div>
  </el-card>
</template>

<script>
import * as echarts from 'echarts'
import {
  getOverviewRecentLineData,
  getOverviewTimelyLineData,
} from '../../api/overview/getLineData'
import dateFormatter from '@/utils/dateFormatter'
export default {
  data() {
    return {
      loading: false,
    }
  },
  methods: {
    fetchLinedata() {
      //先创建空数据的echarts，在ws持续更新数据
      const echarts1 = echarts.init(this.$refs.echarts1)
      var option = {
        title: {
          text: '时变数据折线图',
        },
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
          splitLine: {
            // show: false,
          },
        },
        legend: {},
        grid: {
          left: '3%',
          right: '4%',
          bottom: '2%',
          containLabel: true,
        },
        series: [],
      }
      echarts1.setOption(option)
      window.onresize = () => {
        echarts1.resize()
      }
      //创建完echarts后建立ws连接
      //! 目前是整个seriesData的替换，更新数据时没有平移的动画，需要优化
      this.ws = new WebSocket('ws://1.117.224.40/ws/turbines/get-powers')
      this.ws.onmessage = (e) => {
        const res = JSON.parse(e.data)
        let seriesData = new Array(res.length)
        for (let i = 0; i < res.length; i++) {
          var lineData = new Array(res[0].data.length)
          for (let j = 0; j < res[i].data.length; j++) {
            console.log(res[i].data[j].date)
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
        echarts1.setOption(option)
      }
    },
    // fetchLinedata_old() {
    //   getOverviewRecentLineData()
    //     .then((res) => {
    //       this.drawLineData(res.data)
    //     })
    //     .catch((e) => {
    //       console.log(e)
    //     })
    // },
    // drawLineData(data) {
    //   const echarts1 = echarts.init(this.$refs.echarts1)
    //   var seriesData = []
    //   var clusterList = Object.keys(data[0].value)
    //   // clusterList : ["cluster1","cluster2",...]
    //   clusterList.forEach((cluster) => {
    //     var lineData = []
    //     data.forEach((dateItem) => {
    //       var date = new Date(dateItem.date)
    //       this.latestDate = date
    //       lineData.push({
    //         name: date.toString(),
    //         value: [dateFormatter(date, 'typical'), dateItem.value[cluster]],
    //       })
    //     })
    //     seriesData.push({
    //       animationDuration: 0,
    //       name: cluster,
    //       type: 'line',
    //       showSymbol: false,
    //       data: lineData,
    //       smooth: true,
    //     })
    //   })
    //   var option = {
    //     title: {
    //       text: '时变数据折线图',
    //     },
    //     tooltip: {
    //       trigger: 'axis',
    //       axisPointer: {
    //         animation: false,
    //       },
    //     },
    //     xAxis: {
    //       type: 'time',
    //     },
    //     yAxis: {
    //       type: 'value',
    //       boundaryGap: [0, '100%'],
    //       splitLine: {
    //         // show: false,
    //       },
    //     },
    //     legend: {},
    //     grid: {
    //       left: '3%',
    //       right: '4%',
    //       bottom: '2%',
    //       containLabel: true,
    //     },
    //     series: seriesData,
    //   }
    //   echarts1.setOption(option)
    //   window.onresize = () => {
    //     echarts1.resize()
    //   }
    //   this.loading = false
    //   this.updateLineData(seriesData, echarts1, option)
    // },
    // updateLineData(seriesData, echartsObj, echartsOption) {
    //   this.timer = setInterval(() => {
    //     getOverviewTimelyLineData()
    //       .then((res) => {
    //         this.latestDate = new Date(+this.latestDate + 1000)
    //         seriesData.forEach((clusterData) => {
    //           // if (clusterData.data.length > 60) {
    //           clusterData.data.shift()
    //           // }
    //           clusterData.data.push({
    //             name: this.latestDate.toString(),
    //             value: [
    //               dateFormatter(this.latestDate, 'typical'),
    //               res.data.value[clusterData.name],
    //             ],
    //           })
    //         })

    //         echartsObj.setOption(echartsOption)
    //         // {"value":{
    //         //   "cluster1|20-40":20,
    //         //   "cluster2|20-40":20,
    //         //   "cluster3|20-40":20,
    //         //   "cluster4|20-40":20,
    //         //   "cluster5|20-40":20,
    //         // }}
    //       })
    //       .catch((e) => {
    //         console.log(e)
    //       })
    //   }, 1000)
    // },
  },
  mounted() {
    this.fetchLinedata()
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    if (this.ws) {
      this.ws.close()
    }
  },
}
</script>

<style lang="less" scoped>
.linechart {
  height: calc(0.4 * (100vh - 238px));
}
</style>