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
// //import 'leaflet-geotiff-2/dist/leaflet-geotiff-rgb'
// //import 'leaflet-geotiff-2/dist/leaflet-geotiff-vector-arrows'
import 'leaflet-geotiff-2/dist/leaflet-geotiff-plotty'
//流线图插件
import 'leaflet-velocity/dist/leaflet-velocity.css'
import 'leaflet-velocity/dist/leaflet-velocity'
//相关静态资源
import data from '../../json/zb.json'
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
        'http://localhost/geotiff/testout.tif'

      this.drawContour(layerControl, tiffUrl)
      this.drawStream(layerControl, data)
      // 画标记点
      this.drawMarker()
    },
    drawContour(layerControlObj, url) {
      const rendererOptions = {
        band: 0,
        displayMin: 1,
        displayMax: 5,
        //todo 这里要加上自动识别范围的功能
        applyDisplayRange: false,
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
        noDataValue: null,
        opacity: 0.75,
      }
      var layer = L.leafletGeotiff(url, option).addTo(this.map)
      layerControlObj.addOverlay(layer, '风场云图2')
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
      layerControlObj.addOverlay(velocityLayer1, '风场流线')
      //挂载map对象移动事件（隐藏流线）
      this.map.on('moveend', () => {
        velocityLayer1.remove()
        this.map.addLayer(velocityLayer1)
      })
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
          console.log('Icon')
          console.log(Icon)

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
      console.log(this.layerGroup)
      this.layerGroup.forEach((layer) => {
        if (this.checkedClusters.indexOf(layer.name) !== -1) {
          mapObj.addLayer(layer.data)
        } else {
          layer.data.remove()
        }
      })
    },
  },
  mounted() {
    this.initMap()
  },
}
</script>
<style lang="less" scoped>
.floating {
  z-index: 9999;
  position: absolute;
  padding: 0px;
  // text-align: center;
  // width: 150px;
  left: 15px;
  top: 15px;
  .select {
    margin-top: 10px;
    max-height: calc(100vh - 280px);
    overflow: auto;
  }
  .scroller::-webkit-scrollbar {
    width: 8px;
    height: 9px;
  }

  .scroller::-webkit-scrollbar-track {
    background-color: #f9f9f9;
    -webkit-border-radius: 2em;
    -moz-border-radius: 2em;
    border-radius: 2em;
  }
  .scroller::-webkit-scrollbar-thumb {
    background-color: #dedede;
    -webkit-border-radius: 2em;
    -moz-border-radius: 2em;
    border-radius: 2em;
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
