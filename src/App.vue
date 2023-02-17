<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
}
</script>

<style lang="less">
html,
body,
#app {
  margin: 0;
  padding: 0;
  height: 100%;
}
* {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}

::-webkit-scrollbar {
  width: 8px;
  height: 9px;
}
::-webkit-scrollbar-track {
  background-color: #f9f9f9;
  -webkit-border-radius: 2em;
  -moz-border-radius: 2em;
  border-radius: 2em;
}
::-webkit-scrollbar-thumb {
  background-color: #dedede;
  -webkit-border-radius: 2em;
  -moz-border-radius: 2em;
  border-radius: 2em;
}

.scroller-large::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.scroller-large::-webkit-scrollbar-track {
  background-color: #eee;
  -webkit-border-radius: 2em;
  -moz-border-radius: 2em;
  border-radius: 2em;
}
.scroller-large::-webkit-scrollbar-thumb {
  background-color: #bbb;
  -webkit-border-radius: 2em;
  -moz-border-radius: 2em;
  border-radius: 2em;
}
</style>