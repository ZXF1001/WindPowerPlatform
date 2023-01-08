<template>
  <div>
    <h2>websocket test</h2>
    <el-input v-model="text"></el-input>
    <el-button @click="connect">连接</el-button>
    <el-button @click="send">发送</el-button>
    <el-button @click="close">断开</el-button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      text: '',
    }
  },
  methods: {
    connect() {
      // this.ws = new WebSocket('ws://1.117.224.40/ws/')
      // this.ws.onopen = () => {
      //   this.ws.send('我连上了')
      // }
      // this.ws.onmessage = (e) => {
      //   console.log(e.data)
      // }
    },
    send() {
      this.ws.send(this.text)
    },
    close() {
      if (this.ws) {
        this.ws.close()
      }
    },
  },
}
</script>
