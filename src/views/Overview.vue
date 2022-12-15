<template>
  <div>
    <h1 class="title">总览</h1>
    <el-row>
      <!-- 左栏 -->
      <el-col :span="7">
        <num-and-table></num-and-table>
      </el-col>
      <!-- 右栏 -->
      <el-col :span="17">
        <!-- 右上的地图 -->
        <map-container></map-container>
        <!-- 右下的线图 -->
        <line-chart></line-chart>
      </el-col>
    </el-row>
  </div>
</template>
<style lang="less" scoped>
.title {
  margin-top: 0;
}
</style>
<script>
//import tab from '@/store/tab'
import numAndTable from '@/components/overview/numAndTable.vue'
import MapContainer from '../components/overview/MapContainer'
import lineChart from '../components/overview/lineChart.vue'
export default {
  components: { numAndTable, MapContainer, lineChart },
}
</script>