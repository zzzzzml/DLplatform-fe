import { defineStore } from 'pinia'
import { login, logout, getUserInfo } from '../api/auth'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo')) || null,
    role: localStorage.getItem('role') || '', // 'student' 或 'teacher'
    lastExperimentInfo: JSON.parse(localStorage.getItem('lastExperimentInfo')) || null // 最近发布的实验信息
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isStudent: (state) => state.role === 'student',
    isTeacher: (state) => state.role === 'teacher'
  },

  actions: {
    async login(credentials) {
      try {
        // 调用API，只传递username和password
        const loginData = {
          username: credentials.username,
          password: credentials.password
        }
        const res = await login(loginData)

        // 处理API响应
        if (res.code === 200) {
          // 保存用户信息
          this.userInfo = {
            user_id: res.data.user_id,
            user_type: res.data.user_type,
            realname: res.data.realname,
            email: res.data.email,
            username: credentials.username,
            profile_completed: res.data.profile_completed || false,
            student_id: res.data.student_id,
            class_id: res.data.class_id
          }
          this.role = res.data.user_type
          this.token = 'api_token_' + Date.now() // 如果API没有返回token，生成一个

          // 保存到localStorage
          localStorage.setItem('token', this.token)
          localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
          localStorage.setItem('role', this.role)

          ElMessage.success(res.message)
          return res
        } else {
          throw new Error(res.message || '登录失败')
        }
      } catch (error) {
        console.error('Login failed:', error)
        ElMessage.error(error.message || '登录失败，请检查用户名和密码')
        throw error
      }
    },

    async fetchUserInfo() {
      // 如果没有用户信息，尝试从API获取（兼容旧版本）
      try {
        const response = await getUserInfo()
        
        // 确保我们正确处理API返回的数据结构
        const userInfo = response.data || response
        
        this.userInfo = {
          user_id: userInfo.user_id || userInfo.id,
          user_type: userInfo.user_type || userInfo.role,
          realname: userInfo.real_name || userInfo.realname || userInfo.name,
          email: userInfo.email,
          username: userInfo.username,
          profile_completed: userInfo.profile_completed || false,
          student_id: userInfo.student_id,
          class_id: userInfo.class_id
        }
        this.role = this.userInfo.user_type

        localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
        localStorage.setItem('role', this.role)

        return this.userInfo
      } catch (error) {
        console.error('获取用户信息失败:', error)
        return null
      }
    },

    async logout() {
      try {
        await logout()
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.resetState()
      }
    },

    resetState() {
      this.token = ''
      this.userInfo = null
      this.role = ''
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('role')
    }
  }
}) 