<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getExperimentById } from '../../../api/experiment'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const experimentId = route.params.id

const experiment = ref(null)
const loading = ref(false)

// 获取实验详情
const fetchExperimentDetail = async () => {
  loading.value = true
  try {
    const res = await getExperimentById(experimentId)
    experiment.value = res
  } catch (error) {
    console.error('Failed to fetch experiment detail:', error)
    ElMessage.error('获取实验详情失败')
  } finally {
    loading.value = false
  }
}

// 提交实验
const submitExperiment = () => {
  router.push(`/student/experiment-submit/${experimentId}`)
}

onMounted(() => {
  fetchExperimentDetail()
})
</script>

<template>
  <div class="experiment-detail" v-loading="loading">
    <div v-if="experiment" class="detail-container">
      <div class="page-header">
        <h2>{{ experiment.title }}</h2>
        <div class="actions">
          <el-button type="primary" @click="submitExperiment">
            {{ experiment.submitted ? '重新提交' : '提交实验' }}
          </el-button>
        </div>
      </div>

      <el-card class="info-card">
        <div class="experiment-info">
          <div class="info-item">
            <span class="label">发布教师：</span>
            <span class="value">{{ experiment.teacherName }}</span>
          </div>
          <div class="info-item">
            <span class="label">开始时间：</span>
            <span class="value">{{ experiment.startTime }}</span>
          </div>
          <div class="info-item">
            <span class="label">截止时间：</span>
            <span class="value">{{ experiment.endTime }}</span>
          </div>
          <div class="info-item">
            <span class="label">状态：</span>
            <el-tag :type="experiment.status === 'active' ? 'success' : 'info'">
              {{ experiment.status === 'active' ? '进行中' : '已结束' }}
            </el-tag>
          </div>
          <div class="info-item">
            <span class="label">提交状态：</span>
            <el-tag :type="experiment.submitted ? 'success' : 'warning'">
              {{ experiment.submitted ? '已提交' : '未提交' }}
            </el-tag>
          </div>
        </div>
      </el-card>

      <el-card class="content-card">
        <template #header>
          <div class="card-header">
            <span>实验说明</span>
          </div>
        </template>
        <div v-html="experiment.description" class="experiment-description"></div>
      </el-card>

      <el-card class="content-card" v-if="experiment.attachments && experiment.attachments.length > 0">
        <template #header>
          <div class="card-header">
            <span>实验附件</span>
          </div>
        </template>
        <div class="attachment-list">
          <div v-for="(file, index) in experiment.attachments" :key="index" class="attachment-item">
            <el-icon><Document /></el-icon>
            <a :href="file.url" target="_blank" class="attachment-link">{{ file.name }}</a>
          </div>
        </div>
      </el-card>

      <el-card class="content-card" v-if="experiment.requirements">
        <template #header>
          <div class="card-header">
            <span>提交要求</span>
          </div>
        </template>
        <div v-html="experiment.requirements" class="experiment-requirements"></div>
      </el-card>
    </div>

    <el-empty v-else description="未找到实验信息" />
  </div>
</template>

<style scoped>
.experiment-detail {
  padding: 20px;
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
}

.page-header h2 {
  margin: 0;
}

.info-card {
  margin-bottom: 20px;
}

.experiment-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: center;
}

.label {
  font-weight: bold;
  margin-right: 10px;
  color: #606266;
}

.content-card {
  margin-bottom: 20px;
}

.card-header {
  font-weight: bold;
}

.experiment-description, 
.experiment-requirements {
  line-height: 1.6;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.attachment-item {
  display: flex;
  align-items: center;
}

.attachment-link {
  margin-left: 10px;
  color: #409EFF;
  text-decoration: none;
}

.attachment-link:hover {
  text-decoration: underline;
}
</style> 