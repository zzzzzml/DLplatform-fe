<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import {
  HomeFilled,
  Document,
  TrendCharts,
  User,
  Setting,
  Menu,
  Close,
  ArrowRight,
  Management,
  DataAnalysis,
  UserFilled
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const sidebarCollapsed = ref(false)
const showMobileMenu = ref(false)

// 教师端菜单配置
const menuItems = [
  {
    title: '首页',
    icon: HomeFilled,
    path: '/teacher/home',
    key: 'home'
  },
  {
    title: '实验管理',
    icon: Document,
    key: 'experiment',
    children: [
      { title: '实验列表', path: '/teacher/experiment-manage' },
      { title: '创建实验', path: '/teacher/experiment-create' }
    ]
  },
  {
    title: '评估中心',
    icon: TrendCharts,
    key: 'evaluation',
    children: [
      { title: '评估管理', path: '/teacher/evaluation' },
      { title: '数据分析', path: '/teacher/analytics' }
    ]
  },
  {
    title: '班级管理',
    icon: Management,
    path: '/teacher/class-manage',
    key: 'class'
  },
  {
    title: '个人中心',
    icon: User,
    path: '/teacher/profile',
    key: 'profile'
  }
]

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const handleLogout = async () => {
  await userStore.logout()
  router.push('/')
}

const isActiveRoute = (path) => {
  return route.path === path || route.path.startsWith(path + '/')
}

onMounted(() => {
  document.body.classList.add('animate-fade-in')
})
</script>

<template>
  <div class="teacher-layout">
    <!-- 动态背景 -->
    <div class="background-pattern">
      <div class="pattern-hexagon"></div>
      <div class="pattern-waves"></div>
    </div>

    <!-- 顶部导航栏 -->
    <header class="top-header glass">
      <div class="header-left">
        <div class="logo-section">
          <div class="logo-icon teacher">
            <el-icon size="24"><Management /></el-icon>
          </div>
          <span class="logo-text">DL Platform</span>
          <span class="user-badge teacher">教师端</span>
        </div>
      </div>

      <div class="header-right">
        <div class="user-info">
          <div class="user-avatar teacher">
            <el-icon><UserFilled /></el-icon>
          </div>
          <div class="user-details">
            <span class="user-name">{{ userStore.userInfo?.name || '教师' }}</span>
            <span class="user-role">教师</span>
          </div>
        </div>

        <el-dropdown @command="handleLogout">
          <button class="user-menu-btn">
            <el-icon><Setting /></el-icon>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <div class="main-container">
      <!-- 侧边栏 -->
      <aside
        class="sidebar glass-card"
        :class="{
          collapsed: sidebarCollapsed,
          'mobile-show': showMobileMenu
        }"
      >
        <!-- 侧边栏头部 -->
        <div class="sidebar-header">
          <div class="sidebar-logo" v-show="!sidebarCollapsed">
            <span class="logo-text">教师端</span>
          </div>
          <button
            class="sidebar-toggle"
            @click="toggleSidebar"
            :class="{ collapsed: sidebarCollapsed }"
          >
            <el-icon><Menu /></el-icon>
          </button>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-items">
            <template v-for="item in menuItems" :key="item.key">
              <!-- 单级菜单 -->
              <el-tooltip
                v-if="!item.children"
                :content="item.title"
                placement="right"
                :disabled="!sidebarCollapsed"
              >
                <router-link
                  :to="item.path"
                  class="nav-item"
                  :class="{ active: isActiveRoute(item.path) }"
                >
                  <div class="nav-icon">
                    <el-icon><component :is="item.icon" /></el-icon>
                  </div>
                  <span class="nav-text">{{ item.title }}</span>
                  <div class="nav-indicator"></div>
                </router-link>
              </el-tooltip>

              <!-- 多级菜单 -->
              <div v-else class="nav-group">
                <div class="nav-group-title">
                  <div class="nav-icon">
                    <el-icon><component :is="item.icon" /></el-icon>
                  </div>
                  <span class="nav-text" v-show="!sidebarCollapsed">{{ item.title }}</span>
                </div>
                <div class="nav-group-items" v-show="!sidebarCollapsed">
                  <router-link
                    v-for="child in item.children"
                    :key="child.path"
                    :to="child.path"
                    class="nav-sub-item"
                    :class="{ active: isActiveRoute(child.path) }"
                  >
                    <span class="nav-sub-text">{{ child.title }}</span>
                    <el-icon class="nav-sub-arrow"><ArrowRight /></el-icon>
                  </router-link>
                </div>
              </div>
            </template>
          </div>
        </nav>
      </aside>

      <!-- 内容区域 -->
      <main class="content-area" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
        <div class="content-wrapper">
          <router-view v-slot="{ Component }">
            <transition name="page" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
    </div>

    <!-- 移动端遮罩 -->
    <div
      v-if="showMobileMenu"
      class="mobile-overlay"
      @click="toggleMobileMenu"
    ></div>
  </div>
</template>

<style scoped>
.teacher-layout {
  min-height: 100vh;
  position: relative;
  background: var(--bg-secondary);
  overflow-x: hidden;
  --teacher-primary: #2563eb;
  --teacher-secondary: #1e40af;
  --teacher-accent: #3b82f6;
  --teacher-gradient: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  --teacher-light: rgba(37, 99, 235, 0.1);
  --teacher-medium: rgba(37, 99, 235, 0.2);
}

/* 动态背景 - 教师端专用 */
.background-pattern {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.pattern-hexagon {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f093fb' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  animation: float 25s ease-in-out infinite;
}

.pattern-waves {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f5576c' fill-opacity='0.03'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20v20h40V20c0-11.046-8.954-20-20-20z'/%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.8;
}

/* 顶部导航栏 - 教师端样式 */
.top-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-6);
  z-index: var(--z-fixed);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-light);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.logo-icon.teacher {
  width: 40px;
  height: 40px;
  background: var(--teacher-gradient);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.logo-text {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.user-badge.teacher {
  padding: var(--space-1) var(--space-3);
  background: var(--teacher-light);
  color: var(--teacher-secondary);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  border: 1px solid var(--teacher-medium);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.user-avatar.teacher {
  width: 36px;
  height: 36px;
  background: var(--teacher-gradient);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.user-role {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.user-menu-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: var(--gray-100);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  color: var(--text-secondary);
}

.user-menu-btn:hover {
  background: var(--gray-200);
  color: var(--text-primary);
}

/* 主要内容区域 */
.main-container {
  display: flex;
  margin-top: 70px;
  min-height: calc(100vh - 70px);
}

/* 侧边栏 - 教师端样式 */
.sidebar {
  width: 200px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-right: 1px solid var(--border-light);
  transition: all var(--duration-normal) var(--ease-out);
  position: fixed;
  top: 70px;
  left: 0;
  height: calc(100vh - 70px);
  z-index: var(--z-sticky);
  overflow-y: auto;
}

.sidebar.collapsed {
  width: 60px;
}

/* 内容区域需要左边距来避免被固定侧边栏遮挡 */
.content-area {
  margin-left: 200px;
  width: calc(100% - 200px);
  transition: all var(--duration-normal) var(--ease-out);
}

.content-area.sidebar-collapsed {
  margin-left: 60px;
  width: calc(100% - 60px);
}

/* 侧边栏头部 - 教师端样式 */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-light);
  margin-bottom: var(--space-4);
  min-height: 60px;
}

.sidebar.collapsed .sidebar-header {
  padding: var(--space-3);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
  justify-content: center;
}

.sidebar.collapsed .sidebar-logo {
  display: none;
}

.sidebar-logo .logo-text {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.sidebar-toggle {
  width: 36px;
  height: 36px;
  border: none;
  background: var(--gray-100);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  color: var(--text-secondary);
  position: absolute;
  right: var(--space-3);
}

.sidebar.collapsed .sidebar-toggle {
  position: static;
  background: var(--teacher-light);
  color: var(--teacher-primary);
}

.sidebar-toggle:hover {
  background: var(--teacher-medium);
  color: var(--teacher-secondary);
  transform: scale(1.05);
}

.sidebar-nav {
  padding: 0 var(--space-4) var(--space-6);
  height: calc(100% - 80px);
  overflow-y: auto;
}

.nav-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: 0 var(--space-3);
}

.sidebar.collapsed .nav-items {
  padding: 0 var(--space-2);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-xl);
  text-decoration: none;
  color: var(--text-secondary);
  transition: all var(--duration-normal) var(--ease-out);
  position: relative;
  overflow: hidden;
  justify-content: flex-start;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: var(--space-3) var(--space-2);
  gap: 0;
}

.nav-item:hover {
  background: var(--teacher-light);
  color: var(--teacher-primary);
}

.sidebar:not(.collapsed) .nav-item:hover {
  transform: translateX(4px);
}

.nav-item.active {
  background: var(--teacher-gradient);
  color: white;
  box-shadow: var(--shadow-lg);
}

.nav-item.active .nav-indicator {
  opacity: 1;
  transform: scaleY(1);
}

.nav-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-text {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  white-space: nowrap;
  opacity: 1;
  transition: all var(--duration-normal) var(--ease-out);
}

.sidebar.collapsed .nav-text {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

.nav-indicator {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%) scaleY(0);
  width: 3px;
  height: 20px;
  background: white;
  border-radius: var(--radius-full);
  opacity: 0;
  transition: all var(--duration-normal) var(--ease-out);
}

/* 导航组 - 教师端样式 */
.nav-group {
  margin-bottom: var(--space-4);
}

.sidebar.collapsed .nav-group {
  display: none;
}

.nav-group-title {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  color: var(--text-tertiary);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-2);
}

.nav-group-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-left: var(--space-6);
  padding-left: var(--space-3);
  border-left: 2px solid var(--border-light);
}

.nav-sub-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: var(--text-secondary);
  transition: all var(--duration-normal) var(--ease-out);
  margin-bottom: var(--space-1);
}

.nav-sub-item:hover {
  background: var(--teacher-light);
  color: var(--teacher-primary);
}

.nav-sub-item.active {
  background: var(--teacher-medium);
  color: var(--teacher-secondary);
}

.nav-sub-text {
  font-size: var(--text-sm);
}

.nav-sub-arrow {
  opacity: 0;
  transform: translateX(-4px);
  transition: all var(--duration-normal) var(--ease-out);
}

.nav-sub-item:hover .nav-sub-arrow,
.nav-sub-item.active .nav-sub-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* 内容区域 */
.content-area {
  background: var(--bg-secondary);
  position: relative;
  min-height: calc(100vh - 70px);
}

.content-wrapper {
  padding: var(--space-8);
  max-width: 1400px;
  margin: 0 auto;
}

/* 页面切换动画 */
.page-enter-active,
.page-leave-active {
  transition: all var(--duration-normal) var(--ease-out);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -280px;
    top: 70px;
    height: calc(100vh - 70px);
    z-index: var(--z-modal);
    width: 280px;
  }

  .sidebar.mobile-show {
    left: 0;
  }

  .content-area {
    margin-left: 0;
  }

  .content-area.sidebar-collapsed {
    margin-left: 0;
  }

  .content-wrapper {
    padding: var(--space-4);
  }

  .user-details {
    display: none;
  }

  .logo-text {
    display: none;
  }
}

.mobile-overlay {
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-overlay);
  z-index: var(--z-modal-backdrop);
  backdrop-filter: blur(4px);
}

@media (max-width: 480px) {
  .top-header {
    padding: 0 var(--space-4);
  }

  .content-wrapper {
    padding: var(--space-3);
  }
}
</style>