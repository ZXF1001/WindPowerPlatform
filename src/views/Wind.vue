<template>
  <el-tabs v-model="activeName"
           :before-leave="beforeTagsLeave">

    <el-tab-pane label="风玫瑰图"
                 name="windrose"
                 :lazy="true">
      <wind-rose-polar></wind-rose-polar>
    </el-tab-pane>
    <el-tab-pane label="风速信息"
                 name="speedLine"
                 :lazy="true">
      <speed-line></speed-line>
    </el-tab-pane>
    <el-tab-pane label="和风天气"
                 name="weather"
                 :lazy="true">
      <qweather></qweather>
    </el-tab-pane>
    <el-tab-pane label="openweather"
                 name="openweather"
                 :lazy="true">
      <openweather></openweather>
    </el-tab-pane>
    <el-tab-pane label="流线图"
                 name="streamline"
                 :lazy="true">
      <streamline></streamline>
    </el-tab-pane>
    <el-tab-pane label="风资源云图"
                 name="contour"
                 :lazy="true">
      <wind-contour></wind-contour>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import windContour from '../components/wind/windContour.vue'
import windRosePolar from '../components/wind/windRosePolar.vue'
import streamline from '../components/wind/streamline.vue'
import speedLine from '../components/wind/speedLine.vue'
import qweather from '../components/wind/qweather.vue'
import openweather from '../components/wind/openweather.vue'

export default {
  components: {
    windContour,
    windRosePolar,
    streamline,
    speedLine,
    qweather,
    openweather,
  },
  data() {
    return {
      activeName: 'windrose',
    }
  },
  methods: {
    beforeTagsLeave() {},
  },
}
</script>

<style lang="less" scoped>
// .el-tab-pane {
//   height: calc(100vh - 154px); //内部元素的高度
//   overflow-y: auto;
// }
</style>