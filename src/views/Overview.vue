<template>
  <div>
    <h1>总览</h1>
    <el-row>
      <el-col :span="6">
        <div class="grid-content bg-purple"
             style="margin-right:10px">
          <!-- 左栏 -->
          <div class="num-info">
            <!-- 左上的四块数字 -->
            <div class="row">
              <el-card>
                <p class="label">运行中台数</p>
                <p class="num">{{numData[0]}}</p>
              </el-card>
              <el-card>
                <p class="label">总台数</p>
                <p class="num">{{numData[1]}}</p>
              </el-card>
            </div>
            <div class="row">
              <el-card>
                <p class="label">优化前功率</p>
                <p class="num">{{numData[2]}}MW</p>
              </el-card>
              <el-card>
                <p class="label">优化后功率</p>
                <p class="num">{{numData[3]}}MW</p>
              </el-card>
            </div>
          </div>
          <el-card style="height:600px">
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
      </el-col>
      <el-col :span="18">
        <div class="right">
          <!-- 右栏 -->
          <el-card class="map">
            <!-- 右上的地图 -->
            <div>
              右上的地图
            </div>
          </el-card>
          <el-card>
            <!-- 右下的线图 -->
            <div class="linechart"
                 ref="echarts1"></div>
          </el-card>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
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
      margin-bottom: 10px;
      .label {
        text-align: center;
        margin-top: 0;
        font-weight: bold;
      }
      .num {
        text-align: center;
        font-size: 30px;
        margin-bottom: 0px;
        margin-top: 0px;
      }
    }
  }
}
.right {
  .map {
    margin-bottom: 10px;
    height: 460px;
  }
  .linechart {
    height: 350px;
  }
}
</style>
<script>
//import tab from '@/store/tab'
import { getData } from '../api/'
import * as echarts from 'echarts'
export default {
  data() {
    return {
      numData: [],
      tableData: [],
    }
  },
  mounted() {
    getData().then(({ data }) => {
      console.log(data)
      const { tableData } = data.data
      this.tableData = tableData
      this.numData = [
        data.data.runNum,
        data.data.totalNum,
        data.data.noOptPower,
        data.data.optPower,
      ]
      // 准备画折线图
      const echarts1 = echarts.init(this.$refs.echarts1)
      const { lineData } = data.data

      var echarts1Option = {
        xAxis: {
          type: 'category',
          data: lineData.date,
        },
        yAxis: {
          type: 'value',
          scale: true,
        },
        tooltip: {
          trigger: 'item',
        },
        legend: {},
        title: {
          text: '功率',
        },
        series: [],
      }
      const legend1 = Object.keys(lineData.data[0])
      legend1.forEach((key) => {
        echarts1Option.series.push({
          name: key,
          type: 'line',
          data: lineData.data.map((item) => item[key]),
          smooth: true,
        })
      })
      echarts1.setOption(echarts1Option)
    })
  },
}
</script>