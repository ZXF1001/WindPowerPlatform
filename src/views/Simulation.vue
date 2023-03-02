<template>
  <div>
    <h1>这是Simulation</h1>
    <p>这个暂时用于地图上风速可视化的测试</p>
    <!-- map地图容器 -->
    <div id="map">
      <!-- 地图内部显示colorbar的div -->
      <div id="colorbar">
        <div id="colorbar-img">
          <!-- 有colorbar数据就显示colorbar，没有就显示透明图 -->
          <img
            width="100%"
            height="20"
            draggable="false"
            :src="colorbarData || emptyImg"
          />
        </div>
        <div id="label">
          <!-- colorbar的刻度标注 -->
          <span v-for="i in [0, 1, 2, 3, 4]" :key="i">{{
            (dataMin + ((dataMax - dataMin) * i) / 4).toFixed(2)
          }}</span>
        </div>
      </div>
    </div>
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
      colorbarData: null,
      dataMin: null,
      dataMax: null,
      // 一张空白图片的数据，用于在没有colorbar数据时显示
      emptyImg:
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    };
  },
  methods: {
    showMap() {
      const mapOptions = {
        center: [41.25, 114.9],
        zoom: 9,
        layerName: "天地图卫星",
      };
      const { map, layerControl } = myMapFunc.mapInit(mapOptions);
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
        //find the max and min of the data
        let max = -Infinity;
        let min = Infinity;
        let exampledata = new Float32Array(csvDataObj.n_row * csvDataObj.n_col);
        for (let y = 0; y < csvDataObj.n_row; y++) {
          for (let x = 0; x < csvDataObj.n_col; x++) {
            exampledata[y * csvDataObj.n_col + x] =
              csvDataObj.data[csvDataObj.n_row - y][x];
            max =
              max > exampledata[y * csvDataObj.n_col + x]
                ? max
                : exampledata[y * csvDataObj.n_col + x];
            min =
              min < exampledata[y * csvDataObj.n_col + x]
                ? min
                : exampledata[y * csvDataObj.n_col + x];
          }
        }
        return { exampledata, max, min };
      }

      const url = `${rootURL}/contour/data1.csv`;
      readRemoteCSV(url, (res) => {
        const csvDataObj = handleRawData(res.data);
        // set the center of the map to the center of the data and zoom to the data
        this.map.fitBounds([
          [csvDataObj.lat_north, csvDataObj.lng_west],
          [csvDataObj.lat_south, csvDataObj.lng_east],
        ]);

        const { exampledata, max, min } = createArrayBufferData(csvDataObj);
        this.dataMin = min;
        this.dataMax = max;
        const canvas = document.createElement("canvas");
        const plotty = require("plotty");
        const color1 = "rgba(8, 52, 113, 1)";
        const color2 = "rgba(47, 127, 188,0)";
        plotty.addColorScale("blueblur", [color1, color2], [0, 1]);
        let plot = new plotty.plot({
          canvas: canvas,
          data: exampledata,
          width: csvDataObj.n_col,
          height: csvDataObj.n_row,
          domain: [min, max],
          // noDataValue: 10,
          colorScale: "blueblur",
        });
        console.log(plot);
        // Render the plot.
        plot.render();
        const colorBarImg = plot.getColorScaleImage();
        console.log(colorBarImg);
        // add a canvas to the page
        this.colorbarData = colorBarImg.toDataURL("image/png");

        const imgUrl = canvas.toDataURL("image/png");

        const imgBounds = L.latLngBounds(
          L.latLng(csvDataObj.lat_north, csvDataObj.lng_west),
          L.latLng(csvDataObj.lat_south, csvDataObj.lng_east)
        );
        const options = { opacity: 1 };
        L.imageOverlay(imgUrl, imgBounds, options).addTo(this.map);
      });
    },
  },
  mounted() {
    this.showMap();
  },
};
</script>
<style lang="less" scoped>
#map {
  height: 700px;
  width: 100%;
  display: flex;
  justify-content: center;
  #colorbar {
    position: absolute;
    bottom: 5px;
    width: 40%;
    padding: 10px;
    z-index: 9999;
    background-color: rgba(255, 255, 255, 0.5);
    border: 2px solid rgba(0, 0, 0, 0.5);
    #colorbar-img,
    #label {
      display: flex;
      justify-content: space-between;
      user-select: none; // 文字不可选
    }
  }
}
</style>
