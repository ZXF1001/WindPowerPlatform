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
export default {
  name: 'wsDistriDialog',
  props: ['selectedSpan'],
  methods: {
    drawDistribute() {
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
            data: [3, 4, 5, 6, 7, 8, 9],
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
            data: [10, 52, 200, 334, 390, 330, 220],
          },
        ],
      }
      option && this.distributeChart.setOption(option)
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