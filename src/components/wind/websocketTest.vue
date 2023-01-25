<template>
  <div>
    <h2>geotiff test</h2>
    <el-button @click="load"
               disabled>load geotiff</el-button>
    <div>
      <canvas id="plot"></canvas>
    </div>
    <div id="colorbar"></div>
    <div class="num">
      <span>{{min?min:""}}</span>
      <span>{{max?max:''}}</span>
    </div>
  </div>
</template>

<script>
import { fromUrl } from 'geotiff'
export default {
  data() {
    return {
      min: null,
      max: null,
    }
  },
  methods: {
    load() {
      const main = async () => {
        try {
          const tiff = await fromUrl('http://1.117.224.40/geotiff/test.tif')
          const image = await tiff.getImage()
          const data = await image.readRasters({
            resampleMethod: 'bilinear',
          })
          // 获取geotiff最大最小值
          let max,
            min = data[0][0]
          for (let i = 0; i < data[0].length; i++) {
            const element = data[0][i]
            max = max > element ? max : element
            min = min < element ? min : element
          }
          this.min = min
          this.max = max
          // plotty绘制
          const canvas = document.getElementById('plot')
          const plotty = require('plotty')
          const plotOption = {
            canvas,
            data: data[0],
            width: image.getWidth(),
            height: image.getHeight(),
            domain: [min, max],
            colorScale: 'greys',
            clampHigh: false,
          }
          const plot = new plotty.plot(plotOption)
          plot.render()
          // colorbar的绘制
          const colorScale = plot.getColorScaleImage()
          colorScale.setAttribute('style', 'width:25%;height:20px')
          document.getElementById('colorbar').appendChild(colorScale)
        } catch (error) {
          console.log(error)
        }
      }
      main()
    },
  },
  mounted() {
    this.load()
  },
}
</script>
<style lang="less" scoped>
#plot {
  width: 25%;
}
.num {
  width: 25%;
  display: flex;
  justify-content: space-between;
}
</style>