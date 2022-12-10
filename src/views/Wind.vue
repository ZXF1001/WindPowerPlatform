<template>
  <div>
    <h1>这是Wind</h1>
    <el-card>
      <!-- 右下的线图 -->
      <div class="linechart"
           ref="echarts"></div>
    </el-card>
  </div>
</template>
<script>
import axios from 'axios'
import * as echarts from 'echarts'
export default {
  data() {
    return {
      latestDate: null,
      oneDay: 24 * 3600 * 1000,
      oneSecond: 1000,
      timer: null,
    }
  },
  methods: {
    fetchData() {
      axios
        .get('https://windplatform.usemock.com/time_power_hhmmss')
        .then((res) => {
          this.drawData(res.data)
        })
        .catch((e) => {
          console.log(e)
        })
    },
    drawData(data) {
      const echarts1 = echarts.init(this.$refs.echarts)
      var seriesData = []
      var clusterList = Object.keys(data[0].value) // clusterList : ["cluster1","cluster2",...]
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
          splitLine: {
            show: false,
          },
        },
        yAxis: {
          type: 'value',
          boundaryGap: [0, '100%'],
          splitLine: {
            show: false,
          },
        },
        series: seriesData,
      }
      echarts1.setOption(option)
      this.updateData(seriesData, echarts1, option)
    },
    updateData(seriesData, echartsObj, echartsOption) {
      this.timer = setInterval(() => {
        axios
          .get('https://windplatform.usemock.com/timely_data')
          .then((res) => {
            this.latestDate = new Date(+this.latestDate + this.oneSecond)
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
    this.fetchData()
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
  height: 800px;
}
</style>