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
          v-model:file-list="fileList"
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
          :limit="1"
          accept=".zip,.rar,.7z"
          :auto-upload="false"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              只能上传 .zip/.rar/.7z 文件，且不超过 10MB
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
            <li>请确保上传的是实验代码压缩包（.zip/.rar/.7z格式）</li>
            <li>文件大小不能超过10MB</li>
            <li>压缩包内请包含所有实验相关代码和文件</li>
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
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled, Document } from '@element-plus/icons-vue'
import { uploadExperimentFile, getUploadHistory } from '../../../api/upload'
import { getExperimentById, getExperimentDetail } from '../../../api/experiment'

const route = useRoute()
const router = useRouter()

// 响应式数据
const uploadRef = ref(null)
const fileList = ref([])
// 调试用，打印fileList变化
watch(fileList, (val) => {
  console.log('fileList变化:', val)
})
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadHistory = ref([])

// 实验信息（从接口获取）
const experimentInfo = ref({})

// 上传配置
const uploadUrl = computed(() => {
  return '/api/experiments/upload'
})

const uploadHeaders = computed(() => {
  const token = localStorage.getItem('token')
  return {
    'Authorization': `Bearer ${token}`
  }
})

const uploadData = computed(() => {
  // 直接从路由参数获取实验ID
  const experimentId = route.params.id
  // 确保experimentId是数字
  const numericExperimentId = parseInt(experimentId)
  if (isNaN(numericExperimentId)) {
    console.error(`计算uploadData时，实验ID不是有效的数字: ${experimentId}`)
  }
  
  // 获取用户信息
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  const userId = userInfo.user_id || userInfo.id || 1
  
  return {
    experimentId: isNaN(numericExperimentId) ? experimentId : numericExperimentId,
    studentId: userId
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
  console.log('上传前验证文件:', file.name, file.type, file.size)
  
  // 检查文件类型
  const allowedExts = ['.zip', '.rar', '.7z']
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
  if (!allowedExts.includes(ext)) {
    ElMessage.error('只能上传.zip/.rar/.7z文件！')
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

  return true // 阻止el-upload自动上传，由手动触发submitUpload
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
  const file = fileList.value[0]
  if (!file.raw) {
    ElMessage.error('文件未正确加载，请重新选择')
    return
  }
  
  // 获取实验ID
  const experimentId = route.params.id
  if (!experimentId) {
    ElMessage.error('无法获取实验ID，请刷新页面重试')
    console.error('实验ID不存在:', route.params)
    return
  }
  
  // 确保experimentId是数字
  const numericExperimentId = parseInt(experimentId)
  if (isNaN(numericExperimentId)) {
    ElMessage.error(`实验ID不是有效的数字: ${experimentId}`)
    console.error(`实验ID不是有效的数字: ${experimentId}`)
    return
  }
  
  // 获取用户信息
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  const userId = userInfo.user_id || userInfo.id || 1
  
  console.log('用户ID:', userId)
  console.log('实验ID:', numericExperimentId)
  
  uploading.value = true
  uploadProgress.value = 0
  file.status = 'uploading'
  
  // 创建FormData
  const formData = new FormData()
  formData.append('file', file.raw)
  formData.append('experimentId', numericExperimentId)
  formData.append('studentId', userId)
  
  // 打印formData所有内容
  for (let [key, value] of formData.entries()) {
    console.log('formData:', key, value)
  }
  
  try {
    const response = await uploadExperimentFile(formData)
    console.log('上传响应:', response)
    if (response.code === 200) {
      ElMessage.success('文件上传成功！')
      file.status = 'success'
      uploadProgress.value = 100
      uploading.value = false
      // 上传成功后刷新上传历史
      await fetchUploadHistory()
      setTimeout(() => {
        ElMessage.success('实验提交成功！')
        router.push('/student/experiment-list')
      }, 1000)
    } else {
      handleUploadError(new Error(response.message || '上传失败'), file)
    }
  } catch (error) {
    console.error('上传错误:', error)
    handleUploadError(error, file)
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
  // 重试机制
  let retryCount = 0
  const maxRetries = 3
  
  const tryFetchHistory = async () => {
    try {
      // 直接从路由参数获取实验ID
      const experimentId = route.params.id
      if (!experimentId) {
        console.error('无法获取实验ID，无法获取上传历史')
        return
      }
      
      // 确保experimentId是数字
      const numericExperimentId = parseInt(experimentId)
      if (isNaN(numericExperimentId)) {
        console.error(`实验ID不是有效的数字: ${experimentId}`)
        return
      }
      
      console.log('获取上传历史，实验ID:', numericExperimentId, '尝试次数:', retryCount + 1)
      const response = await getUploadHistory(numericExperimentId)
      console.log('上传历史响应:', response)
      
      // 兼容后端返回格式
      if (response.code === 200 && response.data) {
        uploadHistory.value = response.data
        console.log('上传历史数据:', uploadHistory.value)
      } else if (response.success && response.data) {
        uploadHistory.value = response.data
        console.log('上传历史数据(旧格式):', uploadHistory.value)
      } else {
        console.warn('上传历史数据为空或格式不正确:', response)
        uploadHistory.value = []
      }
    } catch (error) {
      console.error('获取上传历史失败:', error)
      
      // 重试逻辑
      if (retryCount < maxRetries) {
        retryCount++
        const delay = retryCount * 1000 // 1秒, 2秒, 3秒
        console.log(`获取上传历史失败，将在${delay}ms后重试(${retryCount}/${maxRetries})`)
        
        return new Promise(resolve => {
          setTimeout(async () => {
            await tryFetchHistory()
            resolve()
          }, delay)
        })
      } else {
        console.error(`获取上传历史失败，已达到最大重试次数(${maxRetries})`)
        uploadHistory.value = []
      }
    }
  }
  
  await tryFetchHistory()
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 页面加载时获取实验信息和上传历史
onMounted(async () => {
  // 获取实验ID
  const experimentId = route.params.id
  if (!experimentId) {
    ElMessage.error('无法获取实验ID，请返回实验列表重新选择')
    console.error('实验ID不存在:', route.params)
    setTimeout(() => {
      router.push('/student/experiment-list')
    }, 2000)
    return
  }
  
  console.log('获取实验详情，ID:', experimentId)
  
  // 获取实验信息，添加重试机制
  let retryCount = 0
  const maxRetries = 3
  
  const fetchExperimentInfo = async () => {
    try {
      // 确保experimentId是数字
      const numericExperimentId = parseInt(experimentId)
      if (isNaN(numericExperimentId)) {
        throw new Error(`实验ID不是有效的数字: ${experimentId}`)
      }
      
      console.log('发送请求获取实验详情，ID:', numericExperimentId, '尝试次数:', retryCount + 1)
      const response = await getExperimentDetail(numericExperimentId)
      console.log('实验详情响应:', response)
      
      if (response.code === 200 && response.data) {
        experimentInfo.value = response.data.experiment || {}
        console.log('实验信息:', experimentInfo.value)
        
        // 自动判断状态，兼容deadline字段
        if (experimentInfo.value.deadline) {
          let end = new Date(experimentInfo.value.deadline.replace(' ', 'T'))
          if (isNaN(end)) end = new Date(experimentInfo.value.deadline)
          const now = new Date()
          experimentInfo.value.status = end > now ? 'active' : 'ended'
          experimentInfo.value.endTime = experimentInfo.value.deadline // 兼容模板
          experimentInfo.value.title = experimentInfo.value.experiment_name // 兼容模板
        } else if (experimentInfo.value.endTime) {
          let end = new Date(experimentInfo.value.endTime.replace(' ', 'T'))
          if (isNaN(end)) end = new Date(experimentInfo.value.endTime)
          const now = new Date()
          experimentInfo.value.status = end > now ? 'active' : 'ended'
        } else {
          experimentInfo.value.status = 'unknown'
        }
        
        // 保存实验ID，确保后续使用
        experimentInfo.value.id = numericExperimentId
        
        // 检查截止时间
        if (experimentInfo.value.status === 'ended') {
          ElMessage.warning('该实验已截止，无法提交')
        }
        
        // 获取上传历史
        await fetchUploadHistory()
      } else {
        ElMessage.error(response.message || '获取实验详情失败')
        console.error('获取实验详情失败，响应:', response)
        setTimeout(() => {
          router.push('/student/experiment-list')
        }, 2000)
      }
    } catch (e) {
      console.error('获取实验详情失败:', e)
      
      // 重试逻辑
      if (retryCount < maxRetries) {
        retryCount++
        const delay = retryCount * 1000 // 1秒, 2秒, 3秒
        console.log(`将在${delay}ms后重试(${retryCount}/${maxRetries})`)
        ElMessage.warning(`获取实验详情失败，正在重试(${retryCount}/${maxRetries})...`)
        
        setTimeout(() => {
          fetchExperimentInfo()
        }, delay)
      } else {
        ElMessage.error(`获取实验详情失败: ${e.message}`)
        experimentInfo.value = {}
        setTimeout(() => {
          router.push('/student/experiment-list')
        }, 2000)
      }
    }
  }
  
  // 开始获取实验信息
  await fetchExperimentInfo()
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