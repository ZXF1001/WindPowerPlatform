<template>
  <div class="windrose"
       ref="radarchart"></div>
</template>

<script>
import * as echarts from 'echarts'
import axios from 'axios'
export default {
  data() {
    return {}
  },
  methods: {
    getRoseData() {
      axios
        .get('https://windplatform.usemock.com/windrose')
        .then((res) => {
          // windData:
          //   //假定数据是从正北方向逆时针排布
          //   {
          //     '<5m/s': [
          //       0.2, 0.3, 0.11, 0.23, 0.12, 0.22, 0.13, 0.25, 0.31, 0.31, 0.04,
          //       0.12, 0.31, 0.16, 0.32, 0.26,
          //     ],
          //     '>5m/s': [
          //       0.11, 0.24, 0.21, 0.33, 0.22, 0.12, 0.13, 0.26, 0.21, 0.41, 0.14,
          //       0.02, 0.21, 0.24, 0.22, 0.1,
          //     ],
          //   },
          this.drawRose(res.data)
        })
        .catch((e) => {
          console.log(e)
        })
    },
    drawRose(roseData) {
      const echarts1 = echarts.init(this.$refs.radarchart)
      var speedList = Object.keys(roseData) // ['<5m/s' , '>5m/s' , ...]
      var dataMax = 0
      for (var i = 0; i < roseData[speedList[0]].length; i++) {
        var sum = 0
        speedList.forEach((speedData) => {
          sum += roseData[speedData][i]
        })
        dataMax = sum > dataMax ? sum : dataMax
      }

      var seriesData = []
      //极坐标堆叠图的数据是从正北方向顺时针排布
      speedList.forEach((speedData) => {
        seriesData.push({
          animationDuration: 0,
          type: 'bar',
          data: roseData[speedData],
          coordinateSystem: 'polar',
          name: speedData,
          stack: 'a',
          emphasis: {
            focus: 'series',
          },
        })
      })
      var option = {
        title: {
          text: '风向玫瑰图（极坐标堆叠图）',
        },
        angleAxis: {
          startAngle: 90 + 360 / 16 / 2,
          type: 'category',
          data: [
            'N',
            '',
            'NE',
            '',
            'E',
            '',
            'SE',
            '',
            'S',
            '',
            'SW',
            '',
            'W',
            '',
            'NW',
            '',
          ],
        },
        radiusAxis: {
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
        },
        polar: {},
        series: seriesData,
        legend: {
          x: 'center',
          y: 'bottom',
          data: Object.keys(roseData),
        },
      }

      option && echarts1.setOption(option)
      window.onresize = () => {
        echarts1.resize()
      }
    },
  },
  mounted() {
    this.getRoseData()
  },
  beforeDestroy() {},
}
</script>
<style lang="less" scoped>
.windrose {
  height: 400px;
}
</style>

