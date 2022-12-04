<template>
  <div>
    <el-row>
      <el-col :span="2">
        <div class="left">
          <el-checkbox :indeterminate="isIndeterminate"
                       v-model="checkAll"
                       @change="handleCheckAllChange">全选</el-checkbox>
          <div style="margin: 15px 0;"></div>
          <el-checkbox-group v-model="checkedClusters"
                             @change="handleCheckedClustersChange">
            <el-checkbox v-for="cluster in clusters"
                         :label="cluster"
                         :key="cluster"
                         style="display: block; padding-top: 10px;">{{cluster}}</el-checkbox>

          </el-checkbox-group>
        </div>
      </el-col>
      <el-col :span="22">
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
const clusterOptions = ['No.1', 'No.2'] //这些数据应该从数据库中获得
export default {
  data() {
    return {
      //多选框相关变量
      checkAll: true,
      checkedClusters: clusterOptions, //这是选中的集群Array
      clusters: clusterOptions,
      isIndeterminate: false,
      // 地图相关变量
      map: null,
      infoWindow: null, //地图标记弹窗
    }
  },
  methods: {
    //多选框相关方法
    handleCheckAllChange(val) {
      this.checkedClusters = val ? clusterOptions : []
      this.isIndeterminate = false
    },
    //多选框相关方法
    handleCheckedClustersChange(value) {
      // 传入的是一个选中项目的Array
      let checkedCount = value.length
      this.checkAll = checkedCount === this.clusters.length
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.clusters.length
    },
    //高德地图初始化，包括了画边界和画标记
    initMap() {
      AMapLoader.load({
        key: 'f9cb65dd9831f33581c66e88ec5881a6',
        version: '2.0',
        plugins: [''],
      })
        .then((AMap) => {
          this.map = new AMap.Map('container', {
            viewMode: '3D', // 地图模式
            terrain: true, // 开启地形图
            zoom: 1,
            center: [114.824031, 41.489795],
            layers: [
              //使用多个图层
              //new AMap.TileLayer.Satellite(),
            ],
          })
          this.drawBounds(AMap) //绘制区域边界
          //初始化信息窗口对象
          this.infoWindow = new AMap.InfoWindow({
            //isCustom: true, //使用自定义窗体
            closeWhenClickMap: true, //点击地图隐藏窗体
            content: '',
            offset: new AMap.Pixel(0, -32),
          })
          this.map.on('complete', () => {
            this.getMarker(AMap)
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
    //画标记点的方法
    getMarker(m_AMap) {
      // 传入AMap对象，读取点位数据并渲染在AMap对象上
      axios
        .get(
          //'https://mock.presstime.cn/mock/6389a56de7aea00081e03bbb/wp/turbine_position'
          'https://mock.presstime.cn/mock/6389a56de7aea00081e03bbb/wp/zb_position'
        )
        .then((res) => {
          // console.log(res.data)
          var markerList = []
          res.data.forEach((cluster) => {
            cluster.turbine.forEach((element) => {
              var marker = new m_AMap.Marker({
                map: this.map,
                position: [element.lon, element.lat],
              })
              marker.on('click', (e) => {
                //给每个标记注册一个点击事件
                var infoWindowContent = [
                  '<p>集群编号：' + cluster.cluster_id + '</p>',
                  '<p>风力机编号：' + element.turbine_id + '</p>',
                  '<p>风力机坐标：(' +
                    element.lat +
                    ',' +
                    element.lon +
                    ')</p>',
                  '<p>风力机高程：' + element.height + '</p>',
                ]
                this.infoWindow.setContent(infoWindowContent.join(''))
                this.infoWindow.open(this.map, marker.getPosition())
              })
              markerList.push(marker)
              this.map.setFitView()
            })
          })
          this.map.add(markerList)
        })
        .catch((e) => {
          console.log(e)
          alert('地图模块调用失败！')
        })
    },
  },
  mounted() {
    this.initMap()
  },
  // 跳转前销毁实例释放内存
  beforeRouteLeave() {
    this.map.destroy()
    this.map.clear()
  },
}
</script>

<style lang="less" scoped>
#container {
  padding: 0px;
  margin: 0px;
  width: 100%;
  height: 400px;
}
</style>