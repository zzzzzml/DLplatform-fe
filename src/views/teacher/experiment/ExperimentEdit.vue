<template>
  <div class="experiment-edit">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <h2>编辑实验</h2>
        </div>
      </template>
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>
      <el-form v-else :model="experimentForm" :rules="rules" ref="experimentFormRef" label-width="100px" class="experiment-form">
        <el-form-item label="实验名称" prop="experiment_name">
          <el-input v-model="experimentForm.experiment_name" placeholder="请输入实验名称"></el-input>
        </el-form-item>
        <el-form-item label="班级" prop="class_id">
          <el-select v-model="experimentForm.class_id" placeholder="请选择班级" style="width: 100%">
            <el-option
              v-for="item in classes"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期" prop="deadline">
          <el-date-picker
            v-model="experimentForm.deadline"
            type="datetime"
            placeholder="选择截止日期"
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="实验介绍" prop="description">
          <el-input
            v-model="experimentForm.description"
            type="textarea"
            rows="6"
            placeholder="请输入实验介绍和要求"
          ></el-input>
        </el-form-item>
        
        <!-- 附件显示和上传区域 -->
        <el-form-item label="实验附件">
          <div v-if="attachments.length > 0" class="attachment-list">
            <div v-for="attachment in attachments" :key="attachment.attachment_id" class="attachment-item">
              <div class="attachment-info">
                <el-icon><Document /></el-icon>
                <div class="file-details">
                  <div class="file-name">{{ attachment.file_name }}</div>
                  <div class="file-meta">{{ formatFileSize(attachment.file_size) }}</div>
                </div>
              </div>
              <div class="attachment-actions">
                <el-button type="primary" size="small" @click="downloadFile(attachment)">下载</el-button>
              </div>
            </div>
          </div>
          <div v-else class="no-attachments">
            暂无附件
          </div>
          
          <el-upload
            class="upload-demo"
            drag
            :action="uploadUrl"
            :headers="uploadHeaders"
            :data="uploadData"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            :limit="5"
            :with-credentials="false"
            :http-request="customUploadRequest"
            multiple
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              拖拽文件到此处或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持上传任意类型文件，单个文件不超过50MB。上传的新附件将覆盖原有附件。
              </div>
            </template>
          </el-upload>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="submitting">保存</el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button @click="goBack">返回</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTeacherExperimentDetail, updateExperiment, downloadAttachment } from '@/api/experiment'
import { getCourses, getClasses } from '@/api/class'
import { Document, UploadFilled } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const experimentId = route.params.id
const experimentFormRef = ref(null)
const courses = ref([])
const classes = ref([])
const loading = ref(true)
const submitting = ref(false)
const attachments = ref([])

const experimentForm = reactive({
  experiment_name: '',
  class_id: '',
  description: '',
  deadline: ''
})

// 上传相关配置
const uploadUrl = computed(() => {
  // 获取API基础URL
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  return `${baseURL}/teacher/experiment/attachment/upload`;
})

const uploadHeaders = computed(() => {
  // 获取认证信息
  const token = localStorage.getItem('token');
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  
  const headers = {
    'Authorization': token ? `Bearer ${token}` : ''
  };
  
  // 添加用户ID和类型，兼容后端验证
  if (userInfo && userInfo.user_id) {
    headers['User-ID'] = userInfo.user_id.toString();
    if (userInfo.user_type) {
      headers['User-Type'] = userInfo.user_type;
    }
  }
  
  return headers;
})

const uploadData = computed(() => {
  return {
    experiment_id: experimentId
  };
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
  ]
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 下载附件
const downloadFile = async (attachment) => {
  try {
    const response = await downloadAttachment(attachment.attachment_id);
    
    // 检查响应类型
    if (response instanceof Blob) {
      // 如果已经是Blob，直接使用
      const blob = response;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      ElMessage.success('文件下载成功');
    } else if (response.code === 200 && response.data) {
      // 如果是JSON响应，可能包含文件数据
      ElMessage.error('下载失败：服务器返回了非文件数据');
      console.error('下载失败：', response);
    } else {
      ElMessage.error(response.message || '文件下载失败');
    }
  } catch (error) {
    console.error('Download failed:', error);
    ElMessage.error('文件下载失败');
  }
}

// 上传前检查
const beforeUpload = (file) => {
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过50MB');
    return false;
  }
  return true;
}

// 上传成功回调
const handleUploadSuccess = (response, file, fileList) => {
  if (response.code === 200) {
    if (response.message === '附件更新成功') {
      ElMessage.success('附件更新成功');
      // 更新已存在的附件
      if (response.data && response.data.attachment) {
        const index = attachments.value.findIndex(item => 
          item.file_name === response.data.attachment.file_name);
        if (index !== -1) {
          attachments.value[index] = response.data.attachment;
        } else {
          attachments.value.push(response.data.attachment);
        }
      }
    } else {
      ElMessage.success('附件上传成功');
      // 添加新上传的附件到列表
      if (response.data && response.data.attachment) {
        attachments.value.push(response.data.attachment);
      }
    }
  } else {
    ElMessage.error(response.message || '上传失败');
  }
}

// 上传失败回调
const handleUploadError = (error, file, fileList) => {
  console.error('上传失败:', error);
  ElMessage.error('附件上传失败，请重试');
}

// 自定义上传请求
const customUploadRequest = (options) => {
  const { action, file, headers, data, onSuccess, onError, onProgress } = options;
  
  // 创建FormData对象
  const formData = new FormData();
  formData.append('file', file);
  
  // 添加其他数据
  if (data) {
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
  }
  
  // 获取用户信息
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const token = localStorage.getItem('token');
  
  // 创建请求头
  const requestHeaders = {
    ...headers,
    'User-ID': userInfo.user_id || '',
    'User-Type': userInfo.user_type || 'teacher',
    'Authorization': token ? `Bearer ${token}` : ''
  };
  
  console.log('自定义上传请求:', {
    url: action,
    headers: requestHeaders,
    formData: Object.fromEntries(formData.entries())
  });
  
  // 发送请求
  fetch(action, {
    method: 'POST',
    headers: requestHeaders,
    body: formData
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(result => {
    console.log('上传成功:', result);
    onSuccess(result);
  })
  .catch(error => {
    console.error('上传失败:', error);
    onError(error);
  });
}

onMounted(async () => {
  try {
    loading.value = true;
    
    // 获取班级信息
    const classesData = await getClasses();
    if (classesData && classesData.code === 200) {
      classes.value = classesData.data.map(item => ({
        id: item.class_id,
        name: item.class_name
      }));
    } else {
      classes.value = [];
      console.error('获取班级列表失败:', classesData);
    }
    
    // 获取课程信息
    try {
      const coursesData = await getCourses();
      courses.value = coursesData.map(course => ({
        id: course.id,
        name: course.name
      }));
    } catch (error) {
      console.error('获取课程列表失败:', error);
      courses.value = [];
    }

    // 获取实验详情
    await fetchExperimentDetail();
  } catch (error) {
    console.error('初始化数据失败:', error);
    ElMessage.error('初始化数据失败，请刷新重试');
  } finally {
    loading.value = false;
  }
});

// 获取实验详情
const fetchExperimentDetail = async () => {
  try {
    const response = await getTeacherExperimentDetail(experimentId);
    if (response && response.code === 200 && response.data) {
      const experimentData = response.data.experiment;
      
      // 填充表单数据
      experimentForm.experiment_name = experimentData.experiment_name || '';
      experimentForm.class_id = experimentData.class_id || '';
      experimentForm.description = experimentData.description || '';
      
      // 处理日期
      if (experimentData.deadline) {
        experimentForm.deadline = new Date(experimentData.deadline);
      }
      
      // 获取附件列表
      attachments.value = response.data.attachments || [];
      
      console.log('实验详情数据:', experimentData);
      console.log('附件列表:', attachments.value);
    } else {
      ElMessage.error('获取实验详情失败');
      console.error('获取实验详情失败:', response);
    }
  } catch (error) {
    console.error('获取实验详情失败:', error);
    ElMessage.error('获取实验详情失败');
  }
};

const submitForm = async () => {
  if (!experimentFormRef.value) return;
  
  await experimentFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        submitting.value = true;
        
        // 准备提交数据
        const submitData = {
          experiment_name: experimentForm.experiment_name,
          class_id: experimentForm.class_id,
          description: experimentForm.description,
          deadline: experimentForm.deadline instanceof Date 
            ? experimentForm.deadline.toISOString() 
            : experimentForm.deadline
        };
        
        // 调用更新API
        const response = await updateExperiment(experimentId, submitData);
        
        if (response && response.code === 200) {
          ElMessage.success('更新实验成功');
          router.push('/teacher/experiment-manage');
        } else {
          ElMessage.error(response?.message || '更新实验失败');
        }
      } catch (error) {
        console.error('更新实验失败:', error);
        ElMessage.error('更新实验失败，请重试');
      } finally {
        submitting.value = false;
      }
    } else {
      return false;
    }
  });
};

const resetForm = () => {
  if (experimentFormRef.value) {
    experimentFormRef.value.resetFields();
  }
};

const goBack = () => {
  router.push('/teacher/experiment-manage');
};
</script>

<style scoped>
.experiment-edit {
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

.loading-container {
  padding: 20px 0;
}

.experiment-form {
  margin-top: 20px;
}

.attachment-list {
  margin-bottom: 20px;
}

.attachment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.attachment-info {
  display: flex;
  align-items: center;
}

.attachment-info .el-icon {
  font-size: 20px;
  color: #409EFF;
  margin-right: 10px;
}

.file-details {
  display: flex;
  flex-direction: column;
}

.file-name {
  font-weight: 500;
  color: #303133;
}

.file-meta {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.attachment-actions {
  display: flex;
  gap: 8px;
}

.no-attachments {
  color: #909399;
  font-style: italic;
  margin-bottom: 15px;
}

.upload-demo {
  width: 100%;
}

.upload-demo :deep(.el-upload-dragger) {
  width: 100%;
  height: 180px;
}

.el-upload__tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}
</style> 