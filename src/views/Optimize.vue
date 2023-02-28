<template>
  <div>
    <h1>这是Optimize</h1>
    <p>
      这个暂时用于plotty可视化的测试，详见http://santilland.github.io/plotty/
    </p>
  </div>
</template>
<script>
import GeoTIFF, { fromArrayBuffer } from "geotiff";
export default {
  data() {
    return {};
  },
  methods: {
    createGeotiffPic() {
      (async function () {
        const buffer = new ArrayBuffer(32);
        const tiff = await fromArrayBuffer(buffer);
        console.log(tiff);
        // ...
      })();
    },
  },
  mounted() {
    this.createGeotiffPic();
  },
};
</script>
