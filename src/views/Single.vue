<template>
  <div>
    <h1>这是Single</h1>

  </div>
</template>
<script>
import { getMyTurbineData } from '../api/wind/getMapData'
export default {
  data() {
    return {}
  },
  mounted() {
    getMyTurbineData().then((res) => {
      console.log(res)
    })
  },
}
</script>