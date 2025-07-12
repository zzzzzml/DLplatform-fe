import request from './index'

// 上传实验压缩包（zip/rar/7z）
export function uploadExperimentFile(formData) {
  return request.post('/api/experiments/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 获取实验上传历史
export function getUploadHistory(experimentId) {
  // 确保experimentId是数字
  const numericExperimentId = parseInt(experimentId)
  if (isNaN(numericExperimentId)) {
    console.error(`getUploadHistory: 实验ID不是有效的数字: ${experimentId}`)
    return Promise.reject(new Error(`实验ID不是有效的数字: ${experimentId}`))
  }
  
  return request.get(`/api/experiments/${numericExperimentId}/uploads`)
}

// 删除上传的文件
export function deleteUploadedFile(uploadId) {
  return request({
    url: `/uploads/${uploadId}`,
    method: 'delete'
  })
}

// 获取文件上传状态
export function getUploadStatus(uploadId) {
  return request({
    url: `/uploads/${uploadId}/status`,
    method: 'get'
  })
}

// 重新上传文件
export function reuploadFile(uploadId, data) {
  return request({
    url: `/uploads/${uploadId}/reupload`,
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
} 