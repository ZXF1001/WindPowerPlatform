<template>
  <!-- 点击玫瑰图弹窗 -->
  <div>
    <h3>{{selectedSpan}}</h3>
    <div class="windDistribute"
         ref="distributeChart"></div>
    <!-- <span slot="footer">
      <el-button type="primary"
                 @click="dialogVisible = false">确 定</el-button>
    </span> -->
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { post4WSData } from '@/api/wind/postRoseData'
export default {
  name: 'wsDistriDialog',
  props: ['selectedSpan'],
  methods: {
    drawDistribute() {
      var data = {
        site: this.selectedSpan.siteLabel,
        height: this.selectedSpan.heightLabel,
        dir: this.selectedSpan.dirIndex,
        dateBegin: null,
        dateEnd: null,
      }
      if (this.selectedSpan.dateRange !== null) {
        var YY0 = this.selectedSpan.dateRange[0].getFullYear()
        var MM0 = this.selectedSpan.dateRange[0].getMonth() + 1
        var DD0 = this.selectedSpan.dateRange[0].getDate()
        var hh0 = this.selectedSpan.dateRange[0].getHours()
        var mm0 = this.selectedSpan.dateRange[0].getMinutes()
        var ss0 = this.selectedSpan.dateRange[0].getSeconds()
        var YY1 = this.selectedSpan.dateRange[1].getFullYear()
        var MM1 = this.selectedSpan.dateRange[1].getMonth() + 1
        var DD1 = this.selectedSpan.dateRange[1].getDate()
        var hh1 = this.selectedSpan.dateRange[1].getHours()
        var mm1 = this.selectedSpan.dateRange[1].getMinutes()
        var ss1 = this.selectedSpan.dateRange[1].getSeconds()
        data.dateBegin = `${YY0}-${MM0}-${DD0} ${hh0}:${mm0}:${ss0}`
        data.dateEnd = `${YY1}-${MM1}-${DD1} ${hh1}:${mm1}:${ss1}`
      }
      post4WSData(data)
        .then((res) => {
          console.log(res.data)
          var maxV = 0
          var minV = 0
          res.data.forEach((range) => {
            maxV =
              parseInt(range.rangeStart) > maxV
                ? parseInt(range.rangeStart)
                : maxV
          })
          var speedList = new Array(maxV - minV + 1).fill(0)
          for (let i = 0; i < speedList.length; i++) {
            speedList[i] += i
          }
          var countList = new Array(maxV - minV + 1).fill(0)
          res.data.forEach((range) => {
            countList[parseInt(range.rangeStart)] = parseInt(range.count)
          })
          console.log(speedList)
          console.log(countList)
          this.distributeChart = echarts.init(this.$refs.distributeChart)
          var option = {
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow',
              },
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true,
            },
            xAxis: [
              {
                type: 'category',
                data: speedList,
                axisTick: {
                  alignWithLabel: true,
                },
              },
            ],
            yAxis: [
              {
                type: 'value',
              },
            ],
            series: [
              {
                name: 'Speed',
                type: 'bar',
                barWidth: '100%',
                data: countList,
              },
            ],
          }
          option && this.distributeChart.setOption(option)
        })
        .catch((e) => {
          console.log(e)
        })
    },
    closeDialog() {
      //在这里销毁当前玫瑰图的曲线数据(若有)
      if (this.distributeChart !== null) {
        this.distributeChart.dispose()
        this.distributeChart = null
      }
    },
  },
}
</script>
<style lang="less" scoped>
.windDistribute {
  height: 400px;
}
</style>