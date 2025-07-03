<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { getTeacherExperiments } from '../../api/experiment'
import {
  Document,
  TrendCharts,
  User,
  Clock,
  Star,
  Trophy,
  DataAnalysis,
  Notebook,
  ArrowRight,
  Plus,
  Management,
  Check,
  Files
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const recentExperiments = ref([])
const loading = ref(false)
const stats = ref({
  totalExperiments: 0,
  activeExperiments: 0,
  pendingEvaluations: 0,
  totalStudents: 0
})

// 快速操作配置
const quickActions = [
  {
    title: '创建实验',
    description: '发布新的深度学习实验任务',
    icon: Plus,
    color: 'primary',
    path: '/teacher/experiment-create'
  },
  {
    title: '实验管理',
    description: '管理已发布的实验任务',
    icon: Management,
    color: 'success',
    path: '/teacher/experiment-manage'
  },
  {
    title: '评估中心',
    description: '查看和评价学生提交',
    icon: Check,
    color: 'warning',
    path: '/teacher/evaluation'
  },
  {
    title: '班级管理',
    description: '管理班级和学生信息',
    icon: User,
    color: 'info',
    path: '/teacher/class-manage'
  }
]

// 获取教师最近发布的实验
const fetchRecentExperiments = async () => {
  loading.value = true
  try {
    const res = await getTeacherExperiments({
      page: 1,
      limit: 5,
      recent: true
    })
    recentExperiments.value = res.data || []
    // 更新统计数据
    stats.value.pendingEvaluations = res.pendingEvaluations || 0
  } catch (error) {
    console.error('Failed to fetch recent experiments:', error)
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    // 这里应该调用真实的API获取统计数据
    // 暂时保持空状态，等待后端API实现
    // const response = await api.getTeacherStats()
    // stats.value = response.data
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
}

const goToExperimentManage = () => {
  router.push('/teacher/experiment-manage')
}

const viewExperiment = (id) => {
  router.push(`/teacher/experiment-detail/${id}`)
}

const getStatusColor = (status) => {
  const colors = {
    active: 'success',
    pending: 'warning',
    completed: 'info'
  }
  return colors[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    active: '进行中',
    pending: '待开始',
    completed: '已结束'
  }
  return texts[status] || '未知'
}

onMounted(() => {
  fetchRecentExperiments()
  fetchStats()

  // 设置页面背景
  document.body.style.background = `linear-gradient(135deg,
    rgba(71, 85, 105, 0.06) 0%,
    rgba(51, 65, 85, 0.08) 50%,
    rgba(30, 41, 59, 0.1) 100%)`
  document.body.style.backgroundAttachment = 'fixed'
})

onUnmounted(() => {
  // 恢复默认背景
  document.body.style.background = ''
  document.body.style.backgroundAttachment = ''
})
</script>

<template>
  <div class="teacher-home">
    <!-- 装饰性背景元素 -->
    <div class="background-decorations">
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
      <div class="floating-shape shape-3"></div>
      <div class="floating-shape shape-4"></div>
      <div class="floating-shape shape-5"></div>
      <div class="floating-shape shape-6"></div>

      <!-- 几何图形装饰 -->
      <div class="geometric-shapes">
        <div class="diamond diamond-1"></div>
        <div class="diamond diamond-2"></div>
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="star star-1"></div>
        <div class="star star-2"></div>
      </div>

      <!-- 粒子效果 -->
      <div class="particles">
        <div class="particle particle-1"></div>
        <div class="particle particle-2"></div>
        <div class="particle particle-3"></div>
        <div class="particle particle-4"></div>
        <div class="particle particle-5"></div>
        <div class="particle particle-6"></div>
        <div class="particle particle-7"></div>
        <div class="particle particle-8"></div>
      </div>

      <!-- 网格背景 -->
      <div class="grid-background">
        <div class="grid-line grid-line-1"></div>
        <div class="grid-line grid-line-2"></div>
        <div class="grid-line grid-line-3"></div>
        <div class="grid-line grid-line-4"></div>
      </div>

      <!-- 光晕效果 -->
      <div class="glow-effects">
        <div class="glow glow-1"></div>
        <div class="glow glow-2"></div>
        <div class="glow glow-3"></div>
      </div>

      <!-- 额外装饰元素 -->
      <div class="extra-decorations">
        <div class="wave wave-1"></div>
        <div class="wave wave-2"></div>
        <div class="dot-pattern dot-pattern-1"></div>
        <div class="dot-pattern dot-pattern-2"></div>
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
      </div>
    </div>

    <div class="main-content">
      <!-- 欢迎横幅 -->
      <div class="welcome-banner animate-fade-in-up">
        <div class="banner-content">
          <div class="welcome-text">
            <h1 class="welcome-title">
              欢迎回来，<span class="text-gradient">{{ userStore.userInfo?.name || '老师' }}</span>
            </h1>
            <p class="welcome-subtitle">
              管理您的教学实验，指导学生探索深度学习的奥秘
            </p>
          </div>
          <div class="welcome-stats">
            <div class="stat-item">
              <div class="stat-number">{{ stats.totalExperiments }}</div>
              <div class="stat-label">总实验数</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ stats.activeExperiments }}</div>
              <div class="stat-label">进行中</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ stats.pendingEvaluations }}</div>
              <div class="stat-label">待评价</div>
            </div>
          </div>
        </div>
        <div class="banner-decoration">
          <div class="floating-icon">
            <el-icon size="60"><Management /></el-icon>
          </div>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="quick-actions animate-fade-in-up animate-delay-200">
        <h2 class="section-title">
          <el-icon><Star /></el-icon>
          快速操作
        </h2>
        <div class="action-grid">
          <div
            v-for="action in quickActions"
            :key="action.title"
            class="action-card"
            @click="router.push(action.path)"
          >
            <div class="action-icon" :class="`bg-${action.color}`">
              <el-icon size="24"><component :is="action.icon" /></el-icon>
            </div>
            <div class="action-content">
              <h3 class="action-title">{{ action.title }}</h3>
              <p class="action-description">{{ action.description }}</p>
            </div>
            <div class="action-arrow">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- 最近实验 -->
      <div class="recent-experiments animate-fade-in-up animate-delay-400">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon><Clock /></el-icon>
            最近实验
          </h2>
          <el-button
            link
            class="view-all-btn"
            @click="goToExperimentManage"
          >
            管理全部
            <el-icon class="ml-1"><ArrowRight /></el-icon>
          </el-button>
        </div>

        <div v-loading="loading" class="experiments-container">
          <div v-if="recentExperiments.length === 0" class="empty-state">
            <el-icon size="80" class="empty-icon"><Notebook /></el-icon>
            <h3>暂无实验</h3>
            <p>开始创建您的第一个深度学习实验吧！</p>
            <el-button type="primary" class="btn-gradient" @click="router.push('/teacher/experiment-create')">
              <el-icon><Plus /></el-icon>
              创建实验
            </el-button>
          </div>

          <div v-else class="experiments-grid">
            <div
              v-for="experiment in recentExperiments"
              :key="experiment.id"
              class="experiment-card"
              @click="viewExperiment(experiment.id)"
            >
              <div class="experiment-header">
                <div class="experiment-status">
                  <el-tag
                    :type="getStatusColor(experiment.status)"
                    size="small"
                  >
                    {{ getStatusText(experiment.status) }}
                  </el-tag>
                </div>
                <div class="experiment-submissions" v-if="experiment.submissionCount">
                  <el-icon><User /></el-icon>
                  <span>{{ experiment.submissionCount }}人提交</span>
                </div>
              </div>

              <div class="experiment-content">
                <h3 class="experiment-title">{{ experiment.title }}</h3>
                <p class="experiment-description">{{ experiment.description }}</p>

                <div class="experiment-meta">
                  <div class="meta-item">
                    <el-icon><Clock /></el-icon>
                    <span>{{ experiment.startTime }}</span>
                  </div>
                  <div class="meta-item">
                    <el-icon><Clock /></el-icon>
                    <span>截止：{{ experiment.endTime }}</span>
                  </div>
                </div>
              </div>

              <div class="experiment-footer">
                <el-button
                  type="primary"
                  size="small"
                  class="btn-gradient"
                >
                  管理实验
                  <el-icon><ArrowRight /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 教学概览 -->
      <div class="teaching-overview animate-fade-in-up animate-delay-600">
        <h2 class="section-title">
          <el-icon><DataAnalysis /></el-icon>
          教学概览
        </h2>
        <div class="overview-container">
          <div class="overview-card">
            <div class="overview-header">
              <h3>本周教学进度</h3>
              <span class="overview-percentage">85%</span>
            </div>
            <div class="overview-bar-container">
              <div class="overview-bar" style="width: 85%"></div>
            </div>
            <p class="overview-description">已发布 4/5 个计划实验</p>
          </div>

          <div class="overview-card">
            <div class="overview-header">
              <h3>学生参与度</h3>
              <span class="overview-percentage">92%</span>
            </div>
            <div class="overview-bar-container">
              <div class="overview-bar participation-bar" style="width: 92%"></div>
            </div>
            <p class="overview-description">活跃学生比例</p>
          </div>
        </div>
      </div>

      <!-- 教学统计 -->
      <div class="teaching-stats animate-fade-in-up animate-delay-800">
        <h2 class="section-title">
          <el-icon><TrendCharts /></el-icon>
          教学统计
        </h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon bg-primary">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalExperiments }}</div>
              <div class="stat-name">总实验数</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon bg-success">
              <el-icon><Check /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.activeExperiments }}</div>
              <div class="stat-name">进行中</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon bg-warning">
              <el-icon><Trophy /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pendingEvaluations }}</div>
              <div class="stat-name">待评价</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon bg-info">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalStudents }}</div>
              <div class="stat-name">学生总数</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 教学建议 -->
      <div class="teaching-suggestions animate-fade-in-up animate-delay-1000">
        <h2 class="section-title">
          <el-icon><Star /></el-icon>
          教学建议
        </h2>
        <div class="suggestions-grid">
          <div class="suggestion-card">
            <div class="suggestion-icon">
              <el-icon><Management /></el-icon>
            </div>
            <div class="suggestion-content">
              <h3>优化实验设计</h3>
              <p>根据学生反馈调整实验难度和内容安排</p>
            </div>
          </div>

          <div class="suggestion-card">
            <div class="suggestion-icon">
              <el-icon><Check /></el-icon>
            </div>
            <div class="suggestion-content">
              <h3>及时评价反馈</h3>
              <p>保持对学生提交作业的及时评价和指导</p>
            </div>
          </div>

          <div class="suggestion-card">
            <div class="suggestion-icon">
              <el-icon><Files /></el-icon>
            </div>
            <div class="suggestion-content">
              <h3>丰富教学资源</h3>
              <p>增加更多样化的学习材料和参考资源</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.teacher-home {
  position: relative;
}

.main-content {
  padding: 0;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  min-height: 100vh;
  z-index: 1;
}

@keyframes backgroundShift {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

/* 装饰性背景元素 */
.background-decorations {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(240, 147, 251, 0.1), rgba(245, 87, 108, 0.1));
  animation: floatShape 15s ease-in-out infinite;
}

.floating-shape.shape-1 {
  width: 120px;
  height: 120px;
  top: 10%;
  left: 5%;
  animation-delay: 0s;
  background: linear-gradient(135deg, rgba(240, 147, 251, 0.15), rgba(245, 87, 108, 0.15));
}

.floating-shape.shape-2 {
  width: 80px;
  height: 80px;
  top: 70%;
  right: 10%;
  animation-delay: 3s;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.12), rgba(118, 75, 162, 0.12));
}

.floating-shape.shape-3 {
  width: 150px;
  height: 150px;
  bottom: 15%;
  left: 15%;
  animation-delay: 6s;
  background: linear-gradient(135deg, rgba(67, 233, 123, 0.1), rgba(56, 249, 215, 0.1));
}

.floating-shape.shape-4 {
  width: 60px;
  height: 60px;
  top: 30%;
  right: 25%;
  animation-delay: 9s;
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.14), rgba(0, 242, 254, 0.14));
}

.floating-shape.shape-5 {
  width: 100px;
  height: 100px;
  top: 50%;
  left: 80%;
  animation-delay: 12s;
  background: linear-gradient(135deg, rgba(240, 147, 251, 0.12), rgba(245, 87, 108, 0.12));
}

.floating-shape.shape-6 {
  width: 90px;
  height: 90px;
  bottom: 40%;
  right: 5%;
  animation-delay: 15s;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
}

@keyframes floatShape {
  0%, 100% {
    transform: translateY(0px) translateX(0px) rotate(0deg);
    opacity: 0.6;
  }
  25% {
    transform: translateY(-30px) translateX(20px) rotate(90deg);
    opacity: 0.8;
  }
  50% {
    transform: translateY(-60px) translateX(-10px) rotate(180deg);
    opacity: 1;
  }
  75% {
    transform: translateY(-30px) translateX(-30px) rotate(270deg);
    opacity: 0.8;
  }
}

/* 几何图形装饰 */
.geometric-shapes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.diamond {
  position: absolute;
  width: 30px;
  height: 30px;
  background: linear-gradient(45deg, rgba(240, 147, 251, 0.18), rgba(245, 87, 108, 0.18));
  transform: rotate(45deg);
  animation: rotateDiamond 18s linear infinite;
}

.diamond-1 {
  top: 25%;
  left: 12%;
  animation-delay: 1s;
}

.diamond-2 {
  bottom: 35%;
  right: 18%;
  animation-delay: 9s;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(240, 147, 251, 0.15), transparent);
  animation: pulseCircle 12s ease-in-out infinite;
}

.circle-1 {
  width: 80px;
  height: 80px;
  top: 15%;
  right: 10%;
  animation-delay: 3s;
}

.circle-2 {
  width: 60px;
  height: 60px;
  bottom: 25%;
  left: 8%;
  animation-delay: 7s;
}

.star {
  position: absolute;
  width: 0;
  height: 0;
  animation: rotateStar 20s linear infinite;
}

.star:before,
.star:after {
  content: '';
  position: absolute;
  left: -15px;
  top: -5px;
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-bottom: 10px solid rgba(245, 87, 108, 0.18);
  transform: rotate(35deg);
}

.star:after {
  transform: rotate(-35deg);
}

.star-1 {
  top: 40%;
  left: 5%;
  animation-delay: 4s;
}

.star-2 {
  bottom: 15%;
  right: 25%;
  animation-delay: 11s;
}

@keyframes rotateDiamond {
  0% {
    transform: rotate(45deg) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: rotate(225deg) scale(1.3);
    opacity: 0.9;
  }
  100% {
    transform: rotate(405deg) scale(1);
    opacity: 0.6;
  }
}

@keyframes pulseCircle {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.8;
  }
}

@keyframes rotateStar {
  0% {
    transform: rotate(0deg) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: rotate(180deg) scale(1.2);
    opacity: 0.9;
  }
  100% {
    transform: rotate(360deg) scale(1);
    opacity: 0.6;
  }
}

/* 粒子效果 */
.particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(240, 147, 251, 0.8);
  border-radius: 50%;
  animation: particleFloat 14s ease-in-out infinite;
}

.particle-1 {
  top: 12%;
  left: 18%;
  animation-delay: 0s;
  background: rgba(240, 147, 251, 0.8);
}

.particle-2 {
  top: 28%;
  right: 22%;
  animation-delay: 2.5s;
  background: rgba(245, 87, 108, 0.8);
}

.particle-3 {
  top: 48%;
  left: 6%;
  animation-delay: 5s;
  background: rgba(102, 126, 234, 0.8);
}

.particle-4 {
  bottom: 32%;
  right: 15%;
  animation-delay: 7.5s;
  background: rgba(118, 75, 162, 0.8);
}

.particle-5 {
  bottom: 18%;
  left: 32%;
  animation-delay: 10s;
  background: rgba(240, 147, 251, 0.8);
}

.particle-6 {
  top: 38%;
  right: 38%;
  animation-delay: 12.5s;
  background: rgba(245, 87, 108, 0.8);
}

.particle-7 {
  bottom: 48%;
  left: 72%;
  animation-delay: 1.5s;
  background: rgba(102, 126, 234, 0.8);
}

.particle-8 {
  top: 72%;
  right: 6%;
  animation-delay: 8.5s;
  background: rgba(118, 75, 162, 0.8);
}

@keyframes particleFloat {
  0%, 100% {
    transform: translateY(0px) translateX(0px) scale(1);
    opacity: 0.3;
  }
  25% {
    transform: translateY(-50px) translateX(25px) scale(1.8);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-100px) translateX(-20px) scale(2.5);
    opacity: 1;
  }
  75% {
    transform: translateY(-50px) translateX(-40px) scale(1.8);
    opacity: 0.7;
  }
}

/* 网格背景 */
.grid-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  opacity: 0.3;
}

.grid-line {
  position: absolute;
  background: linear-gradient(90deg, transparent, rgba(240, 147, 251, 0.3), transparent);
  animation: gridMove 16s ease-in-out infinite;
}

.grid-line-1 {
  width: 1px;
  height: 100%;
  left: 20%;
  animation-delay: 0s;
}

.grid-line-2 {
  width: 100%;
  height: 1px;
  top: 30%;
  animation-delay: 4s;
}

.grid-line-3 {
  width: 1px;
  height: 100%;
  right: 25%;
  animation-delay: 8s;
}

.grid-line-4 {
  width: 100%;
  height: 1px;
  bottom: 40%;
  animation-delay: 12s;
}

@keyframes gridMove {
  0%, 100% {
    opacity: 0.1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.02);
  }
}

/* 光晕效果 */
.glow-effects {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  animation: glowPulse 10s ease-in-out infinite;
}

.glow-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  background: radial-gradient(circle, rgba(240, 147, 251, 0.25), transparent);
  animation-delay: 0s;
}

.glow-2 {
  width: 150px;
  height: 150px;
  bottom: 20%;
  right: 15%;
  background: radial-gradient(circle, rgba(245, 87, 108, 0.2), transparent);
  animation-delay: 3s;
}

.glow-3 {
  width: 180px;
  height: 180px;
  top: 50%;
  right: 40%;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.18), transparent);
  animation-delay: 6s;
}

@keyframes glowPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.6;
  }
}

/* 额外装饰元素 */
.extra-decorations {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.wave {
  position: absolute;
  width: 100%;
  height: 100px;
  background: linear-gradient(90deg, transparent, rgba(240, 147, 251, 0.1), transparent);
  clip-path: polygon(0 50%, 100% 30%, 100% 70%, 0 90%);
  animation: waveMove 20s ease-in-out infinite;
}

.wave-1 {
  top: 20%;
  animation-delay: 0s;
}

.wave-2 {
  bottom: 30%;
  animation-delay: 10s;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.08), transparent);
}

@keyframes waveMove {
  0%, 100% {
    transform: translateX(-50px) scaleY(1);
    opacity: 0.3;
  }
  50% {
    transform: translateX(50px) scaleY(1.2);
    opacity: 0.6;
  }
}

.dot-pattern {
  position: absolute;
  width: 200px;
  height: 200px;
  background-image: radial-gradient(circle, rgba(240, 147, 251, 0.2) 2px, transparent 2px);
  background-size: 20px 20px;
  animation: dotFloat 25s ease-in-out infinite;
}

.dot-pattern-1 {
  top: 15%;
  right: 20%;
  animation-delay: 5s;
}

.dot-pattern-2 {
  bottom: 25%;
  left: 10%;
  animation-delay: 15s;
  background-image: radial-gradient(circle, rgba(102, 126, 234, 0.15) 2px, transparent 2px);
}

@keyframes dotFloat {
  0%, 100% {
    transform: rotate(0deg) scale(1);
    opacity: 0.4;
  }
  50% {
    transform: rotate(180deg) scale(1.1);
    opacity: 0.7;
  }
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(30px);
  animation: orbFloat 18s ease-in-out infinite;
}

.orb-1 {
  width: 150px;
  height: 150px;
  top: 25%;
  left: 70%;
  background: radial-gradient(circle, rgba(240, 147, 251, 0.3), rgba(245, 87, 108, 0.1));
  animation-delay: 2s;
}

.orb-2 {
  width: 100px;
  height: 100px;
  bottom: 35%;
  right: 25%;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.25), rgba(118, 75, 162, 0.1));
  animation-delay: 8s;
}

.orb-3 {
  width: 120px;
  height: 120px;
  top: 60%;
  left: 15%;
  background: radial-gradient(circle, rgba(67, 233, 123, 0.2), rgba(56, 249, 215, 0.08));
  animation-delay: 14s;
}

@keyframes orbFloat {
  0%, 100% {
    transform: translateY(0px) translateX(0px) scale(1);
    opacity: 0.5;
  }
  33% {
    transform: translateY(-40px) translateX(30px) scale(1.2);
    opacity: 0.8;
  }
  66% {
    transform: translateY(20px) translateX(-20px) scale(0.9);
    opacity: 0.6;
  }
}

/* 欢迎横幅 */
.welcome-banner {
  padding: 2rem;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  color: white;
  border-radius: 1rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.3);
  transition: all 0.3s ease;
}

.welcome-banner:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(37, 99, 235, 0.4);
}

.welcome-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  animation: float 20s ease-in-out infinite;
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 2;
}

.welcome-text {
  flex: 1;
}

.welcome-title {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.25;
}

.text-gradient {
  background: linear-gradient(45deg, #fff, #fce7f3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-size: 1.125rem;
  opacity: 1;
  margin: 0;
  line-height: 1.75;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  font-weight: 400;
}

.welcome-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.8;
}

.banner-decoration {
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.1;
  z-index: 1;
}

.floating-icon {
  color: white;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

/* 区块标题 */
.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header .section-title {
  margin-bottom: 0;
}

.view-all-btn {
  color: #2563eb;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}

.view-all-btn:hover {
  background: rgba(37, 99, 235, 0.1);
  color: #1e40af;
  transform: translateX(2px);
}

/* 快速操作 */
.quick-actions {
  margin-bottom: 3rem;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.action-card {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s ease;
}

.action-card:hover::before {
  left: 100%;
}

.action-card:hover {
  border-color: #93c5fd;
  box-shadow: 0 20px 40px rgba(37, 99, 235, 0.15);
  transform: translateY(-4px) scale(1.02);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.action-icon.bg-primary { background: linear-gradient(135deg, #2563eb, #1e40af); }
.action-icon.bg-success { background: linear-gradient(135deg, #4facfe, #00f2fe); }
.action-icon.bg-warning { background: linear-gradient(135deg, #43e97b, #38f9d7); }
.action-icon.bg-info { background: linear-gradient(135deg, #667eea, #764ba2); }

.action-content {
  flex: 1;
}

.action-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.action-description {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  line-height: 1.75;
}

.action-arrow {
  color: #94a3b8;
  transition: all 0.3s ease;
}

.action-card:hover .action-arrow {
  color: #f093fb;
  transform: translateX(4px);
}

/* 最近实验 */
.recent-experiments {
  margin-bottom: 3rem;
}

.experiments-container {
  min-height: 200px;
}

.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  color: #64748b;
}

.empty-icon {
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.empty-state p {
  margin-bottom: 1.5rem;
}

.experiments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.experiment-card {
  padding: 1.5rem;
  cursor: pointer;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  background: white;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.experiment-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #2563eb, #1e40af);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.experiment-card:hover::after {
  transform: scaleX(1);
}

.experiment-card:hover {
  border-color: #93c5fd;
  box-shadow: 0 20px 40px rgba(37, 99, 235, 0.15);
  transform: translateY(-6px);
}

.experiment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.experiment-status {
  display: flex;
  gap: 0.5rem;
}

.experiment-submissions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #f093fb;
  font-weight: 600;
  font-size: 0.875rem;
}

.experiment-content {
  margin-bottom: 1rem;
}

.experiment-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
  line-height: 1.25;
}

.experiment-description {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 1rem 0;
  line-height: 1.75;
}

.experiment-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #94a3b8;
}

.experiment-footer {
  display: flex;
  justify-content: flex-end;
}

/* 教学概览 */
.teaching-overview {
  margin-bottom: 3rem;
}

.overview-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.overview-card {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.overview-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2563eb, #1e40af);
}

.overview-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(37, 99, 235, 0.15);
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.overview-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.overview-percentage {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2563eb;
}

.overview-bar-container {
  width: 100%;
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.overview-bar {
  height: 100%;
  background: linear-gradient(90deg, #2563eb, #1e40af);
  border-radius: 4px;
  transition: width 1s ease;
  position: relative;
}

.overview-bar.participation-bar {
  background: linear-gradient(90deg, #43e97b, #38f9d7);
}

.overview-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: overviewShine 2s ease-in-out infinite;
}

@keyframes overviewShine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.overview-description {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
}

/* 教学统计 */
.teaching-stats {
  margin-bottom: 3rem;
}

/* 教学建议 */
.teaching-suggestions {
  margin-bottom: 3rem;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.suggestion-card {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.suggestion-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(240, 147, 251, 0.05), transparent);
  transition: left 0.5s ease;
}

.suggestion-card:hover::before {
  left: 100%;
}

.suggestion-card:hover {
  border-color: #f0abfc;
  box-shadow: 0 8px 25px rgba(240, 147, 251, 0.1);
  transform: translateY(-2px);
}

.suggestion-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.suggestion-content h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.suggestion-content p {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(240, 147, 251, 0.02), rgba(245, 87, 108, 0.02));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.stat-icon.bg-primary { background: #2563eb; }
.stat-icon.bg-success { background: #10b981; }
.stat-icon.bg-warning { background: #f59e0b; }
.stat-icon.bg-info { background: #3b82f6; }

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.stat-name {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.25rem;
}

/* 按钮样式 */
.btn-gradient {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  border: none;
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-gradient::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.btn-gradient:hover::before {
  left: 100%;
}

.btn-gradient:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 12px 30px rgba(240, 147, 251, 0.4);
}

/* 进入动画 */
.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out;
}

.animate-delay-200 {
  animation-delay: 0.2s;
  animation-fill-mode: both;
}

.animate-delay-400 {
  animation-delay: 0.4s;
  animation-fill-mode: both;
}

.animate-delay-600 {
  animation-delay: 0.6s;
  animation-fill-mode: both;
}

.animate-delay-800 {
  animation-delay: 0.8s;
  animation-fill-mode: both;
}

.animate-delay-1000 {
  animation-delay: 1.0s;
  animation-fill-mode: both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 工具类 */
.ml-1 {
  margin-left: 0.25rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .banner-content {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }

  .welcome-stats {
    justify-content: center;
  }

  .action-grid {
    grid-template-columns: 1fr;
  }

  .experiments-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .welcome-banner {
    padding: 1.5rem;
  }

  .welcome-title {
    font-size: 1.5rem;
  }

  .welcome-subtitle {
    font-size: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .experiment-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>