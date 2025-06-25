<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { getTeacherExperiments } from '../../api/experiment'

const router = useRouter()
const userStore = useUserStore()

const recentExperiments = ref([])
const pendingEvaluations = ref(0)
const loading = ref(false)

// 获取教师最近发布的实验
const fetchRecentExperiments = async () => {
  loading.value = true
  try {
    const res = await getTeacherExperiments({
      page: 1,
      limit: 5,
      recent: true
    })
    recentExperiments.value = res.data
    // 获取待评价数量
    pendingEvaluations.value = res.pendingEvaluations || 0
  } catch (error) {
    console.error('Failed to fetch recent experiments:', error)
  } finally {
    loading.value = false
  }
}

// 创建新实验
const createNewExperiment = () => {
  router.push('/teacher/experiment-create')
}

// 跳转到实验管理
const goToExperimentManage = () => {
  router.push('/teacher/experiment-manage')
}

// 编辑实验
const editExperiment = (id) => {
  router.push(`/teacher/experiment-edit/${id}`)
}

// 查看评价
const goToEvaluation = () => {
  router.push('/teacher/evaluation')
}

onMounted(() => {
  fetchRecentExperiments()
})
</script>

<template>
  <div class="teacher-home">
    <div class="welcome-section">
      <h2>欢迎使用深度学习教学实验平台</h2>
      <p>当前身份：教师 - {{ userStore.userInfo?.name }}</p>
    </div>

    <el-row :gutter="20" class="stat-cards">
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-icon">
            <el-icon size="40"><Files /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ recentExperiments.length }}</div>
            <div class="stat-label">近期发布的实验</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-icon">
            <el-icon size="40"><Check /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ pendingEvaluations }}</div>
            <div class="stat-label">待评价实验</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card create-card" @click="createNewExperiment">
          <div class="stat-icon">
            <el-icon size="40"><Plus /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">创建新实验</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="recent-experiments">
      <template #header>
        <div class="card-header">
          <span>最近发布的实验</span>
          <el-button type="primary" size="small" @click="goToExperimentManage">管理全部</el-button>
        </div>
      </template>
      <div v-loading="loading">
        <el-empty v-if="recentExperiments.length === 0" description="暂无发布的实验" />
        <el-table v-else :data="recentExperiments" style="width: 100%">
          <el-table-column prop="title" label="实验名称" min-width="200" />
          <el-table-column prop="startTime" label="开始时间" width="180" />
          <el-table-column prop="endTime" label="截止时间" width="180" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'info'">
                {{ row.status === 'active' ? '进行中' : '已结束' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="submissionCount" label="提交数量" width="100" />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="editExperiment(row.id)">
                编辑
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <el-row :gutter="20" class="feature-cards">
      <el-col :span="8">
        <el-card class="feature-card" @click="router.push('/teacher/experiment-manage')">
          <el-icon size="40"><Files /></el-icon>
          <h3>实验管理</h3>
          <p>管理您发布的所有实验</p>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="feature-card" @click="goToEvaluation">
          <el-icon size="40"><Check /></el-icon>
          <h3>实验评价</h3>
          <p>查看和评价学生提交的实验</p>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="feature-card" @click="router.push('/teacher/class-manage')">
          <el-icon size="40"><User /></el-icon>
          <h3>班级管理</h3>
          <p>管理您的班级和学生</p>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.teacher-home {
  padding: 20px;
}

.welcome-section {
  margin-bottom: 30px;
}

.welcome-section h2 {
  font-size: 24px;
  margin-bottom: 10px;
}

.stat-cards {
  margin-bottom: 30px;
}

.stat-card {
  height: 120px;
  display: flex;
  align-items: center;
  padding: 20px;
}

.create-card {
  cursor: pointer;
  transition: all 0.3s;
  background-color: #f0f9eb;
}

.create-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  margin-right: 20px;
  color: #409EFF;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  color: #666;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recent-experiments {
  margin-bottom: 30px;
}

.feature-cards {
  margin-top: 30px;
}

.feature-card {
  height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.feature-card h3 {
  margin: 15px 0 5px;
}

.feature-card p {
  color: #666;
  text-align: center;
}
</style> 