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
  ArrowRight
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const sidebarCollapsed = ref(false)
const showMobileMenu = ref(false)

// 学生端菜单配置
const menuItems = [
  {
    title: '首页',
    icon: HomeFilled,
    path: '/student/home',
    key: 'home'
  },
  {
    title: '实验中心',
    icon: Document,
    key: 'experiment',
    children: [
      { title: '实验列表', path: '/student/experiment-list' },
      { title: '我的提交', path: '/student/result' }
    ]
  },
  {
    title: '学习分析',
    icon: TrendCharts,
    path: '/student/analytics',
    key: 'analytics'
  },
  {
    title: '个人中心',
    icon: User,
    path: '/student/profile',
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
  // 页面加载动画
  document.body.classList.add('animate-fade-in')
})
</script>

<template>
  <div class="student-layout">
    <!-- 动态背景 -->
    <div class="background-pattern">
      <div class="pattern-dots"></div>
      <div class="pattern-grid"></div>
    </div>

    <!-- 顶部导航栏 -->
    <header class="top-header glass">
      <div class="header-left">
        <button
          class="menu-toggle"
          @click="toggleSidebar"
          :class="{ active: sidebarCollapsed }"
        >
          <el-icon><Menu /></el-icon>
        </button>

        <div class="logo-section">
          <div class="logo-icon">
            <el-icon size="24"><Document /></el-icon>
          </div>
          <span class="logo-text">DL Platform</span>
          <span class="user-badge">学生端</span>
        </div>
      </div>

      <div class="header-right">
        <div class="user-info">
          <div class="user-avatar">
            <el-icon><User /></el-icon>
          </div>
          <div class="user-details">
            <span class="user-name">{{ userStore.userInfo?.name || '学生' }}</span>
            <span class="user-role">学生</span>
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
        <nav class="sidebar-nav">
          <div class="nav-items">
            <template v-for="item in menuItems" :key="item.key">
              <!-- 单级菜单 -->
              <router-link
                v-if="!item.children"
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

              <!-- 多级菜单 -->
              <div v-else class="nav-group">
                <div class="nav-group-title">
                  <div class="nav-icon">
                    <el-icon><component :is="item.icon" /></el-icon>
                  </div>
                  <span class="nav-text">{{ item.title }}</span>
                </div>
                <div class="nav-group-items">
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
      <main class="content-area">
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
.student-layout {
  min-height: 100vh;
  position: relative;
  background: var(--bg-secondary);
  overflow-x: hidden;
}

/* 动态背景 */
.background-pattern {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.pattern-dots {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(circle, var(--primary-200) 1px, transparent 1px);
  background-size: 30px 30px;
  opacity: 0.1;
  animation: float 20s ease-in-out infinite;
}

.pattern-grid {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(var(--primary-100) 1px, transparent 1px),
    linear-gradient(90deg, var(--primary-100) 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.05;
}

/* 顶部导航栏 */
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

.menu-toggle {
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(var(--primary-500), 0.1);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  color: var(--primary-600);
}

.menu-toggle:hover {
  background: rgba(var(--primary-500), 0.2);
  transform: scale(1.05);
}

.menu-toggle.active {
  background: var(--primary-500);
  color: white;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: var(--gradient-primary);
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

.user-badge {
  padding: var(--space-1) var(--space-3);
  background: var(--primary-100);
  color: var(--primary-700);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
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

.user-avatar {
  width: 36px;
  height: 36px;
  background: var(--gradient-secondary);
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

/* 侧边栏 */
.sidebar {
  width: 280px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-right: 1px solid var(--border-light);
  transition: all var(--duration-normal) var(--ease-out);
  position: relative;
  z-index: var(--z-sticky);
}

.sidebar.collapsed {
  width: 80px;
}

.sidebar-nav {
  padding: var(--space-6) 0;
  height: 100%;
}

.nav-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: 0 var(--space-4);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-xl);
  text-decoration: none;
  color: var(--text-secondary);
  transition: all var(--duration-normal) var(--ease-out);
  position: relative;
  overflow: hidden;
}

.nav-item:hover {
  background: var(--primary-50);
  color: var(--primary-600);
  transform: translateX(4px);
}

.nav-item.active {
  background: var(--gradient-primary);
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
  transition: opacity var(--duration-normal) var(--ease-out);
}

.sidebar.collapsed .nav-text {
  opacity: 0;
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

/* 导航组 */
.nav-group {
  margin-bottom: var(--space-4);
}

.nav-group-title {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  color: var(--text-tertiary);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.nav-group-items {
  margin-left: var(--space-8);
  border-left: 2px solid var(--border-light);
  padding-left: var(--space-4);
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
  background: var(--primary-50);
  color: var(--primary-600);
}

.nav-sub-item.active {
  background: var(--primary-100);
  color: var(--primary-700);
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
  flex: 1;
  background: var(--bg-secondary);
  position: relative;
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
  }

  .sidebar.mobile-show {
    left: 0;
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