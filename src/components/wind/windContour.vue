//! 注意：在这里的更改记得在overview/mapContainer下同步更改
<template>
  <div style="height=100%">
    <el-card class="floating">
      <div class="collapse"
           @click="isShow = !isShow">
        <h4 class="title">集群列表<i class="el-icon-arrow-down el-icon--right"></i></h4>
      </div>
      <el-collapse-transition>
        <div class="select scroller"
             v-loading="loading"
             v-show="isShow">
          <el-checkbox :indeterminate="isIndeterminate"
                       v-model="checkAll"
                       @change="handleCheckAllChange">全选</el-checkbox>
          <div style="margin: 10px 0;"></div>
          <el-checkbox-group v-model="checkedClusters"
                             @change="handleCheckedClustersChange">
            <el-checkbox v-for="cluster in clusterOptions"
                         :label="cluster"
                         :key="cluster"
                         style="display: block; padding-top: 10px;">{{cluster}}</el-checkbox>

          </el-checkbox-group>

        </div>
      </el-collapse-transition>
    </el-card>
    <div id='map'>

    </div>
  </div>
</template>

<script>
import 'leaflet/dist/leaflet.css'
import L from 'leaflet/dist/leaflet'
import '@panzhiyue/leaflet-canvasmarker' //canvas渲染marker的插件
//geotiff渲染插件
import 'leaflet-geotiff-2'
import GeoTIFF from 'geotiff'
// //import 'leaflet-geotiff-2/dist/leaflet-geotiff-rgb'
// //import 'leaflet-geotiff-2/dist/leaflet-geotiff-vector-arrows'
import 'leaflet-geotiff-2/dist/leaflet-geotiff-plotty'
//流线图插件
import 'leaflet-velocity/dist/leaflet-velocity.css'
import 'leaflet-velocity/dist/leaflet-velocity'
//相关静态资源
import data from '@/json/zb.json'
import baseLayersData from '@/json/map/baseLayers.json'
import Icon from '@/assets/windTurbineSvg/windturbine.svg'
//请求风机点位的api
import { getMyTurbineData } from '@/api/wind/getMapData.js'
export default {
  data() {
    return {
      isShow: true,
      loading: true,
      checkAll: true,
      clusterOptions: [],
      checkedClusters: [], //这是选中的集群Array
      isIndeterminate: false,
      map: null,
      layerGroup: [],
      geolayer: null,
    }
  },
  methods: {
    //多选框相关方法
    handleCheckAllChange(val) {
      this.checkedClusters = val ? this.clusterOptions : []
      this.isIndeterminate = false
      this.redrawMarker(this.map)
    },
    handleCheckedClustersChange(value) {
      // 传入的是一个选中项目的Array
      var checkedCount = value.length
      this.checkAll = checkedCount === this.clusterOptions.length
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.clusterOptions.length
      this.redrawMarker(this.map)
    },
    // 挂载后初始化地图并加载标记
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
          //没有annotation就不用考虑组成图层组
          baseLayers[element.name] = L.tileLayer(element.url, {
            minZoom: element.minZoom,
            maxZoom: element.maxZoom,
          })
        }
      })

      this.map = L.map('map', {
        //参考坐标系
        // crs: L.CRS.EPSG3857,
        attributionControl: false,
        zoomControl: false,
        center: [41.25, 114.9],
        zoom: 9,
        layers: baseLayers['天地图地形'], //默认加载图层
        preferCanvas: true,
      })
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
        .addTo(this.map)
      //定义比例尺控件
      L.control
        .scale({
          position: 'bottomleft',
          maxWidth: '100',
          imperial: false,
        })
        .addTo(this.map)
      // 定义标量云图图层
      const tiffUrl =
        // 'https://stuartmatthews.github.io/leaflet-geotiff/tif/wind_speed.tif'
        // 'https://s3.amazonaws.com/elevation-tiles-prod/geotiff/11/1679/765.tif'
        'http://1.117.224.40/geotiff/testout.tif'

      this.drawContour(layerControl, tiffUrl)
      this.drawStream(layerControl, data)
      // 画标记点
      this.drawMarker()
    },
    drawContour(layerControlObj, url) {
      const rendererOptions = {
        band: 0,
        displayMin: 0,
        displayMax: 5,
        //todo 这里要加上自动识别范围的功能(x)
        applyDisplayRange: true,
        clampLow: true,
        clampHigh: true,
        colorScale: 'viridis',
      }

      const renderer = new L.LeafletGeotiff.Plotty(rendererOptions)
      const option = {
        renderer: renderer,
        // bounds: [
        //   [40.7, 114],
        //   [41.8, 115.8],
        // ],

        useWorker: true,
        noDataValue: -99,
        sourceFunction: GeoTIFF.fromUrl,
        opacity: 0.75,
      }
      this.geolayer = L.leafletGeotiff(url, option)

      layerControlObj.addOverlay(this.geolayer, '风场云图')
    },
    drawStream(layerControlObj, windData) {
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
      this.map.addLayer(velocityLayer1)
      const velocityName = '风场流线'
      layerControlObj.addOverlay(velocityLayer1, velocityName)

      // <<这段程序是为了避免没勾选流线图时移动地图导致流线图自己刷新出来
      var streamlineSelected = true
      this.map.on('overlayremove', (event) => {
        if (event.name === velocityName) {
          streamlineSelected = false
        }
      })
      this.map.on('overlayadd', (event) => {
        if (event.name === velocityName) {
          streamlineSelected = true
        }
      })
      this.map.on('moveend', () => {
        if (streamlineSelected === true) {
          velocityLayer1.remove()
          this.map.addLayer(velocityLayer1)
        }
      })
      // 这段程序是为了避免没勾选流线图时移动地图导致流线图自己刷新出来>>
    },
    drawMarker() {
      var groupByCluster = (res) => {
        //把数据库返回的零散数据按集群id整合
        var clusterIdList = []
        var data = []
        res.data.forEach((turbineItem) => {
          if (clusterIdList.indexOf(turbineItem.cluster_id) == -1) {
            clusterIdList.push(turbineItem.cluster_id)
            this.clusterOptions.push(turbineItem.cluster_name)
            this.checkedClusters.push(turbineItem.cluster_name)
            data.push({
              cluster_id: turbineItem.cluster_id,
              cluster_name: turbineItem.cluster_name,
              turbine: [],
            })
          }
          var index = data.findIndex(
            (item) => item.cluster_id == turbineItem.cluster_id
          )
          data[index].turbine.push({
            turbine_id: turbineItem.turbine_id,
            lat: turbineItem.lat,
            lng: turbineItem.lng,
            height: turbineItem.height,
          })
        })
        this.loading = false
        return data
      }
      getMyTurbineData()
        .then((res) => {
          var data = groupByCluster(res)
          // var colorList = [
          //   '#5470c6',
          //   '#91cc75',
          //   '#fac858',
          //   '#ee6666',
          //   '#73c0de',
          //   '#3ba272',
          //   '#fc8452',
          //   '#9a60b4',
          //   '#ea7ccc',
          //   '#A6ACAF',
          //   '#27AE60',
          //   '#00FFFF',
          //   '#000080',
          //   '#FF0000',
          //   '#FFFF00',
          //   '#00FF00',
          //   '#28ED9C',
          //   '#95324E',
          //   '#F7AAAA',
          // ]

          var icon = L.icon({
            iconUrl: Icon,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -15],
          })
          data.forEach((cluster) => {
            var markerList = []

            cluster.turbine.forEach((turbine) => {
              var tempMarker = L.marker([turbine.lat, turbine.lng], {
                icon: icon,
              })
              var popupContent = `<span>风力机编号：${turbine.turbine_id}</span><br>
                                  <span>所属集群：${cluster.cluster_name}</span><br>
                                  <span>经度：${turbine.lat}</span><br>
                                  <span>纬度：${turbine.lng}</span><br>
                                  <span>高程：${turbine.height}</span>`

              tempMarker.bindPopup(popupContent)
              markerList.push(tempMarker)
            })
            var templayerGroup = L.canvasMarkerLayer({
              collisionFlg: false, // 碰撞检测
            }).addTo(this.map)
            templayerGroup.addLayers(markerList)

            this.layerGroup.push({
              name: cluster.cluster_name,
              data: templayerGroup,
            })
          })
          // mapObj.on('zoomend', () => {})
        })
        .catch((e) => {
          console.log(e)
        })
    },
    redrawMarker(mapObj) {
      this.layerGroup.forEach((layer) => {
        if (this.checkedClusters.indexOf(layer.name) !== -1) {
          mapObj.addLayer(layer.data)
        } else {
          layer.data.remove()
        }
      })
    },
  },
  computed: {
    isCollapse() {
      return this.$store.state.tab.isCollapse
    },
    geotiffMinAndMax() {
      if (this.geolayer !== null) {
        return [this.geolayer.min, this.geolayer.max]
      } else {
        return null
      }
    },
  },
  watch: {
    isCollapse() {
      setTimeout(() => {
        this.map.invalidateSize(false)
      }, 400)
    },
    geotiffMinAndMax() {
      if (this.geotiffMinAndMax != null) {
        this.geolayer.options.renderer.setDisplayRange(
          this.geotiffMinAndMax[0],
          this.geotiffMinAndMax[1]
        )
        this.geolayer.addTo(this.map)
      }
    },
  },
  mounted() {
    this.initMap()
  },
  beforeDestroy() {
    if (this.map) {
      this.map.remove()
      this.map = null
    }
  },
}
</script>
<style lang="less" scoped>
.floating {
  z-index: 2000;
  position: absolute;
  padding: 0px;
  // text-align: center;
  // width: 150px;
  left: 15px;
  top: 15px;
  .select {
    margin-top: 10px;
    min-height: 60px;
    max-height: calc(100vh - 280px);
    overflow: auto;
  }

  .collapse {
    cursor: pointer;
    .title {
      margin: 0;
    }
  }
}
#map {
  height: calc(100vh - 154px);
}
</style>
