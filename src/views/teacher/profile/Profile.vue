<template>
  <div class="teacher-profile">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <h2>个人资料</h2>
        </div>
      </template>
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="6" animated />
      </div>
      <div v-else>
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <div class="profile-content">
              <el-descriptions title="教师信息" :column="2" border>
                <el-descriptions-item label="姓名">{{ userInfo.name }}</el-descriptions-item>
                <el-descriptions-item label="工号">{{ userInfo.teacherId }}</el-descriptions-item>
                <el-descriptions-item label="性别">{{ userInfo.gender === 1 ? '男' : userInfo.gender === 2 ? '女' : '未设置' }}</el-descriptions-item>
                <el-descriptions-item label="邮箱">{{ userInfo.email }}</el-descriptions-item>
                <el-descriptions-item label="手机">{{ userInfo.phone || '未设置' }}</el-descriptions-item>
                <el-descriptions-item label="所属院系">{{ userInfo.department || '未设置' }}</el-descriptions-item>
                <el-descriptions-item label="职称">{{ userInfo.title || '未设置' }}</el-descriptions-item>
                <el-descriptions-item label="办公室">{{ userInfo.office || '未设置' }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </el-tab-pane>
          <el-tab-pane label="修改信息" name="edit">
            <div class="profile-edit">
              <el-form 
                :model="profileForm" 
                :rules="rules" 
                ref="profileFormRef" 
                label-width="100px" 
                class="profile-form"
              >
                <el-form-item label="姓名" prop="name">
                  <el-input v-model="profileForm.name" placeholder="请输入姓名"></el-input>
                </el-form-item>
                <el-form-item label="性别" prop="gender">
                  <el-radio-group v-model="profileForm.gender">
                    <el-radio :label="1">男</el-radio>
                    <el-radio :label="2">女</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="profileForm.email" placeholder="请输入邮箱"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="phone">
                  <el-input v-model="profileForm.phone" placeholder="请输入手机号"></el-input>
                </el-form-item>
                <el-form-item label="所属院系" prop="department">
                  <el-input v-model="profileForm.department" placeholder="请输入所属院系"></el-input>
                </el-form-item>
                <el-form-item label="职称" prop="title">
                  <el-input v-model="profileForm.title" placeholder="请输入职称"></el-input>
                </el-form-item>
                <el-form-item label="办公室" prop="office">
                  <el-input v-model="profileForm.office" placeholder="请输入办公室"></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="updateProfile">保存修改</el-button>
                  <el-button @click="resetForm">重置</el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>
          <el-tab-pane label="修改密码" name="password">
            <div class="password-edit">
              <el-form 
                :model="passwordForm" 
                :rules="passwordRules" 
                ref="passwordFormRef" 
                label-width="100px" 
                class="password-form"
              >
                <el-form-item label="当前密码" prop="oldPassword">
                  <el-input 
                    v-model="passwordForm.oldPassword" 
                    type="password" 
                    placeholder="请输入当前密码" 
                    show-password
                  ></el-input>
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                  <el-input 
                    v-model="passwordForm.newPassword" 
                    type="password" 
                    placeholder="请输入新密码" 
                    show-password
                  ></el-input>
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input 
                    v-model="passwordForm.confirmPassword" 
                    type="password" 
                    placeholder="请再次输入新密码" 
                    show-password
                  ></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="updatePassword">修改密码</el-button>
                  <el-button @click="resetPasswordForm">重置</el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserInfo, updateUserProfile, updateUserPassword } from '@/api/auth'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const loading = ref(true)
const activeTab = ref('basic')
const profileFormRef = ref(null)
const passwordFormRef = ref(null)

const userInfo = ref({
  id: '',
  name: '',
  teacherId: '',
  gender: null,
  email: '',
  phone: '',
  department: '',
  title: '',
  office: ''
})

const profileForm = reactive({
  name: '',
  gender: null,
  email: '',
  phone: '',
  department: '',
  title: '',
  office: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

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

onMounted(async () => {
  await fetchUserInfo()
})

// 获取用户信息
const fetchUserInfo = async () => {
  loading.value = true
  try {
    const data = await getUserInfo()
    userInfo.value = data
    
    // 填充表单
    Object.keys(profileForm).forEach(key => {
      profileForm[key] = data[key] || profileForm[key]
    })
    
    loading.value = false
  } catch (error) {
    console.error('获取用户信息失败', error)
    ElMessage.error('获取用户信息失败')
    loading.value = false
  }
}

// 更新个人资料
const updateProfile = async () => {
  if (!profileFormRef.value) return
  
  await profileFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await updateUserProfile(profileForm)
        ElMessage.success('个人资料更新成功')
        // 重新获取用户信息
        await fetchUserInfo()
        // 更新全局用户信息
        userStore.setUserInfo({
          ...userInfo.value
        })
        // 切换到基本信息标签页
        activeTab.value = 'basic'
      } catch (error) {
        console.error('更新个人资料失败', error)
        ElMessage.error('更新个人资料失败，请重试')
      }
    } else {
      return false
    }
  })
}

// 更新密码
const updatePassword = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await updateUserPassword({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })
        ElMessage.success('密码修改成功，请重新登录')
        // 清空密码表单
        resetPasswordForm()
        // 登出
        setTimeout(() => {
          userStore.logout()
        }, 1500)
      } catch (error) {
        console.error('修改密码失败', error)
        ElMessage.error('修改密码失败，请检查当前密码是否正确')
      }
    } else {
      return false
    }
  })
}

// 重置个人资料表单
const resetForm = () => {
  if (profileFormRef.value) {
    // 重置为当前用户信息
    Object.keys(profileForm).forEach(key => {
      profileForm[key] = userInfo.value[key] || profileForm[key]
    })
  }
}

// 重置密码表单
const resetPasswordForm = () => {
  if (passwordFormRef.value) {
    passwordFormRef.value.resetFields()
  }
}
</script>

<style scoped>
.teacher-profile {
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

.profile-content {
  margin-top: 20px;
}

.profile-edit,
.password-edit {
  margin-top: 20px;
}

.profile-form,
.password-form {
  max-width: 500px;
}
</style> 