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
      <el-select v-model="timeRangeValue"
                 placeholder="选择时间范围"
                 size="small">
        <el-option-group>
          <el-option v-for="timeRange in timeRangeOptions"
                     :key="timeRange.value"
                     :label="timeRange.label"
                     :value="timeRange.value">
          </el-option>
        </el-option-group>
        <el-option-group>
          <el-option label="打开范围选择器..."
                     :value="7">
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
    <!-- 遍历的风速-时间图 -->
    <div v-for="options in vforList"
         :key="options.value">
      <el-card class="card"
               shadow='never'
               v-show="((siteValue.indexOf(options.siteValue)!=-1)||(siteValue.length==0))&&((heightValue.indexOf(options.heightValue)!=-1)||(heightValue.length==0))">
        <p class="title">{{options.siteLabel}}测风塔 {{options.heightLabel}}数据</p>
        <div class="windChart"
             ref="windChart"
             :id="options.siteLabel+options.heightLabel"></div>
      </el-card>
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
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期">
        </el-date-picker>
      </div>
      <span slot="footer">
        <el-button @click="handleDialogCancel">取 消</el-button>
        <el-button type="primary"
                   :disabled="confirmDisable"
                   @click="handleDialogConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getSiteData, getHeightData } from '@/api/wind/getFilterData'
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
        { label: '近一小时', value: 1 },
        { label: '近一天', value: 2 },
        { label: '近一周', value: 3 },
        { label: '近一月', value: 4 },
        { label: '近一季度', value: 5 },
        { label: '近一年', value: 6 },
      ],
      userDefinedTimeRangeValue: null,
      dialogVisible: false,

      vforList: [],
    }
  },
  watch: {
    timeRangeValue(newVal, oldVal) {
      this.oldTimeRangeValue = oldVal
      if (newVal === 7) {
        // 7表示自定义的选项序号
        this.dialogVisible = true
      }
    },
  },
  computed: {
    confirmDisable() {
      return this.userDefinedTimeRangeValue === null ? true : false
    },
  },
  methods: {
    test() {
      // const data = {
      //   site: '0305',
      //   height: '70m',
      //   type: 'user-defined',
      //   dateBegin: '2016-2-10 11:30',
      //   dateEnd: '2016-2-11 1:30',
      // }
      // console.log(data)
      // post4SpeedTimeData(data)
      //   .then((res) => {
      //     console.log(res)
      //   })
      //   .catch((e) => {
      //     console.log(e)
      //   })
    },
    handleDialogCancel() {
      this.timeRangeValue = this.oldTimeRangeValue
      this.dialogVisible = false
    },
    handleDialogConfirm() {
      if (this.timeRangeOptions.length === 6 + 1) {
        this.timeRangeOptions.splice(
          this.timeRangeOptions.findIndex((item) => item.value == 0),
          1
        )
      }
      this.timeRangeOptions.push({
        label: '自定义范围',
        value: 0,
      })
      this.timeRangeValue = 0
      this.dialogVisible = false
    },
    clearFilter() {
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
          this.echartsList = new Array(this.siteOptions.length)
          for (var i = 0; i < this.siteOptions.length; i++) {
            this.echartsList[i] = new Array(this.heightOptions.length)
          }
          this.$nextTick(() => {
            // this.drawRoseData(this.range)
          })
        })
        .catch((e) => {
          console.log(e)
        })
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
.datepickerWrap {
  text-align: center;
}
.card {
  margin-top: 5px;
  margin-bottom: 10px;
  .title {
    margin: 0px 0px 10px 0px;
  }
  .windChart {
    height: 280px;
  }
}
</style>