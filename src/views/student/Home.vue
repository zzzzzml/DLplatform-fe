<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { useExperimentStore } from '../../stores/experiment'

const router = useRouter()
const userStore = useUserStore()
const experimentStore = useExperimentStore()

const recentExperiments = ref([])
const loading = ref(false)

// 获取最近的实验
const fetchRecentExperiments = async () => {
  loading.value = true
  try {
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

// 跳转到实验列表
const goToExperimentList = () => {
  router.push('/student/experiment-list')
}

// 查看实验详情
const viewExperiment = (id) => {
  router.push(`/student/experiment-detail/${id}`)
}

onMounted(() => {
  fetchRecentExperiments()
})
</script>

<template>
  <div class="student-home">
    <div class="welcome-section">
      <h2>欢迎使用深度学习教学实验平台</h2>
      <p>当前身份：学生 - {{ userStore.userInfo?.name }}</p>
    </div>

    <el-card class="recent-experiments">
      <template #header>
        <div class="card-header">
          <span>最近实验</span>
          <el-button type="primary" size="small" @click="goToExperimentList">查看全部</el-button>
        </div>
      </template>
      <div v-loading="loading">
        <el-empty v-if="recentExperiments.length === 0" description="暂无最近实验" />
        <el-table v-else :data="recentExperiments" style="width: 100%">
          <el-table-column prop="title" label="实验名称" min-width="200" />
          <el-table-column prop="teacherName" label="发布教师" width="120" />
          <el-table-column prop="endTime" label="截止时间" width="180" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'info'">
                {{ row.status === 'active' ? '进行中' : '已结束' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="viewExperiment(row.id)">
                查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <el-row :gutter="20" class="feature-cards">
      <el-col :span="8">
        <el-card class="feature-card" @click="router.push('/student/experiment-list')">
          <el-icon size="40"><Files /></el-icon>
          <h3>实验列表</h3>
          <p>查看所有可用的实验任务</p>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="feature-card" @click="router.push('/student/result')">
          <el-icon size="40"><List /></el-icon>
          <h3>实验结果</h3>
          <p>查看已提交实验的评分和反馈</p>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="feature-card" @click="router.push('/student/profile')">
          <el-icon size="40"><User /></el-icon>
          <h3>个人中心</h3>
          <p>管理您的个人信息和账户设置</p>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.student-home {
  padding: 20px;
}

.welcome-section {
  margin-bottom: 30px;
}

.welcome-section h2 {
  font-size: 24px;
  margin-bottom: 10px;
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