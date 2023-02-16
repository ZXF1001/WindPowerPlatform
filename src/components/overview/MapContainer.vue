<template>
  <el-card class="map">
    <el-container>
      <el-aside width="auto">
        <div class="select scroller">
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
      </el-aside>
      <el-main>
        <div id='map'>
          <div id="colorbarAndLabel"
               v-if="colorbarVisible">
            <div id="colorbar">
              <!-- 一张透明图为colorbar占位 -->
              <img width="100%"
                   height="20"
                   draggable="false"
                   :src="colorbarData?colorbarData:emptyImg">
              <!-- 没有载入colormap时用透明图代替 -->
            </div>
            <div id="label">
              <span v-for="item in [0,1,2,3,4]"
                    :key="item">{{geotiffMinAndMax[0]+(geotiffMinAndMax[1]-geotiffMinAndMax[0])*item/4}}</span>

            </div>
          </div>

        </div>

      </el-main>
    </el-container>
  </el-card>
</template>

<script>
import * as myMapFunc from '@/js/map/map'
export default {
  data() {
    return {
      checkAll: true,
      clusterOptions: [],
      checkedClusters: [], //这是选中的集群Array
      isIndeterminate: false,
      map: null,
      geolayer: null,
      colormap: 'viridis',
      colorbarData: null,
      contourSelected: false,
      emptyImg:
        'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    }
  },
  methods: {
    //多选框相关方法
    handleCheckAllChange(checkedAll) {
      this.checkedClusters = checkedAll ? this.clusterOptions : []
      this.isIndeterminate = false
      myMapFunc.redrawMarker(this)
    },
    handleCheckedClustersChange(checkedList) {
      // 传入的是一个选中项目的Array
      const checkedCount = checkedList.length
      this.checkAll = checkedCount === this.clusterOptions.length
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.clusterOptions.length
      myMapFunc.redrawMarker(this)
    },
  },
  computed: {
    isCollapse() {
      return this.$store.state.tab.isCollapse
    },
    geotiffMinAndMax() {
      if (this.geolayer ? this.geolayer.min : false) {
        return [this.geolayer.min, this.geolayer.max]
      } else {
        return null
      }
    },
    colorbarVisible() {
      if (this.contourSelected) {
        return this.geotiffMinAndMax ? this.geotiffMinAndMax[0] : false
      } else {
        return false
      }
    },
  },
  watch: {
    isCollapse() {
      // 这里得等侧边栏折叠完才能更新地图容器边界
      setTimeout(() => {
        this.map.invalidateSize(false)
      }, 400)
    },
    geotiffMinAndMax() {
      // 与computed中的geotiffMinAndMax配合使用，使得geotiff
      // 读取到最大最小值的时候定义contour渲染器的最大最小值
      if (this.geotiffMinAndMax ? this.geotiffMinAndMax[0] : false) {
        if (this.contourLoading) this.contourLoading.close()
        this.$message({ message: '加载标量云图完成', type: 'success' })
        this.geolayer.options.renderer.setDisplayRange(
          this.geotiffMinAndMax[0],
          this.geotiffMinAndMax[1]
        )
        this.geolayer.addTo(this.map)
        const renderer = this.geolayer.options.renderer
        this.colorbarData = renderer.getColourbarDataUrl(this.colormap)
      }
    },
  },
  mounted() {
    const baseLayers = myMapFunc.handleBaseLayers()
    const { map, layerControl } = myMapFunc.mapInit(baseLayers)
    this.map = map
    // 画流线图和云图
    myMapFunc.drawContour(this, layerControl)
    myMapFunc.drawStream(this, layerControl)
    // 画标记点
    myMapFunc.drawMarker(this)
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
.map {
  margin-bottom: 10px;

  #map {
    height: calc(0.6 * (100vh - 238px));
    display: flex;
    justify-content: center;
    #colorbarAndLabel {
      position: absolute;
      bottom: 5px;
      width: 40%;
      padding: 10px;
      z-index: 9999;
      background-color: rgba(255, 255, 255, 0.5);
      border: 2px solid rgba(0, 0, 0, 0.5);
      #colorbar,
      #label {
        display: flex;
        justify-content: space-between;
        user-select: none; // 文字不可选
      }
    }
  }
  .select {
    height: calc(0.6 * (100vh - 238px));
    margin-right: 5px;
    overflow: auto;
  }
  .el-main {
    padding: 0;
    height: 100%;
  }
}
</style>