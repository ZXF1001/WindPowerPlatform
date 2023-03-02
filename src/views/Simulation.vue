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

// 静态资源的引入
import { rootURL } from "/rootURL.js";
import { readRemoteCSV } from "@/utils/readCSV.js";
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
      const { map, layerControl } = myMapFunc.mapInit();
      this.map = map;

      this.drawContour();
      myMapFunc.drawMarker(this, { isAddToMap: false });
    },
    drawContour() {
      function handleRawData(rawData) {
        // read the csv and return its metadata and data

        const n_row = Number(rawData[0][0]);
        const n_col = Number(rawData[1][0]);
        const lng_west = Number(rawData[2][0]);
        const lat_north = Number(rawData[3][0]);
        const lng_east = Number(rawData[4][0]);
        const lat_south = Number(rawData[5][0]);
        const data = rawData.slice(6);
        const obj = {
          n_row,
          n_col,
          lng_west,
          lat_north,
          lng_east,
          lat_south,
          data,
        };
        return obj;
      }
      function createArrayBufferData(csvDataObj) {
        let exampledata = new Float32Array(csvDataObj.n_row * csvDataObj.n_col);
        for (let y = 0; y <= csvDataObj.n_row; y++) {
          for (let x = 0; x <= csvDataObj.n_col; x++) {
            // Save the sine.
            exampledata[y * csvDataObj.n_col + x] =
              csvDataObj.data[csvDataObj.n_row - y][x];
          }
        }
        return exampledata;
      }

      const url = `${rootURL}/contour/data1.csv`;
      readRemoteCSV(url, (res) => {
        const csvDataObj = handleRawData(res.data);
        const exampledata = createArrayBufferData(csvDataObj);
        console.log(exampledata);
        const canvas = document.createElement("canvas");
        const plotty = require("plotty");
        let plot = new plotty.plot({
          canvas: canvas,
          data: exampledata,
          width: csvDataObj.n_col,
          height: csvDataObj.n_row,
          domain: [0, 20],
          colorScale: "viridis",
        });

        // Render the plot.
        plot.render();

        const canvasUrl = canvas.toDataURL("image/png");

        const bounds = L.latLngBounds(
          L.latLng(csvDataObj.lat_north, csvDataObj.lng_west),
          L.latLng(csvDataObj.lat_south, csvDataObj.lng_east)
        );
        const options = { opacity: 0.75 };
        L.imageOverlay(canvasUrl, bounds, options).addTo(this.map);
      });
    },
    drawMarkers() {
      //draw markers fetch from api
    },
  },
  mounted() {
    // this.showMap();
    this.showMap();
  },
};
</script>
<style lang="less" scoped>
#map {
  height: 700px;
  width: 100%;
}
</style>
