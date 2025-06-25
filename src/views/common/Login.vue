<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const loginForm = reactive({
  username: '',
  password: '',
  role: 'student'
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const formRef = ref(null)
const loading = ref(false)

const handleLogin = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        // 调用登录并等待结果
        const result = await userStore.login(loginForm)
        console.log('登录成功，角色:', userStore.role, '跳转页面中...')
        
        // 确保状态已更新后再进行跳转
        setTimeout(() => {
          // 根据角色跳转到不同的首页
          if (userStore.isTeacher) {
            console.log('跳转到教师首页')
            router.push('/teacher/home')
          } else {
            console.log('跳转到学生首页')
            router.push('/student/home')
          }
        }, 100)
      } catch (error) {
        console.error('Login failed:', error)
        ElMessage.error('登录失败，请检查用户名和密码')
      } finally {
        loading.value = false
      }
    }
  })
}

// 预填充测试账号，方便测试
const fillTestAccount = () => {
  loginForm.username = '123'
  loginForm.password = '123'
  loginForm.role = 'student'
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="title">深度学习教学实验平台</h2>
      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        label-position="top"
        class="login-form"
      >
        <el-form-item label="用户名" prop="username" class="required-label">
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入用户名"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password" class="required-label">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="角色" prop="role" class="required-label">
          <el-radio-group v-model="loginForm.role">
            <el-radio label="student">学生</el-radio>
            <el-radio label="teacher">教师</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <div class="button-container">
          <el-button type="primary" :loading="loading" @click="handleLogin" class="login-button">登录</el-button>
        </div>
        <div class="button-container">
          <el-button @click="goToRegister" class="register-button">注册</el-button>
        </div>
        
        <div class="test-account-tip" @click="fillTestAccount">
          <p>测试账号: 123</p>
          <p>测试密码: 123</p>
          <p class="click-tip">点击此区域自动填充测试账号</p>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.login-box {
  width: 360px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.title {
  text-align: center;
  margin-bottom: 30px;
  color: #409EFF;
  font-size: 24px;
  font-weight: 600;
}

.login-form {
  margin-top: 20px;
}

.login-form :deep(.el-form-item__label) {
  font-weight: 500;
  font-size: 14px;
  color: #606266;
  padding-bottom: 0;
}

.required-label :deep(.el-form-item__label)::before {
  content: "*";
  color: #f56c6c;
  margin-right: 4px;
}

.button-container {
  margin-top: 10px;
  text-align: center;
  width: 100%;
}

.login-button, .register-button {
  width: 100%;
  height: 40px;
  border-radius: 4px;
}

.login-button {
  background-color: #409EFF;
}

.register-button {
  border-color: #dcdfe6;
  color: #606266;
}

.test-account-tip {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #909399;
  line-height: 1.5;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.test-account-tip:hover {
  background-color: #e6f1fc;
}

.click-tip {
  font-size: 12px;
  color: #409EFF;
  margin-top: 5px;
}
</style> 