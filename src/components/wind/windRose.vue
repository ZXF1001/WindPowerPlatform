<template>
  <div class="windrose"
       ref="radarchart"></div>
</template>

<script>
import * as echarts from 'echarts'
export default {
  data() {
    return {
      windData:
        //假定数据是从正北方向逆时针排布

        {
          '<5m/s': [
            0.2, 0.3, 0.11, 0.23, 0.12, 0.22, 0.13, 0.25, 0.31, 0.31, 0.04,
            0.12, 0.31, 0.16, 0.32, 0.26,
          ],
          '>5m/s': [
            0.11, 0.24, 0.21, 0.33, 0.22, 0.12, 0.13, 0.26, 0.21, 0.41, 0.14,
            0.02, 0.21, 0.24, 0.22, 0.2,
          ],
        },
    }
  },
  methods: {
    drawRose() {
      const echarts1 = echarts.init(this.$refs.radarchart)
      var radarMax = 0
      var speedList = Object.keys(this.windData) // ['<0.5m/s' , '>0.5m/s']
      //根据数据大小确定雷达图坐标范围
      speedList.forEach((speedData) => {
        var tempMax = Math.max(...this.windData[speedData])
        radarMax = tempMax > radarMax ? tempMax : radarMax
      })
      //用遍历取得series的data
      var seriesData = []
      speedList.forEach((speedData) => {
        seriesData.push({
          value: this.windData[speedData],
          name: speedData,
        })
      })
      var option = {
        title: {
          text: '风向玫瑰图',
        },
        legend: {
          x: 'center', //可设定图例在左、右、居中
          y: 'bottom', //可设定图例在上、下、居中
          // padding: [0, 50, 0, 0], //可设定图例[距上方距离，距右方距离，距下方距离，距左方距离]
          data: Object.keys(this.windData),
        },
        radar: {
          shape: 'circle',
          // radius: 130,
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
    this.drawRose()
  },
}
</script>
<style lang="less" scoped>
.windrose {
  height: 600px;
}
</style>

