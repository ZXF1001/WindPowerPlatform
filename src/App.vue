<template>
  <div id="app">
    <router-view></router-view>
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
.scroller::-webkit-scrollbar {
  width: 8px;
  height: 9px;
}

.scroller::-webkit-scrollbar-track {
  background-color: #f9f9f9;
  -webkit-border-radius: 2em;
  -moz-border-radius: 2em;
  border-radius: 2em;
}
.scroller::-webkit-scrollbar-thumb {
  background-color: #dedede;
  -webkit-border-radius: 2em;
  -moz-border-radius: 2em;
  border-radius: 2em;
}
</style>