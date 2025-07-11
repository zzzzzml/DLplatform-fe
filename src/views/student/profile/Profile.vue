<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../../stores/user'
import { updateUserInfo, updateUserPassword } from '../../../api/auth'

const userStore = useUserStore()
const loading = ref(false)
const saving = ref(false)
const uploadLoading = ref(false)
const activeTab = ref('profile')
const isEditing = ref(false)

// 表单引用
const profileFormRef = ref(null)
const passwordFormRef = ref(null)

const userForm = reactive({
  name: '',
  email: '',
  phone: '',
  studentId: '',
  className: '',
  avatar: ''
})

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
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
    { required: true, message: '请输入学号', trigger: 'blur' },
    { min: 8, max: 20, message: '学号长度在 8 到 20 个字符', trigger: 'blur' }
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

// 从store加载用户信息到表单
const loadUserInfo = () => {
  loading.value = true
  try {
    const userInfo = userStore.userInfo
    if (userInfo) {
      userForm.name = userInfo.name || ''
      userForm.email = userInfo.email || ''
      userForm.studentId = userInfo.studentId || ''
      userForm.className = userInfo.className || ''
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
        const data = {
          real_name: userForm.name,
          email: userForm.email,
          student_id: userForm.studentId,
          class_id: userForm.className,
        }
        const res = await updateUserInfo(data)
        if (res.code === 200) {
          ElMessage.success(res.message || '个人信息更新成功')
          // 重新获取最新的用户信息到store
          await userStore.fetchUserInfo()
          // 从store重新加载到表单
          loadUserInfo()
          isEditing.value = false
        } else {
          ElMessage.error(res.message || '个人信息更新失败')
        }
      } catch (error) {
        console.error('Failed to update user info:', error)
        ElMessage.error('个人信息更新失败，请重试')
      } finally {
        saving.value = false
      }
    } else {
      return false
    }
  })
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

onMounted(() => {
  loadUserInfo()
})
</script>

<template>
  <div class="profile-container">
    <div class="page-header">
      <h2>个人资料</h2>
    </div>

    <el-card v-loading="loading">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="个人信息" name="profile">
          <div class="profile-content">
            <el-row :gutter="20">
              <el-col :span="18">
                <div class="profile-actions">
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
                  <el-descriptions-item label="学号">{{ userForm.studentId }}</el-descriptions-item>
                  <el-descriptions-item label="班级">{{ userForm.className }}</el-descriptions-item>
                  <el-descriptions-item label="邮箱">{{ userForm.email }}</el-descriptions-item>
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
                  <el-form-item label="学号" prop="studentId">
                    <el-input v-model="userForm.studentId" placeholder="请输入学号" />
                  </el-form-item>
                  <el-form-item label="班级">
                    <el-input v-model="userForm.className" disabled />
                  </el-form-item>
                  <el-form-item label="邮箱" prop="email">
                    <el-input v-model="userForm.email" placeholder="请输入邮箱" />
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

.profile-content {
  padding: 20px 0;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.avatar-uploader {
  margin-top: 15px;
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