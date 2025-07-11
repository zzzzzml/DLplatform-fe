<script setup>
// 空的script块，路由视图会根据URL动态渲染不同的组件
</script>

<template>
  <router-view />
</template>

<style>
/* 全局样式可以放在这里 */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

#app {
  height: 100%;
  width: 100%;
}
</style>
