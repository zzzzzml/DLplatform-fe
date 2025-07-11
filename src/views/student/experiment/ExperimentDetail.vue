<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getExperimentDetail, downloadAttachment } from '../../../api/experiment'
import { ElMessage } from 'element-plus'
import { Document, Download, ArrowDown } from '@element-plus/icons-vue'

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

// 提交实验
const submitExperiment = () => {
  router.push(`/student/experiment-submit/${experimentId}`)
}

// 下载附件
const downloadFile = async (attachment) => {
  try {
    const response = await downloadAttachment(attachment.attachment_id)

    // 创建下载链接
    const blob = new Blob([response], { type: 'application/octet-stream' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = attachment.file_name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.success('文件下载成功')
  } catch (error) {
    console.error('Download failed:', error)
    ElMessage.error('文件下载失败')
  }
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
        <h2>{{ experiment.experiment_name }}</h2>
        <div class="actions">
          <el-dropdown v-if="experiment.attachments && experiment.attachments.length > 0" trigger="click">
            <el-button type="success" :icon="Download">
              下载附件
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="attachment in experiment.attachments"
                  :key="attachment.attachment_id"
                  @click="downloadFile(attachment)"
                >
                  <div class="attachment-item">
                    <el-icon><Document /></el-icon>
                    <div class="attachment-info">
                      <div class="file-name">{{ attachment.file_name }}</div>
                      <div class="file-meta">{{ formatFileSize(attachment.file_size) }} | {{ formatDateTime(attachment.upload_time) }}</div>
                    </div>
                  </div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button type="primary" @click="submitExperiment">
            提交实验
          </el-button>
        </div>
      </div>

      <el-card class="info-card">
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

.experiment-content {
  line-height: 1.8;
  color: #444;
  font-size: 15px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 下拉菜单中的附件项样式 */
.el-dropdown-menu .attachment-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 0;
  min-width: 250px;
}

.el-dropdown-menu .attachment-info {
  flex: 1;
}

.el-dropdown-menu .file-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.el-dropdown-menu .file-meta {
  font-size: 12px;
  color: #666;
}
</style> 