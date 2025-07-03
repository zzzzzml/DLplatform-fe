<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { ArrowDown } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const userName = computed(() => userStore.userInfo?.name || '用户')
const userRole = computed(() => {
  return userStore.isTeacher ? '教师' : '学生'
})

const handleLogout = async () => {
  await userStore.logout()
  router.push('/')
}
</script>

<template>
  <div class="header">
    <div class="logo">
      <h1>深度学习教学实验平台</h1>
    </div>
    <div class="user-info">
      <el-dropdown>
        <span class="user-dropdown">
          {{ userName }}({{ userRole }})
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="router.push(userStore.isTeacher ? '/teacher/profile' : '/student/profile')">个人中心</el-dropdown-item>
            <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.logo h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #409EFF;
}

.user-dropdown {
  cursor: pointer;
  display: flex;
  align-items: center;
}
</style> 