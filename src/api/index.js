import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const instance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  // 允许跨域请求携带凭证
  withCredentials: false
})

// 请求拦截器
instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    
    console.log('请求拦截器中的用户信息:', userInfo)
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 同时传递用户ID和用户类型，兼容后端旧版本
    if (userInfo && userInfo.user_id) {
      config.headers['User-ID'] = userInfo.user_id.toString()
      
      // 添加用户类型到请求头，帮助后端识别用户角色
      if (userInfo.user_type) {
        config.headers['User-Type'] = userInfo.user_type
        console.log(`设置User-Type请求头: ${userInfo.user_type}`)
      }
    }
    
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  response => {
    // 如果是二进制数据（如文件下载），直接返回响应数据
    if (response.config.responseType === 'blob') {
      return response.data
    }
    return response.data
  },
  error => {
    if (error.response && error.response.status === 401) {
      // 未授权，跳转到登录页
      localStorage.removeItem('token')
      window.location.href = '/'
    }
    // 添加更多的错误信息
    console.error('API请求错误:', error.config?.url, error.message, error.response?.status)
    return Promise.reject(error)
  }
)

export default instance 