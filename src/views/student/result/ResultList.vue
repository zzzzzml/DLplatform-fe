<script setup>
import { ref, onMounted, computed } from 'vue'
import { getStudentResults } from '../../../api/experiment'

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
      limit: pageSize.value
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

onMounted(() => {
  fetchResults()
})
</script>

<template>
  <div class="result-list">
    <div class="page-header">
      <h2>实验结果</h2>
    </div>

    <el-card v-loading="loading">
      <el-table :data="results" border style="width: 100%">
        <el-table-column prop="experimentTitle" label="实验名称" min-width="200" />
        <el-table-column prop="teacherName" label="评价教师" width="120" />
        <el-table-column prop="submitTime" label="提交时间" width="180" />
        <el-table-column prop="evaluateTime" label="评价时间" width="180" />
        <el-table-column prop="score" label="分数" width="100">
          <template #default="{ row }">
            <span :class="{'high-score': row.score >= 90, 'medium-score': row.score >= 70 && row.score < 90, 'low-score': row.score < 70}">
              {{ row.score }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="rank" label="排名" width="100" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewFeedback(row)">
              查看评价
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
    </el-card>

    <el-card class="score-statistics" v-if="results.length > 0">
      <template #header>
        <div class="card-header">
          <span>成绩统计</span>
        </div>
      </template>
      <div class="stat-cards">
        <div class="stat-card">
          <div class="stat-label">平均分</div>
          <div class="stat-value">
            {{ averageScore }}
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">最高分</div>
          <div class="stat-value high-score">
            {{ maxScore }}
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">最低分</div>
          <div class="stat-value" :class="{'low-score': minScore < 70}">
            {{ minScore }}
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">已评实验</div>
          <div class="stat-value">
            {{ results.length }}
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.result-list {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.score-statistics {
  margin-top: 30px;
}

.card-header {
  font-weight: bold;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 4px;
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
}

.high-score {
  color: #67C23A;
}

.medium-score {
  color: #E6A23C;
}

.low-score {
  color: #F56C6C;
}
</style> 