<template>
  <div>
    <div class="filterbox">
      <!-- 筛选栏 -->
      <span>筛选条件：</span>
      <el-select v-model="siteValue"
                 multiple
                 collapse-tags
                 placeholder="选择测风塔"
                 size="small">
        <el-option v-for="site in siteOptions"
                   :key="site.value"
                   :label="site.label"
                   :value="site.value">
        </el-option>
      </el-select>
      <el-select v-model="heightValue"
                 multiple
                 collapse-tags
                 placeholder="选择高度"
                 size="small">
        <el-option v-for="height in heightOptions"
                   :key="height.value"
                   :label="height.label"
                   :value="height.value">
        </el-option>
      </el-select>

      <el-date-picker v-model="dateValue"
                      size="small"
                      type="datetimerange"
                      :default-value="new Date('2016/1/1')"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期">
      </el-date-picker>

      <el-button size="mini"
                 plain
                 @click="clearFilter">清除</el-button>
    </div>
    <!-- 遍历的风玫瑰图 -->

    <div class="roseGroup">
      <div v-for="options in vforList"
           :key="options.value">
        <!-- <el-divider content-position="left"
                    v-if="options.heightValue==1&&(siteValue.indexOf(options.siteValue)!=-1)">{{options.siteLabel}}测风塔</el-divider> -->
        <el-card class="card"
                 shadow="never"
                 v-show="((siteValue.indexOf(options.siteValue)!=-1)||(siteValue.length==0))&&((heightValue.indexOf(options.heightValue)!=-1)||(heightValue.length==0))"
                 v-loading="loading">
          <p class="title">{{options.siteLabel}}测风塔 {{options.heightLabel}}数据</p>
          <div class="windrose"
               ref="roseChart"
               :id="options.siteLabel+options.heightLabel"></div>
        </el-card>
      </div>
    </div>
    <el-dialog :title="dialogTitle"
               :visible.sync="dialogVisible"
               width="60%"
               @opened="parentDrawDistribute"
               @close="parentCloseDialog">
      <ws-distri-dialog :selectedSpan="drawDistributeParams"
                        ref="distriDialog"></ws-distri-dialog>
    </el-dialog>
  </div>
</template>

<script>
import { getSiteData, getHeightData } from '@/api/wind/getFilterData'
import { post4WDData } from '@/api/wind/postRoseData.js'
import wsDistriDialog from '@/components/wind/windRose/wsDistriDialog.vue'
import * as echarts from 'echarts'
import colorBar from '@/json/windRose/colorBar.json'
export default {
  components: { wsDistriDialog },
  data() {
    return {
      //筛选框的数据
      siteOptions: [],
      heightOptions: [],
      siteValue: [],
      heightValue: [],
      dateValue: null,
      //加载遮罩的状态
      loading: true,
      //所有的echarts玫瑰图
      range: [0, 3, 5, 7, 9, 11, 13, 15], //要画的风速区间
      vforList: [], //为了一个v-for就能遍历
      echartsList: null,
      //风速分布弹窗的数据
      dialogVisible: false,
      dialogTitle: null,
      drawDistributeParams: {}, //用于弹窗画图的全局传参
    }
  },
  watch: {
    dateValue() {
      this.redrawRose()
    },
  },
  methods: {
    clearFilter() {
      this.siteValue = []
      this.heightValue = []
      this.dateValue = null
    },
    fetchFilterData() {
      Promise.all([getSiteData(), getHeightData()])
        .then((res) => {
          const siteRes = res[0].data
          const heightRes = res[1].data
          siteRes.forEach((site) => {
            this.siteOptions.push({
              value: this.siteOptions.length + 1,
              label: site,
            })
          })
          heightRes.forEach((height) => {
            this.heightOptions.push({
              value: this.heightOptions.length + 1,
              label: height,
            })
          })
          this.siteOptions.forEach((siteValue) => {
            this.heightOptions.forEach((heightValue) => {
              this.vforList.push({
                value: this.vforList.length,
                siteLabel: siteValue.label,
                siteValue: siteValue.value,
                heightLabel: heightValue.label,
                heightValue: heightValue.value,
              })
            })
          })
          // 有问题的代码(改一个值会导致其他值一起改掉，会出错)
          // this.echartsList = new Array(this.siteOptions.length).fill(
          //   new Array(this.heightOptions.length).fill(null)
          // )
          this.echartsList = new Array(this.siteOptions.length)
          for (var i = 0; i < this.siteOptions.length; i++) {
            this.echartsList[i] = new Array(this.heightOptions.length)
          }
          this.$nextTick(() => {
            this.drawRoseData(this.range)
          })
        })
        .catch((e) => {
          console.log(e)
        })
    },
    drawRoseData() {
      this.vforList.forEach((item) => {
        //
        const data = {
          site: item.siteLabel,
          height: item.heightLabel,
          range: this.range,
          dateBegin: null,
          dateEnd: null,
        }
        if (this.dateValue !== null) {
          var YY0 = this.dateValue[0].getFullYear()
          var MM0 = this.dateValue[0].getMonth() + 1
          var DD0 = this.dateValue[0].getDate()
          var hh0 = this.dateValue[0].getHours()
          var mm0 = this.dateValue[0].getMinutes()
          var ss0 = this.dateValue[0].getSeconds()
          var YY1 = this.dateValue[1].getFullYear()
          var MM1 = this.dateValue[1].getMonth() + 1
          var DD1 = this.dateValue[1].getDate()
          var hh1 = this.dateValue[1].getHours()
          var mm1 = this.dateValue[1].getMinutes()
          var ss1 = this.dateValue[1].getSeconds()
          data.dateBegin = `${YY0}-${MM0}-${DD0} ${hh0}:${mm0}:${ss0}`
          data.dateEnd = `${YY1}-${MM1}-${DD1} ${hh1}:${mm1}:${ss1}`
        }
        post4WDData(data)
          .then((res) => {
            var roseData = res.data

            // const colorBar = [
            //   '#453781', //0-5
            //   '#32648e', //5-10
            //   '#238a8d', //10-15
            //   '#29af7f', //15-20
            //   '#74d055', //20-25
            //   '#fde725', //25-
            // ]

            this.echartsList[item.siteValue - 1][item.heightValue - 1] =
              echarts.init(
                document.getElementById(item.siteLabel + item.heightLabel)
              )
            var seriesData = []
            var color = []
            //极坐标堆叠图的数据是从正北方向顺时针排布
            for (var key in roseData) {
              if (roseData[key].length != 0) {
                var index = Math.round(
                  (this.range.indexOf(parseInt(key.split('-')[0])) /
                    (this.range.length - 1)) *
                    (colorBar.length - 1)
                )
                color.push(colorBar[index])
              }

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
              color: color,
              // title: {
              //   text: `${item.siteLabel} ${item.heightLabel}风向玫瑰图`,
              // },
              tooltip: {
                trigger: 'item',
                axisPointer: {
                  type: 'shadow',
                },
                confine: true,
                borderColor: '#333',
                padding: [5, 10],
                position: 'top',
                formatter: '点击查看该方向的风速分布',
                textStyle: {
                  fontSize: 13,
                },
              },
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
                center: ['50%', '35%'],
                radius: '72%', //半径大小
              },
              series: seriesData,
              legend: {
                // orient: 'vertical',
                x: 'center',
                y: 'bottom',
                formatter: '{name} m/s',
              },
            }

            this.echartsList[item.siteValue - 1][
              item.heightValue - 1
            ].setOption(option)
            this.loading = false
            this.echartsList[item.siteValue - 1][item.heightValue - 1].on(
              'click',
              (params) => {
                const dirList = [
                  'N',
                  'NNE',
                  'NE',
                  'NEE',
                  'E',
                  'SEE',
                  'SE',
                  'SSE',
                  'S',
                  'SSW',
                  'SW',
                  'SWW',
                  'W',
                  'NWW',
                  'NW',
                  'NNW',
                ]
                this.dialogTitle = `${item.siteLabel}站点 ${
                  item.heightLabel
                }高度 ${dirList[params.dataIndex]}方向风速分布`
                this.drawDistributeParams = {
                  siteLabel: item.siteLabel,
                  heightLabel: item.heightLabel,
                  dirIndex: params.dataIndex,
                  dateRange: this.dateValue,
                }
                this.dialogVisible = true
              }
            )
          })
          .catch((e) => {
            console.log(e)
          })
      })
    },
    redrawRose() {
      this.loading = true
      this.vforList.forEach((ele) => {
        var data = {
          site: ele.siteLabel,
          height: ele.heightLabel,
          range: this.range,
          dateBegin: null,
          dateEnd: null,
        }
        if (this.dateValue !== null) {
          var YY0 = this.dateValue[0].getFullYear()
          var MM0 = this.dateValue[0].getMonth() + 1
          var DD0 = this.dateValue[0].getDate()
          var hh0 = this.dateValue[0].getHours()
          var mm0 = this.dateValue[0].getMinutes()
          var ss0 = this.dateValue[0].getSeconds()
          var YY1 = this.dateValue[1].getFullYear()
          var MM1 = this.dateValue[1].getMonth() + 1
          var DD1 = this.dateValue[1].getDate()
          var hh1 = this.dateValue[1].getHours()
          var mm1 = this.dateValue[1].getMinutes()
          var ss1 = this.dateValue[1].getSeconds()
          data.dateBegin = `${YY0}-${MM0}-${DD0} ${hh0}:${mm0}:${ss0}`
          data.dateEnd = `${YY1}-${MM1}-${DD1} ${hh1}:${mm1}:${ss1}`
        }
        post4WDData(data)
          .then((res) => {
            var color = []
            var roseData = res.data
            var seriesData = []
            for (var key in roseData) {
              if (roseData[key].length != 0) {
                var index = Math.round(
                  (this.range.indexOf(parseInt(key.split('-')[0])) /
                    (this.range.length - 1)) *
                    (colorBar.length - 1)
                )
                color.push(colorBar[index])
              }
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
                })
              }
            }

            var option =
              this.echartsList[ele.siteValue - 1][
                ele.heightValue - 1
              ].getOption()
            option.series = seriesData
            option.color = color

            this.echartsList[ele.siteValue - 1][ele.heightValue - 1].setOption(
              option,
              { notMerge: true }
            )
            this.loading = false
          })
          .catch((e) => {
            console.log(e)
          })
      })
    },
    parentDrawDistribute() {
      this.$refs.distriDialog.drawDistribute()
    },
    parentCloseDialog() {
      this.$refs.distriDialog.closeDialog()
    },
  },
  mounted() {
    this.fetchFilterData()
  },
}
</script>
<style lang="less" scoped>
/deep/.el-card__body {
  padding: 15px;
}
.filterbox {
  margin-bottom: 10px;
  .el-select,
  .el-date-picker {
    margin-left: 5px;
    margin-right: 5px;
  }

  .el-button {
    margin-left: 5px;
  }
}
.windrose {
  height: 340px;
}
.roseGroup {
  display: flex; //弹性布局
  // justify-content: space-between; //中间空隙自适应
  flex-wrap: wrap; //自适应分行
  .card {
    width: 280px;
    margin: 5px;
    .title {
      margin: 0px 0px 10px 0px;
      text-align: center;
    }
  }
}
/deep/.el-dialog__body {
  padding-top: 0px;
}
</style>

