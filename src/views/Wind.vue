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
      <upload-wind-data v-if="existList.uploadWindData"
                        @refresh="refresh" />
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import windContour from '@/components/wind/windContour.vue'
import windRose from '@/components/wind/windRose.vue'
import speedLine from '@/components/wind/speedLine.vue'
import qweather from '@/components/wind/qweather.vue'
import uploadWindData from '@/components/wind/uploadWindData.vue'
export default {
  components: {
    windContour,
    windRose,
    speedLine,
    qweather,
    uploadWindData,
  },
  data() {
    return {
      activeName: 'windRose',
      existList: {
        windRose: true,
        speedLine: true,
        weather: true,
        contour: true,
        uploadWindData: true,
      },
    }
  },
  methods: {
    refresh() {
      // 上传完成后刷新上传页面的方法
      this.existList.uploadWindData = false
      this.$nextTick(() => {
        this.existList.uploadWindData = true
      })
    },
    beforeTagsLeave(newTab, oldTab) {
      this.existList[newTab] = true
      this.existList[oldTab] = false
    },
  },
}
</script>