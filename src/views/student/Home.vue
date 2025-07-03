<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)

const goToExperimentList = () => {
  router.push('/student/experiment-list')
}

onMounted(() => {
  console.log('学生首页已加载')
})
</script>

<template>
  <div class="student-home">
    <div class="welcome-section">
      <h1>欢迎使用深度学习教学实验平台</h1>
      <p>当前身份：学生 - {{ userStore.userInfo?.name || '同学' }}</p>
    </div>

    <div class="quick-actions">
      <h2>快速操作</h2>
      <div class="action-grid">
        <el-card class="action-card" @click="goToExperimentList">
          <h3>实验列表</h3>
          <p>查看所有可用的实验任务</p>
        </el-card>

        <el-card class="action-card" @click="router.push('/student/result')">
          <h3>实验结果</h3>
          <p>查看已完成实验的评分</p>
        </el-card>

        <el-card class="action-card" @click="router.push('/student/profile')">
          <h3>个人中心</h3>
          <p>管理个人信息和设置</p>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.student-home {
  padding: 2rem;
}

.welcome-section {
  margin-bottom: 2rem;
  text-align: center;
}

.welcome-section h1 {
  color: #409EFF;
  margin-bottom: 1rem;
}

.quick-actions {
  margin-bottom: 2rem;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.action-card {
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  padding: 1.5rem;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.action-card h3 {
  color: #409EFF;
  margin-bottom: 0.5rem;
}

.action-card p {
  color: #666;
  margin: 0;
}
</style>

<style scoped>
.student-home {
  padding: 0;
  max-width: 1200px;
  margin: 0 auto;
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

.welcome-subtitle {
  font-size: 1.125rem;
  opacity: 0.9;
  margin: 0;
  line-height: 1.75;
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