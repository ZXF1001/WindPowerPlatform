<template>
  <div>
    <h2>websocket test</h2>
    <el-input v-model="text"></el-input>
    <el-button @click="connect">连接</el-button>
    <el-button @click="close">断开</el-button>
  </div>
</template>

<script>
import { connectWS } from '@/utils/WebSocket/ws'
export default {
  data() {
    return {
      text: '',
    }
  },
  methods: {
    connect() {
      this.ws = connectWS('/test', (res) => {
        console.log(res)
      })
    },

    close() {
      if (this.ws) {
        this.ws.close()
      }
    },
  },
  beforeDestroy() {
    if (this.ws) {
      this.ws.close()
    }
  },
}
</script>
