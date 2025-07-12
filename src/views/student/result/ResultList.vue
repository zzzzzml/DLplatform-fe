<script setup>
import { ref, onMounted, computed } from 'vue'
import { getStudentResults } from '../../../api/experiment'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const results = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 计算平均分
const averageScore = computed(() => {
  if (results.value.length === 0) return 0
  const sum = results.value.reduce((acc, item) => acc + item.score, 0)
  return (sum / results.value.length).toFixed(1)
})

// 计算最高分
const maxScore = computed(() => {
  if (results.value.length === 0) return 0
  return Math.max(...results.value.map(item => item.score))
})

// 计算最低分
const minScore = computed(() => {
  if (results.value.length === 0) return 0
  return Math.min(...results.value.map(item => item.score))
})

// 获取实验结果列表
const fetchResults = async () => {
  loading.value = true
  try {
    const res = await getStudentResults({
      page: currentPage.value,
      pageSize: pageSize.value
    })
    results.value = res.data
    total.value = res.total
  } catch (error) {
    console.error('Failed to fetch results:', error)
    ElMessage.error('获取实验结果失败')
  } finally {
    loading.value = false
  }
}

// 处理分页变化
const handlePageChange = (page) => {
  currentPage.value = page
  fetchResults()
}

// 查看评价详情
const viewFeedback = (result) => {
  ElMessageBox.alert(result.feedback, '教师评价', {
    confirmButtonText: '确定'
  })
}

// 查看排名
const viewRanking = (experimentId) => {
  router.push(`/student/score/${experimentId}`)
}

onMounted(() => {
  fetchResults()
})
</script>

<template>
  <div class="result-list">
    <div class="page-header">
      <h2>实验结果</h2>
    </div>

    <div class="stats-cards">
      <el-card class="stat-card">
        <div class="stat-title">平均分</div>
        <div class="stat-value">{{ averageScore }}</div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-title">最高分</div>
        <div class="stat-value">{{ maxScore }}</div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-title">最低分</div>
        <div class="stat-value">{{ minScore }}</div>
      </el-card>
    </div>

    <el-table
      v-loading="loading"
      :data="results"
      border
      style="width: 100%; margin-top: 20px;"
    >
      <el-table-column label="实验名称" prop="experiment_name" min-width="200" />
      <el-table-column label="提交时间" prop="submit_time" width="180" />
      <el-table-column label="评分" prop="score" width="100" align="center" />
      <el-table-column label="操作" width="200" align="center">
        <template #default="{ row }">
          <el-button
            type="primary"
            size="small"
            @click="viewFeedback(row)"
            v-if="row.feedback"
          >
            查看评价
          </el-button>
          <el-button
            type="success"
            size="small"
            @click="viewRanking(row.experiment_id)"
          >
            查看排名
          </el-button>
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
.result-list {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stats-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  flex: 1;
  text-align: center;
}

.stat-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 