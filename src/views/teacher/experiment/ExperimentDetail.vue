<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getTeacherExperimentDetail, downloadAttachment } from '../../../api/experiment'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Download, Document, ArrowDown } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const experimentId = route.params.id

const experiment = ref(null)
const attachments = ref([])
const loading = ref(false)

// 获取实验详情
const fetchExperimentDetail = async () => {
  loading.value = true
  try {
    const response = await getTeacherExperimentDetail(experimentId)
    if (response.code === 200) {
      experiment.value = response.data.experiment
      attachments.value = response.data.attachments || []
      console.log('获取到实验详情:', experiment.value)
      console.log('获取到附件:', attachments.value)
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

// 下载附件
const downloadFile = async (attachment) => {
  try {
    const response = await downloadAttachment(attachment.attachment_id)
    
    // 检查响应类型
    if (response instanceof Blob) {
      // 如果已经是Blob，直接使用
      const blob = response
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = attachment.file_name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      ElMessage.success('文件下载成功')
    } else if (response.code === 200 && response.data) {
      // 如果是JSON响应，可能包含文件数据
      ElMessage.error('下载失败：服务器返回了非文件数据')
      console.error('下载失败：', response)
    } else {
      ElMessage.error(response.message || '文件下载失败')
    }
  } catch (error) {
    console.error('Download failed:', error)
    ElMessage.error('文件下载失败')
  }
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

// 查看排名
const viewRanking = () => {
  router.push(`/teacher/score/${experimentId}`)
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

// 获取状态文本
const getStatusText = (exp) => {
  if (!exp || !exp.deadline) return '未知'
  
  const currentTime = new Date().getTime()
  const endTime = new Date(exp.deadline).getTime()
  const startTime = exp.publish_time ? new Date(exp.publish_time).getTime() : currentTime
  
  if (currentTime > endTime) {
    return '已结束'
  } else if (currentTime < startTime) {
    return '未开始'
  } else {
    return '进行中'
  }
}

// 获取状态标签类型
const getStatusType = (exp) => {
  if (!exp || !exp.deadline) return 'info'
  
  const currentTime = new Date().getTime()
  const endTime = new Date(exp.deadline).getTime()
  const startTime = exp.publish_time ? new Date(exp.publish_time).getTime() : currentTime
  
  if (currentTime > endTime) {
    return 'info' // 已结束-蓝色
  } else if (currentTime < startTime) {
    return 'warning' // 未开始-橙色
  } else {
    return 'success' // 进行中-绿色
  }
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
          <el-dropdown v-if="attachments.length > 0" trigger="click" class="dropdown-button">
            <el-button type="success" :icon="Download">
              下载附件
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="attachment in attachments"
                  :key="attachment.attachment_id"
                  @click="downloadFile(attachment)"
                >
                  <div class="attachment-item-dropdown">
                    <el-icon><Document /></el-icon>
                    <div class="attachment-info">
                      <div class="file-name">{{ attachment.file_name }}</div>
                      <div class="file-meta">{{ formatFileSize(attachment.file_size) }}</div>
                    </div>
                  </div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button type="warning" @click="viewRanking">
            查看排名
          </el-button>
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
          <div class="info-item">
            <span class="label">发布时间：</span>
            <span class="value">{{ formatDateTime(experiment.publish_time) }}</span>
          </div>
          <div class="info-item">
            <span class="label">班级ID：</span>
            <span class="value">{{ experiment.class_id }}</span>
          </div>
          <div class="info-item">
            <span class="label">实验状态：</span>
            <span class="value">
              <el-tag :type="getStatusType(experiment)">
                {{ getStatusText(experiment) }}
              </el-tag>
            </span>
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

      <el-card class="content-card" v-if="attachments.length > 0">
        <template #header>
          <div class="card-header">
            <span>实验附件</span>
          </div>
        </template>
        <div class="attachment-list">
          <div v-for="attachment in attachments" :key="attachment.attachment_id" class="attachment-item">
            <el-icon><Document /></el-icon>
            <div class="attachment-info">
              <div class="file-name">{{ attachment.file_name }}</div>
              <div class="file-meta">{{ formatFileSize(attachment.file_size) }} | {{ formatDateTime(attachment.upload_time) }}</div>
            </div>
            <el-button type="primary" size="small" @click="downloadFile(attachment)">下载</el-button>
          </div>
        </div>
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
  background: #f5f7fa;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
  font-size: 22px;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.dropdown-button {
  margin-right: 10px;
}

.info-card,
.content-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
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
  color: #606266;
  min-width: 100px;
}

.value {
  color: #303133;
  font-weight: 500;
}

.experiment-content {
  line-height: 1.8;
  color: #303133;
  font-size: 15px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.attachment-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.attachment-item-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
}

.attachment-item .el-icon,
.attachment-item-dropdown .el-icon {
  font-size: 20px;
  color: #409EFF;
  margin-right: 10px;
}

.attachment-info {
  flex: 1;
  margin-right: 10px;
}

.file-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 5px;
}

.file-meta {
  font-size: 12px;
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .actions {
    width: 100%;
    justify-content: flex-start;
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
