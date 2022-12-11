<template>
  <div>
    <h1>这是Wind</h1>
    <el-row>
      <el-col :span="8">
        <div class="left">
          <el-card>
            <wind-rose-radar></wind-rose-radar>
          </el-card>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="mid">
          <el-card>
            <wind-rose-polar></wind-rose-polar>
            <!-- <streamline></streamline> -->
          </el-card>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="right">
          <el-card>
            <h1>风速云图</h1>
            <!-- <wind-contour></wind-contour> -->
          </el-card>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import windContour from '../components/wind/windContour.vue'
import windRoseRadar from '../components/wind/windRoseRadar.vue'
import windRosePolar from '../components/wind/windRosePolar.vue'
import streamline from '../components/wind/streamline.vue'
export default {
  components: { windContour, windRoseRadar, windRosePolar, streamline },
  data() {
    return {}
  },
}
</script>
<style lang="less" scoped>
.left,
.mid {
  margin-right: 10px;
}
</style>