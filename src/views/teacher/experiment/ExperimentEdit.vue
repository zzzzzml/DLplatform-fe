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
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="loading">保存</el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button @click="goBack">返回</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getTeacherExperimentDetail, updateExperiment } from '@/api/experiment'
import { getCourses, getClasses } from '@/api/class'

const route = useRoute()
const router = useRouter()
const experimentId = route.params.id
const experimentFormRef = ref(null)
const courses = ref([])
const classes = ref([])
const loading = ref(true)

const experimentForm = reactive({
  experiment_name: '',
  class_id: '',
  description: '',
  deadline: ''
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
    const response = await getTeacherExperimentDetail(experimentId);
    if (response && response.code === 200 && response.data && response.data.experiment) {
      const experimentData = response.data.experiment;
      
      // 填充表单数据
      experimentForm.experiment_name = experimentData.experiment_name || '';
      experimentForm.class_id = experimentData.class_id || '';
      experimentForm.description = experimentData.description || '';
      
      // 处理日期
      if (experimentData.deadline) {
        experimentForm.deadline = new Date(experimentData.deadline);
      }
      
      console.log('实验详情数据:', experimentData);
    } else {
      ElMessage.error('获取实验详情失败');
      console.error('获取实验详情失败:', response);
    }
  } catch (error) {
    console.error('初始化数据失败:', error);
    ElMessage.error('初始化数据失败，请刷新重试');
  } finally {
    loading.value = false;
  }
});

const submitForm = async () => {
  if (!experimentFormRef.value) return;
  
  await experimentFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true;
        
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
        loading.value = false;
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
</style> 