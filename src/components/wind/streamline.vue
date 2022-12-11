<template>
  <div>挂载成功</div>
</template>

<script>
import * as echarts from 'echarts'
// import 'echarts-gl'
import 'echarts-extension-amap'
import AMapLoader from '@amap/amap-jsapi-loader'
import axios from 'axios'
window._AMapSecurityConfig = {
  securityJsCode: '1260f13fffc52b86824606929288ef75',
}
export default {
  data() {
    return {}
  },
  methods: {
    initmap() {
      AMapLoader.load({
        key: 'f9cb65dd9831f33581c66e88ec5881a6',
        version: '2.0',
        // version: '2.1Beta',
        plugins: [''],
      })
        .then((AMap) => {
          this.drawStreamline(AMap)
        })
        .catch((e) => {
          console.log(e)
        })
    },
    drawStreamline(m_AMap) {
      axios
        .get()
        .then((res) => {
          console.log(res.data)
        })
        .catch((e) => {
          console.log(e)
        })
    },
  },
  mounted() {
    this.initmap()
  },
}
</script>
