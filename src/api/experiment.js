import request from './index'

// 获取实验列表
export function getExperiments(params) {
  return request({
    url: '/experiments',
    method: 'get',
    params
  })
}

// 兼容性导出（确保两个名称都可用）
export const getExperimentList = getExperiments

// 获取实验详情
export function getExperimentById(id) {
  return request({
    url: `/experiments/${id}`,
    method: 'get'
  })
}

// 创建实验
export function createExperiment(data) {
  return request({
    url: '/experiments',
    method: 'post',
    data
  })
}

// 更新实验
export function updateExperiment(id, data) {
  return request({
    url: `/experiments/${id}`,
    method: 'put',
    data
  })
}

// 删除实验
export function deleteExperiment(id) {
  return request({
    url: `/experiments/${id}`,
    method: 'delete'
  })
}

// 获取学生实验列表
export function getStudentExperiments(params) {
  return request({
    url: '/student/experiments',
    method: 'get',
    params
  })
}

// 提交实验
export function submitExperiment(id, data) {
  return request({
    url: `/student/experiments/${id}/submit`,
    method: 'post',
    data
  })
}

// 获取提交详情
export function getSubmissionDetail(id) {
  return request({
    url: `/submissions/${id}`,
    method: 'get'
  })
}

// 获取评价列表
export function getEvaluations(params) {
  return request({
    url: '/evaluations',
    method: 'get',
    params
  })
}

// 评价实验提交
export function evaluateSubmission(id, data) {
  return request({
    url: `/submissions/${id}/evaluate`,
    method: 'post',
    data
  })
}

// 获取学生实验结果列表
export function getStudentResults(params) {
  return request({
    url: '/student/results',
    method: 'get',
    params
  })
}

// 教师端API
// 获取教师的实验列表
export function getTeacherExperiments(params) {
  return request({
    url: '/teacher/experiments',
    method: 'get',
    params
  })
}

// 获取待评价的实验提交列表
export function getSubmissionList(params) {
  return request({
    url: '/teacher/submissions',
    method: 'get',
    params
  })
}

// 评价实验
export function evaluateSubmissionTeacher(id, data) {
  return request({
    url: `/teacher/submissions/${id}/evaluate`,
    method: 'post',
    data
  })
}

// 获取实验结果列表
export function getResultList(params) {
  return request({
    url: '/results',
    method: 'get',
    params
  })
}

// 一键下载+评测所有提交
export function downloadAndEvaluateAll(experimentId) {
  return request({
    url: '/test',
    method: 'get',
    params: { experimentId }
  })
} 