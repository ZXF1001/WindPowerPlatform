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
      <span class="updateTime">{{updateTime}}</span>
      <!-- 左下的表格 -->
      <el-table :data="tableData"
                style="width: 100%">
        <el-table-column prop="cluster"
                         label="集群"
                         sortable>
        </el-table-column>
        <el-table-column prop="power"
                         label="功率/MW"
                         sortable>
        </el-table-column>
        <el-table-column prop="perpower"
                         label="台均/MW"
                         sortable>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import dateFormatter from '@/utils/dateFormatter'
export default {
  data() {
    return {
      loading: true,
      numData: {
        runNum: '34',
        totalNum: '42',
        noOptPower: '10.2',
        optPower: '11.1',
      },
      updateTime: '更新中',
      tableData: [],
    }
  },
  methods: {
    wsConnect() {
      this.ws = new WebSocket(
        'ws://1.117.224.40/ws/turbines/get-overview-numdata'
      )
      this.ws.onmessage = (e) => {
        const res = JSON.parse(e.data)
        this.tableData = res.map((cluster) => {
          return {
            cluster: cluster.cluster_id,
            power: cluster.power,
            perpower: cluster.power / 16,
          }
        })
        this.updateTime = `更新时间：${dateFormatter(new Date(), 'typical')}`
        if (this.loading) {
          this.loading = false
        }
      }
    },
  },
  mounted() {
    this.wsConnect()
  },
  beforeDestroy() {
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
  .updateTime {
    font-size: 12px;
  }
}
</style>