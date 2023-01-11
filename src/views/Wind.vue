<template>
  <el-tabs v-model="activeName"
           :before-leave="beforeTagsLeave">

    <el-tab-pane label="风玫瑰图"
                 name="windRose"
                 :lazy="true">
      <wind-rose v-if="existList.windRose" />
    </el-tab-pane>
    <el-tab-pane label="风速信息"
                 name="speedLine"
                 :lazy="true">
      <speed-line v-if="existList.speedLine" />
    </el-tab-pane>
    <el-tab-pane label="气象预报"
                 name="weather"
                 :lazy="true">
      <qweather v-if="existList.weather" />
    </el-tab-pane>
    <el-tab-pane label="风资源图"
                 name="contour"
                 :lazy="true">
      <wind-contour v-if="existList.contour" />
    </el-tab-pane>
    <el-tab-pane label="上传数据"
                 name="uploadWindData"
                 :lazy="true">
      <upload-wind-data v-if="existList.uploadWindData" />
    </el-tab-pane>
    <el-tab-pane label="WebSocket测试"
                 name="websocketTest"
                 :lazy="true">
      <websocket-test v-if="existList.uploadWindData" />
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import windContour from '@/components/wind/windContour.vue'
import windRose from '@/components/wind/windRose.vue'
import speedLine from '@/components/wind/speedLine.vue'
import qweather from '@/components/wind/qweather.vue'
import uploadWindData from '@/components/wind/uploadWindData.vue'
import websocketTest from '@/components/wind/websocketTest.vue'
export default {
  components: {
    windContour,
    windRose,
    speedLine,
    qweather,
    uploadWindData,
    websocketTest,
  },
  data() {
    return {
      activeName: 'windRose',
      // activeName: 'websocketTest',
      existList: {
        windRose: true,
        speedLine: true,
        weather: true,
        contour: true,
        uploadWindData: true,
        websocketTest: true,
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