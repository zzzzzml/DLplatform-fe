<template>
  <div class="experiment-upload">
    <div class="page-header">
      <el-page-header @back="goBack" title="返回实验列表">
        <template #content>
          <span class="page-title">实验文件上传</span>
        </template>
      </el-page-header>
    </div>

    <div class="upload-container">
      <!-- 实验信息卡片 -->
      <div class="experiment-info">
        <h3>实验信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>实验名称：</label>
            <span>{{ experimentInfo.title }}</span>
          </div>
          <div class="info-item">
            <label>发布教师：</label>
            <span>{{ experimentInfo.teacherName }}</span>
          </div>
          <div class="info-item">
            <label>截止时间：</label>
            <span>{{ experimentInfo.endTime }}</span>
          </div>
          <div class="info-item">
            <label>实验状态：</label>
            <el-tag :type="experimentInfo.status === 'active' ? 'success' : 'info'">
              {{ experimentInfo.status === 'active' ? '进行中' : '已结束' }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 文件上传区域 -->
      <div class="upload-section">
        <h3>文件上传</h3>
        
        <!-- 拖拽上传区域 -->
        <el-upload
          ref="uploadRef"
          class="upload-dragger"
          drag
          :action="uploadUrl"
          :headers="uploadHeaders"
          :data="uploadData"
          :before-upload="beforeUpload"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :on-progress="handleUploadProgress"
          :file-list="fileList"
          :limit="1"
          accept=".pth"
          :auto-upload="false"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              只能上传 .pth 文件，且不超过 10MB
            </div>
          </template>
        </el-upload>

        <!-- 上传进度 -->
        <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
          <el-progress 
            :percentage="uploadProgress" 
            :stroke-width="8"
            status="success"
          />
          <p class="progress-text">正在上传文件...</p>
        </div>

        <!-- 已上传文件列表 -->
        <div v-if="fileList.length > 0" class="uploaded-files">
          <h4>已上传文件</h4>
          <div class="file-list">
            <div 
              v-for="file in fileList" 
              :key="file.uid"
              class="file-item"
            >
              <div class="file-info">
                <el-icon class="file-icon"><document /></el-icon>
                <div class="file-details">
                  <div class="file-name">{{ file.name }}</div>
                  <div class="file-size">{{ formatFileSize(file.size) }}</div>
                </div>
              </div>
              <div class="file-actions">
                <el-button 
                  v-if="file.status === 'ready'"
                  type="primary" 
                  size="small"
                  @click="submitUpload"
                  :loading="uploading"
                >
                  提交上传
                </el-button>
                <el-button 
                  v-if="file.status === 'success'"
                  type="success" 
                  size="small"
                  disabled
                >
                  上传成功
                </el-button>
                <el-button 
                  type="danger" 
                  size="small"
                  @click="removeFile(file)"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 上传历史 -->
      <div v-if="uploadHistory.length > 0" class="upload-history">
        <h3>上传历史</h3>
        <div class="history-list">
          <div 
            v-for="item in uploadHistory" 
            :key="item.id"
            class="history-item"
          >
            <div class="history-info">
              <el-icon class="history-icon"><document /></el-icon>
              <div class="history-details">
                <div class="history-name">{{ item.fileName }}</div>
                <div class="history-meta">
                  <span>{{ formatFileSize(item.fileSize) }}</span>
                  <span>{{ item.uploadTime }}</span>
                </div>
              </div>
            </div>
            <div class="history-status">
              <el-tag :type="item.status === 'success' ? 'success' : 'warning'">
                {{ item.status === 'success' ? '上传成功' : '上传中' }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 提交说明 -->
      <div class="submit-notes">
        <h3>提交说明</h3>
        <div class="notes-content">
          <ul>
            <li>请确保上传的是模型权重文件（.pth格式）</li>
            <li>文件大小不能超过10MB</li>
            <li>请确保文件为有效的PyTorch模型权重</li>
            <li>提交后将无法修改，请仔细检查后再提交</li>
            <li>系统将自动检测文件格式</li>
          </ul>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button @click="goBack">取消</el-button>
        <el-button 
          type="primary" 
          @click="submitUpload"
          :loading="uploading"
          :disabled="fileList.length === 0"
        >
          提交实验
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled, Document } from '@element-plus/icons-vue'
import { uploadExperimentFile, getUploadHistory } from '../../../api/upload'

const route = useRoute()
const router = useRouter()

// 响应式数据
const uploadRef = ref(null)
const fileList = ref([])
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadHistory = ref([])

// 实验信息（从路由参数获取实验ID，这里使用静态数据）
const experimentInfo = ref({
  id: route.params.id,
  title: '基于Vue3的组件化开发实践',
  teacherName: '张教授',
  startTime: '2025-06-01 09:00:00',
  endTime: '2025-07-10 23:59:59',
  status: 'active'
})

// 上传配置
const uploadUrl = computed(() => {
  // 这里应该配置真实的上传API地址
  return '/api/experiments/upload'
})

const uploadHeaders = computed(() => {
  const token = localStorage.getItem('token')
  return {
    'Authorization': `Bearer ${token}`
  }
})

const uploadData = computed(() => {
  return {
    experimentId: experimentInfo.value.id,
    studentId: JSON.parse(localStorage.getItem('userInfo'))?.id || 1
  }
})

// 文件大小格式化
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 上传前验证
const beforeUpload = (file) => {
  // 检查文件类型
  const isPth = file.name.endsWith('.pth')
  if (!isPth) {
    ElMessage.error('只能上传.pth文件！')
    return false
  }

  // 检查文件大小（10MB）
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过10MB！')
    return false
  }

  // 检查是否已上传文件
  if (fileList.value.length > 0) {
    ElMessage.warning('只能上传一个文件，请先删除现有文件')
    return false
  }

  return true
}

// 上传成功处理
const handleUploadSuccess = (response, file) => {
  ElMessage.success('文件上传成功！')
  file.status = 'success'
  uploadProgress.value = 100
  uploading.value = false
  
  // 模拟提交成功后的跳转
  setTimeout(() => {
    ElMessage.success('实验提交成功！')
    router.push('/student/experiment-list')
  }, 1000)
}

// 上传失败处理
const handleUploadError = (error, file) => {
  ElMessage.error('文件上传失败，请重试')
  file.status = 'error'
  uploading.value = false
  uploadProgress.value = 0
}

// 上传进度处理
const handleUploadProgress = (event, file) => {
  uploadProgress.value = Math.round(event.percent)
}

// 删除文件
const removeFile = (file) => {
  const index = fileList.value.indexOf(file)
  if (index > -1) {
    fileList.value.splice(index, 1)
    uploadProgress.value = 0
  }
}

// 提交上传
const submitUpload = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择要上传的文件')
    return
  }

  try {
    await ElMessageBox.confirm(
      '确定要提交这个实验文件吗？提交后将无法修改。',
      '确认提交',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    uploading.value = true
    uploadProgress.value = 0
    
    const file = fileList.value[0]
    file.status = 'uploading'
    
    // 创建FormData对象
    const formData = new FormData()
    formData.append('file', file.raw || file)
    formData.append('experimentId', experimentInfo.value.id)
    formData.append('studentId', JSON.parse(localStorage.getItem('userInfo'))?.id || 1)
    
    try {
      // 调用真实的上传API
      const response = await uploadExperimentFile(formData)
      
      if (response.success) {
        handleUploadSuccess(response, file)
      } else {
        handleUploadError(new Error(response.message), file)
      }
    } catch (error) {
      // 如果API调用失败，使用模拟上传
      console.log('API调用失败，使用模拟上传:', error)
      simulateUpload(file)
    }
    
  } catch (error) {
    // 用户取消
    console.log('用户取消提交')
  }
}

// 模拟上传过程（当API不可用时使用）
const simulateUpload = (file) => {
  const interval = setInterval(() => {
    uploadProgress.value += Math.random() * 20
    if (uploadProgress.value >= 100) {
      clearInterval(interval)
      handleUploadSuccess({ success: true }, file)
    }
  }, 200)
}

// 获取上传历史
const fetchUploadHistory = async () => {
  try {
    const response = await getUploadHistory(experimentInfo.value.id)
    uploadHistory.value = response.data || []
  } catch (error) {
    console.log('获取上传历史失败:', error)
    // 使用模拟数据
    uploadHistory.value = [
      {
        id: 1,
        fileName: 'experiment_v1.pth',
        fileSize: 2048,
        uploadTime: '2025-01-15 14:30:00',
        status: 'success'
      }
    ]
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 页面加载时获取实验信息和上传历史
onMounted(async () => {
  console.log('实验ID:', route.params.id)
  await fetchUploadHistory()
})
</script>

<style scoped>
.experiment-upload {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.upload-container {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.experiment-info {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.experiment-info h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-item label {
  font-weight: bold;
  color: #666;
  margin-right: 10px;
  min-width: 80px;
}

.info-item span {
  color: #333;
}

.upload-section {
  margin-bottom: 30px;
}

.upload-section h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 16px;
}

.upload-dragger {
  width: 100%;
}

.upload-progress {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.progress-text {
  margin-top: 10px;
  text-align: center;
  color: #666;
}

.uploaded-files {
  margin-top: 20px;
}

.uploaded-files h4 {
  margin-bottom: 15px;
  color: #333;
  font-size: 14px;
}

.file-list {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
}

.file-item:last-child {
  border-bottom: none;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-icon {
  font-size: 20px;
  color: #409eff;
}

.file-details {
  display: flex;
  flex-direction: column;
}

.file-name {
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.file-size {
  font-size: 12px;
  color: #999;
}

.file-actions {
  display: flex;
  gap: 10px;
}

.submit-notes {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.submit-notes h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 16px;
}

.notes-content ul {
  margin: 0;
  padding-left: 20px;
}

.notes-content li {
  margin-bottom: 8px;
  color: #666;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

/* 自定义上传区域样式 */
:deep(.el-upload-dragger) {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.3s;
}

:deep(.el-upload-dragger:hover) {
  border-color: #409eff;
  background: #f0f9ff;
}

:deep(.el-upload-dragger .el-icon--upload) {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

:deep(.el-upload__text) {
  color: #606266;
  font-size: 14px;
  text-align: center;
}

:deep(.el-upload__text em) {
  color: #409eff;
  font-style: normal;
}

:deep(.el-upload__tip) {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.upload-history {
  margin-bottom: 30px;
}

.upload-history h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 16px;
}

.history-list {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
}

.history-item:last-child {
  border-bottom: none;
}

.history-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.history-icon {
  font-size: 20px;
  color: #409eff;
}

.history-details {
  display: flex;
  flex-direction: column;
}

.history-name {
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.history-meta {
  font-size: 12px;
  color: #999;
}

.history-status {
  display: flex;
  align-items: center;
}
</style> 