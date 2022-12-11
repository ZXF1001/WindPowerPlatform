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
          <el-card style="height:400px">
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
    height: 270px;
  }
}
</style>
<script>
//import tab from '@/store/tab'
import { getOverviewNumData } from '../api/overview/getNumData.js'
import { getOverviewRecentLineData } from '../api/overview/getLineData.js'
import { getOverviewTimelyLineData } from '../api/overview/getLineData.js'
import MapContainer from '../components/overview/MapContainer.vue'
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
      timer1: null,
      //动态折线图相关
      latestDate: null,
      oneDay: 24 * 3600 * 1000,
      oneSecond: 1000,
      timer2: null,
    }
  },
  methods: {
    fetchNumData() {
      this.timer1 = setInterval(() => {
        getOverviewNumData()
          .then((res) => {
            this.numData = res.data.numData
            this.tableData = res.data.tableData
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
    fetchLinedata() {
      getOverviewRecentLineData()
        .then((res) => {
          this.drawLineData(res.data)
        })
        .catch((e) => {
          console.log(e)
        })
    },
    drawLineData(data) {
      const echarts1 = echarts.init(this.$refs.echarts1)
      var seriesData = []
      var clusterList = Object.keys(data[0].value) // clusterList : ["cluster1","cluster2",...]
      clusterList.forEach((cluster) => {
        var lineData = []
        data.forEach((dateItem) => {
          var date = new Date(dateItem.date)
          this.latestDate = date
          lineData.push({
            name: date.toString(),
            value: [
              date.getFullYear() +
                '/' +
                (date.getMonth() + 1) +
                '/' +
                date.getDate() +
                ' ' +
                date.getHours() +
                ':' +
                date.getMinutes() +
                ':' +
                date.getSeconds(),
              dateItem.value[cluster],
            ],
          })
        })
        seriesData.push({
          animationDuration: 0,
          name: cluster,
          type: 'line',
          showSymbol: false,
          data: lineData,
          smooth: true,
        })
      })

      var option = {
        title: {
          text: '时变数据折线图',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            animation: false,
          },
        },
        xAxis: {
          type: 'time',
          splitLine: {
            show: false,
          },
        },
        yAxis: {
          type: 'value',
          boundaryGap: [0, '100%'],
          splitLine: {
            show: false,
          },
        },
        legend: {
          data: clusterList,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '2%',
          containLabel: true,
        },
        series: seriesData,
      }
      echarts1.setOption(option)
      window.onresize = () => {
        echarts1.resize()
      }
      this.updateLineData(seriesData, echarts1, option)
    },
    updateLineData(seriesData, echartsObj, echartsOption) {
      this.timer2 = setInterval(() => {
        getOverviewTimelyLineData()
          .then((res) => {
            this.latestDate = new Date(+this.latestDate + this.oneSecond)
            seriesData.forEach((clusterData) => {
              // if (clusterData.data.length > 60) {
              clusterData.data.shift()
              // }
              clusterData.data.push({
                name: this.latestDate.toString(),
                value: [
                  // [
                  //   this.latestDate.getFullYear(),
                  //   this.latestDate.getMonth() + 1,
                  //   this.latestDate.getDate(),
                  // ].join('/'),
                  this.latestDate.getFullYear() +
                    '/' +
                    (this.latestDate.getMonth() + 1) +
                    '/' +
                    this.latestDate.getDate() +
                    ' ' +
                    this.latestDate.getHours() +
                    ':' +
                    this.latestDate.getMinutes() +
                    ':' +
                    this.latestDate.getSeconds(),
                  res.data.value[clusterData.name],
                ],
              })
            })

            echartsObj.setOption(echartsOption)
            // {"value":{
            //   "cluster1|20-40":20,
            //   "cluster2|20-40":20,
            //   "cluster3|20-40":20,
            //   "cluster4|20-40":20,
            //   "cluster5|20-40":20,
            // }}
          })
          .catch((e) => {
            console.log(e)
          })
      }, 1000)
    },
  },
  mounted() {
    this.fetchNumData()
    this.fetchLinedata()
  },
  beforeDestroy() {
    if (this.timer1) {
      clearInterval(this.timer1)
      this.timer1 = null
    }
    if (this.timer2) {
      clearInterval(this.timer2)
      this.timer2 = null
    }
  },
  // beforeRouteLeave(to, from, next) {
  //   this.map && this.map.destroy()
  //   console.log('地图已销毁')
  //   next()
  // },
}
</script>