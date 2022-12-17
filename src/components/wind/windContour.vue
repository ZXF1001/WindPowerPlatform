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
      var baseLayers = []
      // 从底图列表baseLayers.json文件中读取底图
      baseLayersData.forEach((element) => {
        if ('annotationUrl' in element) {
          //底图的标注annotation也要加进来
          var map = L.tileLayer(element.url, {
            minZoom: element.minZoom,
            maxZoom: element.maxZoom,
          })
          var annotation = L.tileLayer(element.annotationUrl, {
            minZoom: element.minZoom,
            maxZoom: element.maxZoom,
          })
          baseLayers[element.name] = L.layerGroup([map, annotation])
        } else {
          baseLayers[element.name] = L.tileLayer(element.url, {
            minZoom: element.minZoom,
            maxZoom: element.maxZoom,
          })
        }
      })

      //定义map对象
      var map = L.map('map2', {
        //参考坐标系
        // crs: L.CRS.EPSG3857,
        attributionControl: false,
        zoomControl: false,
        center: [41.05, 114.8],
        zoom: 9,
        layers: baseLayers['天地图地形'], //默认加载图层
      })
      // map.dragging.disable() // 禁止平移
      // 定义图层控件
      var layerControl = L.control
        .layers(
          baseLayers,
          {},
          {
            position: 'topright',
            collapsed: true,
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

      var imageUrl =
        'https://maps.lib.utexas.edu/maps/historical/newark_nj_1922.jpg'

      const point1 = [41.55, 115.3]
      const point2 = [41.05, 114.8]
      this.drawContour(map, layerControl, imageUrl, point1, point2)
    },
    drawContour(mapObj, layerControlObj, imgUrl, point1, point2) {
      // 以image形式绘制云图
      var imgBounds = [point1, point2]
      var contourLayer1 = L.imageOverlay(imgUrl, imgBounds, {
        opacity: 0.5,
      })
      // contourLayer1.addTo(mapObj)
      mapObj.addLayer(contourLayer1)
      layerControlObj.addOverlay(contourLayer1, '风场云图')
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
