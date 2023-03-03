<template>
  <div id="main">
    <h1>这是Optimize</h1>
    <p>
      这个暂时用于plotty可视化的测试，详见http://santilland.github.io/plotty/
    </p>
    <p>本机</p>
    <el-button @click="showGeotiff">click</el-button>
    <canvas id="canvas" />
  </div>
</template>
<script>
import GeoTIFF, { fromArrayBuffer } from "geotiff";

export default {
  data() {
    return {};
  },
  methods: {
    createPic() {
      // The canvas to plot on.
      var canvas = document.getElementById("canvas");

      // The width of the data.
      var width = 300;

      // The height of the data.
      var height = 100;

      // The data to plot.
      var exampledata = new Float32Array(height * width);

      // The offset of the plot from the left side of the canvas.
      var xoff = width / 3;

      // The offset of the plot from the top of the canvas.
      var yoff = height / 3;

      // Fill the data array.
      for (let y = 0; y <= height; y++) {
        for (let x = 0; x <= width; x++) {
          // The distance of the current point from the center of the plot.
          let x2 = x - xoff;
          let y2 = y - yoff;
          let d = Math.sqrt(x2 * x2 + y2 * y2);

          // The sine of the distance.
          let t = Math.sin(d / 6.0);

          // Save the sine.
          exampledata[y * width + x] = t;
        }
      }

      // Create the plot.
      const plotty = require("plotty");
      let plot = new plotty.plot({
        canvas: canvas,
        data: exampledata,
        width: width,
        height: height,
        domain: [-10, 10],
        colorScale: "viridis",
      });

      // Render the plot.
      plot.render();
    },
    createCanvasAndPic() {
      // create a canvas and do something
      var canvas = document.createElement("canvas");
      const width = 300;
      const height = 100;
      canvas.width = width;
      canvas.height = height;
      var ctx = canvas.getContext("2d");
      ctx.fillStyle = "rgb(200,0,0)";
      ctx.fillRect(10, 10, 55, 50);
      // show a canvas in the div
      document.getElementById("main").appendChild(canvas);
      //convent a canvas to a picture
      var img = canvas.toDataURL("image/png");
      console.log(img);
    },
  },
  mounted() {
    this.createPic();
    this.createCanvasAndPic();
  },
};
</script>
<style lang="less" scoped>
#canvas {
  width: 100%;
}
</style>
