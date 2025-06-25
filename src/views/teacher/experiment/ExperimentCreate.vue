<template>
  <div class="experiment-create">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <h2>创建实验</h2>
        </div>
      </template>
      <el-form :model="experimentForm" :rules="rules" ref="experimentFormRef" label-width="100px" class="experiment-form">
        <el-form-item label="实验名称" prop="title">
          <el-input v-model="experimentForm.title" placeholder="请输入实验名称"></el-input>
        </el-form-item>
        <el-form-item label="课程" prop="courseId">
          <el-select v-model="experimentForm.courseId" placeholder="请选择课程" style="width: 100%">
            <el-option
              v-for="item in courses"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="班级" prop="classIds">
          <el-select
            v-model="experimentForm.classIds"
            multiple
            placeholder="请选择班级"
            style="width: 100%"
          >
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
            rows="4"
            placeholder="请输入实验介绍"
          ></el-input>
        </el-form-item>
        <el-form-item label="实验要求" prop="requirements">
          <el-input
            v-model="experimentForm.requirements"
            type="textarea"
            rows="4"
            placeholder="请输入实验要求"
          ></el-input>
        </el-form-item>
        <el-form-item label="参考资料" prop="references">
          <el-input
            v-model="experimentForm.references"
            type="textarea"
            rows="4"
            placeholder="请输入参考资料"
          ></el-input>
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createExperiment } from '@/api/experiment'
import { getCourses } from '@/api/class'

const router = useRouter()
const experimentFormRef = ref(null)
const courses = ref([])
const classes = ref([])

const experimentForm = reactive({
  title: '',
  courseId: '',
  classIds: [],
  deadline: '',
  description: '',
  requirements: '',
  references: ''
})

const rules = {
  title: [
    { required: true, message: '请输入实验名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  courseId: [
    { required: true, message: '请选择课程', trigger: 'change' }
  ],
  classIds: [
    { required: true, message: '请至少选择一个班级', trigger: 'change' }
  ],
  deadline: [
    { required: true, message: '请选择截止日期', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入实验介绍', trigger: 'blur' }
  ],
  requirements: [
    { required: true, message: '请输入实验要求', trigger: 'blur' }
  ]
}

onMounted(async () => {
  try {
    // 获取课程和班级信息
    const coursesData = await getCourses()
    courses.value = coursesData

    // 假设班级数据在课程接口中返回，根据实际情况调整
    // 或者添加独立的获取班级接口
    const classesData = []
    coursesData.forEach(course => {
      if (course.classes && course.classes.length) {
        classesData.push(...course.classes)
      }
    })
    classes.value = classesData
  } catch (error) {
    console.error('获取课程或班级数据失败', error)
    ElMessage.error('获取数据失败，请刷新重试')
  }
})

const submitForm = async () => {
  if (!experimentFormRef.value) return
  
  await experimentFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await createExperiment(experimentForm)
        ElMessage.success('创建实验成功')
        router.push('/teacher/experiment-manage')
      } catch (error) {
        console.error('创建实验失败', error)
        ElMessage.error('创建实验失败，请重试')
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
</style> 