<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getExperimentsList, deleteExperiment } from '../../../api/experiment'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'

const router = useRouter()

const loading = ref(false)
const experiments = ref([])
const searchKeyword = ref('')
const filteredExperiments = ref([])

// 获取实验列表
const fetchExperiments = async () => {
  loading.value = true
  try {
    const response = await getExperimentsList()
    if (response.code === 200) {
      experiments.value = response.data || []
      filteredExperiments.value = experiments.value
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
    await ElMessageBox.confirm('确定要删除该实验吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteExperiment(id)
    ElMessage.success('删除成功')
    fetchExperiments()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete failed:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 查看实验详情
const viewExperiment = (id) => {
  router.push(`/teacher/experiment-detail/${id}`)
}

// 查看提交列表
const viewSubmissions = (id) => {
  router.push({
    path: '/teacher/evaluation',
    query: { experimentId: id }
  })
}

// 处理搜索
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    filteredExperiments.value = experiments.value
  } else {
    filteredExperiments.value = experiments.value.filter(exp =>
      exp.experiment_name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
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
  <div class="experiment-manage">
    <div class="page-header">
      <h2>实验管理</h2>
      <div class="action-box">
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索实验名称"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
          </el-input>
        </div>
        <el-button type="primary" @click="createExperiment">
          <el-icon><Plus /></el-icon>新建实验
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
      <el-table-column prop="deadline" label="截止时间" width="200">
        <template #default="{ row }">
          {{ formatDateTime(row.deadline) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="320" fixed="right">
        <template #default="{ row }">
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
            查看提交
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="handleDelete(row.experiment_id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>


  </div>
</template>

<style scoped>
.experiment-manage {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.action-box {
  display: flex;
  gap: 15px;
}

.search-box {
  width: 300px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 