import { defineStore } from 'pinia'
import { login, logout, getUserInfo } from '../api/auth'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo')) || null,
    role: localStorage.getItem('role') || '' // 'student' 或 'teacher'
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isStudent: (state) => state.role === 'student',
    isTeacher: (state) => state.role === 'teacher'
  },

  actions: {
    async login(credentials) {
      try {
        // 本地开发模式：当用户名和密码都是123时直接登录
        if (credentials.username === '123' && credentials.password === '123') {
          // 使用前端选择的角色创建模拟用户信息
          const mockUserInfo = {
            user_id: credentials.role === 'student' ? 1 : 2,
            user_type: credentials.role,
            realname: credentials.role === 'student' ? 'jack' : '王老师',
            email: credentials.role === 'student' ? '123@163.com' : 'wang@example.com',
            username: credentials.username
          }

          // 保存用户信息
          this.userInfo = mockUserInfo
          this.role = credentials.role
          this.token = 'mock_token_' + Date.now()

          // 保存到localStorage
          localStorage.setItem('token', this.token)
          localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
          localStorage.setItem('role', this.role)

          ElMessage.success('测试登录成功')
          return { token: this.token }
        }

        // 调用真实的API，只传递username和password
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
            username: credentials.username
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
        throw error
      }
    },

    async fetchUserInfo() {
      // 如果是测试账号或API登录，直接返回已存储的用户信息
      if (this.userInfo) {
        return this.userInfo
      }

      // 如果没有用户信息，尝试从API获取（兼容旧版本）
      try {
        const userInfo = await getUserInfo()
        this.userInfo = {
          user_id: userInfo.user_id || userInfo.id,
          user_type: userInfo.user_type || userInfo.role,
          realname: userInfo.realname || userInfo.name,
          email: userInfo.email,
          username: userInfo.username
        }
        this.role = this.userInfo.user_type

        localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
        localStorage.setItem('role', this.role)

        return this.userInfo
      } catch (error) {
        console.error('Failed to fetch user info:', error)
        throw error
      }
    },

    async logout() {
      // 如果是测试账号，直接清除状态
      if (this.token && this.token.startsWith('mock_token_')) {
        this.resetState()
        ElMessage.success('已退出登录')
        return
      }
      
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