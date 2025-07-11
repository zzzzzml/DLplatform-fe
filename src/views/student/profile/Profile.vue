<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../../stores/user'
import { updateUserInfo, updateUserPassword } from '../../../api/auth'
import { getClasses } from '../../../api/class'
import { useRoute, useRouter } from 'vue-router'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const loading = ref(false)
const saving = ref(false)
const classesLoading = ref(false)
const activeTab = ref('profile')
const isEditing = ref(false)
const classes = ref([]) // 班级列表

// 表单引用
const profileFormRef = ref(null)
const passwordFormRef = ref(null)

// 用户表单
const userForm = reactive({
  name: '',
  email: '',
  studentId: '',
  classId: null
})

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 计算属性：是否为学生用户
const isStudent = computed(() => {
  return userStore.role === 'student'
})

// 计算属性：是否为教师用户
const isTeacher = computed(() => {
  return userStore.role === 'teacher'
})

// 计算属性：是否为首次登录（未完成资料）
const isFirstLogin = computed(() => {
  return userStore.userInfo && !userStore.userInfo.profile_completed
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  studentId: [
    { required: isStudent, message: '请输入学号', trigger: 'blur' },
    { min: 8, max: 20, message: '学号长度在 8 到 20 个字符', trigger: 'blur' }
  ],
  classId: [
    { required: isStudent, message: '请选择班级', trigger: 'change' }
  ]
}

// 密码验证规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 获取班级列表
const fetchClasses = async () => {
  if (!isStudent.value) return // 教师不需要获取班级列表
  
  classesLoading.value = true
  try {
    const res = await getClasses()
    if (res.data) {
      classes.value = res.data
    } else {
      classes.value = []
    }
  } catch (error) {
    console.error('获取班级列表失败:', error)
    ElMessage.warning('获取班级列表失败，请刷新重试')
    classes.value = []
  } finally {
    classesLoading.value = false
  }
}

// 从store加载用户信息到表单
const loadUserInfo = () => {
  loading.value = true
  try {
    const userInfo = userStore.userInfo
    if (userInfo) {
      userForm.name = userInfo.real_name || userInfo.realname || ''
      userForm.email = userInfo.email || ''
      
      // 只有学生才有学号和班级
      if (isStudent.value) {
        userForm.studentId = userInfo.student_id || ''
        userForm.classId = userInfo.class_id || null
      }
      
      // 如果是首次登录，自动进入编辑模式
      if (isFirstLogin.value) {
        isEditing.value = true
        ElMessage.info('请完善您的个人资料')
      }
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
    ElMessage.error('加载用户信息失败')
  } finally {
    loading.value = false
  }
}

// 进入编辑模式
const enterEditMode = () => {
  isEditing.value = true
}

// 取消编辑
const cancelEdit = () => {
  // 如果是首次登录，不允许取消编辑
  if (isFirstLogin.value) {
    ElMessage.warning('首次登录需要完善个人资料')
    return
  }
  
  // 从store重新加载数据，恢复原始状态
  loadUserInfo()
  isEditing.value = false
  if (profileFormRef.value) {
    profileFormRef.value.clearValidate()
  }
}

// 保存用户信息
const saveUserInfo = async () => {
  if (!profileFormRef.value) return
  
  await profileFormRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        // 构建请求数据
        const data = {
          real_name: userForm.name,
          email: userForm.email
        }
        
        // 学生才能更新学号和班级
        if (isStudent.value) {
          data.student_id = userForm.studentId
          data.class_id = userForm.classId
        }
        
        const res = await updateUserInfo(data)
        
        if (res.code === 200) {
          // 显示成功消息，包括资料完成状态
          if (res.data && res.data.profile_completed) {
            if (res.data.profile_status_changed) {
              ElMessage.success({
                message: '个人资料已完成，现在您可以使用系统的所有功能了！',
                duration: 5000
              })
              
              // 重新获取最新的用户信息到store
              await userStore.fetchUserInfo()
              
              // 如果有重定向路径，完成资料后跳转回去
              const redirectPath = route.query.redirect
              if (redirectPath) {
                setTimeout(() => {
                  router.push(redirectPath)
                }, 1500)
              }
            } else {
              // 重新获取最新的用户信息到store
              await userStore.fetchUserInfo()
              ElMessage.success(res.message || '个人资料更新成功')
            }
          } else {
            // 重新获取最新的用户信息到store
            await userStore.fetchUserInfo()
            ElMessage.warning({
              message: '个人资料已更新，但仍有必填项未完成',
              duration: 3000
            })
          }
          
          // 从store重新加载到表单
          loadUserInfo()
          // 如果不是首次登录，退出编辑模式
          if (!isFirstLogin.value) {
            isEditing.value = false
          }
        } else {
          // 处理各种错误情况
          handleUpdateError(res)
        }
      } catch (error) {
        console.error('更新个人资料失败:', error)
        ElMessage.error('更新个人资料失败，请重试')
      } finally {
        saving.value = false
      }
    } else {
      // 表单验证失败，显示提示
      if (isFirstLogin.value) {
        ElMessage.warning('请完善所有必填项后再保存')
      }
      return false
    }
  })
}

// 处理更新错误
const handleUpdateError = (res) => {
  switch (res.code) {
    case 400:
      ElMessage.error(res.message || '参数错误')
      break
    case 403:
      ElMessage.error(`无权修改字段: ${res.forbidden_fields?.join(', ')}`)
      break
    case 404:
      ElMessage.error(res.message || '班级不存在')
      break
    case 409:
      if (res.conflict_email) {
        ElMessage.error(`邮箱 ${res.conflict_email} 已被使用`)
      } else if (res.conflict_student_id) {
        ElMessage.error(`学号 ${res.conflict_student_id} 已被使用`)
      } else {
        ElMessage.error('数据冲突，请修改后重试')
      }
      break
    case 500:
      ElMessage.error(res.message || '服务器内部错误')
      break
    default:
      ElMessage.error(res.message || '更新失败')
  }
}

// 修改密码
const updatePassword = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const data = {
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        }
        const res = await updateUserPassword(data)
        if (res.code === 200) {
          ElMessage.success('密码修改成功，请重新登录')
          // 清空密码表单
          resetPasswordForm()
          // 登出
          setTimeout(() => {
            userStore.logout()
          }, 1500)
        } else {
          ElMessage.error(res.message || '密码修改失败')
        }
      } catch (error) {
        console.error('修改密码失败:', error)
        ElMessage.error('修改密码失败，请检查当前密码是否正确')
      }
    } else {
      return false
    }
  })
}

// 重置密码表单
const resetPasswordForm = () => {
  if (passwordFormRef.value) {
    passwordFormRef.value.resetFields()
  }
}

onMounted(async () => {
  await fetchClasses() // 获取班级列表
  
  // 先从服务器获取最新的用户信息
  try {
    await userStore.fetchUserInfo()
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
  
  // 然后加载到表单
  loadUserInfo() 
  
  // 检查是否是从路由守卫跳转过来的强制完善资料
  const isRedirected = route.query.first_login === 'true'
  const redirectPath = route.query.redirect
  
  // 如果是首次登录或被重定向，自动进入编辑模式并显示提示
  if (isFirstLogin.value || isRedirected) {
    isEditing.value = true
    
    // 显示不同的提示信息
    if (isRedirected) {
      ElMessage.warning({
        message: '请先完善您的个人资料后才能访问其他页面',
        duration: 5000,
        showClose: true
      })
    } else {
      ElMessage.warning({
        message: '请完善您的个人资料后才能继续使用系统',
        duration: 5000,
        showClose: true
      })
    }
  }
})
</script>

<template>
  <div class="profile-container">
    <div class="page-header">
      <h2>个人资料</h2>
      <div v-if="isFirstLogin" class="first-login-tip">
        <el-alert
          title="首次登录需要完善个人资料"
          type="info"
          :closable="false"
          show-icon
        />
      </div>
    </div>

    <el-card v-loading="loading">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="个人信息" name="profile">
          <div class="profile-content">
            <el-row :gutter="20">
              <el-col :span="18">
                <div class="profile-actions" v-if="!isFirstLogin">
                  <el-button 
                    v-if="!isEditing" 
                    type="primary" 
                    @click="enterEditMode"
                    icon="Edit"
                  >
                    编辑信息
                  </el-button>
                  <div v-if="isEditing">
                    <el-button 
                      type="primary" 
                      :loading="saving" 
                      @click="saveUserInfo"
                      icon="Check"
                    >
                      {{ saving ? '保存中...' : '保存' }}
                    </el-button>
                    <el-button @click="cancelEdit" icon="Close">取消</el-button>
                  </div>
                </div>

                <!-- 查看模式 -->
                <el-descriptions v-if="!isEditing" :column="2" border class="profile-info">
                  <el-descriptions-item label="姓名">{{ userForm.name }}</el-descriptions-item>
                  <el-descriptions-item label="邮箱">{{ userForm.email }}</el-descriptions-item>
                  <template v-if="isStudent">
                    <el-descriptions-item label="学号">{{ userForm.studentId }}</el-descriptions-item>
                    <el-descriptions-item label="班级">
                      {{ classes.find(c => c.class_id === userForm.classId)?.class_name || '未分配' }}
                    </el-descriptions-item>
                  </template>
                </el-descriptions>

                <!-- 编辑模式 -->
                <el-form 
                  v-if="isEditing"
                  ref="profileFormRef"
                  :model="userForm"
                  :rules="rules"
                  label-width="100px"
                  class="profile-form"
                >
                  <el-form-item label="姓名" prop="name">
                    <el-input v-model="userForm.name" placeholder="请输入姓名" />
                  </el-form-item>
                  <el-form-item label="邮箱" prop="email">
                    <el-input v-model="userForm.email" placeholder="请输入邮箱" />
                  </el-form-item>
                  
                  <!-- 学生特有字段 -->
                  <template v-if="isStudent">
                    <el-form-item label="学号" prop="studentId">
                      <el-input v-model="userForm.studentId" placeholder="请输入学号" />
                    </el-form-item>
                    <el-form-item label="班级" prop="classId">
                      <el-select 
                        v-model="userForm.classId" 
                        placeholder="请选择班级"
                        style="width: 100%"
                        :loading="classesLoading"
                      >
                        <el-option
                          v-for="item in classes"
                          :key="item.class_id"
                          :label="item.class_name"
                          :value="item.class_id"
                        />
                      </el-select>
                    </el-form-item>
                  </template>
                  
                  <!-- 保存按钮 -->
                  <el-form-item v-if="isFirstLogin">
                    <el-button 
                      type="primary" 
                      :loading="saving" 
                      @click="saveUserInfo"
                    >
                      {{ saving ? '保存中...' : '保存个人资料' }}
                    </el-button>
                  </el-form-item>
                </el-form>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <el-tab-pane label="修改密码" name="password">
          <div class="password-edit">
            <el-form 
              ref="passwordFormRef"
              :model="passwordForm"
              :rules="passwordRules"
              label-width="100px"
              class="password-form"
            >
              <el-form-item label="当前密码" prop="oldPassword">
                <el-input 
                  v-model="passwordForm.oldPassword" 
                  type="password" 
                  placeholder="请输入当前密码"
                  show-password
                />
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input 
                  v-model="passwordForm.newPassword" 
                  type="password" 
                  placeholder="请输入新密码"
                  show-password
                />
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input 
                  v-model="passwordForm.confirmPassword" 
                  type="password" 
                  placeholder="请再次输入新密码"
                  show-password
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="updatePassword">修改密码</el-button>
                <el-button @click="resetPasswordForm">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style scoped>
.profile-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.first-login-tip {
  margin-top: 10px;
}

.profile-content {
  padding: 20px 0;
}

.profile-actions {
  margin-bottom: 20px;
  text-align: right;
}

.profile-info {
  margin-top: 20px;
}

.profile-form {
  margin-top: 20px;
}

.password-edit {
  margin-top: 20px;
}

.password-form {
  max-width: 500px;
}

.el-card {
  margin-bottom: 20px;
}

.el-descriptions {
  margin-top: 20px;
}

.profile-actions .el-button {
  margin-left: 10px;
}

.profile-actions .el-button:first-child {
  margin-left: 0;
}
</style> 