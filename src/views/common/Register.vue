<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '../../api/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  name: '',
  email: '',
  role: 'student'
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { 
      required: true, 
      message: '请再次输入密码', 
      trigger: 'blur' 
    },
    { 
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

const formRef = ref(null)
const loading = ref(false)

const handleRegister = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        // 删除确认密码字段，后端不需要
        const { confirmPassword, ...registerData } = registerForm
        await register(registerData)
        ElMessage.success('注册成功，请登录')
        router.push('/')
      } catch (error) {
        console.error('Register failed:', error)
        ElMessage.error('注册失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
  })
}

const goToLogin = () => {
  router.push('/')
}
</script>

<template>
  <div class="register-container">
    <div class="register-box">
      <h2 class="title">用户注册</h2>
      <el-form
        ref="formRef"
        :model="registerForm"
        :rules="rules"
        label-position="top"
        class="register-form"
      >
        <div class="form-row">
          <el-form-item label="用户名" prop="username" class="form-item required-label">
            <el-input 
              v-model="registerForm.username" 
              placeholder="请输入用户名"
            />
          </el-form-item>
          <el-form-item label="姓名" prop="name" class="form-item required-label">
            <el-input 
              v-model="registerForm.name" 
              placeholder="请输入姓名"
            />
          </el-form-item>
        </div>
        
        <el-form-item label="邮箱" prop="email" class="required-label">
          <el-input 
            v-model="registerForm.email" 
            placeholder="请输入邮箱"
          />
        </el-form-item>
        
        <div class="form-row">
          <el-form-item label="密码" prop="password" class="form-item required-label">
            <el-input 
              v-model="registerForm.password" 
              type="password" 
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword" class="form-item required-label">
            <el-input 
              v-model="registerForm.confirmPassword" 
              type="password" 
              placeholder="请再次输入密码"
              show-password
            />
          </el-form-item>
        </div>
        
        <el-form-item label="角色" prop="role" class="required-label">
          <el-radio-group v-model="registerForm.role">
            <el-radio label="student">学生</el-radio>
            <el-radio label="teacher">教师</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <div class="button-container">
          <el-button type="primary" :loading="loading" @click="handleRegister" class="register-button">注册</el-button>
        </div>
        <div class="button-container">
          <el-button @click="goToLogin" class="login-button">返回登录</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.register-box {
  width: 560px;
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

.register-form {
  margin-top: 20px;
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-item {
  flex: 1;
}

.register-form :deep(.el-form-item__label) {
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

.register-button, .login-button {
  width: 100%;
  height: 40px;
  border-radius: 4px;
}

.register-button {
  background-color: #409EFF;
}

.login-button {
  border-color: #dcdfe6;
  color: #606266;
}

@media screen and (max-width: 768px) {
  .register-box {
    width: 90%;
    padding: 30px 20px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style> 