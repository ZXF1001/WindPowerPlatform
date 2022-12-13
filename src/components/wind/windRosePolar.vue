<template>
  <div>
    <div class="filterbox">
      <span>筛选条件：</span>
      <el-select v-model="value1"
                 multiple
                 collapse-tags
                 placeholder="选择集群"
                 size="small">
        <el-option v-for="item in options1"
                   :key="item.value"
                   :label="item.label"
                   :value="item.value">
        </el-option>
      </el-select>
      <el-select v-model="value2"
                 multiple
                 collapse-tags
                 placeholder="选择状态"
                 size="small">
        <el-option v-for="item in options2"
                   :key="item.value"
                   :label="item.label"
                   :value="item.value">
        </el-option>
      </el-select>
    </div>

    <el-card class="card"
             shadow="hover">
      <p class="rose-title">标题</p>
      <div class="windrose"
           ref="chart"></div>
    </el-card>
  </div>
</template>

<script>
import { getWindRoseData } from '../../api/wind/getRoseData.js'
import * as echarts from 'echarts'
export default {
  data() {
    return {
      options1: [
        {
          value: 'option1',
          label: '向服务器',
        },
        {
          value: 'option2',
          label: '请求',
        },
        {
          value: 'option3',
          label: '集群列表',
        },
        {
          value: 'option4',
          label: '数据',
        },
      ],
      options2: [
        {
          value: 'option1',
          label: '向服务器',
        },
        {
          value: 'option2',
          label: '请求',
        },
        {
          value: 'option3',
          label: '所有的',
        },
        {
          value: 'option4',
          label: '状态数据',
        },
      ],
      value1: [],
      value2: [],
    }
  },
  methods: {
    drawRoseData() {
      getWindRoseData()
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
          var roseData = res.data
          const echarts1 = echarts.init(this.$refs.chart)
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
            // title: {
            //   text: '风向玫瑰图（极坐标堆叠图）',
            // },
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
            polar: {
              center: ['50%', '40%'],
              radius: '75%', //半径大小
            },
            series: seriesData,
            legend: {
              // orient: 'vertical',
              x: 'center',
              y: 'bottom',
              data: Object.keys(roseData),
            },
          }

          option && echarts1.setOption(option)
          window.onresize = () => {
            echarts1.resize()
          }
        })
        .catch((e) => {
          console.log(e)
        })
    },
  },
  mounted() {
    this.drawRoseData()
  },
}
</script>
<style lang="less" scoped>
.filterbox {
  margin-bottom: 10px;
  .el-select {
    margin-left: 5px;
    margin-right: 5px;
  }
}
.windrose {
  height: 270px;
}
.card {
  width: 250px;
  .rose-title {
    margin: 0px 0px 10px 0px;
    text-align: center;
  }
}
</style>

