<template>
  <div v-loading="loading"
       style="margin-right:10px">
    <!-- 左栏 -->
    <div class="num-info">
      <!-- 左上的四块数字 -->
      <div class="row">
        <el-card>
          <p class="label">运行中</p>
          <p class="num">{{numData.runNum}}</p>
        </el-card>
        <el-card>
          <p class="label">总台数</p>
          <p class="num">{{numData.totalNum}}</p>
        </el-card>
      </div>
      <div class="row">
        <el-card>
          <p class="label">优化前功率/MW</p>
          <p class="num">{{numData.noOptPower}}</p>
        </el-card>
        <el-card>
          <p class="label">优化后功率/MW</p>
          <p class="num">{{numData.optPower}}</p>
        </el-card>
      </div>
    </div>
    <el-card class="echarts-table">
      <!-- 左下的表格 -->
      <el-table :data="tableData"
                style="width: 100%">
        <el-table-column prop="cluster"
                         label="集群">
        </el-table-column>
        <el-table-column prop="power"
                         label="功率/MW">
        </el-table-column>
        <el-table-column prop="perpower"
                         label="台均功率/MW">
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getOverviewNumData } from '../../api/overview/getNumData'
export default {
  data() {
    return {
      loading: true,
      numData: {
        runNum: '加载中',
        totalNum: '加载中',
        noOptPower: '加载中',
        optPower: '加载中',
      },
      tableData: [],

      timer1: null,
    }
  },
  methods: {
    fetchNumData() {
      this.timer1 = setInterval(() => {
        getOverviewNumData()
          .then((res) => {
            this.numData = res.data.numData
            this.tableData = res.data.tableData
            this.loading = false
          })
          .catch((e) => {
            console.log(e)
          })
        // 在/api中统一管理后弃用
        // axios
        //   .get('https://windplatform.usemock.com/overview_data')
        //   .then((res) => {
        //     this.numData = res.data.numData
        //     this.tableData = res.data.tableData
        //   })
        //   .catch((error) => {
        //     console.log(error)
        //   })
      }, 1000)
    },
  },
  created() {
    this.fetchNumData()
  },
  beforeDestroy() {
    if (this.timer1) {
      clearInterval(this.timer1)
      this.timer1 = null
    }
  },
}
</script>

<style lang="less" scoped>
.num-info {
  .row {
    display: flex;
    justify-content: space-between;
    .el-card {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48%;
      height: 113px;
      margin-bottom: 10px;
      font-weight: bold;
      .label {
        text-align: center;
        margin-top: 0;
      }
      .num {
        text-align: center;
        font-size: 25px;
        margin-bottom: 0px;
        margin-top: 0px;
      }
    }
  }
}
.echarts-table {
  height: calc(100vh - 396px);
}
</style>