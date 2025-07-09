<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getExperimentsList } from '../../../api/experiment'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

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

// 查看实验详情
const viewExperiment = (id) => {
  router.push(`/student/experiment-detail/${id}`)
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
  <div class="experiment-list">
    <div class="page-header">
      <h2>实验列表</h2>
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
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            type="primary"
            size="small"
            @click="viewExperiment(row.experiment_id)"
          >
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>


  </div>
</template>

<style scoped>
.experiment-list {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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