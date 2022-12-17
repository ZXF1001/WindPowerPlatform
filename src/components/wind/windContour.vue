<template>
  <div id='map2'>
  </div>
</template>

<script>
import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet/dist/leaflet'
export default {
  methods: {
    initMap() {
      //瓦片地图列表
      var baseLayers = {
        高德卫星: L.tileLayer(
          'https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
          { minZoom: 1, maxZoom: 18 }
        ),
        高德路网: L.tileLayer(
          'https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
          { minZoom: 3, maxZoom: 18 }
        ),
        腾讯地图路网: L.tileLayer(
          'http://rt0.map.gtimg.com/realtimerender?z={z}&x={x}&y={-y}&type=vector&style=0',
          { minZoom: 3, maxZoom: 18 }
        ),
        GeoQ标准: L.tileLayer(
          'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}',
          { minZoom: 0, maxZoom: 18 }
        ),
        GeoQ暖色: L.tileLayer(
          'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetWarm/MapServer/tile/{z}/{y}/{x}',
          { minZoom: 0, maxZoom: 18 }
        ),
        GeoQ灰色: L.tileLayer(
          'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetGray/MapServer/tile/{z}/{y}/{x}',
          { minZoom: 0, maxZoom: 18 }
        ),
        GeoQ深色: L.tileLayer(
          'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}',
          { minZoom: 0, maxZoom: 18 }
        ),

        opentopomap: L.tileLayer(
          'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
          { minZoom: 0, maxZoom: 18 }
        ),
        CARTO白色: L.tileLayer(
          'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
          { minZoom: 0, maxZoom: 18 }
        ),

        天地图标准: L.tileLayer(
          'https://t3.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TileMatrix={z}&TileRow={y}&TileCol={x}&tk=9e888cc799f9e890369bf6c08bba4bf3',
          { minZoom: 1, maxZoom: 18 }
        ),
        天地图卫星: L.tileLayer(
          'http://t0.tianditu.gov.cn/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={z}&TileRow={y}&TileCol={x}&style=default&format=tiles&tk=9e888cc799f9e890369bf6c08bba4bf3',
          { minZoom: 1, maxZoom: 18 }
        ),
        天地图地形: L.tileLayer(
          'http://t0.tianditu.gov.cn/ter_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ter&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TileMatrix={z}&TileRow={y}&TileCol={x}&tk=9e888cc799f9e890369bf6c08bba4bf3',
          { minZoom: 1, maxZoom: 18 }
        ),
        'Thunderforest-Landscape': L.tileLayer(
          'https://tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=9ceb45fae79844f7a88afd27aa351aad',
          { minZoom: 1, maxZoom: 20 }
        ),
        'Thunderforest-OpenCycleMap': L.tileLayer(
          'https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=9ceb45fae79844f7a88afd27aa351aad',
          { minZoom: 1, maxZoom: 20 }
        ),
        'Thunderforest-Outdoors': L.tileLayer(
          'https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=9ceb45fae79844f7a88afd27aa351aad',
          { minZoom: 1, maxZoom: 20 }
        ),
      }
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
