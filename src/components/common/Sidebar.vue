<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../../stores/user'
import {
  HomeFilled,
  Files,
  Check,
  User,
  List
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)

// 教师菜单
const teacherMenus = [
  {
    title: '首页',
    path: '/teacher/home',
    icon: HomeFilled
  },
  {
    title: '实验管理',
    path: '/teacher/experiment-manage',
    icon: Files
  },
  {
    title: '实验评价',
    path: '/teacher/evaluation',
    icon: Check
  },
  {
    title: '班级管理',
    path: '/teacher/class-manage',
    icon: User
  }
]

// 学生菜单
const studentMenus = [
  {
    title: '首页',
    path: '/student/home',
    icon: HomeFilled
  },
  {
    title: '实验列表',
    path: '/student/experiment-list',
    icon: Files
  },
  {
    title: '实验结果',
    path: '/student/result',
    icon: List
  }
]

const menus = computed(() => {
  return userStore.isTeacher ? teacherMenus : studentMenus
})
</script>

<template>
  <el-menu
    :default-active="activeMenu"
    class="sidebar-menu"
    router
    :collapse="false"
  >
    <el-menu-item v-for="menu in menus" :key="menu.path" :index="menu.path">
      <el-icon><component :is="menu.icon" /></el-icon>
      <span>{{ menu.title }}</span>
    </el-menu-item>
  </el-menu>
</template>

<style scoped>
.sidebar-menu {
  height: 100%;
  border-right: none;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 200px;
}
</style> 