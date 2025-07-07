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
          // 创建模拟的token和用户信息
          const mockToken = 'mock_token_' + Date.now()
          const mockUserInfo = {
            id: 1,
            username: credentials.username,
            name: '测试用户',
            role: credentials.role,
            email: 'test@example.com'
          }
          
          // 保存到store和localStorage
          this.token = mockToken
          this.userInfo = mockUserInfo
          this.role = credentials.role
          
          localStorage.setItem('token', mockToken)
          localStorage.setItem('userInfo', JSON.stringify(mockUserInfo))
          localStorage.setItem('role', credentials.role)
          
          ElMessage.success('测试登录成功')
          return { token: mockToken }
        }
        
        // 如果不是测试账号，则调用真实的API
        const res = await login(credentials)
        this.token = res.token
        localStorage.setItem('token', res.token)
        await this.fetchUserInfo()
        return res
      } catch (error) {
        console.error('Login failed:', error)
        throw error
      }
    },

    async fetchUserInfo() {
      // 如果是测试账号，直接返回localStorage中的用户信息
      if (this.token && this.token.startsWith('mock_token_')) {
        return this.userInfo
      }
      
      try {
        const userInfo = await getUserInfo()
        this.userInfo = userInfo
        this.role = userInfo.role
        
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
        localStorage.setItem('role', userInfo.role)
        
        return userInfo
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