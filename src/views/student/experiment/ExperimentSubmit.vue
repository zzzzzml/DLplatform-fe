<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getExperimentById, submitExperiment } from '../../../api/experiment'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const experimentId = route.params.id

const experiment = ref(null)
const loading = ref(false)
const submitting = ref(false)

const formData = reactive({
  content: '',
  attachments: []
})

// 获取实验详情
const fetchExperimentDetail = async () => {
  loading.value = true
  try {
    const res = await getExperimentById(experimentId)
    experiment.value = res
    
    // 如果已经提交过，加载之前的提交内容
    if (res.submissionData) {
      formData.content = res.submissionData.content || ''
    }
  } catch (error) {
    console.error('Failed to fetch experiment detail:', error)
    ElMessage.error('获取实验详情失败')
  } finally {
    loading.value = false
  }
}

// 提交实验
const handleSubmit = async () => {
  if (!formData.content && formData.attachments.length === 0) {
    ElMessage.warning('请填写实验内容或上传附件')
    return
  }
  
  submitting.value = true
  try {
    await submitExperiment(experimentId, formData)
    ElMessage.success('实验提交成功')
    router.push('/student/experiment-list')
  } catch (error) {
    console.error('Failed to submit experiment:', error)
    ElMessage.error('实验提交失败')
  } finally {
    submitting.value = false
  }
}

// 取消提交
const cancelSubmit = () => {
  router.back()
}

// 文件上传成功回调
const handleFileSuccess = (response, file, fileList) => {
  formData.attachments.push({
    name: file.name,
    url: response.url,
    size: file.size
  })
}

// 删除文件
const handleFileRemove = (file) => {
  const index = formData.attachments.findIndex(item => item.name === file.name)
  if (index > -1) {
    formData.attachments.splice(index, 1)
  }
}

onMounted(() => {
  fetchExperimentDetail()
})
</script>

<template>
  <div class="experiment-submit" v-loading="loading">
    <div v-if="experiment" class="submit-container">
      <div class="page-header">
        <h2>提交实验：{{ experiment.title }}</h2>
      </div>

      <el-card class="info-card">
        <div class="experiment-info">
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

      <el-card class="submit-form">
        <template #header>
          <div class="card-header">
            <span>提交内容</span>
          </div>
        </template>
        
        <el-form label-position="top">
          <el-form-item label="实验报告内容">
            <el-input
              v-model="formData.content"
              type="textarea"
              :rows="10"
              placeholder="请输入实验报告内容..."
            />
          </el-form-item>
          
          <el-form-item label="上传附件">
            <el-upload
              action="/api/upload"
              :on-success="handleFileSuccess"
              :on-remove="handleFileRemove"
              :file-list="formData.attachments"
              multiple
            >
              <el-button type="primary">选择文件</el-button>
              <template #tip>
                <div class="el-upload__tip">
                  支持任意类型文件，单个文件不超过50MB
                </div>
              </template>
            </el-upload>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" :loading="submitting" @click="handleSubmit">提交实验</el-button>
            <el-button @click="cancelSubmit">取消</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <el-empty v-else description="未找到实验信息" />
  </div>
</template>

<style scoped>
.experiment-submit {
  padding: 20px;
}

.submit-container {
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
  display: flex;
  gap: 30px;
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

.experiment-requirements {
  line-height: 1.6;
}

.submit-form {
  margin-bottom: 20px;
}
</style> 