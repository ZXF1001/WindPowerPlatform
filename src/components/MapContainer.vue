<template>
  <div id="container"></div>
</template>

<script>
import axios from 'axios'
import AMapLoader from '@amap/amap-jsapi-loader'
window._AMapSecurityConfig = {
  securityJsCode: '1260f13fffc52b86824606929288ef75',
}
export default {
  data() {
    return {
      map: null,
      position: [],
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
          var markerList = []
          this.position.forEach((element) => {
            var marker = new AMap.Marker({
              position: element.turbine_position, //位置
            })
            markerList.push(marker)
          })
          this.map.add(markerList)
        })
        .catch((e) => {
          console.log(e)
        })
    },
  },
  mounted() {
    axios
      .get(
        'https://mock.presstime.cn/mock/6389a56de7aea00081e03bbb/wp/turbine_position'
      )
      .then((res) => {
        console.log(res.data.position)
        this.position = res.data.position
        console.log(this.position)
      })
      .catch((e) => {
        console.log(e)
      })
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