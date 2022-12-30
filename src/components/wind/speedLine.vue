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
                 multiple
                 collapse-tags
                 placeholder="选择时间范围"
                 size="small">
        <el-option v-for="timeRange in timeRangeOptions"
                   :key="timeRange.value"
                   :label="timeRange.label"
                   :value="timeRange.value">
        </el-option>
      </el-select>

      <el-button size="mini"
                 plain
                 @click="clearFilter">清除</el-button>
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

  </div>
</template>

<script>
import { getSiteData, getHeightData } from '@/api/wind/getFilterData'
import * as echarts from 'echarts'

export default {
  data() {
    return {
      //筛选框的数据
      siteOptions: [],
      heightOptions: [],
      siteValue: [],
      heightValue: [],
      timeRangeValue: [],
      timeRangeOptions: [
        { label: '近一小时', value: 1 },
        { label: '近一天', value: 2 },
        { label: '近一周', value: 3 },
        { label: '近一月', value: 4 },
        { label: '近半年', value: 5 },
        { label: '近一年', value: 6 },
        { label: '自定义', value: 7 },
      ],
      vforList: [],
    }
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