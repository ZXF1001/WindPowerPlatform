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
      ws: null,
      text: '',
    }
  },
  methods: {
    connect() {
      //连接ws服务器
      // 打开一个 web socket  这里端口号和上面监听的需一致
      this.ws = new WebSocket('ws://1.117.224.40:8082/')

      // Web Socket 已连接上，使用 send() 方法发送数据
      this.ws.onopen = () => {
        this.ws.send('我连上了')
      }
      // 这里接受服务器端发过来的消息
      this.ws.onmessage = (e) => {
        console.log(e.data)
      }
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
