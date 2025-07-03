<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '../../api/auth'
import { ElMessage } from 'element-plus'
import { User, Lock, Message, UserFilled, Reading, ArrowLeft } from '@element-plus/icons-vue'
import 'animate.css'

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
const showForm = ref(false)

// 动画控制
onMounted(() => {
  setTimeout(() => {
    showForm.value = true
  }, 300)
})

const handleRegister = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
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
    <!-- 动态背景 -->
    <div class="background-animation">
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
        <div class="shape shape-5"></div>
        <div class="shape shape-6"></div>
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
            <h1 class="brand-title">加入我们</h1>
            <p class="brand-subtitle">开启您的深度学习之旅</p>
          </div>

          <div class="benefits">
            <div class="benefit-item">
              <div class="benefit-icon">
                <el-icon><UserFilled /></el-icon>
              </div>
              <div class="benefit-content">
                <h3>个性化学习</h3>
                <p>根据您的学习进度和能力，提供定制化的学习路径</p>
              </div>
            </div>

            <div class="benefit-item">
              <div class="benefit-icon">
                <el-icon><Reading /></el-icon>
              </div>
              <div class="benefit-content">
                <h3>实践导向</h3>
                <p>通过真实项目和实验，掌握深度学习核心技能</p>
              </div>
            </div>

            <div class="benefit-item">
              <div class="benefit-icon">
                <el-icon><User /></el-icon>
              </div>
              <div class="benefit-content">
                <h3>专业指导</h3>
                <p>经验丰富的导师团队，为您提供专业的学习指导</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧注册表单 -->
      <div class="register-panel" :class="{ 'show': showForm }">
        <div class="register-box animate__animated animate__fadeInRight">
          <!-- 返回按钮 -->
          <div class="back-button" @click="goToLogin">
            <el-icon><ArrowLeft /></el-icon>
            <span>返回登录</span>
          </div>

          <div class="form-header">
            <h2 class="form-title">创建账户</h2>
            <p class="form-subtitle">填写信息完成注册</p>
          </div>

          <el-form
            ref="formRef"
            :model="registerForm"
            :rules="rules"
            class="register-form"
            @keyup.enter="handleRegister"
          >
            <div class="form-row">
              <el-form-item prop="username" class="form-item">
                <el-input
                  v-model="registerForm.username"
                  placeholder="用户名"
                  size="large"
                  :prefix-icon="User"
                  class="form-input"
                />
              </el-form-item>

              <el-form-item prop="name" class="form-item">
                <el-input
                  v-model="registerForm.name"
                  placeholder="真实姓名"
                  size="large"
                  :prefix-icon="UserFilled"
                  class="form-input"
                />
              </el-form-item>
            </div>

            <el-form-item prop="email">
              <el-input
                v-model="registerForm.email"
                placeholder="邮箱地址"
                size="large"
                :prefix-icon="Message"
                class="form-input"
              />
            </el-form-item>

            <div class="form-row">
              <el-form-item prop="password" class="form-item">
                <el-input
                  v-model="registerForm.password"
                  type="password"
                  placeholder="密码"
                  size="large"
                  :prefix-icon="Lock"
                  show-password
                  class="form-input"
                />
              </el-form-item>

              <el-form-item prop="confirmPassword" class="form-item">
                <el-input
                  v-model="registerForm.confirmPassword"
                  type="password"
                  placeholder="确认密码"
                  size="large"
                  :prefix-icon="Lock"
                  show-password
                  class="form-input"
                />
              </el-form-item>
            </div>

            <el-form-item prop="role">
              <div class="role-selector">
                <div class="role-title">选择身份</div>
                <el-radio-group v-model="registerForm.role" class="role-group">
                  <el-radio-button label="student">学生</el-radio-button>
                  <el-radio-button label="teacher">教师</el-radio-button>
                </el-radio-group>
              </div>
            </el-form-item>

            <el-button
              type="primary"
              :loading="loading"
              @click="handleRegister"
              class="register-button"
              size="large"
            >
              <span v-if="!loading">立即注册</span>
              <span v-else>注册中...</span>
            </el-button>

            <div class="form-footer">
              <span class="login-text">已有账户？</span>
              <el-button type="text" @click="goToLogin" class="login-link">
                立即登录
              </el-button>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 主容器 */
.register-container {
  height: 100vh;
  width: 100vw;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
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
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  animation: float 8s ease-in-out infinite;
}

.shape-1 {
  width: 100px;
  height: 100px;
  top: 15%;
  left: 15%;
  animation-delay: 0s;
}

.shape-2 {
  width: 80px;
  height: 80px;
  top: 70%;
  left: 85%;
  animation-delay: 2s;
}

.shape-3 {
  width: 120px;
  height: 120px;
  top: 85%;
  left: 10%;
  animation-delay: 4s;
}

.shape-4 {
  width: 60px;
  height: 60px;
  top: 5%;
  left: 75%;
  animation-delay: 1s;
}

.shape-5 {
  width: 90px;
  height: 90px;
  top: 45%;
  left: 5%;
  animation-delay: 3s;
}

.shape-6 {
  width: 110px;
  height: 110px;
  top: 25%;
  left: 90%;
  animation-delay: 5s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-30px) rotate(180deg);
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
  max-width: 1400px;
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

.benefits {
  margin-top: 2rem;
}

.benefit-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.benefit-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  font-size: 1.5rem;
}

.benefit-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.benefit-content p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
  line-height: 1.5;
}

/* 右侧注册面板 */
.register-panel {
  flex: 0 0 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translateX(50px);
  transition: all 0.6s ease;
}

.register-panel.show {
  opacity: 1;
  transform: translateX(0);
}

.register-box {
  width: 100%;
  max-width: 480px;
  padding: 2.5rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
}

.back-button {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  padding: 0.5rem;
  border-radius: 8px;
}

.back-button:hover {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.form-header {
  text-align: center;
  margin: 2rem 0 2rem 0;
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

.register-form {
  margin-top: 1.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-item {
  flex: 1;
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
  background: linear-gradient(135deg, #764ba2, #667eea);
  border-color: #667eea;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.register-button {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #764ba2, #667eea);
  border: none;
  font-size: 1rem;
  font-weight: 600;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

.register-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(118, 75, 162, 0.4);
}

.form-footer {
  text-align: center;
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.login-text {
  color: #666;
  font-size: 0.9rem;
}

.login-link {
  color: #667eea;
  font-weight: 600;
  padding: 0;
  font-size: 0.9rem;
}

.login-link:hover {
  color: #764ba2;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .content-wrapper {
    flex-direction: column;
    padding: 1rem;
  }

  .info-panel {
    display: none;
  }

  .register-panel {
    flex: 1;
    width: 100%;
  }

  .register-box {
    padding: 2rem 1.5rem;
  }
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .register-box {
    padding: 1.5rem 1rem;
  }

  .brand-title {
    font-size: 2rem;
  }
}
</style>