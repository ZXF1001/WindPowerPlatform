<template>
  <div style="height=100%">
    <el-card class="floating">
      <div class="collapse"
           @click="collapseItem">
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
    collapseItem() {
      this.isShow = !this.isShow
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
        // zoomAnimation:false,
        markerZoomAnimation: false,
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
    drawMarker(mapObj) {
      getOverviewTurbineData()
        .then((res) => {
          // 自定义marker的icon
          // console.log(res.data)
          // var myIcon = L.icon({
          //   iconUrl:
          //     'http://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',
          //   iconSize: [24, 32],
          //   iconAnchor: [14, 32],
          //   popupAnchor: [-1, -35],
          // })
          res.data.forEach((cluster) => {
            this.clusterOptions.push(cluster.cluster_id)
            this.checkedClusters.push(cluster.cluster_id)
            var markerList = []
            var bound = {
              top: cluster.turbine[0].lng,
              bottom: cluster.turbine[0].lng,
              left: cluster.turbine[0].lat,
              right: cluster.turbine[0].lat,
            }
            cluster.turbine.forEach((turbine) => {
              bound.top = turbine.lng > bound.top ? turbine.lng : bound.top
              bound.bottom =
                turbine.lng < bound.bottom ? turbine.lng : bound.bottom
              bound.left = turbine.lat < bound.left ? turbine.lat : bound.left
              bound.right =
                turbine.lat > bound.right ? turbine.lat : bound.right

              // 使用自定icon的marker
              // var tempMarker = L.marker([turbine.lat, turbine.lng], {
              //   icon: myIcon,
              //   opacity: 0.8,
              // })
              var tempMarker = L.circleMarker([turbine.lat, turbine.lng])
              var popupContent = `<span>风力机编号：${turbine.turbine_id}</span><br>
                                  <span>所属集群：${cluster.cluster_id}</span><br>
                                  <span>经度：${turbine.lat}</span><br>
                                  <span>纬度：${turbine.lng}</span><br>
                                  <span>高程：${turbine.height}</span>`
              tempMarker.bindPopup(popupContent).openPopup()
              markerList.push(tempMarker)
            })

            var templayerGroup = L.layerGroup(markerList).addTo(mapObj)
            // 定义矩形的地理边界
            var bounds = [
              [bound.left, bound.top],
              [bound.right, bound.bottom],
            ]

            // 创建一个橙色的矩形
            var rec = L.rectangle(bounds, { color: '#ff7800', weight: 1 })
            this.layerGroup.push({
              name: cluster.cluster_id,
              bound: rec,
              data: templayerGroup,
            })
          })
          this.loading = false
          // mapObj.on('zoomend', () => {
          //   console.log(this.layerGroup)
          //   if (mapObj.getZoom() == 9 || mapObj.getZoom() == 10) {
          //     //显示风力机点位
          //     this.redrawMarker(this.map)
          //   }
          // })
        })
        .catch((e) => {
          console.log(e)
        })
    },
    redrawMarker(mapObj) {
      this.layerGroup.forEach((layer) => {
        if (this.checkedClusters.indexOf(layer.name) !== -1) {
          // if (mapObj.getZoom() < 10) {
          //   mapObj.addLayer(layer.bound)
          //   layer.data.remove()
          // } else {
          //   mapObj.addLayer(layer.data)
          //   layer.bound.remove()
          // }
          mapObj.addLayer(layer.data)
        } else {
          // layer.bound.remove()
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
#map2 {
  height: calc(100vh - 154px);
}
</style>
