<template>
  <div>
    <h1>这是Simulation</h1>
    <p>这个暂时用于地图arraybuffer可视化的测试</p>
    <div id="map" />
  </div>
</template>
<script>
import * as myMapFunc from "@/js/map/map";
export default {
  data() {
    return {};
  },
  mounted() {
    const baseLayers = myMapFunc.handleBaseLayers();
    const { map, layerControl } = myMapFunc.mapInit(baseLayers);
    this.map = map;
  },
};
</script>
<style lang="less" scoped>
#map {
  height: 300px;
  width: 100%;
}
</style>
