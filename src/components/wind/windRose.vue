<template>
  <div>
    <div class="filterbox">
      <!-- 筛选栏 -->
      <span>筛选条件：</span>
      <el-select v-model="siteValue"
                 multiple
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

      <el-popconfirm title="确定重置吗？"
                     @confirm="clearFilter">
        <el-button slot="reference"
                   size="mini"
                   plain>重置</el-button>
      </el-popconfirm>
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
                 v-loading="options.loading">
          <div class="title">
            <p class="titleleft">{{options.siteLabel}}测风塔 {{options.heightLabel}}数据</p>
            <el-button type="text"
                       @click="drawPDF(options.siteLabel,options.heightLabel)">风速PDF</el-button>
          </div>
          <div class="windrose"
               ref="roseChart"
               :id="'windRose'+options.siteLabel+options.heightLabel"></div>
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
import { post4WDData } from '@/api/wind/post4RoseData.js'
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
    drawPDF(site, height) {
      this.dialogTitle = `${site}站点 ${height}高度风速概率密度函数`
      this.drawDistributeParams = {
        siteLabel: site,
        heightLabel: height,
        dirIndex: 'all',
        dateRange: this.dateValue,
      }
      this.dialogVisible = true
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
                loading: true,
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
            this.drawRoseData()
          })
        })
        .catch((e) => {
          console.log(e)
        })
    },
    drawRoseData() {
      var dateBegin = null
      var dateEnd = null
      if (this.dateValue) {
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
        dateBegin = `${YY0}-${MM0}-${DD0} ${hh0}:${mm0}:${ss0}`
        dateEnd = `${YY1}-${MM1}-${DD1} ${hh1}:${mm1}:${ss1}`
      }
      this.vforList.forEach((item) => {
        const data = {
          site: item.siteLabel,
          height: item.heightLabel,
          range: this.range,
          dateBegin: dateBegin,
          dateEnd: dateEnd,
        }

        post4WDData(data)
          .then((res) => {
            var roseData = res.data
            this.echartsList[item.siteValue - 1][item.heightValue - 1] =
              echarts.init(
                document.getElementById(
                  'windRose' + item.siteLabel + item.heightLabel
                )
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
            item.loading = false
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
      this.vforList.forEach((item) => {
        item.loading = true
      })
      var data = {
        site: null,
        height: null,
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
      this.vforList.forEach((ele) => {
        (data.site = ele.siteLabel),
          (data.height = ele.heightLabel),
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

              this.echartsList[ele.siteValue - 1][
                ele.heightValue - 1
              ].setOption(option, { notMerge: true })
              ele.loading = false
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

.roseGroup {
  display: flex; //弹性布局
  // justify-content: space-between; //中间空隙自适应
  flex-wrap: wrap; //自适应分行
  /deep/.el-card__body {
    padding: 15px;
  }
  .card {
    width: 280px;
    margin: 5px;
    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .titleleft {
        margin: 0px;
      }
    }

    .windrose {
      height: 340px;
    }
  }
}
/deep/.el-dialog__body {
  padding-top: 0px;
}
</style>

