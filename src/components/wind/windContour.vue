<template>
  <div>
    <el-card class="floating">
      <h3 class="title">集群列表<i class="el-icon-arrow-down el-icon--right"
           @click="collapseItem"></i></h3>
      <div class="select"
           v-loading="loading">
        <el-checkbox :indeterminate="isIndeterminate"
                     v-model="checkAll"
                     @change="handleCheckAllChange">全选</el-checkbox>
        <div style="margin: 15px 0;"></div>
        <el-checkbox-group v-model="checkedClusters"
                           @change="handleCheckedClustersChange">
          <el-checkbox v-for="cluster in clusterOptions"
                       :label="cluster"
                       :key="cluster"
                       style="display: block; padding-top: 10px;">{{cluster}}</el-checkbox>

        </el-checkbox-group>
      </div>
    </el-card>
    <div id='map2'>

    </div>
  </div>
</template>

<script>
import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet/dist/leaflet'
import baseLayersData from '../../json/map/baseLayers.json'
import { getOverviewTurbineData } from '../../api/overview/getMapData.js'
export default {
  data() {
    return {
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
    collapseItem() {
      console.log('dd')
    },
    //多选框相关方法
    handleCheckAllChange(val) {
      this.checkedClusters = val ? this.clusterOptions : []
      this.isIndeterminate = false
      this.redrawMarker(this.map)
    },
    //多选框相关方法
    handleCheckedClustersChange(value) {
      // 传入的是一个选中项目的Array
      var checkedCount = value.length
      this.checkAll = checkedCount === this.clusterOptions.length
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.clusterOptions.length
      this.redrawMarker(this.map)
    },
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

      //定义map对象
      this.map = L.map('map2', {
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
        .addTo(this.map)
      //定义比例尺控件
      L.control
        .scale({
          position: 'bottomleft',
          maxWidth: '100',
          imperial: false,
        })
        .addTo(this.map)
      // 画标记点
      this.drawMarker(this.map, layerControl)

      // 定义图片图层
      var imageUrl =
        'https://www.energychina.press/fileNFNYJS/journal/article/nfnyjs/2017/1/PIC/2095-8676-04-01-006-F008.jpg'
      // 'https://maps.lib.utexas.edu/maps/historical/newark_nj_1922.jpg'

      const point1 = [41.55, 115.3]
      const point2 = [41.05, 114.8]
      this.drawContour(this.map, layerControl, imageUrl, point1, point2)
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
    drawMarker(mapObj, layerControlObj) {
      getOverviewTurbineData()
        .then((res) => {
          console.log(res.data)
          var myIcon = L.icon({
            iconUrl:
              'http://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',
            iconSize: [24, 32],
            iconAnchor: [14, 32],
            popupAnchor: [-1, -35],
          })
          res.data.forEach((cluster) => {
            this.clusterOptions.push(cluster.cluster_id)
            this.checkedClusters.push(cluster.cluster_id)
            var markerList = []
            cluster.turbine.forEach((turbine) => {
              var tempMarker = L.marker([turbine.lat, turbine.lng], {
                icon: myIcon,
              })
              var popupContent = `<span>风力机编号：${turbine.turbine_id}</span><br>
                                  <span>所属集群：${cluster.cluster_id}</span><br>
                                  <span>经度：${turbine.lat}</span><br>
                                  <span>纬度：${turbine.lng}</span>`
              tempMarker.bindPopup(popupContent).openPopup()
              markerList.push(tempMarker)
            })
            var templayerGroup = L.layerGroup(markerList).addTo(mapObj)
            this.layerGroup.push({
              name: cluster.cluster_id,
              data: templayerGroup,
            })
          })
          this.loading = false
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
  width: 150px;
  left: 15px;
  top: 15px;
  .title {
    margin-top: 0;
    .el-icon-arrow-down {
      cursor: pointer;
    }
  }
}
#map2 {
  height: calc(100vh - 154px);
}
</style>
