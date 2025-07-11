import request from './index'

// 登录
export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

// 注册
export function register(data) {
  return request({
    url: '/register',
    method: 'post',
    data
  })
}

// 获取用户信息
export function getUserInfo() {
  return request({
    url: '/auth/user-info',
    method: 'get'
  })
}

// 更新用户信息
export function updateUserInfo(data) {
  return request({
    url: '/auth/user-info',
    method: 'put',
    data
  })
}

// 更新用户资料（兼容性别名）
export const updateUserProfile = updateUserInfo

// 更新用户密码
export function updateUserPassword(data) {
  return request({
    url: '/auth/change-password',
    method: 'put',
    data
  })
}

// 登出
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}