<script setup>
import Header from '../components/common/Header.vue'
import Sidebar from '../components/common/Sidebar.vue'
</script>

<template>
  <div class="student-layout">
    <Header />
    <div class="main-container">
      <div class="sidebar">
        <Sidebar />
      </div>
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped>
.student-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 200px;
  background-color: #f8f8f8;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

.content {
  flex: 1;
  padding: 20px;
  overflow: auto;
}
</style> 