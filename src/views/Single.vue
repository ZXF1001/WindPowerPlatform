<template>
  <div>
    <h1>这是Single</h1>
    <el-button @click="postMyData">dd</el-button>
  </div>
</template>
<script>
import { postData } from '../api/wind/postRoseData.js'
export default {
  data() {
    return {}
  },
  methods: {
    postMyData() {
      const data = {
        site: '0305',
        height: 70,
        range: [0, 3, 5, 7, 9],
      }
      postData(data)
        .then((res) => {
          console.log(res)
        })
        .catch((e) => {
          console.log(e)
        })
    },
  },
  mounted() {},
}
</script>