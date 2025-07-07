import request from './index'

// 上传实验文件
export function uploadExperimentFile(data) {
  return request({
    url: '/experiments/upload',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取上传历史
export function getUploadHistory(experimentId) {
  return request({
    url: `/experiments/${experimentId}/uploads`,
    method: 'get'
  })
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