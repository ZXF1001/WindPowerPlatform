<template>
  <div>
    <h1>这是Load</h1>
    <el-button @click="connect">连接</el-button>
  </div>
</template>
<script>
export default {
  data() {
    return {}
  },
  methods: {
    connect() {
      this.ws = new WebSocket('ws://localhost:5000/echo')
      this.ws.onopen = () => {
        console.log('open')
        this.ws.send('message')
      }

      this.ws.onmessage = function (res) {
        console.log(res.data)
      }
      this.ws.onclose = () => {
        //监听整个过程中websocket的状态
        console.log('close')
      }
    },
  },
  mounted() {},
}
</script>