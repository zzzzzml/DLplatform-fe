import request from './index'

// 获取实验列表
export function getExperiments(params) {
  return request({
    url: '/experiments',
    method: 'get',
    params
  })
}

// 获取实验列表（新接口）
export function getExperimentsList() {
  return request({
    url: '/experiments/list',
    method: 'get'
  })
}

// 获取实验详情（新接口）
export function getExperimentDetail(experimentId) {
  // 确保experimentId是数字
  const numericExperimentId = parseInt(experimentId)
  if (isNaN(numericExperimentId)) {
    console.error(`getExperimentDetail: 实验ID不是有效的数字: ${experimentId}`)
    return Promise.reject(new Error(`实验ID不是有效的数字: ${experimentId}`))
  }
  
  return request({
    url: '/student/experiment/requirements',
    method: 'get',
    params: {
      experiment_id: numericExperimentId
    }
  })
}

// 获取教师实验详情
export function getTeacherExperimentDetail(experimentId) {
  // 确保experimentId是数字
  const numericExperimentId = parseInt(experimentId)
  if (isNaN(numericExperimentId)) {
    console.error(`getTeacherExperimentDetail: 实验ID不是有效的数字: ${experimentId}`)
    return Promise.reject(new Error(`实验ID不是有效的数字: ${experimentId}`))
  }
  
  return request({
    url: '/teacher/experiment/detail',
    method: 'get',
    params: {
      experiment_id: numericExperimentId
    }
  })
}

// 下载附件
export function downloadAttachment(attachmentId) {
  return request({
    url: `/download/attachment/${attachmentId}`,
    method: 'get',
    responseType: 'blob'
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

// 发布实验（带附件）
export function publishExperimentWithAttachment(formData) {
  return request({
    url: '/teacher/experiment/publish',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 更新实验
export function updateExperiment(id, data) {
  // 确保id是数字
  const numericId = parseInt(id)
  if (isNaN(numericId)) {
    console.error(`updateExperiment: 实验ID不是有效的数字: ${id}`)
    return Promise.reject(new Error(`实验ID不是有效的数字: ${id}`))
  }
  
  console.log('更新实验，参数:', { id: numericId, data })
  
  return request({
    url: '/teacher/experiment/update',
    method: 'post',
    data: {
      experiment_id: numericId,
      ...data
    }
  })
}

// 删除实验
export function deleteExperiment(id) {
  // 确保id是数字
  const numericId = parseInt(id)
  if (isNaN(numericId)) {
    console.error(`deleteExperiment: 实验ID不是有效的数字: ${id}`)
    return Promise.reject(new Error(`实验ID不是有效的数字: ${id}`))
  }
  
  console.log('删除实验，ID:', numericId)
  
  return request({
    url: '/teacher/experiment/delete',
    method: 'post',
    data: {
      experiment_id: numericId
    }
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
  // 如果提供了experiment_id，确保是数字类型
  if (params && params.experiment_id) {
    params.experiment_id = parseInt(params.experiment_id)
    if (isNaN(params.experiment_id)) {
      console.error(`getEvaluations: experiment_id不是有效的数字: ${params.experiment_id}`)
      return Promise.reject(new Error(`实验ID不是有效的数字`))
    }
  }
  
  // 记录请求参数
  console.log('getEvaluations请求参数:', params)
  
  return request({
    url: '/evaluations',
    method: 'get',
    params
  }).then(response => {
    console.log('getEvaluations响应:', response)
    return response
  }).catch(error => {
    console.error('getEvaluations错误:', error)
    return Promise.reject(error)
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
  try {
    return request({
      url: '/teacher/experiments',
      method: 'get',
      params
    })
  } catch (error) {
    console.error('获取教师实验列表失败:', error)
    return Promise.reject(error)
  }
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

// 学生端获取实验排名
export function getExperimentRanking(experimentId, studentId) {
  // 确保experimentId是数字
  const numericExperimentId = parseInt(experimentId)
  if (isNaN(numericExperimentId)) {
    console.error(`getExperimentRanking: 实验ID不是有效的数字: ${experimentId}`)
    return Promise.reject(new Error(`实验ID不是有效的数字: ${experimentId}`))
  }

  const data = { experiment_id: numericExperimentId };
  if (studentId !== undefined) {
    data.student_id = studentId;
  }
  
  console.log('调用实验排名API，参数:', data);
  
  return request({
    url: '/student/experiment/scores',
    method: 'post',
    data
  })
}

// 教师端获取实验排名
export function getTeacherExperimentRanking(experimentId) {
  // 确保experimentId是数字
  const numericExperimentId = parseInt(experimentId)
  if (isNaN(numericExperimentId)) {
    console.error(`getTeacherExperimentRanking: 实验ID不是有效的数字: ${experimentId}`)
    return Promise.reject(new Error(`实验ID不是有效的数字: ${experimentId}`))
  }
  
  console.log('调用教师实验排名API，参数:', { experiment_id: numericExperimentId });
  
  return request({
    url: '/teacher/experiment/scores',
    method: 'post',
    data: {
      experiment_id: numericExperimentId
    }
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

// 一键评测所有提交
export function evaluateAll(experimentId) {
  if (!experimentId) {
    console.error('evaluateAll: 缺少experimentId参数')
    return Promise.reject(new Error('缺少实验ID参数'))
  }
  
  // 确保experimentId是数字类型
  const numericExperimentId = parseInt(experimentId)
  if (isNaN(numericExperimentId)) {
    console.error(`evaluateAll: experimentId不是有效的数字: ${experimentId}`)
    return Promise.reject(new Error(`实验ID不是有效的数字`))
  }
  
  console.log(`开始一键评测，实验ID: ${numericExperimentId}`)
  
  return request({
    url: '/test',
    method: 'get',
    params: { experimentId: numericExperimentId },
    timeout: 60000 // 增加超时时间到60秒，因为评测可能需要较长时间
  }).then(response => {
    console.log('一键评测响应:', response)
    return response
  }).catch(error => {
    console.error('一键评测错误:', error)
    return Promise.reject(error)
  })
}

// 一键查重
export function checkPlagiarism(experimentId) {
  if (!experimentId) {
    console.error('checkPlagiarism: 缺少experimentId参数')
    return Promise.reject(new Error('缺少实验ID参数'))
  }
  
  // 确保experimentId是数字类型
  const numericExperimentId = parseInt(experimentId)
  if (isNaN(numericExperimentId)) {
    console.error(`checkPlagiarism: experimentId不是有效的数字: ${experimentId}`)
    return Promise.reject(new Error(`实验ID不是有效的数字`))
  }
  
  console.log(`开始一键查重，实验ID: ${numericExperimentId}`)
  
  return request({
    url: '/teacher/experiment/check-plagiarism',
    method: 'post',
    data: { experiment_id: numericExperimentId },
    timeout: 60000 // 增加超时时间到60秒，因为查重可能需要较长时间
  }).then(response => {
    console.log('一键查重响应:', response)
    return response
  }).catch(error => {
    console.error('一键查重错误:', error)
    return Promise.reject(error)
  })
}

// 获取教师首页统计数据
export function getTeacherDashboardStats() {
  return request({
    url: '/teacher/dashboard/stats',
    method: 'get'
  })
}

// 获取学生首页统计数据
export function getStudentDashboardStats() {
  return request({
    url: '/student/dashboard/stats',
    method: 'get'
  })
}

// 上传测试数据
export function uploadTestData(formData) {
  return request({
    url: '/teacher/experiment/upload-testdata',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
