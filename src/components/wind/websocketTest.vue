<template>
  <div>
    <h2>geotiff test</h2>
    <el-button @click="load"
               disabled>load geotiff</el-button>
    <div>
      <canvas id="plot"></canvas>
    </div>
    <div id="colorbar"></div>
  </div>
</template>

<script>
import { fromUrl } from 'geotiff'
export default {
  data() {
    return {}
  },
  methods: {
    load() {
      const main = async () => {
        const tiff = await fromUrl('http://1.117.224.40/geotiff/test.tif')
        const image = await tiff.getImage()

        const data = await image.readRasters({
          resampleMethod: 'bilinear',
        })
        console.log('data', data)
        const canvas = document.getElementById('plot')
        const plotty = require('plotty')
        const plot = new plotty.plot({
          canvas,
          data: data[0],
          width: image.getWidth(),
          height: image.getHeight(),
          domain: [500, 2200],
          // displayRange: [1500, 2000],
          // applyDisplayRange: true,
          colorScale: 'viridis',
          clampHigh: false,
        })
        plot.render()
        // plot.setColorScaleImage(plot.getColorScaleImage())

        let colorScale = plot.getColorScaleImage()
        colorScale.setAttribute('style', 'width:50%;height:20px')
        document.getElementById('colorbar').appendChild(colorScale)
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
  width: 50%;
}
</style>