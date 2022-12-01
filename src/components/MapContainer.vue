<template>
  <div id="container"></div>
</template>

<script>
import AMapLoader from '@amap/amap-jsapi-loader'
window._AMapSecurityConfig = {
  securityJsCode: 'dbe7e12dd1b14b5d02d0d10a5f88342a',
}
export default {
  data() {
    return {
      map: null,
    }
  },
  methods: {
    initMap() {
      AMapLoader.load({
        key: '82e8831a74714291264c1f0318ebfd6c',
        version: '2.0',
        plugins: [''],
      })
        .then((Amap) => {
          this.map = new Amap.Map('container', {
            viewMode: '3D',
            zoom: 5,
            center: [121, 30],
          })
        })
        .catch((e) => {
          console.log(e)
        })
    },
  },
  mounted() {
    //DOM初始化完成进行地图初始化
    this.initMap()
  },
}
</script>

<style lang="less" scoped>
#container {
  padding: 0px;
  margin: 0px;
  width: 100%;
  height: 420px;
}
</style>