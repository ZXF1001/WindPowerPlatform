<template>
  <div id='map'>
  </div>
</template>

<script>
import data from '../../json/zb.json'

import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet/dist/leaflet'
import 'leaflet-velocity/dist/leaflet-velocity.css'
import 'leaflet-velocity/dist/leaflet-velocity'
export default {
  data() {
    return {
      map: null,
    }
  },
  methods: {
    initMap() {
      //瓦片地图列表
      var baseLayers = {
        AMap1: L.tileLayer(
          'https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
          {
            maxZoom: 18,
          }
        ), // 高德卫星
        TXLW: L.tileLayer(
          'http://rt0.map.gtimg.com/realtimerender?z={z}&x={x}&y={-y}&type=vector&style=0',
          {
            maxZoom: 18,
          }
        ), // 腾讯地图路网
        ArcGIS: L.tileLayer(
          'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}',
          {
            maxZoom: 18,
          }
        ), // ArcGIS
        AMap2: L.tileLayer(
          'https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
          {
            maxZoom: 18,
          }
        ), // 高德路网

        Dark: L.tileLayer(
          'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}',
          {
            maxZoom: 18,
          }
        ), // 暗色
        opentopomap: L.tileLayer(
          'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
          {
            maxZoom: 18,
          }
        ), // 密集道路
        White: L.tileLayer(
          'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
          {
            maxZoom: 18,
          }
        ), // 白色
        TDT1: L.tileLayer(
          'https://t3.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TileMatrix={z}&TileRow={y}&TileCol={x}&tk=ec899a50c7830ea2416ca182285236f3',
          {
            maxZoom: 18,
          }
        ), // 天地图
        TDT2: L.tileLayer(
          'http://t0.tianditu.gov.cn/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={z}&TileRow={y}&TileCol={x}&style=default&format=tiles&tk=ec899a50c7830ea2416ca182285236f3',
          {
            maxZoom: 18,
          }
        ), // 天地图卫星
        TDT3: L.tileLayer(
          'http://t0.tianditu.gov.cn/ter_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ter&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TileMatrix={z}&TileRow={y}&TileCol={x}&tk=ec899a50c7830ea2416ca182285236f3',
          {
            maxZoom: 18,
          }
        ), // 天地图地形
      }
      //定义地图
      this.map = L.map('map', {
        //参考坐标系
        // crs: L.CRS.EPSG3857,
        attributionControl: false,
        zoomControl: false,
        center: [41.05, 114.8],
        zoom: 9,
        layers: baseLayers.Dark, //默认加载图层
      })
      this.map.on('move', (e) => {
        velocityLayer1.remove()
      })
      this.map.on('moveend', (e) => {
        this.map.addLayer(velocityLayer1)
      })
      // this.map.dragging.disable() // 禁止平移
      var layerControl = L.control
        .layers(
          baseLayers,
          {},
          {
            position: 'topright',
            collapsed: false,
          }
        )
        .addTo(this.map)

      L.control
        .scale({
          position: 'bottomleft',
          maxWidth: '100',
          imperial: false,
        })
        .addTo(this.map)
      //////////加入风场流线//////////
      const n = data[0].header.nx * data[0].header.ny //网格数
      var minMag = Math.sqrt(
        Math.pow(data[0].data[0], 2) + Math.pow(data[1].data[0], 2)
      )
      var maxMag = 0
      var mag = 0
      for (var i = 0; i < n; i++) {
        mag = Math.sqrt(
          Math.pow(data[0].data[i], 2) + Math.pow(data[1].data[i], 2)
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
        data: data,
        minVelocity: minMag,
        maxVelocity: maxMag,
        velocityScale: 0.01,
        // particleAge: 20,
        // lineWidth: 2,
        // particleMultiplier: 0.001,
        // colorScale:[],
      })
      this.map.addLayer(velocityLayer1)
      layerControl.addOverlay(velocityLayer1, 'Wind Streamline')
    },
  },
  mounted() {
    this.initMap()
  },
}
</script>

<style lang="less" scoped>
#map {
  height: calc(100vh - 154px);
}
</style>