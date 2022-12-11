<template>
  <div class="windrose"
       ref="radarchart"></div>
</template>

<script>
import * as echarts from 'echarts'
import axios from 'axios'
export default {
  data() {
    return {
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
    }
  },
  methods: {
    getRoseData() {
      axios
        .get('https://windplatform.usemock.com/windrose')
        .then((res) => {
          this.drawRose(res.data)
        })
        .catch(console.log(e))
    },
    drawRose(roseData) {
      const echarts1 = echarts.init(this.$refs.radarchart)
      var radarMax = 0
      var speedList = Object.keys(roseData) // ['<0.5m/s' , '>0.5m/s' , ...]
      //根据数据大小确定雷达图坐标范围
      speedList.forEach((speedData) => {
        var tempMax = Math.max(...roseData[speedData])
        radarMax = tempMax > radarMax ? tempMax : radarMax
      })
      radarMax = 1.1 * radarMax
      //用遍历取得series的data
      var seriesData = []
      speedList.forEach((speedData) => {
        seriesData.push({
          value: roseData[speedData],
          name: speedData,
          symbolSize: 4,
        })
      })
      var option = {
        title: {
          text: '风向玫瑰图',
        },
        legend: {
          x: 'center',
          y: 'bottom',
          // padding: [0, 50, 0, 0], //可设定图例[距上方距离，距右方距离，距下方距离，距左方距离]
          data: Object.keys(roseData),
        },
        radar: {
          shape: 'circle',
          // radius: '80%',
          startAngle: 90,
          indicator: [
            { name: 'N', max: radarMax },
            { name: '', max: radarMax },
            { name: 'NW', max: radarMax },
            { name: '', max: radarMax },
            { name: 'W', max: radarMax },
            { name: '', max: radarMax },
            { name: 'SW', max: radarMax },
            { name: '', max: radarMax },
            { name: 'S', max: radarMax },
            { name: '', max: radarMax },
            { name: 'SE', max: radarMax },
            { name: '', max: radarMax },
            { name: 'E', max: radarMax },
            { name: '', max: radarMax },
            { name: 'NE', max: radarMax },
            { name: '', max: radarMax },
          ],
        },
        series: [
          {
            name: 'WindRose',
            type: 'radar',
            // itemStyle: {
            //   // 折线拐点标志的样式。
            //   normal: {
            //     // 普通状态时的样式
            //     lineStyle: {
            //       width: 2,
            //     },
            //     opacity: 0.2,
            //   },
            //   emphasis: {
            //     // 高亮时的样式
            //     lineStyle: {
            //       width: 3,
            //     },
            //     opacity: 1,
            //   },
            // },
            animationDuration: 400,
            data: seriesData,
          },
        ],
      }
      echarts1.setOption(option)
      window.onresize = () => {
        echarts1.resize()
      }
    },
  },
  mounted() {
    this.getRoseData()
  },
}
</script>
<style lang="less" scoped>
.windrose {
  height: 400px;
}
</style>

