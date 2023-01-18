<template>
  <!-- 点击玫瑰图弹窗 -->
  <div>
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
import { post4WSData } from '@/api/wind/post4RoseData'
import colorBar from '@/json/windRose/colorBar.json'
import dateFormatter from '@/utils/dateFormatter'
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
        data.dateBegin = dateFormatter(
          this.selectedSpan.dateRange[0],
          'typical'
        )
        data.dateEnd = dateFormatter(this.selectedSpan.dateRange[1], 'typical')
      }
      post4WSData(data)
        .then((res) => {
          var maxV = 0
          var minV = 0
          var countSum = 0
          for (let i = 0; i < res.data.length; i++) {
            const range = res.data[i]
            maxV =
              parseInt(range.rangeStart) > maxV
                ? parseInt(range.rangeStart)
                : maxV
            countSum += parseInt(range.count)
          }

          if (maxV >= colorBar.length) {
            for (let i = 0; i < maxV + 1; i++) {
              colorBar.push(colorBar[colorBar.length - 1])
            }
          }
          const delta = 1 //表示单个速度范围的跨度，与后端一致
          var seriesData = []

          var countList = new Array(maxV - minV + 1).fill(0)
          for (let i = 0; i < res.data.length; i++) {
            const range = res.data[i]
            countList[parseInt(range.rangeStart)] = parseInt(range.count)
          }

          for (let i = 0; i < maxV - minV + 1; i++) {
            seriesData.push([i + delta / 2, countList[i] / countSum])
          }
          // const colorBar = [
          //   '#453781', //0-5
          //   '#32648e', //5-10
          //   '#238a8d', //10-15
          //   '#29af7f', //15-20
          //   '#74d055', //20-25
          //   '#fde725', //25-
          // ]
          this.distributeChart = echarts.init(this.$refs.distributeChart)
          var option = {
            color: colorBar,
            toolbox: {
              top: 0,
              right: '5%',
              feature: {
                saveAsImage: {},
                magicType: {
                  type: ['line', 'bar'],
                  option: {
                    line: {
                      smooth: true,
                      symbol: 'none',
                      lineStyle: {
                        color: '#5470c6',
                      },
                    },
                    bar: {
                      animationEasing: 'cubicOut',
                    },
                  },
                },
                dataView: {},
              },
            },
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow',
                // formatter: 'some text {value} some text',
              },
              formatter: function (params) {
                var str = `风速：${params[0].data[0] - delta / 2}-${
                  params[0].data[0] + delta / 2
                } m/s<br>频率：${(100 * params[0].data[1]).toFixed(2)}%`
                return str
              },
            },
            grid: {
              left: 45,
              right: '5%',
              bottom: 35,
              top: 50,
              containLabel: true,
            },
            xAxis: [
              {
                name: 'Speed',
                nameLocation: 'center',
                nameGap: 35,
                interval: 1,
                max: function (value) {
                  return value.max + delta / 2
                },
                splitLine: {
                  show: false,
                },
              },
            ],
            yAxis: [
              {
                name: 'Frequency',
                nameGap: 45,
                nameLocation: 'center',
                type: 'value',
                axisLabel: {
                  formatter: function (value) {
                    return value * 100 + '%'
                  },
                },
              },
            ],
            animationDuration: 500,
            animationEasing: 'cubicOut',
            series: [
              {
                colorBy: 'data',
                type: 'bar',
                barWidth: '100%',
                data: seriesData,
                itemStyle: {
                  borderColor: '#111',
                },
              },
            ],
          }
          option && this.distributeChart.setOption(option)
          window.onresize = () => {
            this.distributeChart.resize()
          }
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
        window.onresize = () => {}
      }
    },
  },
}
</script>
<style lang="less" scoped>
.windDistribute {
  height: 60vh;
}
</style>