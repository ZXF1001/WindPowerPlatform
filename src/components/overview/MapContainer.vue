<template>
  <el-card class="map">
    <div v-loading="loading">
      <el-row>
        <el-col :span="3">
          <div class="left">
            <!-- <el-button @click="conventGPS"
                     size="mini">执行gps转化</el-button> -->
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
        </el-col>
        <el-col :span="21">
          <div class="right">
            <div id="container"></div>
          </div>
        </el-col>
      </el-row>

    </div>
  </el-card>
</template>

<script>
//准备工作
import { getOverviewTurbineData } from '../../api/overview/getMapData.js'
import AMapLoader from '@amap/amap-jsapi-loader'
window._AMapSecurityConfig = {
  securityJsCode: '1260f13fffc52b86824606929288ef75',
}
export default {
  data() {
    return {
      loading: true,
      //多选框相关变量
      checkAll: true,
      clusterOptions: [],
      checkedClusters: [], //这是选中的集群Array
      isIndeterminate: false,
      // 地图相关变量
      globalAMap: null, //用于全局调用的AMap对象
      map: null, //全局map对象
      labelsLayerList: [], //绘制不同集群数据的图层列表
      infoWindow: null, //地图标记弹窗
    }
  },
  methods: {
    //多选框相关方法
    handleCheckAllChange(val) {
      this.checkedClusters = val ? this.clusterOptions : []
      this.isIndeterminate = false
      if (val) {
        //全选
        this.labelsLayerList.forEach((element) => {
          element.layerData.show()
        })
      } else {
        //全不选
        this.labelsLayerList.forEach((element) => {
          element.layerData.hide()
        })
      }
    },
    //多选框相关方法
    handleCheckedClustersChange(value) {
      // 传入的是一个选中项目的Array
      var checkedCount = value.length
      this.checkAll = checkedCount === this.clusterOptions.length
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.clusterOptions.length
      this.redrawMarker()
    },
    //高德地图初始化，包括了画边界和画标记
    initMap() {
      AMapLoader.load({
        key: 'f9cb65dd9831f33581c66e88ec5881a6',
        version: '2.0',
        // version: '2.1Beta',
        plugins: [''],
      })
        .then((AMap) => {
          this.globalAMap = AMap
          this.map = new AMap.Map('container', {
            viewMode: '3D', // 地图模式
            // terrain: true, // 开启地形图
            zoom: 9,
            center: [114.88, 41.27565],
            layers: [
              //使用多个图层
              new AMap.TileLayer.Satellite(),
              new AMap.TileLayer.RoadNet(),
            ],
          })
          this.map.plugin(['AMap.MapType', 'AMap.Scale'], () => {
            //地图类型切换
            var type = new AMap.MapType({
              defaultType: 0,
            })
            this.map.addControl(type)
            var scale = new AMap.Scale({
              position: 'RB',
            })
            this.map.addControl(scale)
          })
          //拖动地图时不显示标记点以防卡顿
          this.map.on('movestart', () => {
            this.labelsLayerList.forEach((element) => {
              element.layerData.hide()
            })
          })
          this.map.on('moveend', () => {
            this.redrawMarker()
          })
          this.map.on('complete', () => {
            this.drawBounds(AMap) //绘制区域边界
            //初始化信息窗口对象
            this.infoWindow = new AMap.InfoWindow({
              autoMove: false,
              closeWhenClickMap: true, //点击地图隐藏窗体
              content: '',
              offset: new AMap.Pixel(0, -15),
            })
            this.getMassLabel(AMap)
          })
        })
        .catch((e) => {
          console.log(e)
        })
    },
    //画边界的方法
    drawBounds(m_AMap) {
      // 传入AMap对象，绘制区域边界
      m_AMap.plugin('AMap.DistrictSearch', () => {
        var districtSearch = new m_AMap.DistrictSearch({
          level: 'district',
          //  是否显示下级行政区级数，1表示返回下一级行政区
          subdistrict: 0,
          // 返回行政区边界坐标点
          extensions: 'all',
        })
        // 搜索所有省/直辖市信息
        districtSearch.search('张北县', (status, result) => {
          if (status === 'complete') {
            const bounds = result.districtList[0].boundaries
            for (let i = 0; i < bounds.length; i++) {
              new m_AMap.Polygon({
                map: this.map, // 指定地图对象
                strokeWeight: 2, // 轮廓线宽度
                path: bounds[i], //轮廓线的节点坐标数组
                fillOpacity: 0.1, //透明度
                fillColor: '#256edc', //填充颜色
                strokeColor: '#256edc', //线条颜色
              })
            }
            // this.map.setFitView()
          } else {
            console.log('未查询到张北县信息！')
          }
        })
      })
    },

    //画大量Label
    getMassLabel(m_AMap) {
      getOverviewTurbineData()
        .then((res) => {
          var icon = {
            //标注的icon实例
            type: 'image',
            image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
            size: [8, 12],
            anchor: 'bottom-center',
          }
          var tmp = []
          // res.data结构：
          // [
          //   {
          //   "cluster_id": "No.1",
          //   "turbine": [{
          //     "turbine_id": "WT17-16",
          //     "lat": "41.489795",
          //     "lng": "114.824031",
          //     "AMapPosition": [114.830369,41.491712],
          //     "height": "1404.563873"},
          //       ...,
          //     ]
          //   },
          //   ...,
          //   {...},
          // ]
          res.data.forEach((cluster) => {
            tmp.push(cluster.cluster_id)
            var labelMarkers = []
            cluster.turbine.forEach((element) => {
              // 创建labelMarker实例
              var labelMarker = new m_AMap.LabelMarker({
                id: element.turbine_id, // 此属性非绘制文字内容，仅最为标识使用
                position: element.AMapPosition,
                // zIndex: 16,
                // 将第一步创建的 icon 对象传给 icon 属性
                icon: icon,
              })
              // 挂载标记点击事件
              labelMarker.on('click', () => {
                var infoWindowContent = [
                  '<h1 style="font-size; 18px;margin-top:0px">编号：' +
                    element.turbine_id +
                    '</p>',
                  '<p style="font-size: 12px">集群编号：' +
                    cluster.cluster_id +
                    '</p>',

                  '<p style="font-size: 12px">风力机坐标：(' +
                    element.lat +
                    ',' +
                    element.lng +
                    ')</p>',
                  '<p style="font-size: 12px">风力机高程：' +
                    element.height +
                    '</p>',
                ]
                this.infoWindow.setContent(infoWindowContent.join(''))
                this.infoWindow.open(this.map, labelMarker.getPosition())
              })

              labelMarkers.push(labelMarker)
            })
            // 创建 AMap.LabelsLayer 图层
            var labelsLayer = new m_AMap.LabelsLayer({
              // zIndex: 1000,
              collision: false,
            })
            labelsLayer.add(labelMarkers)
            // 将图层添加到地图，一层表示一个集群
            this.map.add(labelsLayer)
            this.labelsLayerList.push({
              cluster: cluster.cluster_id,
              layerData: labelsLayer,
            })
          })
          this.clusterOptions = tmp
          this.checkedClusters = tmp
          this.loading = false
        })
        .catch((e) => {
          console.log(e)
        })
    },

    redrawMarker() {
      this.labelsLayerList.forEach((layer) => {
        if (this.checkedClusters.indexOf(layer.cluster) !== -1) {
          layer.layerData.show()
        } else {
          layer.layerData.hide()
        }
      })
    },
    // conventGPS() {
    //   axios
    //     .get(
    //       'https://mock.presstime.cn/mock/6389a56de7aea00081e03bbb/wp/zb_position'
    //     )
    //     .then((res) => {
    //       //接收点位数据，加入转化后的高德坐标数据并输出
    //       // console.log(res.data)
    //       var tempjson = []
    //       res.data.forEach((cluster) => {
    //         // console.log(cluster)
    //         var temp_turbine = []
    //         cluster.turbine.forEach((turbine) => {
    //           // console.log(turbine)
    //           this.globalAMap.convertFrom(
    //             [turbine.lng, turbine.lat],
    //             'gps',
    //             function (status, result) {
    //               if (result.info === 'ok') {
    //                 var lnglats = result.locations // Array.<LngLat>

    //                 temp_turbine.push({
    //                   turbine_id: turbine.turbine_id,
    //                   lat: turbine.lat,
    //                   lng: turbine.lng,
    //                   AMapPosition: lnglats[0],
    //                   height: turbine.height,
    //                 })
    //               }
    //             }
    //           )
    //         })
    //         tempjson.push({
    //           cluster_id: cluster.cluster_id,
    //           turbine: temp_turbine,
    //         })
    //       })
    //       console.log(tempjson)
    //     })
    //     .catch((e) => {
    //       console.log(e)
    //     })
    // },
  },
  mounted() {
    this.initMap()
  },
  beforeDestroy() {
    this.map.destroy()
  },
}
</script>

<style lang="less" scoped>
.map {
  margin-bottom: 10px;
}
.left,
#container {
  height: calc(0.6 * (100vh - 238px));
}
.left {
  overflow: scroll;
  overflow-x: hidden;
}
#container {
  padding: 0px;
  margin: 0px;
  width: 100%;
}
</style>