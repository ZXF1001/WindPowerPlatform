//* 把与地图有关的函数都封装在了这里，方便统一管理不同的页面上的地图。
//* 水平有限，很多地方直接把整个this传了进来，不知道以后维护的时候会不会因此遇到bug

// leaflet库
import L from "leaflet/dist/leaflet";
import "leaflet/dist/leaflet.css";
import "@panzhiyue/leaflet-canvasmarker"; //canvas渲染marker的插件
//geotiff渲染插件（必须放在leaflet后）
import GeoTIFF from "geotiff";
import "leaflet-geotiff-2";
import "leaflet-geotiff-2/dist/leaflet-geotiff-plotty";
//流线图插件
import "leaflet-velocity/dist/leaflet-velocity.css";
import "leaflet-velocity/dist/leaflet-velocity";
// 网络请求
import axios from "axios";
import { post4MyTurbineData } from "@/api/wind/post4Position.js";
// 静态资源的引入
import importAllSVG from "@/assets/windTurbineSvg/import.js";
import baseLayersData from "@/json/map/baseLayers.json";
import { rootURL } from "/rootURL.js";
//对baseLayersData底图列表进行处理（路网、标注合并到纯底图上）
export const handleBaseLayers = () => {
  const baseLayers = [];
  // 从底图列表baseLayers.json文件中读取底图
  for (let i = 0; i < baseLayersData.length; i++) {
    const element = baseLayersData[i];
    if ("annotationUrl" in element) {
      //底图的标注annotation也要加进来
      const map = L.tileLayer(element.url, {
        minZoom: element.minZoom,
        maxZoom: element.maxZoom,
      });
      const annotation = L.tileLayer(element.annotationUrl, {
        minZoom: element.minZoom,
        maxZoom: element.maxZoom,
      });
      baseLayers[element.name] = L.layerGroup([map, annotation]);
    } else {
      //没有annotation就不用考虑组成图层组
      baseLayers[element.name] = L.tileLayer(element.url, {
        minZoom: element.minZoom,
        maxZoom: element.maxZoom,
      });
    }
  }
  return baseLayers;
};

// 创建leaflet总体框架控件，返回这些组件（map和layerControl）到vue部件中
export const mapInit = (baseLayers) => {
  const mapOptions = {
    attributionControl: false,
    zoomControl: false,
    center: [41.25, 114.9], //todo 要改成根据坐标数据显示区域
    zoom: 9,
    layers: baseLayers["天地图地形"], //默认加载图层
    preferCanvas: true,
  };
  const map = L.map("map", mapOptions);
  // 定义图层控件
  const layerControl = L.control
    .layers(
      baseLayers,
      {},
      {
        position: "topright",
        collapsed: true,
      }
    )
    .addTo(map);
  //定义比例尺控件
  L.control
    .scale({
      position: "bottomleft",
      maxWidth: "100",
      imperial: false,
    })
    .addTo(map);

  return { map, layerControl };
};

// 不显示云图时，隐藏colorbar
function handleColorbar(that, contourName) {
  that.map.on("overlayremove", (event) => {
    if (event.name === contourName) {
      that.contourSelected = false;
    }
  });
  that.map.on("overlayadd", (event) => {
    if (event.name === contourName) {
      that.contourSelected = true;
    }
  });
}

// 画云图
export const drawContour = (that, layerControlObj) => {
  that.contourLoading = that.$message("正在加载标量云图...");
  const plottyOption = {
    band: 0,
    clampLow: false, // 表示高于范围的不显示
    clampHigh: false,
    colorScale: that.colormap,
  };
  const renderer = new L.LeafletGeotiff.Plotty(plottyOption);
  const option = {
    renderer,
    // bounds: [
    //   [40.7, 114],
    //   [41.8, 115.8],
    // ],
    onError: (error) => {
      console.log(error);
    },
    useWorker: true,
    noDataValue: -32768,
    sourceFunction: GeoTIFF.fromUrl,
    opacity: 0.75,
  };

  const url = `${rootURL}/geotiff/test_compress.tif`;
  that.geolayer = L.leafletGeotiff(url, option);
  const contourName = "风场云图";
  layerControlObj.addOverlay(that.geolayer, contourName);
  handleColorbar(that, contourName);
};

// 获取流线图数据最大最小值的函数
function getMinMax(streamlineData) {
  const n = streamlineData[0].header.nx * streamlineData[0].header.ny; //网格数
  let minMag,
    maxMag = Math.sqrt(
      Math.pow(streamlineData[0].data[0], 2) +
        Math.pow(streamlineData[1].data[0], 2)
    );
  let mag;
  for (let i = 0; i < n; i++) {
    mag = Math.sqrt(
      Math.pow(streamlineData[0].data[i], 2) +
        Math.pow(streamlineData[1].data[i], 2)
    );
    minMag = Math.min(mag, minMag);
    maxMag = Math.max(mag, maxMag);
  }
  return { minMag, maxMag };
}

// 这个函数是为了避免拖拽流线图的时候卡顿
function handleMove(that, velocityName, velocityLayer) {
  let streamlineSelected = true;
  that.map.on("overlayremove", (event) => {
    if (event.name === velocityName) streamlineSelected = false;
  });
  that.map.on("overlayadd", (event) => {
    if (event.name === velocityName) streamlineSelected = true;
  });
  that.map.on("moveend", () => {
    if (streamlineSelected === true) {
      // 避免拖拽流线图的时候卡顿
      velocityLayer.remove();
      that.map.addLayer(velocityLayer);
    }
  });
}
// 画流线图
export const drawStream = (that, layerControlObj) => {
  const streamlineURL = `${rootURL}/streamline/zb.json`;
  axios
    .get(streamlineURL)
    .then((res) => {
      const { minMag, maxMag } = getMinMax(res.data);
      const streamlineOption = {
        displayValues: true,
        displayOptions: {
          velocityType: "",
          position: "bottomright",
          emptyString: "此处没有风数据",
          angleConvention: "meteoCCW",
          showCardinal: true,
          speedUnit: "m/s",
          directionString: "风向",
          speedString: "风速",
        },
        data: res.data,
        minVelocity: minMag,
        maxVelocity: maxMag,
        velocityScale: 0.005,
        frameRate: 40,
        // particleAge: 20,
        // lineWidth: 2,
        // particleMultiplier: 0.005,
        // colorScale:[],
      };
      const velocityLayer = L.velocityLayer(streamlineOption);
      const velocityName = "风场流线";
      layerControlObj.addOverlay(velocityLayer, velocityName);
      that.map.addLayer(velocityLayer);

      handleMove(that, velocityName, velocityLayer);
    })
    .catch((e) => {
      console.log(e);
    });
};

// 画风机标记
// 把数据库返回的零散数据按集群id整合
function groupByCluster(that, data) {
  const clusterIdList = [];
  const turbineData = [];

  for (let i = 0; i < data.length; i++) {
    const turbineItem = data[i];
    if (clusterIdList.indexOf(turbineItem.cluster_id) === -1) {
      clusterIdList.push(turbineItem.cluster_id);
      that.clusterOptions.push(turbineItem.cluster_name);
      that.checkedClusters.push(turbineItem.cluster_name);
      turbineData.push({
        cluster_id: turbineItem.cluster_id,
        cluster_name: turbineItem.cluster_name,
        turbine: [],
      });
    }
    const index = turbineData.findIndex(
      (item) => item.cluster_id === turbineItem.cluster_id
    );
    turbineData[index].turbine.push({
      turbine_id: turbineItem.turbine_id,
      lat: turbineItem.lat,
      lng: turbineItem.lng,
      height: turbineItem.height,
    });
  }

  // this.loading = false
  return turbineData;
}

// 将集群的坐标数据组成地图上Marker的Array
function handleMarkerList(cluster, icon) {
  const markerList = [];
  for (let i = 0; i < cluster.turbine.length; i++) {
    const turbine = cluster.turbine[i];
    const tempMarker = L.marker([turbine.lat, turbine.lng], {
      icon: icon,
    });
    const popupContent = `<span>风力机编号：${turbine.turbine_id}</span><br>
                                <span>所属集群：${cluster.cluster_name}</span><br>
                                <span>经度：${turbine.lng}</span><br>
                                <span>纬度：${turbine.lat}</span><br>
                                <span>高程：${turbine.height}</span>`;

    tempMarker.bindPopup(popupContent);
    markerList.push(tempMarker);
  }
  return markerList;
}

export const drawMarker = (that) => {
  const site = ["zb", "ss2"];
  const postData = { site };
  post4MyTurbineData(postData)
    .then((res) => {
      console.log(res.data);
      const Icons = importAllSVG();
      const turbineData = groupByCluster(that, res.data);
      that.layerGroup = [];
      turbineData.forEach((cluster, index) => {
        const icon = L.icon({
          iconUrl: Icons[index],
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -15],
        });
        const markerList = handleMarkerList(cluster, icon);
        const templayerGroup = L.canvasMarkerLayer({
          collisionFlg: false, // 碰撞检测
        }).addTo(that.map);
        templayerGroup.addLayers(markerList);

        that.layerGroup.push({
          name: cluster.cluster_name,
          data: templayerGroup,
        });
      });
    })
    .catch((e) => {
      console.log(e);
    });
};

export const redrawMarker = (that) => {
  that.layerGroup.forEach((layer) => {
    if (that.checkedClusters.indexOf(layer.name) !== -1) {
      that.map.addLayer(layer.data);
    } else {
      layer.data.remove();
    }
  });
};
