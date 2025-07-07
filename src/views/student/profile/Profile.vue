<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '../../../stores/user'
import { updateUserInfo } from '../../../api/auth'

const userStore = useUserStore()
const loading = ref(false)
const saving = ref(false)

const userForm = reactive({
  name: '',
  email: '',
  phone: '',
  studentId: '',
  className: '',
  avatar: ''
})

// 加载用户信息
const loadUserInfo = () => {
  const userInfo = userStore.userInfo
  if (userInfo) {
    userForm.name = userInfo.name || ''
    userForm.email = userInfo.email || ''
    userForm.phone = userInfo.phone || ''
    userForm.studentId = userInfo.studentId || ''
    userForm.className = userInfo.className || ''
    userForm.avatar = userInfo.avatar || ''
  }
}

// 保存用户信息
const saveUserInfo = async () => {
  saving.value = true
  try {
    await updateUserInfo(userForm)
    await userStore.fetchUserInfo() // 重新获取最新的用户信息
    ElMessage.success('个人信息更新成功')
  } catch (error) {
    console.error('Failed to update user info:', error)
    ElMessage.error('个人信息更新失败')
  } finally {
    saving.value = false
  }
}

// 处理头像上传成功
const handleAvatarSuccess = (response) => {
  userForm.avatar = response.url
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

    <el-card>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="avatar-container">
            <el-avatar 
              :size="150" 
              :src="userForm.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
            />
            <el-upload
              class="avatar-uploader"
              action="/api/upload"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
            >
              <el-button size="small" type="primary">更换头像</el-button>
            </el-upload>
          </div>
        </el-col>
        <el-col :span="18">
          <el-form 
            :model="userForm"
            label-width="100px"
            class="profile-form"
          >
            <el-form-item label="姓名">
              <el-input v-model="userForm.name" />
            </el-form-item>
            <el-form-item label="学号">
              <el-input v-model="userForm.studentId" />
            </el-form-item>
            <el-form-item label="班级">
              <el-input v-model="userForm.className" disabled />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="userForm.email" />
            </el-form-item>
            <el-form-item label="手机">
              <el-input v-model="userForm.phone" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving" @click="saveUserInfo">保存</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="password-card">
      <template #header>
        <div class="card-header">
          <span>修改密码</span>
        </div>
      </template>
      <el-form label-width="100px">
        <el-form-item label="当前密码">
          <el-input type="password" />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input type="password" />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input type="password" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary">修改密码</el-button>
        </el-form-item>
      </el-form>
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

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.avatar-uploader {
  margin-top: 15px;
}

.profile-form {
  padding: 20px 0;
}

.password-card {
  margin-top: 30px;
}

.card-header {
  font-weight: bold;
}
</style> 