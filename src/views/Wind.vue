<template>
  <el-tabs v-model="activeName"
           :before-leave="beforeTagsLeave">

    <el-tab-pane label="风玫瑰图"
                 name="windRose"
                 :lazy="true">
      <wind-rose v-if="existList.windRose"></wind-rose>
    </el-tab-pane>
    <el-tab-pane label="风速信息"
                 name="speedLine"
                 :lazy="true">
      <speed-line v-if="existList.speedLine"></speed-line>
    </el-tab-pane>
    <el-tab-pane label="和风天气"
                 name="weather"
                 :lazy="true">
      <qweather v-if="existList.weather"></qweather>
    </el-tab-pane>
    <el-tab-pane label="风资源图"
                 name="contour"
                 :lazy="true">
      <wind-contour v-if="existList.contour"></wind-contour>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import windContour from '../components/wind/windContour.vue'
import windRose from '../components/wind/windRose.vue'
import speedLine from '../components/wind/speedLine.vue'
import qweather from '../components/wind/qweather.vue'

export default {
  components: {
    windContour,
    windRose,
    speedLine,
    qweather,
  },
  data() {
    return {
      activeName: 'windRose',
      existList: {
        windRose: true,
        speedLine: true,
        weather: true,
        contour: true,
      },
    }
  },
  methods: {
    beforeTagsLeave(newTab, oldTab) {
      this.existList[newTab] = true
      this.existList[oldTab] = false
    },
  },
}
</script>

<style lang="less" scoped>
// .el-tab-pane {
//   height: calc(100vh - 154px); //内部元素的高度
//   overflow-y: auto;
// }
</style>