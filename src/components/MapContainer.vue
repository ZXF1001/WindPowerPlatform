<template>
  <div>
    <el-row>
      <el-col :span="3">
        <div class="left">
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
</template>

<script>
//准备工作
import axios from 'axios'
import AMapLoader from '@amap/amap-jsapi-loader'
window._AMapSecurityConfig = {
  securityJsCode: '1260f13fffc52b86824606929288ef75',
}
export default {
  data() {
    return {
      //多选框相关变量
      checkAll: true,
      clusterOptions: [],
      checkedClusters: [], //这是选中的集群Array
      isIndeterminate: false,
      // 地图相关变量
      globalAMap: null, //用于全局调用的AMap对象
      map: null,
      markerList: [],
      labelsLayerList: [],
      infoWindow: null, //地图标记弹窗
      positionData: [],
    }
  },
  methods: {
    //多选框相关方法
    handleCheckAllChange(val) {
      this.checkedClusters = val ? this.clusterOptions : []
      this.isIndeterminate = false
      if (val) {
        this.labelsLayerList.forEach((ele) => {
          ele.layerData.show()
        })
      } else {
        this.labelsLayerList.forEach((ele) => {
          ele.layerData.hide()
        })
      }
    },
    //多选框相关方法
    handleCheckedClustersChange(value) {
      // 传入的是一个选中项目的Array
      let checkedCount = value.length
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
        plugins: [''],
      })
        .then((AMap) => {
          this.globalAMap = AMap
          this.map = new AMap.Map('container', {
            viewMode: '3D', // 地图模式
            terrain: true, // 开启地形图
            zoom: 8,
            center: [114.88072, 41.275698],
            layers: [
              //使用多个图层
              //new AMap.TileLayer.Satellite(),
            ],
          })
          this.map.on('movestart', () => {
            this.labelsLayerList.forEach((ele) => {
              ele.layerData.hide()
            })
          })
          this.map.on('moveend', () => {
            this.labelsLayerList.forEach((ele) => {
              ele.layerData.show()
            })
          })
          this.map.on('complete', () => {
            this.drawBounds(AMap) //绘制区域边界
            //初始化信息窗口对象
            this.infoWindow = new AMap.InfoWindow({
              //isCustom: true, //使用自定义窗体
              closeWhenClickMap: true, //点击地图隐藏窗体
              content: '',
              offset: new AMap.Pixel(0, -15),
            })
            // 选择画标记点的方式
            this.getMassLabel(AMap) //可以考虑
            // this.getMarker(AMap) //最原始的方法，太慢
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
          // 关键字对应的行政区级别，共有5种级别
          level: 'district',
          //  是否显示下级行政区级数，1表示返回下一级行政区
          subdistrict: 0,
          // 返回行政区边界坐标点
          extensions: 'all',
        })
        // 搜索所有省/直辖市信息
        districtSearch.search('张北县', (status, result) => {
          // 查询成功时，result即为对应的行政区信息
          if (status === 'complete') {
            const bounds = result.districtList[0].boundaries
            for (let i = 0, l = bounds.length; i < l; i++) {
              var polygon = new m_AMap.Polygon({
                map: this.map, // 指定地图对象
                strokeWeight: 2, // 轮廓线宽度
                path: bounds[i], //轮廓线的节点坐标数组
                fillOpacity: 0.1, //透明度
                fillColor: '#256edc', //填充颜色
                strokeColor: '#256edc', //线条颜色
              })
            }
            this.map.setFitView()
          }
        })
      })
    },

    //画大量Label
    getMassLabel(m_AMap) {
      axios
        .get(
          'https://mock.presstime.cn/mock/6389a56de7aea00081e03bbb/wp/zb_position'
        )
        .then((res) => {
          var icon = {
            //标注的icon实例
            type: 'image',
            image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
            size: [8, 12],
            anchor: 'bottom-center',
          }
          var tmp = []
          res.data.forEach((cluster) => {
            tmp.push(cluster.cluster_id)
            var labelMarkers = []
            cluster.turbine.forEach((element) => {
              // 创建labelMarker实例
              var labelMarker = new m_AMap.LabelMarker({
                id: element.turbine_id, // 此属性非绘制文字内容，仅最为标识使用
                position: [element.lon, element.lat],
                zIndex: 16,
                // 将第一步创建的 icon 对象传给 icon 属性
                icon: icon,
              })
              labelMarker.on('click', (e) => {
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
                    element.lon +
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
              zIndex: 1000,
              collision: false,
            })
            labelsLayer.add(labelMarkers)
            // 将图层添加到地图
            this.map.add(labelsLayer)
            this.labelsLayerList.push({
              cluster: cluster.cluster_id,
              layerData: labelsLayer,
            })
          })
          this.clusterOptions = tmp
          this.checkedClusters = tmp
        })
        .catch((e) => {
          console.log(e)
          alert('地图模块调用失败！')
        })
    },
    //画最简单标记点的方法（大量数据时会更慢）
    // getMarker(m_AMap) {
    //   // 传入AMap对象，读取点位数据并渲染在AMap对象上
    //   axios
    //     .get(
    //       //'https://mock.presstime.cn/mock/6389a56de7aea00081e03bbb/wp/turbine_position'
    //       'https://mock.presstime.cn/mock/6389a56de7aea00081e03bbb/wp/zb_position'
    //     )
    //     .then((res) => {
    //       this.positionData = res.data
    //       res.data.forEach((cluster) => {
    //         clusterOptions.push(cluster.cluster_id)
    //         cluster.turbine.forEach((element) => {
    //           var marker = new m_AMap.Marker({
    //             map: this.map,
    //             position: [element.lon, element.lat],
    //           })
    //           marker.on('click', (e) => {
    //             //给每个标记注册一个点击事件
    //             var infoWindowContent = [
    //               '<p>集群编号：' + cluster.cluster_id + '</p>',
    //               '<p>风力机编号：' + element.turbine_id + '</p>',
    //               '<p>风力机坐标：(' +
    //                 element.lat +
    //                 ',' +
    //                 element.lon +
    //                 ')</p>',
    //               '<p>风力机高程：' + element.height + '</p>',
    //             ]
    //             this.infoWindow.setContent(infoWindowContent.join(''))
    //             this.infoWindow.open(this.map, marker.getPosition())
    //           })
    //           this.markerList.push(marker)
    //         })
    //       })
    //       this.map.add(this.markerList)
    //     })
    //     .catch((e) => {
    //       console.log(e)
    //       alert('地图模块调用失败！')
    //     })
    // },

    redrawMarker() {
      this.labelsLayerList.forEach((layer) => {
        if (this.checkedClusters.indexOf(layer.cluster) !== -1) {
          layer.layerData.show()
        } else {
          layer.layerData.hide()
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
.left {
  height: 400px;

  overflow: scroll;
  overflow-x: hidden;
}
#container {
  padding: 0px;
  margin: 0px;
  width: 100%;
  height: 400px;
}
</style>