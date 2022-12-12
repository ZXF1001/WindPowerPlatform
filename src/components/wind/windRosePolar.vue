<template>
  <div>
    <div class="filterbox">
      <span>筛选条件：</span>
      <el-select v-model="value"
                 multiple
                 collapse-tags
                 placeholder="选择集群"
                 size="small">
        <el-option v-for="item in options"
                   :key="item.value"
                   :label="item.label"
                   :value="item.value">
        </el-option>
      </el-select>
      <el-select v-model="value"
                 multiple
                 collapse-tags
                 placeholder="选择状态"
                 size="small">
        <el-option v-for="item in options"
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
      options: [
        {
          value: '选项1',
          label: '黄金糕',
        },
        {
          value: '选项2',
          label: '双皮奶',
        },
        {
          value: '选项3',
          label: '蚵仔煎',
        },
        {
          value: '选项4',
          label: '龙须面',
        },
        {
          value: '选项5',
          label: '北京烤鸭',
        },
      ],
      value: [],
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

