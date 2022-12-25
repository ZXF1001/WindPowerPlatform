<template>
  <!-- 点击玫瑰图弹窗 -->
  <div>
    <!-- <h3>{{selectedSpan}}</h3> -->
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
import colorBar from '@/json/windRose/colorBar.json'
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
          var countSum = 0
          res.data.forEach((range) => {
            maxV =
              parseInt(range.rangeStart) > maxV
                ? parseInt(range.rangeStart)
                : maxV
            countSum += parseInt(range.count)
          })

          if (maxV >= colorBar.length) {
            for (let i = 0; i < maxV + 1; i++) {
              colorBar.push(colorBar[colorBar.length - 1])
            }
          }
          const delta = 1 //表示单个速度范围的跨度，与后端一致
          var seriesData = []

          var countList = new Array(maxV - minV + 1).fill(0)
          res.data.forEach((range) => {
            countList[parseInt(range.rangeStart)] = parseInt(range.count)
          })
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
                      // colorBy: 'data',
                    },
                    bar: {
                      animationEasing: 'cubicOut',
                    },
                  },
                },
              },
            },
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow',
                // formatter: 'some text {value} some text',
              },
              formatter: function (params) {
                console.log(params[0])
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