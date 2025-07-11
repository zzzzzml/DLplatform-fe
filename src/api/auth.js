import request from './index'

// 用户登录
export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

// 用户注册
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
    url: '/profile/update',
    method: 'post',
    data
  })
}

// 更新用户资料（兼容性别名）
export const updateUserProfile = updateUserInfo

// 更新用户密码
export function updateUserPassword(data) {
  return request({
    url: '/auth/change-password',
    method: 'post',
    data
  })
}

// 用户登出
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}
