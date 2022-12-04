<template>
  <div id="container"></div>
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
      map: null,
      position: [],
      infoWindow: null,
    }
  },
  methods: {
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
            zoom: 16,
            center: [120.124, 30.265],
            layers: [
              //使用多个图层
              //new AMap.TileLayer.Satellite(),
            ],
          })
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
    getMarker(m_AMap) {
      // 传入AMap对象，读取点位数据并渲染在AMap对象上
      axios
        .get(
          'https://mock.presstime.cn/mock/6389a56de7aea00081e03bbb/wp/turbine_position'
        )
        .then((res) => {
          this.position = res.data.position
          //读取标记点位置并显示
          var markerList = []
          console.log(res.data.position)
          this.position.forEach((element) => {
            var marker = new m_AMap.Marker({
              position: element.turbine_position, //位置
            })
            marker.on('click', (e) => {
              //给每个标记注册一个点击事件
              var infoWindowContent = [
                '<h1>风力机编号：' + element.turbine_id + '</h1>',
                '<p>风力机坐标：[' + element.turbine_position + ']</p>',
              ]

              this.infoWindow.setContent(infoWindowContent.join(''))
              this.infoWindow.open(this.map, marker.getPosition())
            })
            markerList.push(marker)
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