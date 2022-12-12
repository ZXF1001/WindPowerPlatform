<template>
  <el-tabs v-model="activeName"
           :before-leave="beforeTagsLeave">
    <el-tab-pane label="风玫瑰图"
                 name="windrose">
      <wind-rose-polar></wind-rose-polar>
    </el-tab-pane>
    <el-tab-pane label="风速信息"
                 name="speedLine"
                 :lazy="true">
      <speed-line></speed-line>
    </el-tab-pane>
    <el-tab-pane label="天气信息"
                 name="weather"
                 :lazy="true">
      <weather></weather>
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
import weather from '../components/wind/weather.vue'
export default {
  components: { windContour, windRosePolar, streamline, speedLine, weather },
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

