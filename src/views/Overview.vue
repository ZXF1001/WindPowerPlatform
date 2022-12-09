<template>
  <div>
    <h1 class="title">总览</h1>
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
            <map-container></map-container>
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
.title {
  margin-top: 0;
}
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
.right {
  .map {
    margin-bottom: 10px;
  }
  .linechart {
    height: 350px;
  }
}
</style>
<script>
//import tab from '@/store/tab'
import axios from 'axios'
import MapContainer from '../components/MapContainer.vue'
import * as echarts from 'echarts'
export default {
  components: { MapContainer },
  data() {
    return {
      numData: {
        runNum: '加载中',
        totalNum: '加载中',
        noOptPower: '加载中',
        optPower: '加载中',
      },
      tableData: [],
      lineData: {},
      timer: null,
    }
  },
  methods: {
    fetchNumData() {
      this.timer = setInterval(() => {
        axios
          .get(
            // 'https://mock.presstime.cn/mock/6389a56de7aea00081e03bbb/wp/overview'
            'https://windplatform.usemock.com/overview_data'
          )
          .then((res) => {
            this.numData = res.data.numData
            this.tableData = res.data.tableData
          })
          .catch((error) => {
            console.log(error)
          })
      }, 2000)
    },
    fetchLinedata() {
      axios
        .get(
          // 'https://mock.presstime.cn/mock/6389a56de7aea00081e03bbb/wp/overview'
          'https://windplatform.usemock.com/overview_data'
        )
        .then((res) => {
          this.lineData = res.data.lineData
          //在这里画图
          const echarts1 = echarts.init(this.$refs.echarts1)
          var echarts1Option = {
            xAxis: {
              type: 'category',
              data: res.data.lineData.date,
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
          const legend1 = Object.keys(res.data.lineData.data[0])
          legend1.forEach((key) => {
            echarts1Option.series.push({
              name: key,
              type: 'line',
              data: res.data.lineData.data.map((item) => item[key]),
              smooth: true,
            })
          })
          echarts1.setOption(echarts1Option)
        })
        .catch((error) => {
          console.log(error)
        })
    },
  },
  mounted() {
    this.fetchNumData()
    this.fetchLinedata()
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  },
  // beforeRouteLeave(to, from, next) {
  //   this.map && this.map.destroy()
  //   console.log('地图已销毁')
  //   next()
  // },
}
</script>