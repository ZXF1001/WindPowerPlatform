<template>
  <div>
    <div class="filterbox">
      <!-- 筛选栏 -->
      <span>筛选条件：</span>
      <el-select v-model="siteValue"
                 multiple
                 placeholder="选择测风塔"
                 size="small">
        <el-option v-for="(site,index) in siteOptions"
                   :key="index"
                   :label="site"
                   :value="index">

        </el-option>
      </el-select>
      <el-select v-model="heightValue"
                 multiple
                 placeholder="选择高度"
                 size="small">
        <el-option v-for="(height,index) in heightOptions"
                   :disabled="!isHeightInSelectedSite(height)"
                   :key="index"
                   :label="height"
                   :value="index">
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
      <div v-for="(options,index) in vforList"
           :key="index">
        <el-card class="card"
                 shadow="never"
                 v-show="((siteValue.indexOf(options.siteValue)!==-1)||(siteValue.length===0))&&((heightValue.indexOf(options.heightValue)!==-1)||(heightValue.length===0))"
                 v-loading="options.loading">
          <div class="title">
            <p class="titleleft">{{options.siteLabel}}测风塔 {{options.heightLabel}}数据</p>
            <el-button type="text"
                       @click="drawPDF(options.siteLabel,options.heightLabel)">风速PDF</el-button>
          </div>
          <div class="windrose"
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
import { getSiteAndHeight } from '@/api/wind/getFilterData'
import { post4WDData } from '@/api/wind/post4RoseData.js'
import wsDistriDialog from '@/components/wind/windRose/wsDistriDialog.vue'
import * as echarts from 'echarts'
import colorBar from '@/json/windRose/colorBar.json'
import dateFormatter from '@/utils/dateFormatter'
export default {
  components: { wsDistriDialog },
  data() {
    return {
      //筛选框的数据
      siteOptions: [], //所有的site选项
      heightOptions: [], //所有的height选项
      siteValue: [], //选择的site选项的value值
      heightValue: [], //选择的height选项的value值
      dateValue: null, //选择的日期范围
      //所有的echarts玫瑰图
      range: [0, 3, 5, 7, 9, 11, 13, 15], //要画的风速区间
      vforList: [], //为了一个v-for就能遍历（不然嵌套v-for会导致每个site的几张图为一组，不同site的组中间会换行）
      echartsList: null, //存放所有echarts实例方便redraw
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
  computed: {
    isHeightInSelectedSite() {
      //用于判断传入的高度选项是否在选中的site里
      return function (heightLable) {
        if (this.siteValue.length === 0) return true

        for (let i = 0; i < this.siteValue.length; i++) {
          if (
            this.siteAndHeight[this.siteValue[i]].height.indexOf(
              heightLable
            ) !== -1
          )
            return true
        }
        return false
      }
    },
  },
  methods: {
    clearFilter() {
      //重置按钮
      this.siteValue = []
      this.heightValue = []
      this.dateValue = null
    },
    drawPDF(site, height) {
      //PDF弹窗
      this.dialogTitle = `${site}测风塔 ${height}高度风速概率密度函数`
      this.drawDistributeParams = {
        siteLabel: site,
        heightLabel: height,
        dirIndex: 'all',
        dateRange: this.dateValue,
      }
      this.dialogVisible = true
    },
    fetchFilterData() {
      getSiteAndHeight().then((res) => {
        //获取筛选框的站点和高度数据
        this.siteAndHeight = res.data
        this.siteOptions = res.data.map((item) => item.site)
        this.heightOptions = []
        for (let i = 0; i < res.data.length; i++) {
          const siteObj = res.data[i]
          for (let j = 0; j < siteObj.height.length; j++) {
            const heightObj = siteObj.height[j]
            if (this.heightOptions.indexOf(heightObj) === -1) {
              this.heightOptions.push(heightObj)
            }
          }
        }

        //根据每个测风塔有的高度数据生成v-for要用到的数组
        for (let i = 0; i < res.data.length; i++) {
          const siteObj = res.data[i]
          for (let j = 0; j < siteObj.height.length; j++) {
            const heightObj = siteObj.height[j]
            this.vforList.push({
              value: this.vforList.length,
              siteLabel: siteObj.site,
              siteValue: i,
              heightLabel: heightObj,
              heightValue: this.heightOptions.indexOf(heightObj),
              loading: true,
            })
          }
        }

        //初始化echarts的列表
        this.echartsList = new Array(this.siteOptions.length)
        for (let i = 0; i < this.siteOptions.length; i++) {
          this.echartsList[i] = new Array(this.heightOptions.length)
        }
        this.$nextTick(() => {
          this.drawRoseData()
        })
      })
    },
    drawRoseData() {
      let dateBegin = null
      let dateEnd = null
      if (this.dateValue) {
        dateBegin = dateFormatter(this.dateValue[0], 'typical')
        dateEnd = dateFormatter(this.dateValue[1], 'typical')
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
            const roseData = res.data
            this.echartsList[item.siteValue][item.heightValue] = echarts.init(
              document.getElementById(
                'windRose' + item.siteLabel + item.heightLabel
              )
            )
            const seriesData = []
            const color = []
            //极坐标堆叠图的数据是从正北方向顺时针排布

            for (const key in roseData) {
              if (roseData[key].length != 0) {
                const index = Math.round(
                  (this.range.indexOf(parseInt(key.split('-')[0])) /
                    (this.range.length - 1)) *
                    (colorBar.length - 1)
                )
                color.push(colorBar[index])
              }

              const barData = []
              for (let i = 0; i < roseData[key].length; i++) {
                const dirData = roseData[key][i]
                barData[dirData.direction] = dirData.frequency
              }

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

            const option = {
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

            this.echartsList[item.siteValue][item.heightValue].setOption(option)
            item.loading = false
            this.echartsList[item.siteValue][item.heightValue].on(
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
      const data = {
        site: null,
        height: null,
        range: this.range,
        dateBegin: null,
        dateEnd: null,
      }
      if (this.dateValue !== null) {
        data.dateBegin = dateFormatter(this.dateValue[0], 'typical')
        data.dateEnd = dateFormatter(this.dateValue[1], 'typical')
      }
      this.vforList.forEach((ele) => {
        (data.site = ele.siteLabel),
          (data.height = ele.heightLabel),
          post4WDData(data)
            .then((res) => {
              const color = []
              const roseData = res.data
              const seriesData = []
              for (const key in roseData) {
                if (roseData[key].length != 0) {
                  const index = Math.round(
                    (this.range.indexOf(parseInt(key.split('-')[0])) /
                      (this.range.length - 1)) *
                      (colorBar.length - 1)
                  )
                  color.push(colorBar[index])
                }
                const barData = []
                for (let i = 0; i < roseData[key].length; i++) {
                  const dirData = roseData[key][i]
                  barData[dirData.direction] = dirData.frequency
                }
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

              const option =
                this.echartsList[ele.siteValue][ele.heightValue].getOption()
              option.series = seriesData
              option.color = color

              this.echartsList[ele.siteValue][ele.heightValue].setOption(
                option,
                { notMerge: true }
              )
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
  beforeDestroy() {},
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

