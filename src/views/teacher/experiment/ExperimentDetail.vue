<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getExperimentDetail } from '../../../api/experiment'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const experimentId = route.params.id

const experiment = ref(null)
const loading = ref(false)

// 获取实验详情
const fetchExperimentDetail = async () => {
  loading.value = true
  try {
    const response = await getExperimentDetail(experimentId)
    if (response.code === 200) {
      experiment.value = response.data
    } else {
      ElMessage.error(response.message || '获取实验详情失败')
    }
  } catch (error) {
    console.error('Failed to fetch experiment detail:', error)
    ElMessage.error('获取实验详情失败')
  } finally {
    loading.value = false
  }
}

// 返回列表
const goBack = () => {
  router.push('/teacher/experiment-manage')
}

// 编辑实验
const editExperiment = () => {
  router.push(`/teacher/experiment-edit/${experimentId}`)
}

// 查看提交列表
const viewSubmissions = () => {
  router.push({
    path: '/teacher/evaluation',
    query: { experimentId: experimentId }
  })
}

// 格式化日期时间
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '-'
  const date = new Date(dateTimeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchExperimentDetail()
})
</script>

<template>
  <div class="experiment-detail" v-loading="loading">
    <div v-if="experiment" class="detail-container">
      <div class="page-header">
        <div class="header-left">
          <el-button @click="goBack" :icon="ArrowLeft">返回列表</el-button>
          <h2>{{ experiment.experiment_name }}</h2>
        </div>
        <div class="actions">
          <el-button type="info" @click="viewSubmissions">
            查看提交
          </el-button>
          <el-button type="primary" @click="editExperiment">
            编辑实验
          </el-button>
        </div>
      </div>

      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span>实验信息</span>
          </div>
        </template>
        <div class="experiment-info">
          <div class="info-item">
            <span class="label">实验名称：</span>
            <span class="value">{{ experiment.experiment_name }}</span>
          </div>
          <div class="info-item">
            <span class="label">截止时间：</span>
            <span class="value">{{ formatDateTime(experiment.deadline) }}</span>
          </div>
        </div>
      </el-card>

      <el-card class="content-card" v-if="experiment.description">
        <template #header>
          <div class="card-header">
            <span>实验内容</span>
          </div>
        </template>
        <div class="experiment-content">{{ experiment.description }}</div>
      </el-card>
    </div>

    <el-empty v-else description="未找到实验信息" />
  </div>
</template>

<style scoped>
.experiment-detail {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.detail-container {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.page-header h2 {
  margin: 0;
  color: white;
  font-size: 24px;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 10px;
}

.info-card,
.content-card {
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.card-header {
  font-weight: 600;
  font-size: 16px;
  color: #2c3e50;
}

.experiment-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 10px 0;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

.label {
  font-weight: 600;
  color: #555;
  min-width: 120px;
}

.value {
  color: #333;
  font-weight: 500;
}

.experiment-content {
  line-height: 1.8;
  color: #444;
  font-size: 15px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .header-left {
    justify-content: center;
  }

  .actions {
    justify-content: center;
  }

  .experiment-info {
    grid-template-columns: 1fr;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .label {
    min-width: auto;
  }
}
</style>
