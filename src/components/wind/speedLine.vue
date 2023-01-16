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
      <el-select v-model="timeRangeValue"
                 placeholder="选择时间范围"
                 size="small">
        <el-option-group>
          <el-option label="打开范围选择器..."
                     :value="0">
          </el-option>
        </el-option-group>
        <el-option-group>
          <el-option v-for="timeRange in timeRangeOptions"
                     :key="timeRange.value"
                     :label="timeRange.label"
                     :value="timeRange.value">
          </el-option>
        </el-option-group>

      </el-select>
      <el-popconfirm title="确定重置吗？"
                     @confirm="clearFilter">
        <el-button slot="reference"
                   size="mini"
                   plain>重置</el-button>
      </el-popconfirm>
    </div>

    <!-- 选择自定义日期的弹窗 -->
    <el-dialog title="自定义日期"
               :visible.sync="dialogVisible"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :show-close="false"
               width="40%">
      <div class="datepickerWrap">
        <el-date-picker v-model="userDefinedTimeRangeValue"
                        type="datetimerange"
                        :default-value="new Date('2016/1/1')"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期" />
        <div class="granularity">
          <span class="title">时间分辨率：</span>
          <el-radio v-model="granularityRadio"
                    label="raw">原始数据</el-radio>
          <el-radio v-model="granularityRadio"
                    label="hour"
                    :disabled="hourRadioDisabled">小时平均</el-radio>
          <el-radio v-model="granularityRadio"
                    label="day"
                    :disabled="dayRadioDisabled">日平均</el-radio>
        </div>
      </div>
      <span slot="footer">
        <el-button @click="handleDialogCancel">取 消</el-button>
        <el-button type="primary"
                   :disabled="userDefinedTimeRangeValue === null"
                   @click="handleDialogConfirm">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 遍历的风速-时间图 -->
    <div v-for="(options,index) in vforList"
         :key="index">
      <el-card class="card"
               shadow='never'
               v-loading="options.loading"
               v-show="((siteValue.indexOf(options.siteValue)!==-1)||(siteValue.length===0))&&((heightValue.indexOf(options.heightValue)!==-1)||(heightValue.length===0))">
        <div class="title">
          <p class="titleleft">{{options.siteLabel}}测风塔 {{options.heightLabel}}数据</p>
          <p class="titleright">{{timeScale}}</p>
        </div>
        <div class="windChart"
             :id="'speedLine'+options.siteLabel+options.heightLabel" />
      </el-card>
    </div>
  </div>
</template>

<script>
import { getSiteAndHeight } from '@/api/wind/getFilterData'
import { post4SpeedTimeData } from '@/api/wind/post4SpeedTimeData'

import * as echarts from 'echarts'
import dateFormatter from '@/utils/dateFormatter'
export default {
  data() {
    return {
      //筛选框的数据
      siteOptions: [],
      heightOptions: [],
      siteValue: [],
      heightValue: [],
      timeRangeValue: 1,
      oldTimeRangeValue: 1,
      timeRangeOptions: [
        { label: '近一小时', value: 1, type: '1h' },
        { label: '近一天', value: 2, type: '1d' },
        { label: '近一周', value: 3, type: '1w' },
        { label: '近一月', value: 4, type: '1m' },
        { label: '近一季度', value: 5, type: '1q' },
        { label: '近一年', value: 6, type: '1y' },
      ],
      userDefinedTimeRangeValue: null,
      granularityRadio: 'raw',
      dialogVisible: false,
      echartsList: null,
      vforList: [],
    }
  },
  watch: {
    timeRangeValue(newVal, oldVal) {
      //时间范围改变后重绘
      this.oldTimeRangeValue = oldVal
      if (newVal === 0) {
        // 7表示自定义的选项序号
        this.dialogVisible = true
      } else {
        this.drawLineCharts()
      }
    },
  },
  computed: {
    isHeightInSelectedSite() {
      //用于判断传入的高度选项是否在选中的site里
      return function (heightLable) {
        if (this.siteValue.length === 0) return true
        let status = false
        for (let i = 0; i < this.siteValue.length; i++) {
          if (
            this.siteAndHeight[this.siteValue[i]].height.indexOf(
              heightLable
            ) !== -1
          )
            status = true
        }
        return status
      }
    },
    hourRadioDisabled() {
      //判断什么时候屏蔽1h粒度选项
      if (this.userDefinedTimeRangeValue) {
        const YY0 = this.userDefinedTimeRangeValue[0].getFullYear()
        const YY1 = this.userDefinedTimeRangeValue[1].getFullYear()
        const MM0 = this.userDefinedTimeRangeValue[0].getMonth() + 1
        const MM1 = this.userDefinedTimeRangeValue[1].getMonth() + 1
        const DD0 = this.userDefinedTimeRangeValue[0].getDate()
        const DD1 = this.userDefinedTimeRangeValue[1].getDate()
        const hh0 = this.userDefinedTimeRangeValue[0].getHours()
        const hh1 = this.userDefinedTimeRangeValue[1].getHours()
        return YY0 === YY1 && MM0 === MM1 && DD0 === DD1 && hh0 === hh1
          ? true
          : false
      } else {
        return true
      }
    },
    dayRadioDisabled() {
      //判断什么时候屏蔽1d粒度选项
      if (this.userDefinedTimeRangeValue) {
        const YY0 = this.userDefinedTimeRangeValue[0].getFullYear()
        const YY1 = this.userDefinedTimeRangeValue[1].getFullYear()
        const MM0 = this.userDefinedTimeRangeValue[0].getMonth() + 1
        const MM1 = this.userDefinedTimeRangeValue[1].getMonth() + 1
        const DD0 = this.userDefinedTimeRangeValue[0].getDate()
        const DD1 = this.userDefinedTimeRangeValue[1].getDate()
        return YY0 === YY1 && MM0 === MM1 && DD0 === DD1 ? true : false
      } else {
        return true
      }
    },
    timeScale() {
      //在画的图右上角显示时间尺度
      if (this.timeRangeValue === 0) {
        return ''
      } else if (this.timeRangeValue <= 6) {
        return this.timeRangeOptions[
          this.timeRangeOptions.findIndex(
            (item) => item.value == this.timeRangeValue
          )
        ].label
      } else {
        const datetimeStart = dateFormatter(
          this.userDefinedTimeRangeValue[0],
          'Chinese'
        )
        const datetimeEnd = dateFormatter(
          this.userDefinedTimeRangeValue[1],
          'Chinese'
        )
        return `${datetimeStart} 至 ${datetimeEnd}`
      }
    },
  },
  methods: {
    //弹窗相关处理
    handleDialogCancel() {
      this.timeRangeValue = this.oldTimeRangeValue
      this.userDefinedTimeRangeValue = null
      this.granularityRadio = 'raw'
      this.dialogVisible = false
    },
    handleDialogConfirm() {
      if (this.timeRangeOptions.length === 6 + 1) {
        this.timeRangeOptions.splice(
          this.timeRangeOptions.findIndex((item) => item.value == 6 + 1),
          1
        )
      }
      this.timeRangeOptions.push({
        label: '自定义范围',
        value: 6 + 1,
        type: 'user-defined',
      })
      this.timeRangeValue = 6 + 1
      this.dialogVisible = false
    },
    clearFilter() {
      //重置按钮
      this.siteValue = []
      this.heightValue = []
      this.timeRangeValue = 1
      this.oldTimeRangeValue = 1
      this.userDefinedTimeRangeValue = null
      if (this.timeRangeOptions.length === 6 + 1) {
        this.timeRangeOptions.splice(
          this.timeRangeOptions.findIndex((item) => item.value == 0),
          1
        )
      }
    },
    fetchFilterData() {
      getSiteAndHeight().then((res) => {
        //获取筛选框的站点和高度数据
        this.siteAndHeight = res.data
        this.siteOptions = res.data.map((item) => item.site)
        this.heightOptions = []
        res.data.forEach((siteObj) => {
          siteObj.height.forEach((heightObj) => {
            if (this.heightOptions.indexOf(heightObj) === -1) {
              this.heightOptions.push(heightObj)
            }
          })
        })

        //根据每个测风塔有的高度数据生成v-for要用到的数组
        res.data.forEach((siteObj, siteIndex) => {
          siteObj.height.forEach((heightObj) => {
            this.vforList.push({
              value: this.vforList.length,
              siteLabel: siteObj.site,
              siteValue: siteIndex,
              heightLabel: heightObj,
              heightValue: this.heightOptions.indexOf(heightObj),
              loading: true,
            })
          })
        })
        //初始化echarts的列表
        this.echartsList = new Array(this.siteOptions.length)
        for (var i = 0; i < this.siteOptions.length; i++) {
          this.echartsList[i] = new Array(this.heightOptions.length)
        }
        this.$nextTick(() => {
          this.drawLineCharts()
        })
      })
    },
    drawLineCharts() {
      this.vforList.forEach((item) => {
        item.loading = true
      })
      //遍历之前先确定时间范围
      const selectedIndex = this.timeRangeOptions.findIndex(
        (item) => item.value == this.timeRangeValue
      )
      var data = {
        site: null,
        height: null,
        type: this.timeRangeOptions[selectedIndex].type,
        dateBegin: null,
        dateEnd: null,
        granularity: null,
      }
      if (data.type === 'user-defined' && this.userDefinedTimeRangeValue) {
        const datetimes = this.userDefinedTimeRangeValue
        data.dateBegin = dateFormatter(datetimes[0], 'typical')
        data.dateEnd = dateFormatter(datetimes[1], 'typical')
        data.granularity = this.granularityRadio
      }
      //遍历获取数据并画图
      this.vforList.forEach((item) => {
        data.site = item.siteLabel
        data.height = item.heightLabel
        post4SpeedTimeData(data)
          .then((res) => {
            if (!this.echartsList[item.siteValue][item.heightValue]) {
              this.echartsList[item.siteValue][item.heightValue] = echarts.init(
                document.getElementById(
                  'speedLine' + item.siteLabel + item.heightLabel
                )
              )
            }
            var option = {
              color: ['#5470c6', '#73c0de', '#9fdede'],
              tooltip: {
                trigger: 'axis',
                valueFormatter: (value) => value + ' m/s',
              },
              legend: {},

              grid: {
                containLabel: true,
                left: '2%',
                right: '3%',
                top: '10%',
                bottom: '2%',
              },

              xAxis: {
                type: 'time',

                // splitNumber: 11,
                // axisTick: {
                //   alignWithLabel: true,
                // },
              },
              yAxis: [
                {
                  type: 'value',
                  axisLabel: {
                    formatter: '{value} m/s',
                  },
                },
              ],
              series: [],
            }
            // 判断最大/最小速度数据是否存在，若存在再画折线图
            var avgData = []
            if ('maxSpeed' in res.data[0]) var maxData = []
            if ('minSpeed' in res.data[0]) var minData = []
            res.data.forEach((item) => {
              var time = new Date(item.chartTime)
              var chartTime = dateFormatter(time, 'typical')
              avgData.push({
                name: time.toString(),
                value: [chartTime, item.speed],
              })
              if ('maxSpeed' in res.data[0]) {
                maxData.push({
                  name: time.toString(),
                  value: [chartTime, item.maxSpeed],
                })
              }
              if ('minSpeed' in res.data[0]) {
                minData.push({
                  name: time.toString(),
                  value: [chartTime, item.minSpeed],
                })
              }
            })
            if ('maxSpeed' in res.data[0]) {
              option.series.push({
                name: '最大风速',
                data: maxData,
                type: 'line',
                symbol: 'none',
                // symbolSize: [8, 15],
                // symbolRotate: (value) => 180 - value[2],
              })
            }
            option.series.push({
              name: '平均风速',
              data: avgData,
              type: 'line',
              symbol: 'none',
              // symbolSize: [8, 15],
              // symbolRotate: (value) => 180 - value[2],
            })
            if ('minSpeed' in res.data[0]) {
              option.series.push({
                name: '最小风速',
                data: minData,
                type: 'line',
                symbol: 'none',
                // symbolSize: [8, 15],
                // symbolRotate: (value) => 180 - value[2],
              })
            }

            this.echartsList[item.siteValue][item.heightValue].setOption(option)
            item.loading = false
          })
          .catch((e) => {
            console.log(e)
          })
      })
    },
  },
  mounted() {
    this.fetchFilterData()
    window.onresize = () => {
      this.echartsList.forEach((sites) => {
        sites.forEach((obj) => {
          obj.resize()
        })
      })
    }
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
.datepickerWrap {
  text-align: center;
}
.granularity {
  margin-top: 20px;
  .title {
    margin-right: 20px;
  }
}
.card {
  margin-top: 5px;
  margin-bottom: 10px;
  .title {
    display: flex;
    justify-content: space-between;
    .titleleft,
    .titleright {
      margin: 0px 0px 10px 0px;
    }
  }

  .windChart {
    height: 280px;
  }
}
</style>