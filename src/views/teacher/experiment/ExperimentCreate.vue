<template>
  <div class="experiment-create">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <h2>创建实验</h2>
        </div>
      </template>
      <el-form :model="experimentForm" :rules="rules" ref="experimentFormRef" label-width="100px" class="experiment-form">
        <el-form-item label="实验名称" prop="experiment_name">
          <el-input v-model="experimentForm.experiment_name" placeholder="请输入实验名称"></el-input>
        </el-form-item>
        <el-form-item label="班级" prop="class_id">
          <el-select v-model="experimentForm.class_id" placeholder="请选择班级" style="width: 100%">
            <el-option label="1班" value="1"></el-option>
            <el-option label="2班" value="2"></el-option>
            <el-option label="3班" value="3"></el-option>
            <el-option label="4班" value="4"></el-option>
            <el-option label="5班" value="5"></el-option>
            <el-option label="6班" value="6"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期" prop="deadline">
          <el-date-picker
            v-model="experimentForm.deadline"
            type="datetime"
            placeholder="选择截止日期"
            style="width: 100%"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="实验介绍" prop="description">
          <el-input
            v-model="experimentForm.description"
            type="textarea"
            rows="4"
            placeholder="请输入实验介绍"
          ></el-input>
        </el-form-item>
        <el-form-item label="实验文件" prop="file">
          <el-upload
            ref="uploadRef"
            :file-list="fileList"
            :auto-upload="false"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :limit="1"
            :on-exceed="handleExceed"
            drag
            class="upload-demo"
          >
            <el-icon class="el-icon--upload"><Upload /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持上传单个文件，文件大小不超过10MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">创建</el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button @click="goBack">返回</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import { publishExperimentWithAttachment } from '@/api/experiment'

const router = useRouter()
const userStore = useUserStore()
const experimentFormRef = ref(null)
const uploadRef = ref(null)
const fileList = ref([])

const experimentForm = reactive({
  experiment_name: '',
  class_id: '',
  deadline: '',
  description: '',
  file: null
})

const rules = {
  experiment_name: [
    { required: true, message: '请输入实验名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  class_id: [
    { required: true, message: '请选择班级', trigger: 'change' }
  ],
  deadline: [
    { required: true, message: '请选择截止日期', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入实验介绍', trigger: 'blur' }
  ],
  file: [
    { required: true, message: '请上传实验文件', trigger: 'change' }
  ]
}

// 文件上传处理
const handleFileChange = (file) => {
  experimentForm.file = file.raw
  // 手动触发验证
  if (experimentFormRef.value) {
    experimentFormRef.value.validateField('file')
  }
}

const handleFileRemove = () => {
  experimentForm.file = null
  fileList.value = []
}

const handleExceed = () => {
  ElMessage.warning('只能上传一个文件')
}

const submitForm = async () => {
  if (!experimentFormRef.value) return

  // 验证文件是否已上传
  if (!experimentForm.file) {
    ElMessage.error('请上传实验文件')
    return
  }

  await experimentFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 构建FormData
        const formData = new FormData()
        formData.append('file', experimentForm.file)
        formData.append('experiment_name', experimentForm.experiment_name)
        formData.append('class_id', experimentForm.class_id)
        formData.append('teacher_id', userStore.userInfo.user_id)
        formData.append('description', experimentForm.description)
        formData.append('deadline', experimentForm.deadline)

        const response = await publishExperimentWithAttachment(formData)

        if (response.code === 200) {
          ElMessage.success('发布实验成功')
          router.push('/teacher/experiment-manage')
        } else {
          ElMessage.error(response.message || '发布实验失败')
        }
      } catch (error) {
        console.error('发布实验失败', error)
        ElMessage.error('发布实验失败，请重试')
      }
    } else {
      return false
    }
  })
}

const resetForm = () => {
  if (experimentFormRef.value) {
    experimentFormRef.value.resetFields()
  }
  fileList.value = []
  experimentForm.file = null
}

const goBack = () => {
  router.push('/teacher/experiment-manage')
}
</script>

<style scoped>
.experiment-create {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.experiment-form {
  margin-top: 20px;
}

.mt-4 {
  margin-top: 1rem;
}

.upload-demo {
  width: 100%;
}

.upload-demo :deep(.el-upload-dragger) {
  width: 100%;
  height: 180px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.3s ease;
}

.upload-demo :deep(.el-upload-dragger:hover) {
  border-color: #409eff;
  background: #f0f9ff;
}

.upload-demo :deep(.el-icon--upload) {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.upload-demo :deep(.el-upload__text) {
  color: #606266;
  font-size: 14px;
}

.upload-demo :deep(.el-upload__text em) {
  color: #409eff;
  font-style: normal;
}

.upload-demo :deep(.el-upload__tip) {
  color: #909399;
  font-size: 12px;
  margin-top: 8px;
}
</style> 