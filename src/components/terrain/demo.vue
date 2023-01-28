<template>
  <div>
    <el-button @click="test">test</el-button>

  </div>
</template>

<script>
import GeoTIFF, { fromUrl } from 'geotiff'
export default {
  data() {
    return {}
  },
  methods: {
    test() {},
    fetchTIFF() {
      async function main() {
        const url = 'http://1.117.224.40/geotiff/test_compress.tif'

        const tiff = await fromUrl(url)
        const image = await tiff.getImage()
        const data = await image.readRasters({ resampleMethod: 'bilinear' })
        console.log('data', data)
      }

      main()
    },
  },

  mounted() {
    this.fetchTIFF()
  },
}
</script>
<style lang="less" scoped>
</style>