<template>
  <div>
    <div class="filterbox">
      <span>筛选条件：</span>
      <el-select v-model="value1"
                 multiple
                 collapse-tags
                 placeholder="选择测风塔"
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
           ref="roseChart"></div>
    </el-card>
    <el-card class="card"
             shadow="hover">
      <p class="rose-title">标题</p>
      <div class="windrose"
           ref="roseChart3"></div>
    </el-card>
    <!-- 点击玫瑰图弹窗 -->
    <el-dialog title="xxx的风速分布"
               :visible.sync="dialogVisible"
               width="60%"
               @opened="drawDistribute"
               @close="closeDialog">
      <div class="windDistribute"
           ref="distributeChart"></div>
      <span slot="footer">
        <el-button type="primary"
                   @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { postData } from '@/api/wind/postRoseData.js'
import { get5DayWeather } from '@/api/wind/getOpenWeather'
import * as echarts from 'echarts'
export default {
  data() {
    return {
      //筛选框的数据
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
      //风速分布弹窗的数据
      dialogVisible: false,
      drawDistributeParams: {}, //用于弹窗画图的全局传参
      distributeChart: null,
    }
  },
  methods: {
    drawRoseData() {
      const data = {
        site: '0305',
        height: 70,
        range: [0, 5, 10, 15],
      }
      postData(data)
        .then((res) => {
          var roseData = res.data

          console.log('roseData')
          console.log(roseData)
          const echarts1 = echarts.init(this.$refs.roseChart)
          var seriesData = []
          //极坐标堆叠图的数据是从正北方向顺时针排布
          for (var key in roseData) {
            var barData = []
            roseData[key].forEach((dirData) => {
              barData[dirData.direction] = dirData.frequency
            })
            if (roseData[key].length != 0) {
              seriesData.push({
                animationDuration: 0,
                type: 'bar',
                // barWidth: '100%',
                data: barData,
                coordinateSystem: 'polar',
                name: key,
                stack: 'a',
                // emphasis: {
                //   focus: 'self',
                // },
              })
            }
          }

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
              center: ['50%', '38%'],
              radius: '68%', //半径大小
            },
            series: seriesData,
            legend: {
              // orient: 'vertical',
              x: 'center',
              y: 'bottom',
              // data: Object.keys(roseData),
            },
          }

          option && echarts1.setOption(option)
          echarts1.on('click', (params) => {
            // console.log('params.dataIndex' + params.dataIndex)
            this.drawDistributeParams = {
              dataIndex: params.dataIndex,
            }
            this.dialogVisible = true
          })
          window.onresize = () => {
            echarts1.resize()
          }
        })
        .catch((e) => {
          console.log(e)
        })
    },
    drawRoseData2() {
      // 通过openweather的五天数据画玫瑰图
      get5DayWeather(31.906801, 121.182329).then((res) => {
        if (res.status == '200') {
          var listData = res.data.list
          // console.log(listData)

          var data = {}
          const speedRangeArr = [0, 1, 3, 5, 7, 10, 13, 17, 21, 25, 30]
          // 要将风力划分为0,1,3,5,7,10,13,17,21,25,30这些区间
          listData.forEach((element) => {
            // 每个时间点的风速数据
            for (var i = 1; i < speedRangeArr.length; i++) {
              if (
                element.wind.speed >= speedRangeArr[i - 1] &&
                element.wind.speed < speedRangeArr[i]
              ) {
                // 找出风速对应的区间并存入
                var key = speedRangeArr[i - 1] + '-' + speedRangeArr[i] + 'm/s'
                if (!(key in data)) {
                  data[key] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                }
                //角度化为十六风向序号(顺时针)
                var sectorId = Math.round(element.wind.deg / 22.5) % 16
                data[key][sectorId] += 1 / listData.length
              }
            }
          })
          console.log('data')
          console.log(data)

          //开始画图
          const echarts3 = echarts.init(this.$refs.roseChart3)
          var speedList = Object.keys(data)
          var seriesData = []
          speedList.forEach((speedData) => {
            seriesData.push({
              animationDuration: 0,
              type: 'bar',
              // barWidth: '100%',
              data: data[speedData],
              coordinateSystem: 'polar',
              name: speedData,
              stack: 'a',
              emphasis: {
                // focus: 'self',
              },
            })
            var option = {
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
                center: ['50%', '38%'],
                radius: '68%', //半径大小
              },
              series: seriesData,
              legend: {
                // orient: 'vertical',
                x: 'center',
                y: 'bottom',
                // data: Object.keys(data),
              },
            }
            option && echarts3.setOption(option)
          })
        }
      })
    },
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
      //在这里销毁当前玫瑰图的曲线数据
      console.log('close')
      this.distributeChart.dispose()
      this.distributeChart = null
    },
  },
  mounted() {
    this.drawRoseData()
    this.drawRoseData2()
  },
}
</script>
<style lang="less" scoped>
/deep/.el-card__body {
  padding: 15px;
}
.filterbox {
  margin-bottom: 10px;
  .el-select {
    margin-left: 5px;
    margin-right: 5px;
  }
}
.windrose {
  height: 300px;
}
.card {
  width: 280px;
  .rose-title {
    margin: 0px 0px 10px 0px;
    text-align: center;
  }
}
.windDistribute {
  height: 300px;
}
</style>

