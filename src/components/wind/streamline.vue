<template>
  <div id='streamlimeMap'>
  </div>
</template>

<script>
import data from '../../json/zb.json'

import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet/dist/leaflet'
import 'leaflet-velocity/dist/leaflet-velocity.css'
import 'leaflet-velocity/dist/leaflet-velocity'
import baseLayersData from '../../json/map/baseLayers.json'
export default {
  data() {
    return {}
  },
  methods: {
    initMap() {
      var baseLayers = {}
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
      var map = L.map('streamlimeMap', {
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
      //////////加入风场流线//////////
      this.drawStream(map, layerControl, data)
    },
    drawStream(mapObj, layerControlObj, windData) {
      //封装的绘制风场流场方法，windData有格式要求
      const n = windData[0].header.nx * windData[0].header.ny //网格数
      var minMag = Math.sqrt(
        Math.pow(windData[0].data[0], 2) + Math.pow(windData[1].data[0], 2)
      )
      var maxMag = 0
      var mag = 0
      for (var i = 0; i < n; i++) {
        mag = Math.sqrt(
          Math.pow(windData[0].data[i], 2) + Math.pow(windData[1].data[i], 2)
        )
        minMag = mag < minMag ? mag : minMag
        maxMag = mag > maxMag ? mag : maxMag
      }
      var velocityLayer1 = L.velocityLayer({
        displayValues: true,
        displayOptions: {
          velocityType: '',
          position: 'bottomright',
          emptyString: '此处没有风数据',
          angleConvention: 'meteoCCW',
          showCardinal: true,
          speedUnit: 'm/s',
          directionString: '风向',
          speedString: '风速',
        },
        data: windData,
        minVelocity: minMag,
        maxVelocity: maxMag,
        velocityScale: 0.005,
        frameRate: 40,
        // particleAge: 20,
        // lineWidth: 2,
        // particleMultiplier: 0.005,
        // colorScale:[],
      })
      mapObj.addLayer(velocityLayer1)
      layerControlObj.addOverlay(velocityLayer1, '风场流线')
      //挂载map对象移动事件（隐藏流线）
      mapObj.on('moveend', () => {
        velocityLayer1.remove()
        mapObj.addLayer(velocityLayer1)
      })
    },
  },
  mounted() {
    this.initMap()
  },
}
</script>

<style lang="less" scoped>
#streamlimeMap {
  height: calc(100vh - 154px);
}
</style>