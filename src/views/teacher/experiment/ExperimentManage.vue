<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getExperimentsList, deleteExperiment, uploadTestData } from '../../../api/experiment'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { Search, Plus, Upload } from '@element-plus/icons-vue'

const router = useRouter()

const loading = ref(false)
const experiments = ref([])
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const currentTime = ref(Date.now()) // 当前时间戳，用于动态计算状态
const uploadLoading = ref(false)

// 每秒更新当前时间，确保状态实时性
setInterval(() => {
  currentTime.value = Date.now()
}, 1000)

// 计算属性：根据搜索关键词过滤数据
const filteredExperiments = computed(() => {
  if (!searchKeyword.value.trim()) {
    return experiments.value
  } else {
    return experiments.value.filter(exp =>
      exp.experiment_name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }
})

// 计算总条数（用于分页）
const total = computed(() => {
  return experiments.value.length
})

// 获取实验列表
const fetchExperiments = async () => {
  loading.value = true
  try {
    const response = await getExperimentsList()
    if (response.code === 200) {
      experiments.value = response.data || []
    } else {
      ElMessage.error(response.message || '获取实验列表失败')
    }
  } catch (error) {
    console.error('Failed to fetch experiments:', error)
    ElMessage.error('获取实验列表失败')
  } finally {
    loading.value = false
  }
}

// 创建新实验
const createExperiment = () => {
  router.push('/teacher/experiment-create')
}

// 编辑实验
const editExperiment = (id) => {
  router.push(`/teacher/experiment-edit/${id}`)
}

// 删除实验
const handleDelete = async (id) => {
  try {
    // 显示更详细的确认对话框
    await ElMessageBox.confirm(
      '删除实验将同时删除所有相关的文件、提交记录和成绩数据，此操作不可恢复，是否继续？',
      '删除实验确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true,
        customClass: 'delete-confirm-dialog'
      }
    )

    // 显示加载状态
    const loadingInstance = ElLoading.service({
      lock: true,
      text: '正在删除实验数据...',
      background: 'rgba(0, 0, 0, 0.7)'
    })

    try {
      const response = await deleteExperiment(id)
      
      // 关闭加载状态
      loadingInstance.close()
      
      if (response && response.code === 200) {
        ElMessage({
          type: 'success',
          message: '实验删除成功'
        })
        // 重新获取实验列表
        fetchExperiments()
      } else {
        ElMessage({
          type: 'error',
          message: response?.message || '删除失败，请重试'
        })
      }
    } catch (error) {
      // 关闭加载状态
      loadingInstance.close()
      
      console.error('删除实验失败:', error)
      ElMessage({
        type: 'error',
        message: '删除失败: ' + (error.message || '未知错误')
      })
    }
  } catch (error) {
    // 用户取消删除，不需要显示错误信息
    if (error !== 'cancel') {
      console.error('删除对话框错误:', error)
    }
  }
}

// 查看实验详情
const viewExperiment = (id) => {
  router.push(`/teacher/experiment-detail/${id}`)
}

// 查看提交列表
const viewSubmissions = (id) => {
  console.log('查看排名，实验ID:', id);
  router.push(`/teacher/score/${id}`);
}

// 上传测试数据
const handleUploadTestData = async (id, experimentName) => {
  try {
    // 创建文件选择输入框
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.zip'
    
    // 监听文件选择事件
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return
      
      // 检查文件类型
      if (!file.name.toLowerCase().endsWith('.zip')) {
        ElMessage.error('请上传ZIP格式的测试数据文件')
        return
      }
      
      // 显示上传中状态
      uploadLoading.value = true
      const loadingInstance = ElLoading.service({
        lock: true,
        text: '正在上传测试数据...',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      
      try {
        // 创建表单数据
        const formData = new FormData()
        formData.append('file', file)
        formData.append('experiment_id', id)
        
        // 调用上传API
        const response = await uploadTestData(formData)
        
        if (response && response.code === 200) {
          ElMessage.success(`实验"${experimentName}"的测试数据上传成功`)
        } else {
          ElMessage.error(response?.message || '测试数据上传失败')
        }
      } catch (error) {
        console.error('上传测试数据失败:', error)
        ElMessage.error('测试数据上传失败: ' + (error.message || '未知错误'))
      } finally {
        uploadLoading.value = false
        loadingInstance.close()
      }
    }
    
    // 触发文件选择
    input.click()
  } catch (error) {
    console.error('上传测试数据错误:', error)
    ElMessage.error('上传测试数据失败: ' + (error.message || '未知错误'))
  }
}

// 处理分页变化
const handlePageChange = (page) => {
  currentPage.value = page
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1 // 重置到第一页
}

// 获取状态文本
const getStatusText = (row) => {
  const endTime = new Date(row.deadline).getTime()
  const startTime = new Date(row.publish_time || Date.now()).getTime()
  
  if (currentTime.value > endTime) {
    return '已结束'
  } else if (currentTime.value < startTime) {
    return '未开始'
  } else {
    return '进行中'
  }
}

// 获取状态标签类型
const getStatusType = (row) => {
  const endTime = new Date(row.deadline).getTime()
  const startTime = new Date(row.publish_time || Date.now()).getTime()
  
  if (currentTime.value > endTime) {
    return 'info' // 已结束-蓝色
  } else if (currentTime.value < startTime) {
    return 'warning' // 未开始-橙色
  } else {
    return 'success' // 进行中-绿色
  }
}

// 格式化日期时间
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '-'
  const date = new Date(dateTimeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchExperiments()
})
</script>

<template>
  <div class="experiment-manage-container">
    <div class="page-header">
      <h1 class="page-title">实验管理</h1>
      <div class="header-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索实验名称"
          class="search-input"
          @input="handleSearch"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="createExperiment">
          <el-icon><Plus /></el-icon>创建实验
        </el-button>
      </div>
    </div>

    <el-table
      v-loading="loading"
      :data="filteredExperiments"
      border
      style="width: 100%"
    >
      <el-table-column prop="experiment_name" label="实验名称" min-width="300" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row)">
            {{ getStatusText(row) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="deadline" label="截止时间" width="200">
        <template #default="{ row }">
          {{ formatDateTime(row.deadline) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="320" fixed="right">
        <template #default="{ row }">
          <div class="operation-buttons">
            <el-button
              type="success"
              size="small"
              @click="viewExperiment(row.experiment_id)"
            >
              查看详情
            </el-button>
            <el-button
              type="primary"
              size="small"
              @click="editExperiment(row.experiment_id)"
            >
              编辑
            </el-button>
            <el-button
              type="info"
              size="small"
              @click="viewSubmissions(row.experiment_id)"
            >
              查看排名
            </el-button>
            <el-button
              type="warning"
              size="small"
              @click="handleUploadTestData(row.experiment_id, row.experiment_name)"
              :loading="uploadLoading"
            >
              上传测试
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(row.experiment_id)"
            >
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        background
        layout="total, prev, pager, next"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.experiment-manage-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.search-input {
  width: 300px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.operation-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  justify-content: space-around;
}

.operation-buttons .el-button {
  margin: 0;
  flex: 0 0 auto;
}

/* 删除确认对话框样式 */
:deep(.delete-confirm-dialog) {
  .el-message-box__content {
    padding: 20px;
    font-size: 16px;
    line-height: 1.5;
  }
  
  .el-message-box__status {
    font-size: 24px;
  }
  
  .el-message-box__btns {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}
</style>
