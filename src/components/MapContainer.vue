<template>
  <div id="container"></div>
</template>

<script>
import AMapLoader from '@amap/amap-jsapi-loader'
window._AMapSecurityConfig = {
  securityJsCode: '1260f13fffc52b86824606929288ef75',
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
        key: 'f9cb65dd9831f33581c66e88ec5881a6',
        version: '2.0',
        plugins: [''],
      })
        .then((AMap) => {
          this.map = new AMap.Map('container', {
            viewMode: '3D',
            zoom: 16,
            center: [120.124, 30.265],
            layers: [
              //使用多个图层
              //new AMap.TileLayer.Satellite(),
            ],
          })

          var marker1 = new AMap.Marker({
            position: [120.124, 30.265], //位置
          })
          var marker2 = new AMap.Marker({
            position: [120.125, 30.266], //位置
          })
          var marker3 = new AMap.Marker({
            position: [120.122, 30.263], //位置
          })
          this.map.add([marker1, marker2, marker3])
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