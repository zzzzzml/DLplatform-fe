<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { ElMessage } from 'element-plus'
import { User, Lock, UserFilled, Reading } from '@element-plus/icons-vue'
import 'animate.css'

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
const showForm = ref(false)

// 动画控制
onMounted(() => {
  setTimeout(() => {
    showForm.value = true
  }, 300)
})

const handleLogin = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        const response = await userStore.login(loginForm)
        console.log('登录成功，角色:', userStore.role, '跳转页面中...')

        ElMessage.success('登录成功！')

        // 登录成功后的处理
        if (response.data && response.data.redirect_url) {
          // 使用原来的路由，忽略后端返回的redirect_url
          router.push(userStore.role === 'student' ? '/student/home' : '/teacher/home')
        } else {
          router.push('/')
        }
      } catch (error) {
        console.error('Login failed:', error)
        ElMessage.error('登录失败，请检查用户名和密码')
      } finally {
        loading.value = false
      }
    }
  })
}

const fillTestAccount = () => {
  loginForm.username = '123'
  loginForm.password = '123'
  loginForm.role = 'student'
  ElMessage.info('已填充测试账号')
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<template>
  <div class="login-container">
    <!-- 动态背景 -->
    <div class="background-animation">
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
        <div class="shape shape-5"></div>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="content-wrapper">
      <!-- 左侧信息面板 -->
      <div class="info-panel animate__animated animate__fadeInLeft">
        <div class="brand-section">
          <div class="logo-container">
            <div class="logo-icon">
              <el-icon size="48"><Reading /></el-icon>
            </div>
            <h1 class="brand-title">神经网络与深度学习实验教学平台</h1>
            <p class="brand-subtitle">Neural Network and Deep Learning Teaching Platform</p>
          </div>

          <div class="features">
            <div class="feature-item">
              <el-icon><UserFilled /></el-icon>
              <span>智能化教学管理</span>
            </div>
            <div class="feature-item">
              <el-icon><Reading /></el-icon>
              <span>实验环境一体化</span>
            </div>
            <div class="feature-item">
              <el-icon><User /></el-icon>
              <span>个性化学习体验</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="login-panel" :class="{ 'show': showForm }">
        <div class="login-box animate__animated animate__fadeInRight">
          <div class="form-header">
            <h2 class="form-title">欢迎回来</h2>
            <p class="form-subtitle">请登录您的账户</p>
          </div>

          <el-form
            ref="formRef"
            :model="loginForm"
            :rules="rules"
            class="login-form"
            @keyup.enter="handleLogin"
          >
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="用户名"
                size="large"
                :prefix-icon="User"
                class="form-input"
              />
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="密码"
                size="large"
                :prefix-icon="Lock"
                show-password
                class="form-input"
              />
            </el-form-item>

            <el-form-item prop="role">
              <div class="role-selector">
                <div class="role-title">选择身份</div>
                <el-radio-group v-model="loginForm.role" class="role-group">
                  <el-radio-button label="student">学生</el-radio-button>
                  <el-radio-button label="teacher">教师</el-radio-button>
                </el-radio-group>
              </div>
            </el-form-item>

            <el-button
              type="primary"
              :loading="loading"
              @click="handleLogin"
              class="login-button"
              size="large"
            >
              <span v-if="!loading">立即登录</span>
              <span v-else>登录中...</span>
            </el-button>

            <div class="form-footer">
              <span class="register-text">还没有账户？</span>
              <el-button type="text" @click="goToRegister" class="register-link">
                立即注册
              </el-button>
            </div>

            <div class="test-account-tip" @click="fillTestAccount">
              <el-icon><User /></el-icon>
              <span>点击使用测试账号 (123/123)</span>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 主容器 */
.login-container {
  height: 100vh;
  width: 100vw;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 动态背景 */
.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.floating-shapes {
  position: relative;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 80px;
  height: 80px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 120px;
  height: 120px;
  top: 60%;
  left: 80%;
  animation-delay: 2s;
}

.shape-3 {
  width: 60px;
  height: 60px;
  top: 80%;
  left: 20%;
  animation-delay: 4s;
}

.shape-4 {
  width: 100px;
  height: 100px;
  top: 10%;
  left: 70%;
  animation-delay: 1s;
}

.shape-5 {
  width: 140px;
  height: 140px;
  top: 40%;
  left: 5%;
  animation-delay: 3s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 1;
  }
}

/* 内容包装器 */
.content-wrapper {
  position: relative;
  z-index: 2;
  height: 100vh;
  display: flex;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* 左侧信息面板 */
.info-panel {
  flex: 1;
  padding: 2rem;
  color: white;
}

.brand-section {
  max-width: 500px;
}

.logo-container {
  margin-bottom: 3rem;
}

.logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  margin-bottom: 1rem;
  backdrop-filter: blur(10px);
}

.brand-title {
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(45deg, #fff, #e0e7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 300;
}

.features {
  margin-top: 2rem;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 1rem;
  opacity: 0.9;
}

.feature-item .el-icon {
  margin-right: 0.75rem;
  font-size: 1.2rem;
}

/* 右侧登录面板 */
.login-panel {
  flex: 0 0 450px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translateX(50px);
  transition: all 0.6s ease;
}

.login-panel.show {
  opacity: 1;
  transform: translateX(0);
}

.login-box {
  width: 100%;
  max-width: 400px;
  padding: 2.5rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.form-subtitle {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}

.login-form {
  margin-top: 1.5rem;
}

.form-input {
  margin-bottom: 1rem;
}

.form-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e1e5e9;
  transition: all 0.3s ease;
}

.form-input :deep(.el-input__wrapper:hover) {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.form-input :deep(.el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.role-selector {
  margin: 1.5rem 0;
}

.role-title {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.75rem;
  font-weight: 500;
}

.role-group {
  width: 100%;
}

.role-group :deep(.el-radio-button) {
  flex: 1;
}

.role-group :deep(.el-radio-button__inner) {
  width: 100%;
  border-radius: 8px;
  border: 1px solid #e1e5e9;
  background: #fff;
  color: #666;
  transition: all 0.3s ease;
}

.role-group :deep(.el-radio-button__inner:hover) {
  border-color: #667eea;
  color: #667eea;
}

.role-group :deep(.el-radio-button.is-active .el-radio-button__inner) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-color: #667eea;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.login-button {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  font-size: 1rem;
  font-weight: 600;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.form-footer {
  text-align: center;
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.register-text {
  color: #666;
  font-size: 0.9rem;
}

.register-link {
  color: #667eea;
  font-weight: 600;
  padding: 0;
  font-size: 0.9rem;
}

.register-link:hover {
  color: #764ba2;
}

.test-account-tip {
  margin-top: 1.5rem;
  text-align: center;
  padding: 0.75rem;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #667eea;
  font-size: 0.85rem;
}

.test-account-tip:hover {
  background: rgba(102, 126, 234, 0.15);
  transform: translateY(-1px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
    padding: 1rem;
  }

  .info-panel {
    display: none;
  }

  .login-panel {
    flex: 1;
    width: 100%;
  }

  .login-box {
    padding: 2rem 1.5rem;
  }

  .brand-title {
    font-size: 2rem;
  }
}
</style>