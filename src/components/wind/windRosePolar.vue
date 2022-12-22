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
          <p class="title">{{options.siteLabel}}测风塔{{options.heightLabel}}数据</p>
          <div class="windrose"
               ref="roseChart"
               :id="options.siteLabel+options.heightLabel"></div>
        </el-card>
      </div>
    </div>
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
import { getSiteData, getHeightData } from '@/api/wind/getFilterData'
import { postData } from '@/api/wind/postRoseData.js'
import * as echarts from 'echarts'
export default {
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
      vforList: [], //为了一个v-for就能遍历
      echartsList: [],
      //风速分布弹窗的数据
      dialogVisible: false,
      drawDistributeParams: {}, //用于弹窗画图的全局传参
      distributeChart: null,
    }
  },
  watch: {
    dateValue(newVal, oldVal) {
      this.echartsList.forEach((echartsObj) => {
        echartsObj.dispose()
      })
      this.echartsList = []
      this.loading = true
      console.log(this.dateValue)
      this.drawRoseData()
    },
  },
  methods: {
    clearFilter() {
      this.siteValue = []
      this.heightValue = []
      this.dateValue = []
    },
    fetchFilterData() {
      getSiteData()
        .then((res) => {
          res.data.forEach((site) => {
            this.siteOptions.push({
              value: this.siteOptions.length + 1,
              label: site,
            })
          })
          getHeightData()
            .then((res) => {
              res.data.forEach((height) => {
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

              this.$nextTick(() => {
                this.drawRoseData()
              })
            })
            .catch((e) => {
              console.log(e)
            })
        })
        .catch((e) => {
          console.log(e)
        })
    },
    drawRoseData() {
      var that = this
      const range = [0, 5, 10, 15, 20] //表示风速范围[0,5),[5,10),[10,15),[15,20),[20,inf)
      this.siteOptions.forEach((site) => {
        this.heightOptions.forEach((height) => {
          drawSingleRose(site, height, range, that)
        })
      })

      function drawSingleRose(site, height, range) {
        const data = {
          site: site.label,
          height: height.label,
          range: range,
          dateBegin: null,
          dateEnd: null,
        }

        if (that.dateValue !== null) {
          var YY0 = that.dateValue[0].getFullYear()
          var MM0 = that.dateValue[0].getMonth() + 1
          var DD0 = that.dateValue[0].getDate()
          var hh0 = that.dateValue[0].getHours()
          var mm0 = that.dateValue[0].getMinutes()
          var ss0 = that.dateValue[0].getSeconds()
          var YY1 = that.dateValue[1].getFullYear()
          var MM1 = that.dateValue[1].getMonth() + 1
          var DD1 = that.dateValue[1].getDate()
          var hh1 = that.dateValue[1].getHours()
          var mm1 = that.dateValue[1].getMinutes()
          var ss1 = that.dateValue[1].getSeconds()
          data.dateBegin = `${YY0}-${MM0}-${DD0} ${hh0}:${mm0}:${ss0}`
          data.dateEnd = `${YY1}-${MM1}-${DD1} ${hh1}:${mm1}:${ss1}`
        }
        console.log(data)
        postData(data)
          .then((res) => {
            var roseData = res.data
            that.echartsList.push(
              echarts.init(document.getElementById(site.label + height.label))
            )
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

            option &&
              that.echartsList[that.echartsList.length - 1].setOption(option)
            that.loading = false
            that.echartsList[that.echartsList.length - 1].on(
              'click',
              (params) => {
                that.drawDistributeParams = {
                  dataIndex: params.dataIndex,
                }
                console.log(params.dataIndex)
                that.dialogVisible = true
              }
            )

            window.onresize = () => {
              that.echartsList[that.echartsList.length - 1].resize()
            }
          })
          .catch((e) => {
            console.log(e)
          })
      }
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
  created() {},
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
  height: 300px;
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
.windDistribute {
  height: 300px;
}
</style>

