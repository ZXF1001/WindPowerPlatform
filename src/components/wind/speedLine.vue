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

      <el-button size="mini"
                 plain
                 @click="test">test</el-button>
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
    <div v-for="options in vforList"
         :key="options.value">
      <el-card class="card"
               shadow='never'
               v-loading="options.loading"
               v-show="((siteValue.indexOf(options.siteValue)!=-1)||(siteValue.length==0))&&((heightValue.indexOf(options.heightValue)!=-1)||(heightValue.length==0))">
        <div class="title">
          <p class="titleleft">{{options.siteLabel}}测风塔 {{options.heightLabel}}数据</p>
          <p class="titleright">{{timeScale}}</p>
        </div>
        <div class="windChart"
             ref="windChart"
             :id="'speedLine'+options.siteLabel+options.heightLabel" />
      </el-card>
    </div>
  </div>
</template>

<script>
import { getSiteAndHeight } from '@/api/wind/getFilterData'
import { post4SpeedTimeData } from '@/api/wind/post4SpeedTimeData'

import * as echarts from 'echarts'
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
      fetchController: null,
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
        const YY0 = this.userDefinedTimeRangeValue[0].getFullYear()
        const YY1 = this.userDefinedTimeRangeValue[1].getFullYear()
        const MM0 = this.userDefinedTimeRangeValue[0].getMonth() + 1
        const MM1 = this.userDefinedTimeRangeValue[1].getMonth() + 1
        const DD0 = this.userDefinedTimeRangeValue[0].getDate()
        const DD1 = this.userDefinedTimeRangeValue[1].getDate()
        const hh0 = this.userDefinedTimeRangeValue[0].getHours()
        const hh1 = this.userDefinedTimeRangeValue[1].getHours()
        const mm0 = this.userDefinedTimeRangeValue[0].getMinutes()
        const mm1 = this.userDefinedTimeRangeValue[1].getMinutes()
        const ss0 = this.userDefinedTimeRangeValue[0].getSeconds()
        const ss1 = this.userDefinedTimeRangeValue[1].getSeconds()
        return `${YY0}年${MM0}月${DD0}日${hh0 < 10 ? '0' + hh0 : hh0}:${
          mm0 < 10 ? '0' + mm0 : mm0
        }:${ss0 < 10 ? '0' + ss0 : ss0}至${YY1}年${MM1}月${DD1}日${
          hh1 < 10 ? '0' + hh1 : hh1
        }:${mm1 < 10 ? '0' + mm1 : mm1}:${ss1 < 10 ? '0' + ss1 : ss1}`
      }
    },
  },
  methods: {
    test() {},
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
        var siteOptions = res.data.map((item) => item.site)
        var heightOptions = []
        res.data.forEach((siteObj) => {
          siteObj.height.forEach((heightObj) => {
            if (heightOptions.indexOf(heightObj) === -1) {
              heightOptions.push(heightObj)
            }
          })
        })
        siteOptions.forEach((element, index) => {
          this.siteOptions.push({
            value: index + 1,
            label: element,
          })
        })
        heightOptions.forEach((element) => {
          this.heightOptions.push({
            value: this.heightOptions.length + 1,
            label: element,
          })
        })
        //根据每个测风塔有的高度数据生成v-for要用到的数组
        res.data.forEach((siteObj, siteIndex) => {
          siteObj.height.forEach((heightObj) => {
            this.vforList.push({
              value: this.vforList.length,
              siteLabel: siteObj.site,
              siteValue: siteIndex + 1,
              heightLabel: heightObj,
              heightValue: heightOptions.indexOf(heightObj) + 1,
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
        const datetime = this.userDefinedTimeRangeValue
        var YY0 = datetime[0].getFullYear()
        var MM0 = datetime[0].getMonth() + 1
        var DD0 = datetime[0].getDate()
        var hh0 = datetime[0].getHours()
        var mm0 = datetime[0].getMinutes()
        var ss0 = datetime[0].getSeconds()
        var YY1 = datetime[1].getFullYear()
        var MM1 = datetime[1].getMonth() + 1
        var DD1 = datetime[1].getDate()
        var hh1 = datetime[1].getHours()
        var mm1 = datetime[1].getMinutes()
        var ss1 = datetime[1].getSeconds()
        data.dateBegin = `${YY0}-${MM0}-${DD0} ${hh0}:${mm0}:${ss0}`
        data.dateEnd = `${YY1}-${MM1}-${DD1} ${hh1}:${mm1}:${ss1}`
        data.granularity = this.granularityRadio
      }
      //遍历获取数据并画图
      this.vforList.forEach((item) => {
        data.site = item.siteLabel
        data.height = item.heightLabel
        post4SpeedTimeData(data)
          .then((res) => {
            if (!this.echartsList[item.siteValue - 1][item.heightValue - 1]) {
              this.echartsList[item.siteValue - 1][item.heightValue - 1] =
                echarts.init(
                  document.getElementById(
                    'speedLine' + item.siteLabel + item.heightLabel
                  )
                )
            }

            var avgData = []
            var maxData = []
            var minData = []
            res.data.forEach((item) => {
              var time = new Date(item.chartTime)
              var chartTime =
                time.getFullYear() +
                '/' +
                (time.getMonth() + 1) +
                '/' +
                time.getDate() +
                ' ' +
                time.getHours() +
                ':' +
                time.getMinutes() +
                ':' +
                time.getSeconds()
              avgData.push({
                name: time.toString(),
                value: [chartTime, item.speed],
              })
              maxData.push({
                name: time.toString(),
                value: [chartTime, item.maxSpeed],
              })
              minData.push({
                name: time.toString(),
                value: [chartTime, item.minSpeed],
              })
            })
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
              series: [
                {
                  name: '最大风速',
                  data: maxData,
                  type: 'line',
                  symbol: 'none',
                  // symbolSize: [8, 15],
                  // symbolRotate: (value) => 180 - value[2],
                },
                {
                  name: '平均风速',
                  data: avgData,
                  type: 'line',
                  symbol: 'none',
                  // symbolSize: [8, 15],
                  // symbolRotate: (value) => 180 - value[2],
                },
                {
                  name: '最小风速',
                  data: minData,
                  type: 'line',
                  symbol: 'none',
                  // symbolSize: [8, 15],
                  // symbolRotate: (value) => 180 - value[2],
                },
              ],
            }
            this.echartsList[item.siteValue - 1][
              item.heightValue - 1
            ].setOption(option)
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