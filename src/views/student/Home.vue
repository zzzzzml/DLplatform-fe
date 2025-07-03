<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { useExperimentStore } from '../../stores/experiment'
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
  Plus
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const experimentStore = useExperimentStore()

const recentExperiments = ref([])
const loading = ref(false)
const stats = ref({
  totalExperiments: 0,
  completedExperiments: 0,
  averageScore: 0,
  currentRank: 0
})

const quickActions = [
  {
    title: '浏览实验',
    description: '查看所有可用的实验任务',
    icon: Document,
    color: 'primary',
    path: '/student/experiment-list'
  },
  {
    title: '学习分析',
    description: '查看学习进度和成绩统计',
    icon: TrendCharts,
    color: 'success',
    path: '/student/analytics'
  },
  {
    title: '实验结果',
    description: '查看已完成实验的评分',
    icon: Trophy,
    color: 'warning',
    path: '/student/result'
  },
  {
    title: '个人设置',
    description: '管理个人信息和偏好',
    icon: User,
    color: 'info',
    path: '/student/profile'
  }
]

const completionRate = computed(() => {
  return Math.round((stats.value.completedExperiments / stats.value.totalExperiments) * 100)
})

const fetchRecentExperiments = async () => {
  loading.value = true
  try {
    // 调用真实API获取最近实验
    await experimentStore.fetchExperiments({
      page: 1,
      limit: 5,
      recent: true
    })
    recentExperiments.value = experimentStore.experiments
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
    // const response = await api.getStudentStats()
    // stats.value = response.data
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
}

const goToExperimentList = () => {
  router.push('/student/experiment-list')
}

const viewExperiment = (id) => {
  router.push(`/student/experiment-detail/${id}`)
}

const getDifficultyColor = (difficulty) => {
  const colors = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger'
  }
  return colors[difficulty] || 'info'
}

const getDifficultyText = (difficulty) => {
  const texts = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return texts[difficulty] || '未知'
}

onMounted(() => {
  fetchRecentExperiments()
  fetchStats()
})
</script>

<template>
  <div class="student-home">
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
        <div class="triangle triangle-1"></div>
        <div class="triangle triangle-2"></div>
        <div class="square square-1"></div>
        <div class="square square-2"></div>
        <div class="hexagon hexagon-1"></div>
        <div class="hexagon hexagon-2"></div>
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

      <!-- 简单装饰线条 -->
      <div class="decorative-lines">
        <div class="line line-1"></div>
        <div class="line line-2"></div>
        <div class="line line-3"></div>
      </div>


    </div>

    <!-- 欢迎横幅 -->
    <div class="welcome-banner animate-fade-in-up">
      <div class="banner-content">
        <div class="welcome-text">
          <h1 class="welcome-title">
            欢迎回来，<span class="text-gradient">{{ userStore.userInfo?.name || '同学' }}</span>
          </h1>
          <p class="welcome-subtitle">
            继续您的深度学习之旅，探索人工智能的无限可能
          </p>
        </div>
        <div class="welcome-stats">
          <div class="stat-item">
            <div class="stat-number">{{ stats.totalExperiments }}</div>
            <div class="stat-label">总实验数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ completionRate }}%</div>
            <div class="stat-label">完成率</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.averageScore }}</div>
            <div class="stat-label">平均分</div>
          </div>
        </div>
      </div>
      <div class="banner-decoration">
        <div class="floating-icon">
          <el-icon size="60"><DataAnalysis /></el-icon>
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
          @click="goToExperimentList"
        >
          查看全部
          <el-icon class="ml-1"><ArrowRight /></el-icon>
        </el-button>
      </div>

      <div v-loading="loading" class="experiments-container">
        <div v-if="recentExperiments.length === 0" class="empty-state">
          <el-icon size="80" class="empty-icon"><Notebook /></el-icon>
          <h3>暂无实验</h3>
          <p>开始您的第一个深度学习实验吧！</p>
          <el-button type="primary" class="btn-gradient" @click="goToExperimentList">
            <el-icon><Plus /></el-icon>
            浏览实验
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
                  :type="experiment.status === 'active' ? 'success' : 'info'"
                  size="small"
                >
                  {{ experiment.status === 'active' ? '进行中' : '已完成' }}
                </el-tag>
                <el-tag
                  :type="getDifficultyColor(experiment.difficulty)"
                  size="small"
                  effect="plain"
                >
                  {{ getDifficultyText(experiment.difficulty) }}
                </el-tag>
              </div>
              <div class="experiment-score" v-if="experiment.score">
                <el-icon><Trophy /></el-icon>
                <span>{{ experiment.score }}分</span>
              </div>
            </div>

            <div class="experiment-content">
              <h3 class="experiment-title">{{ experiment.title }}</h3>
              <p class="experiment-description">{{ experiment.description }}</p>

              <div class="experiment-meta">
                <div class="meta-item">
                  <el-icon><User /></el-icon>
                  <span>{{ experiment.teacherName }}</span>
                </div>
                <div class="meta-item">
                  <el-icon><Clock /></el-icon>
                  <span>{{ experiment.endTime }}</span>
                </div>
              </div>

              <div v-if="experiment.status === 'active'" class="experiment-progress">
                <div class="progress-label">
                  <span>进度</span>
                  <span>{{ experiment.progress }}%</span>
                </div>
                <el-progress
                  :percentage="experiment.progress"
                  :stroke-width="6"
                  :show-text="false"
                />
              </div>
            </div>

            <div class="experiment-footer">
              <el-button
                type="primary"
                size="small"
                class="btn-gradient"
              >
                {{ experiment.status === 'active' ? '继续实验' : '查看结果' }}
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 学习进度展示 -->
    <div class="learning-progress animate-fade-in-up animate-delay-600">
      <h2 class="section-title">
        <el-icon><TrendCharts /></el-icon>
        学习进度
      </h2>
      <div class="progress-container">
        <div class="progress-card">
          <div class="progress-header">
            <h3>本周学习目标</h3>
            <span class="progress-percentage">75%</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: 75%"></div>
          </div>
          <p class="progress-description">已完成 3/4 个实验任务</p>
        </div>

        <div class="progress-card">
          <div class="progress-header">
            <h3>技能掌握度</h3>
            <span class="progress-percentage">68%</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar skill-progress" style="width: 68%"></div>
          </div>
          <p class="progress-description">深度学习基础知识</p>
        </div>
      </div>
    </div>

    <!-- 学习统计 -->
    <div class="learning-stats animate-fade-in-up animate-delay-800">
      <h2 class="section-title">
        <el-icon><DataAnalysis /></el-icon>
        学习统计
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
            <el-icon><Trophy /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.completedExperiments }}</div>
            <div class="stat-name">已完成</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-warning">
            <el-icon><Star /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.averageScore }}</div>
            <div class="stat-name">平均分</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-info">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">#{{ stats.currentRank }}</div>
            <div class="stat-name">班级排名</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 学习建议 -->
    <div class="learning-suggestions animate-fade-in-up animate-delay-1000">
      <h2 class="section-title">
        <el-icon><Star /></el-icon>
        学习建议
      </h2>
      <div class="suggestions-grid">
        <div class="suggestion-card">
          <div class="suggestion-icon">
            <el-icon><Notebook /></el-icon>
          </div>
          <div class="suggestion-content">
            <h3>加强基础练习</h3>
            <p>建议完成更多基础实验来巩固理论知识</p>
          </div>
        </div>

        <div class="suggestion-card">
          <div class="suggestion-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="suggestion-content">
            <h3>关注学习进度</h3>
            <p>保持稳定的学习节奏，按时完成实验任务</p>
          </div>
        </div>

        <div class="suggestion-card">
          <div class="suggestion-icon">
            <el-icon><Trophy /></el-icon>
          </div>
          <div class="suggestion-content">
            <h3>挑战高难度</h3>
            <p>尝试更具挑战性的实验项目提升技能水平</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* 全局背景样式 - 不使用scoped */
body {
  background: linear-gradient(135deg,
    rgba(102, 126, 234, 0.08) 0%,
    rgba(118, 75, 162, 0.06) 50%,
    rgba(79, 172, 254, 0.05) 100%) !important;
  background-attachment: fixed !important;
}
</style>

<style scoped>
.student-home {
  padding: 0;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  min-height: 100vh;
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
  z-index: -1;
  overflow: hidden;
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: floatShape 15s ease-in-out infinite;
}

.floating-shape.shape-1 {
  width: 120px;
  height: 120px;
  top: 10%;
  left: 5%;
  animation-delay: 0s;
  background: rgba(255, 255, 255, 0.15);
}

.floating-shape.shape-2 {
  width: 80px;
  height: 80px;
  top: 70%;
  right: 10%;
  animation-delay: 3s;
  background: rgba(255, 255, 255, 0.12);
}

.floating-shape.shape-3 {
  width: 150px;
  height: 150px;
  bottom: 15%;
  left: 15%;
  animation-delay: 6s;
  background: rgba(255, 255, 255, 0.1);
}

.floating-shape.shape-4 {
  width: 60px;
  height: 60px;
  top: 30%;
  right: 25%;
  animation-delay: 9s;
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.07), rgba(0, 242, 254, 0.07));
}

.floating-shape.shape-5 {
  width: 100px;
  height: 100px;
  top: 50%;
  left: 80%;
  animation-delay: 12s;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.06), rgba(118, 75, 162, 0.06));
}

.floating-shape.shape-6 {
  width: 90px;
  height: 90px;
  bottom: 40%;
  right: 5%;
  animation-delay: 15s;
  background: linear-gradient(135deg, rgba(240, 147, 251, 0.05), rgba(245, 87, 108, 0.05));
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

.triangle {
  position: absolute;
  width: 0;
  height: 0;
  animation: rotateGeometry 20s linear infinite;
}

.triangle-1 {
  top: 20%;
  left: 10%;
  border-left: 25px solid transparent;
  border-right: 25px solid transparent;
  border-bottom: 43px solid rgba(102, 126, 234, 0.1);
  animation-delay: 2s;
}

.triangle-2 {
  bottom: 30%;
  right: 15%;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  border-bottom: 35px solid rgba(240, 147, 251, 0.08);
  animation-delay: 8s;
}

.square {
  position: absolute;
  background: linear-gradient(45deg, rgba(118, 75, 162, 0.06), rgba(102, 126, 234, 0.06));
  animation: rotateGeometry 25s linear infinite reverse;
}

.square-1 {
  width: 40px;
  height: 40px;
  top: 60%;
  left: 5%;
  animation-delay: 5s;
}

.square-2 {
  width: 30px;
  height: 30px;
  top: 15%;
  right: 20%;
  animation-delay: 12s;
}

.hexagon {
  position: absolute;
  width: 50px;
  height: 28.87px;
  background: rgba(67, 233, 123, 0.08);
  margin: 14.43px 0;
  animation: rotateGeometry 30s linear infinite;
}

.hexagon:before,
.hexagon:after {
  content: "";
  position: absolute;
  width: 0;
  border-left: 25px solid transparent;
  border-right: 25px solid transparent;
}

.hexagon:before {
  bottom: 100%;
  border-bottom: 14.43px solid rgba(67, 233, 123, 0.08);
}

.hexagon:after {
  top: 100%;
  border-top: 14.43px solid rgba(67, 233, 123, 0.08);
}

.hexagon-1 {
  top: 40%;
  right: 8%;
  animation-delay: 3s;
}

.hexagon-2 {
  bottom: 20%;
  left: 25%;
  animation-delay: 15s;
}

@keyframes rotateGeometry {
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
  background: rgba(102, 126, 234, 0.6);
  border-radius: 50%;
  animation: particleFloat 12s ease-in-out infinite;
}

.particle-1 {
  top: 10%;
  left: 15%;
  animation-delay: 0s;
  background: rgba(102, 126, 234, 0.6);
}

.particle-2 {
  top: 25%;
  right: 20%;
  animation-delay: 2s;
  background: rgba(240, 147, 251, 0.6);
}

.particle-3 {
  top: 45%;
  left: 8%;
  animation-delay: 4s;
  background: rgba(67, 233, 123, 0.6);
}

.particle-4 {
  bottom: 30%;
  right: 12%;
  animation-delay: 6s;
  background: rgba(79, 172, 254, 0.6);
}

.particle-5 {
  bottom: 15%;
  left: 30%;
  animation-delay: 8s;
  background: rgba(118, 75, 162, 0.6);
}

.particle-6 {
  top: 35%;
  right: 35%;
  animation-delay: 10s;
  background: rgba(245, 87, 108, 0.6);
}

.particle-7 {
  bottom: 45%;
  left: 70%;
  animation-delay: 1s;
  background: rgba(56, 249, 215, 0.6);
}

.particle-8 {
  top: 70%;
  right: 8%;
  animation-delay: 7s;
  background: rgba(102, 126, 234, 0.6);
}

@keyframes particleFloat {
  0%, 100% {
    transform: translateY(0px) translateX(0px) scale(1);
    opacity: 0.4;
  }
  25% {
    transform: translateY(-40px) translateX(20px) scale(1.5);
    opacity: 0.8;
  }
  50% {
    transform: translateY(-80px) translateX(-15px) scale(2);
    opacity: 1;
  }
  75% {
    transform: translateY(-40px) translateX(-35px) scale(1.5);
    opacity: 0.8;
  }
}

/* 装饰线条 */
.decorative-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.line {
  position: absolute;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.2), transparent);
  animation: lineMove 12s ease-in-out infinite;
}

.line-1 {
  width: 200px;
  height: 1px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.line-2 {
  width: 150px;
  height: 1px;
  bottom: 30%;
  right: 15%;
  animation-delay: 4s;
}

.line-3 {
  width: 100px;
  height: 1px;
  top: 60%;
  left: 70%;
  animation-delay: 8s;
}

@keyframes lineMove {
  0%, 100% {
    opacity: 0.3;
    transform: translateX(0px);
  }
  50% {
    opacity: 0.8;
    transform: translateX(20px);
  }
}



/* 欢迎横幅 */
.welcome-banner {
  padding: 2rem;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 1rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.welcome-banner:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
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
  background: linear-gradient(45deg, #fff, #e0e7ff);
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
  color: white;
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
  color: #667eea;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}

.view-all-btn:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #4f46e5;
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
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  background: white;
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
  border-color: #a5b4fc;
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.15);
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

.action-icon.bg-primary { background: linear-gradient(135deg, #667eea, #764ba2); }
.action-icon.bg-success { background: linear-gradient(135deg, #4facfe, #00f2fe); }
.action-icon.bg-warning { background: linear-gradient(135deg, #43e97b, #38f9d7); }
.action-icon.bg-info { background: linear-gradient(135deg, #f093fb, #f5576c); }

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
  color: #6366f1;
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
  background: linear-gradient(90deg, #667eea, #764ba2);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.experiment-card:hover::after {
  transform: scaleX(1);
}

.experiment-card:hover {
  border-color: #a5b4fc;
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.15);
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

.experiment-score {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #f59e0b;
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

.experiment-progress {
  margin-top: 1rem;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.experiment-footer {
  display: flex;
  justify-content: flex-end;
}

/* 学习进度展示 */
.learning-progress {
  margin-bottom: 3rem;
}

.progress-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.progress-card {
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

.progress-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.progress-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.15);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.progress-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.progress-percentage {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
}

.progress-bar-container {
  width: 100%;
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 4px;
  transition: width 1s ease;
  position: relative;
}

.progress-bar.skill-progress {
  background: linear-gradient(90deg, #43e97b, #38f9d7);
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: progressShine 2s ease-in-out infinite;
}

@keyframes progressShine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.progress-description {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
}

/* 学习统计 */
.learning-stats {
  margin-bottom: 3rem;
}

/* 学习建议 */
.learning-suggestions {
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
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.05), transparent);
  transition: left 0.5s ease;
}

.suggestion-card:hover::before {
  left: 100%;
}

.suggestion-card:hover {
  border-color: #a5b4fc;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.suggestion-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea, #764ba2);
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
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.02), rgba(118, 75, 162, 0.02));
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

.stat-icon.bg-primary { background: #6366f1; }
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
  background: linear-gradient(135deg, #667eea, #764ba2);
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
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
}

/* 工具类 */
.ml-1 {
  margin-left: 0.25rem;
}

.ml-2 {
  margin-left: 0.5rem;
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

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
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

/* 欢迎横幅 */
.welcome-banner {
  padding: 2rem;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 1rem;
  position: relative;
  overflow: hidden;
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



.welcome-stats {
  display: flex;
  gap: var(--space-8);
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  margin-bottom: var(--space-1);
}

.stat-label {
  font-size: var(--text-sm);
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
}

/* 区块标题 */
.section-title {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-6);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
}

/* 快速操作 */
.quick-actions {
  margin-bottom: var(--space-12);
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-6);
}

.action-card {
  padding: var(--space-6);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  cursor: pointer;
  border: 1px solid var(--border-light);
  transition: all var(--duration-normal) var(--ease-out);
}

.action-card:hover {
  border-color: var(--primary-300);
  box-shadow: var(--shadow-lg);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.action-icon.bg-primary { background: var(--gradient-primary); }
.action-icon.bg-success { background: var(--gradient-success); }
.action-icon.bg-warning { background: var(--gradient-warning); }
.action-icon.bg-info { background: var(--gradient-secondary); }

.action-content {
  flex: 1;
}

.action-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-2) 0;
}

.action-description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0;
  line-height: var(--leading-relaxed);
}

.action-arrow {
  color: var(--text-tertiary);
  transition: all var(--duration-normal) var(--ease-out);
}

.action-card:hover .action-arrow {
  color: var(--primary-600);
  transform: translateX(4px);
}

/* 最近实验 */
.recent-experiments {
  margin-bottom: var(--space-12);
}

.experiments-container {
  min-height: 200px;
}

.empty-state {
  text-align: center;
  padding: var(--space-12) var(--space-6);
  color: var(--text-secondary);
}

.empty-icon {
  color: var(--gray-300);
  margin-bottom: var(--space-4);
}

.empty-state h3 {
  font-size: var(--text-xl);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.empty-state p {
  margin-bottom: var(--space-6);
}

.experiments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--space-6);
}

.experiment-card {
  padding: var(--space-6);
  cursor: pointer;
  border: 1px solid var(--border-light);
  transition: all var(--duration-normal) var(--ease-out);
}

.experiment-card:hover {
  border-color: var(--primary-300);
  box-shadow: var(--shadow-lg);
}

.experiment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-4);
}

.experiment-status {
  display: flex;
  gap: var(--space-2);
}

.experiment-score {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--warning);
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
}

.experiment-content {
  margin-bottom: var(--space-4);
}

.experiment-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-2) 0;
  line-height: var(--leading-tight);
}

.experiment-description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--space-4) 0;
  line-height: var(--leading-relaxed);
}

.experiment-meta {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.experiment-progress {
  margin-top: var(--space-4);
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
}

.experiment-footer {
  display: flex;
  justify-content: flex-end;
}

/* 学习统计 */
.learning-stats {
  margin-bottom: var(--space-8);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-6);
}

.stat-card {
  padding: var(--space-6);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  border: 1px solid var(--border-light);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.stat-icon.bg-primary { background: var(--primary-500); }
.stat-icon.bg-success { background: var(--success); }
.stat-icon.bg-warning { background: var(--warning); }
.stat-icon.bg-info { background: var(--info); }

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  line-height: 1;
}

.stat-name {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-top: var(--space-1);
}

/* 工具类 */
.ml-2 {
  margin-left: var(--space-2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .banner-content {
    flex-direction: column;
    text-align: center;
    gap: var(--space-6);
  }

  .welcome-stats {
    justify-content: center;
  }

  .section-header {
    flex-direction: column;
    gap: var(--space-4);
    align-items: stretch;
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
    padding: var(--space-6);
  }

  .welcome-title {
    font-size: var(--text-2xl);
  }

  .welcome-subtitle {
    font-size: var(--text-base);
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .experiment-meta {
    flex-direction: column;
    gap: var(--space-2);
  }
}
</style>