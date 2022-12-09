<template>
  <div>
    <h1>这是Wind</h1>
    <el-button @click="draw">运行</el-button>
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
      data: [],
      now: new Date(1997, 9, 3),
      oneDay: 24 * 3600 * 1000,
      value: Math.random() * 1000,
    }
  },
  methods: {
    fetchData() {
      axios
        .get('https://windplatform.usemock.com/time_power')
        .then((res) => {
          console.log(res.data)
          this.data = res.data
          this.drawData()
        })
        .catch((e) => {
          console.log(e)
        })
    },
    drawData() {
      const echarts1 = echarts.init(this.$refs.echarts)
      var option = {
        title: {
          text: 'Dynamic Data Axis',
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
        series: [
          {
            name: 'Fake Data',
            type: 'line',
            showSymbol: false,
            data: this.data,
          },
        ],
      }
    },
    randomData() {
      this.now = new Date(+this.now + this.oneDay)
      // console.log(now.getMonth());
      this.value = this.value + Math.random() * 21 - 10
      return {
        name: this.now.toString(),
        value: [
          [
            this.now.getFullYear(),
            this.now.getMonth() + 1,
            this.now.getDate(),
          ].join('/'),
          Math.round(this.value),
        ],
      }
    },
    draw() {
      const echarts1 = echarts.init(this.$refs.echarts)
      // console.log(this.randomData())
      for (var i = 0; i < 1000; i++) {
        this.data.push(this.randomData())
      }
      var option = {
        title: {
          text: 'Dynamic Data & Time Axis',
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
        series: [
          {
            name: 'Fake Data',
            type: 'line',
            showSymbol: false,
            data: this.data,
          },
        ],
      }
      setInterval(() => {
        for (var i = 0; i < 5; i++) {
          this.data.shift()
          this.data.push(this.randomData())
        }
        echarts1.setOption({
          series: [
            {
              data: this.data,
            },
          ],
        })
        console.log(this.data)
        echarts1.setOption(option)
      }, 1000)
    },
  },
}
</script>
<style lang="less" scoped>
.linechart {
  height: 800px;
}
</style>