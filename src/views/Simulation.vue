<template>
  <div>
    <h1>这是Simulation</h1>
    <p>这个暂时用于地图arraybuffer可视化的测试</p>
    <div id="map" />
  </div>
</template>
<script>
// leaflet库
import L from "leaflet/dist/leaflet";
import "leaflet/dist/leaflet.css";
import "@panzhiyue/leaflet-canvasmarker"; //canvas渲染marker的插件
//geotiff渲染插件（必须放在leaflet后）
import GeoTIFF from "geotiff";
import "leaflet-geotiff-2";
import "leaflet-geotiff-2/dist/leaflet-geotiff-plotty";

// 静态资源的引入
import { rootURL } from "/rootURL.js";

import * as myMapFunc from "@/js/map/map";
export default {
  data() {
    return {
      map: null,
      colormap: "viridis",
      geolayer: null,
    };
  },
  computed: {
    geotiffMinAndMax() {
      if (this.geolayer && this.geolayer.min)
        return [this.geolayer.min, this.geolayer.max];
      return null;
    },
  },
  watch: {
    geotiffMinAndMax() {
      // 与computed中的geotiffMinAndMax配合使用，使得geotiff
      // 读取到最大最小值的时候定义contour渲染器的最大最小值
      if (this.geotiffMinAndMax && this.geotiffMinAndMax[0]) {
        this.geolayer.options.renderer.setDisplayRange(
          this.geotiffMinAndMax[0],
          this.geotiffMinAndMax[1]
        );
        this.geolayer.addTo(this.map);
      }
    },
  },
  methods: {
    showMap() {
      const baseLayers = myMapFunc.handleBaseLayers();
      const { map, layerControl } = myMapFunc.mapInit(baseLayers);
      this.map = map;
      const plottyOption = {
        band: 0,
        clampLow: false, // 表示高于范围的不显示
        clampHigh: false,
        colorScale: "viridis",
      };
      const renderer = new L.LeafletGeotiff.Plotty(plottyOption);
      const option = {
        renderer,
        onError: (error) => {
          console.log(error);
        },
        useWorker: true,
        noDataValue: -32768,
        sourceFunction: GeoTIFF.fromArrayBuffer,
        // 这里传入ArrayBuffer
        arrayBuffer: [1],
        opacity: 0.75,
      };
      // const url = `${rootURL}/geotiff/test_compress.tif`;
      const url = null;
      this.geolayer = L.leafletGeotiff(url, option);
      const contourName = "风场云图";
      layerControl.addOverlay(this.geolayer, contourName);
    },
  },
  mounted() {
    this.showMap();
  },
};
</script>
<style lang="less" scoped>
#map {
  height: 800px;
  width: 100%;
}
</style>
