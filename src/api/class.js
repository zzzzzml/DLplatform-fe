import request from './index'

// 获取所有班级
export function getClasses(params) {
  return request({
    url: '/classes',
    method: 'get',
    params
  })
}

// 获取班级详情
export function getClassById(id) {
  return request({
    url: `/classes/${id}`,
    method: 'get'
  })
}

// 创建班级
export function createClass(data) {
  // 确保参数格式正确
  const requestData = {
    class_name: data.class_name
  }
  
  return request({
    url: '/classes',
    method: 'post',
    data: requestData
  })
}

// 更新班级
export function updateClass(id, data) {
  // 确保参数格式正确
  const requestData = {
    class_name: data.class_name
  }
  
  return request({
    url: `/classes/${id}`,
    method: 'put',
    data: requestData
  })
}

// 删除班级
export function deleteClass(id) {
  return request({
    url: `/classes/${id}`,
    method: 'delete'
  })
}

// 获取班级学生列表
export function getClassStudents(id) {
  return request({
    url: `/classes/${id}/students`,
    method: 'get'
  })
}

// 添加学生到班级
export function addStudentToClass(classId, data) {
  return request({
    url: `/classes/${classId}/students`,
    method: 'post',
    data
  })
}

// 从班级移除学生
export function removeStudentFromClass(classId, studentId) {
  return request({
    url: `/classes/${classId}/students/${studentId}`,
    method: 'delete'
  })
}

// 获取课程列表
export function getCourses(params) {
  return request({
    url: '/courses',
    method: 'get',
    params
  })
}

// 获取课程详情
export function getCourseById(id) {
  return request({
    url: `/courses/${id}`,
    method: 'get'
  })
}

// 创建课程
export function createCourse(data) {
  return request({
    url: '/courses',
    method: 'post',
    data
  })
}

// 更新课程
export function updateCourse(id, data) {
  return request({
    url: `/courses/${id}`,
    method: 'put',
    data
  })
}

// 删除课程
export function deleteCourse(id) {
  return request({
    url: `/courses/${id}`,
    method: 'delete'
  })
}

// 获取班级列表（兼容性导出）
export const getClassList = getClasses 