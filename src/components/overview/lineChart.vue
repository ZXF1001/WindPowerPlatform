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
export default {
  data() {
    return {
      loading: true,
      lineData: {},
      latestDate: null,
      timer: null,
    }
  },
  methods: {
    fetchLinedata() {
      getOverviewRecentLineData()
        .then((res) => {
          this.drawLineData(res.data)
        })
        .catch((e) => {
          console.log(e)
        })
    },
    drawLineData(data) {
      const echarts1 = echarts.init(this.$refs.echarts1)
      var seriesData = []
      var clusterList = Object.keys(data[0].value)
      // clusterList : ["cluster1","cluster2",...]
      clusterList.forEach((cluster) => {
        var lineData = []
        data.forEach((dateItem) => {
          var date = new Date(dateItem.date)
          this.latestDate = date
          lineData.push({
            name: date.toString(),
            value: [
              date.getFullYear() +
                '/' +
                (date.getMonth() + 1) +
                '/' +
                date.getDate() +
                ' ' +
                date.getHours() +
                ':' +
                date.getMinutes() +
                ':' +
                date.getSeconds(),
              dateItem.value[cluster],
            ],
          })
        })
        seriesData.push({
          animationDuration: 0,
          name: cluster,
          type: 'line',
          showSymbol: false,
          data: lineData,
          smooth: true,
        })
      })
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
        legend: {
          // data: clusterList,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '2%',
          containLabel: true,
        },
        series: seriesData,
      }
      echarts1.setOption(option)
      window.onresize = () => {
        echarts1.resize()
      }
      this.loading = false
      this.updateLineData(seriesData, echarts1, option)
    },
    updateLineData(seriesData, echartsObj, echartsOption) {
      this.timer = setInterval(() => {
        getOverviewTimelyLineData()
          .then((res) => {
            this.latestDate = new Date(+this.latestDate + 1000)
            seriesData.forEach((clusterData) => {
              // if (clusterData.data.length > 60) {
              clusterData.data.shift()
              // }
              clusterData.data.push({
                name: this.latestDate.toString(),
                value: [
                  // [
                  //   this.latestDate.getFullYear(),
                  //   this.latestDate.getMonth() + 1,
                  //   this.latestDate.getDate(),
                  // ].join('/'),
                  this.latestDate.getFullYear() +
                    '/' +
                    (this.latestDate.getMonth() + 1) +
                    '/' +
                    this.latestDate.getDate() +
                    ' ' +
                    this.latestDate.getHours() +
                    ':' +
                    this.latestDate.getMinutes() +
                    ':' +
                    this.latestDate.getSeconds(),
                  res.data.value[clusterData.name],
                ],
              })
            })

            echartsObj.setOption(echartsOption)
            // {"value":{
            //   "cluster1|20-40":20,
            //   "cluster2|20-40":20,
            //   "cluster3|20-40":20,
            //   "cluster4|20-40":20,
            //   "cluster5|20-40":20,
            // }}
          })
          .catch((e) => {
            console.log(e)
          })
      }, 1000)
    },
  },
  mounted() {
    this.fetchLinedata()
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
.linechart {
  height: calc(0.4 * (100vh - 238px));
}
</style>