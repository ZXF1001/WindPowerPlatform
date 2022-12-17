<template>
  <div id='map2'>
  </div>
</template>

<script>
import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet/dist/leaflet'
import baseLayersData from '../../json/map/baseLayers.json'
export default {
  methods: {
    initMap() {
      var baseLayers = {}
      // 从底图列表baseLayers.json文件中读取底图
      baseLayersData.forEach((element) => {
        baseLayers[element.name] = L.tileLayer(element.url, {
          minZoom: element.minZoom,
          maxZoom: element.maxZoom,
        })
      })
      //定义map对象
      var map = L.map('map2', {
        //参考坐标系
        // crs: L.CRS.EPSG3857,
        attributionControl: false,
        zoomControl: false,
        center: [41.05, 114.8],
        zoom: 9,
        layers: baseLayers['GeoQ深色'], //默认加载图层
      })
      // map.dragging.disable() // 禁止平移
      // 定义图层控件
      var layerControl = L.control
        .layers(
          baseLayers,
          {},
          {
            position: 'topright',
            collapsed: false,
          }
        )
        .addTo(map)
      //定义比例尺控件
      L.control
        .scale({
          position: 'bottomleft',
          maxWidth: '100',
          imperial: false,
        })
        .addTo(map)
    },
  },
  mounted() {
    this.initMap()
  },
}
</script>
<style lang="less" scoped>
#map2 {
  height: calc(100vh - 154px);
}
</style>
