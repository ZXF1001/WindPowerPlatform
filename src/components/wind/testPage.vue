<template>
  <div id='map'>
  </div>
</template>

<script>
import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet/dist/leaflet'
export default {
  data() {
    return {
      map: null,
    }
  },
  methods: {
    initMap() {
      this.map = L.map('map', {
        //参考坐标系
        // crs: L.CRS.EPSG3857,
        //不添加属性说明控件
        attributionControl: false,
        zoomControl: false,
        center: [41.20019, 114.948313],
        zoom: 16,
      })
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
        AMap3: L.tileLayer(
          'http://wprd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
          {
            maxZoom: 18,
          }
        ), // 高德矢量
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
      }
      L.control
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