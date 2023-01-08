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
                :key="tableKey"
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
      loading: false,
      numData: {
        runNum: '加载中',
        totalNum: '加载中',
        noOptPower: '加载中',
        optPower: '加载中',
      },
      tableData: [],
      tableKey: 1,
    }
  },
  methods: {
    wsConnect() {
      this.ws = new WebSocket('ws://1.117.224.40/ws/turbines/get-power')
      this.ws.onmessage = (e) => {
        const res = JSON.parse(e.data)
        console.log(res)
        // res.cluster_id在this.tableData中，就替换this.tableData的那项
        // 如果不在，就加进去
        let clusterInTableData = this.tableData.map((item) => item.cluster)
        let index = clusterInTableData.indexOf(res.cluster_id)
        if (index === -1) {
          this.tableData.push({
            cluster: res.cluster_id,
            power: res.data[0].power,
            perpower: res.data[0].power / 16,
          })
        } else {
          this.tableData[index] = {
            cluster: res.cluster_id,
            power: res.data[0].power,
            perpower: res.data[0].power / 16,
          }
          this.tableKey++
        }
      }
    },
    fetchNumData() {
      // this.timer1 = setInterval(() => {
      //   getOverviewNumData()
      //     .then((res) => {
      //       this.numData = res.data.numData
      //       this.tableData = res.data.tableData
      //       this.loading = false
      //     })
      //     .catch((e) => {
      //       console.log(e)
      //     })
      // }, 1000)
    },
  },
  mounted() {
    this.wsConnect()
    // this.fetchNumData()
  },
  beforeDestroy() {
    if (this.timer1) {
      clearInterval(this.timer1)
      this.timer1 = null
    }
    if (this.ws) {
      this.ws.close()
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