<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getClassList, createClass, updateClass, deleteClass, getClassStudents, addStudentToClass, removeStudentFromClass } from '../../../api/class'

const classes = ref([])
const currentClass = ref(null)
const students = ref([])
const loading = ref(false)
const studentsLoading = ref(false)
const classFormVisible = ref(false)
const studentFormVisible = ref(false)
const confirmLoading = ref(false)

// 班级表单
const classForm = reactive({
  name: '',
  description: ''
})

// 学生表单
const studentForm = reactive({
  username: ''
})

// 班级表单规则
const classRules = {
  name: [{ required: true, message: '请输入班级名称', trigger: 'blur' }]
}

// 学生表单规则
const studentRules = {
  username: [{ required: true, message: '请输入学生用户名', trigger: 'blur' }]
}

// 表单引用
const classFormRef = ref(null)
const studentFormRef = ref(null)

// 获取班级列表
const fetchClasses = async () => {
  loading.value = true
  try {
    const res = await getClassList()
    classes.value = res.data || []
  } catch (error) {
    console.error('Failed to fetch classes:', error)
    ElMessage.error('获取班级列表失败')
  } finally {
    loading.value = false
  }
}

// 获取班级学生列表
const fetchClassStudents = async (classId) => {
  if (!classId) return
  
  studentsLoading.value = true
  try {
    const res = await getClassStudents(classId)
    students.value = res.data || []
  } catch (error) {
    console.error('Failed to fetch class students:', error)
    ElMessage.error('获取班级学生列表失败')
  } finally {
    studentsLoading.value = false
  }
}

// 选择班级
const handleSelectClass = (classItem) => {
  currentClass.value = classItem
  fetchClassStudents(classItem.id)
}

// 打开创建班级对话框
const openCreateClassDialog = () => {
  classForm.name = ''
  classForm.description = ''
  classFormVisible.value = true
}

// 打开编辑班级对话框
const openEditClassDialog = (classItem) => {
  classForm.name = classItem.name
  classForm.description = classItem.description || ''
  classFormVisible.value = true
}

// 保存班级
const saveClass = async () => {
  if (!classFormRef.value) return
  
  await classFormRef.value.validate(async (valid) => {
    if (valid) {
      confirmLoading.value = true
      try {
        if (currentClass.value && currentClass.value.id) {
          // 更新班级
          await updateClass(currentClass.value.id, classForm)
          ElMessage.success('班级更新成功')
        } else {
          // 创建班级
          await createClass(classForm)
          ElMessage.success('班级创建成功')
        }
        fetchClasses()
        classFormVisible.value = false
      } catch (error) {
        console.error('Failed to save class:', error)
        ElMessage.error(currentClass.value ? '班级更新失败' : '班级创建失败')
      } finally {
        confirmLoading.value = false
      }
    }
  })
}

// 删除班级
const handleDeleteClass = async (classItem) => {
  try {
    await ElMessageBox.confirm(`确定要删除班级 "${classItem.name}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteClass(classItem.id)
    ElMessage.success('班级删除成功')
    fetchClasses()
    if (currentClass.value && currentClass.value.id === classItem.id) {
      currentClass.value = null
      students.value = []
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete failed:', error)
      ElMessage.error('班级删除失败')
    }
  }
}

// 打开添加学生对话框
const openAddStudentDialog = () => {
  studentForm.username = ''
  studentFormVisible.value = true
}

// 添加学生到班级
const addStudent = async () => {
  if (!studentFormRef.value || !currentClass.value) return
  
  await studentFormRef.value.validate(async (valid) => {
    if (valid) {
      confirmLoading.value = true
      try {
        await addStudentToClass(currentClass.value.id, studentForm)
        ElMessage.success('学生添加成功')
        fetchClassStudents(currentClass.value.id)
        studentFormVisible.value = false
      } catch (error) {
        console.error('Failed to add student:', error)
        ElMessage.error('学生添加失败')
      } finally {
        confirmLoading.value = false
      }
    }
  })
}

// 移除学生
const handleRemoveStudent = async (student) => {
  if (!currentClass.value) return
  
  try {
    await ElMessageBox.confirm(`确定要将学生 "${student.name}" 从班级移除吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await removeStudentFromClass(currentClass.value.id, student.id)
    ElMessage.success('学生移除成功')
    fetchClassStudents(currentClass.value.id)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Remove failed:', error)
      ElMessage.error('学生移除失败')
    }
  }
}

onMounted(() => {
  fetchClasses()
})
</script>

<template>
  <div class="class-manage">
    <div class="page-header">
      <h2>班级管理</h2>
    </div>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="class-list" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>班级列表</span>
              <el-button type="primary" size="small" @click="openCreateClassDialog">
                <el-icon><Plus /></el-icon>新建班级
              </el-button>
            </div>
          </template>
          <el-empty v-if="classes.length === 0" description="暂无班级" />
          <el-menu
            v-else
            :default-active="currentClass ? currentClass.id : ''"
            class="class-menu"
          >
            <el-menu-item
              v-for="classItem in classes"
              :key="classItem.id"
              :index="classItem.id"
              @click="handleSelectClass(classItem)"
            >
              <div class="class-item">
                <span>{{ classItem.name }}</span>
                <div class="class-actions">
                  <el-button type="primary" size="small" circle @click.stop="openEditClassDialog(classItem)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button type="danger" size="small" circle @click.stop="handleDeleteClass(classItem)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-col>
      
      <el-col :span="18">
        <el-card class="student-list" v-loading="studentsLoading">
          <template #header>
            <div class="card-header">
              <span>
                {{ currentClass ? `${currentClass.name} - 学生列表` : '学生列表' }}
              </span>
              <el-button
                v-if="currentClass"
                type="primary"
                size="small"
                @click="openAddStudentDialog"
              >
                <el-icon><Plus /></el-icon>添加学生
              </el-button>
            </div>
          </template>
          
          <el-empty
            v-if="!currentClass"
            description="请先选择一个班级"
          />
          <el-empty
            v-else-if="students.length === 0"
            description="班级中暂无学生"
          />
          <el-table
            v-else
            :data="students"
            border
            style="width: 100%"
          >
            <el-table-column prop="name" label="姓名" min-width="120" />
            <el-table-column prop="username" label="用户名" min-width="120" />
            <el-table-column prop="studentId" label="学号" min-width="120" />
            <el-table-column prop="email" label="邮箱" min-width="180" />
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="danger"
                  size="small"
                  @click="handleRemoveStudent(row)"
                >
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 班级表单对话框 -->
    <el-dialog
      :title="currentClass ? '编辑班级' : '新建班级'"
      v-model="classFormVisible"
      width="500px"
    >
      <el-form
        ref="classFormRef"
        :model="classForm"
        :rules="classRules"
        label-width="80px"
      >
        <el-form-item label="班级名称" prop="name">
          <el-input v-model="classForm.name" placeholder="请输入班级名称" />
        </el-form-item>
        <el-form-item label="班级描述">
          <el-input
            v-model="classForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入班级描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="classFormVisible = false">取消</el-button>
        <el-button type="primary" :loading="confirmLoading" @click="saveClass">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 添加学生对话框 -->
    <el-dialog
      title="添加学生"
      v-model="studentFormVisible"
      width="500px"
    >
      <el-form
        ref="studentFormRef"
        :model="studentForm"
        :rules="studentRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="studentForm.username" placeholder="请输入学生用户名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="studentFormVisible = false">取消</el-button>
        <el-button type="primary" :loading="confirmLoading" @click="addStudent">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.class-manage {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.class-menu {
  border-right: none;
}

.class-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.class-actions {
  display: flex;
  gap: 5px;
}

.student-list {
  height: 100%;
}
</style> 