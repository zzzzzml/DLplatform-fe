<template>
  <div class="score-rank-container">
    <div class="page-header">
      <h2>实验排名</h2>
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索学生姓名"
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

    <!-- 实验信息 -->
    <el-card class="experiment-info-card" v-if="experimentName">
      <div class="experiment-info">
        <h3>{{ experimentName }}</h3>
        <div class="stats">
          <div class="stat-item">
            <div class="stat-label">平均分</div>
            <div class="stat-value">{{ statistics.average_score }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">最高分</div>
            <div class="stat-value">{{ statistics.max_score }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">最低分</div>
            <div class="stat-value">{{ statistics.min_score }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">参与人数</div>
            <div class="stat-value">{{ statistics.student_count }}</div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 搜索结果统计 -->
    <div class="search-result" v-if="searchKeyword">
      <span class="result-count">找到 {{ filteredStudents.length }} 个匹配结果</span>
      <el-button class="reset-btn" type="info" size="small" @click="resetSearch">重置搜索</el-button>
    </div>

    <!-- 置顶的个人数据 -->
    <el-table
      v-if="myData"
      v-loading="loading"
      :data="[myData]"
      border
      class="my-data-table"
    >
      <el-table-column label="序号" width="80" align="center">
        <template #default="{ row }">
          {{ row.index }}
        </template>
      </el-table-column>
      
      <el-table-column label="排名" width="80" align="center">
        <template #default="{ row }">
          <span class="rank-badge" :class="getRankClass(row.rank)">{{ row.rank }}</span>
        </template>
      </el-table-column>
      
      <el-table-column label="姓名" min-width="120">
        <template #default="{ row }">
          {{ row.name }}<span class="mine-tag">（我）</span>
        </template>
      </el-table-column>
      
      <el-table-column prop="className" label="班级" min-width="150" />
      <el-table-column prop="score" label="分数" width="100" align="center" />
    </el-table>

    <!-- 搜索结果列表 -->
    <el-table
      v-loading="loading"
      :data="pagedStudents"
      border
      class="ranking-table"
      :row-class-name="highlightMyRow"
    >
      <el-table-column label="序号" width="80" align="center">
        <template #default="{ row }">
          {{ row.index }}
        </template>
      </el-table-column>
      
      <el-table-column label="排名" width="80" align="center">
        <template #default="{ row }">
          <span class="rank-badge" :class="getRankClass(row.rank)">{{ row.rank }}</span>
        </template>
      </el-table-column>
      
      <el-table-column label="姓名" min-width="120">
        <template #default="{ row }">
          <!-- 高亮搜索关键词 -->
          <span v-html="highlightKeyword(row.name)"></span>
          <span v-if="row.id === currentUserId" class="mine-tag">（我）</span>
        </template>
      </el-table-column>
      
      <el-table-column prop="className" label="班级" min-width="150" />
      <el-table-column prop="score" label="分数" width="100" align="center" />
    </el-table>

    <div class="pagination" v-if="filteredStudents.length > 0">
      <el-pagination
        background
        layout="total, prev, pager, next"
        :total="filteredStudents.length"
        :current-page="currentPage"
        :page-size="pageSize"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 无搜索结果提示 -->
    <div class="empty-result" v-else-if="searchKeyword && filteredStudents.length === 0">
      <el-empty description="未找到匹配的学生">
        <el-button type="primary" @click="resetSearch">重置搜索</el-button>
      </el-empty>
    </div>

    <!-- 加载失败提示 -->
    <div class="empty-result" v-else-if="!loading && rankedStudents.length === 0">
      <el-empty description="暂无排名数据">
        <el-button type="primary" @click="fetchExperimentRanking">重新加载</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { getExperimentRanking } from '@/api/experiment'
import { useUserStore } from '@/stores/user'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

// 获取路由参数和用户信息
const route = useRoute()
const userStore = useUserStore()

// 状态定义
const loading = ref(true)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const students = ref([]) // 原始学生数据
const experimentName = ref('')
const statistics = ref({}) // 统计数据

// 获取实验ID
const experimentId = computed(() => route.params.id || route.query.experimentId)

// 获取当前登录用户ID
const currentUserId = computed(() => userStore.userInfo?.id)

// 高亮搜索关键词
const highlightKeyword = (text) => {
  if (!searchKeyword.value) return text
  
  const regex = new RegExp(`(${searchKeyword.value})`, 'gi')
  return text.replace(regex, '<span class="highlight">$1</span>')
}

// 计算排名数据
const rankedStudents = computed(() => {
  // 按分数降序排序
  const sorted = [...students.value].sort((a, b) => b.score - a.score)
  
  let rank = 1
  let prevScore = null
  
  return sorted.map((student, index) => {
    // 分数变化时更新排名
    if (prevScore !== null && student.score !== prevScore) {
      rank = index + 1
    }
    
    prevScore = student.score
    
    return {
      ...student,
      rank: rank,
      index: index + 1 // 序号（自然排序）
    }
  })
})

// 过滤后的排名数据（包含搜索逻辑）
const filteredStudents = computed(() => {
  if (!searchKeyword.value) {
    return rankedStudents.value
  }
  
  const keyword = searchKeyword.value.toLowerCase()
  return rankedStudents.value.filter(student => 
    student.name.toLowerCase().includes(keyword)
  )
})

// 我的数据
const myData = computed(() => {
  return rankedStudents.value.find(item => item.id === currentUserId.value) || null
})

// 分页处理
const pagedStudents = computed(() => {
  // 如果我的数据在当前页面中，则从结果中排除，避免重复显示
  let dataToShow = [...filteredStudents.value]
  
  if (myData.value) {
    dataToShow = dataToShow.filter(item => item.id !== currentUserId.value)
  }
  
  const start = (currentPage.value - 1) * pageSize.value
  const end = currentPage.value * pageSize.value
  return dataToShow.slice(start, end)
})

// 分页变化处理
const handlePageChange = (page) => {
  currentPage.value = page
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
}

// 重置搜索
const resetSearch = () => {
  searchKeyword.value = ''
  currentPage.value = 1
}

// 搜索关键词变化时重置分页
watch(searchKeyword, () => {
  currentPage.value = 1
})

// 高亮我的行
const highlightMyRow = (row) => {
  return row.id === currentUserId.value ? 'my-row' : ''
}

// 获取排名样式
const getRankClass = (rank) => {
  if (rank === 1) return 'rank-first'
  if (rank === 2) return 'rank-second'
  if (rank === 3) return 'rank-third'
  return ''
}

// 获取实验排名数据
const fetchExperimentRanking = async () => {
  if (!experimentId.value) {
    ElMessage.error('缺少实验ID')
    console.log('实验ID:', experimentId.value)
    return
  }

  console.log('开始获取实验排名，实验ID:', experimentId.value)
  
  try {
    loading.value = true
    
    const response = await getExperimentRanking(experimentId.value)
    console.log('API响应:', response)
    
    if (response && response.code === 200 && response.data) {
      students.value = response.data.students || []
      experimentName.value = response.data.experiment_name || '实验排名'
      statistics.value = response.data.statistics || {} // 更新统计数据
      console.log('成功获取数据，学生数量:', students.value.length)
    } else {
      console.error('API返回错误:', response)
      ElMessage.error(response?.message || '获取数据失败')
      students.value = []
      statistics.value = {}
    }
  } catch (error) {
    console.error('获取排名失败:', error)
    ElMessage.error('获取排名数据失败')
    students.value = []
    statistics.value = {}
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchExperimentRanking()
})
</script>

<style scoped>
.score-rank-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
}

.search-box {
  width: 300px;
}

.search-result {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  color: #606266;
}

.result-count {
  font-weight: 500;
  color: #409EFF;
}

.reset-btn {
  margin-left: 10px;
}

.experiment-info-card {
  margin-bottom: 20px;
}

.experiment-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.experiment-info h3 {
  margin: 0;
  font-size: 18px;
}

.stats {
  display: flex;
  gap: 30px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #409EFF;
}

.my-data-table {
  margin-bottom: 20px;
}

.my-data-row {
  background-color: #ecf5ff !important;
}

.my-row {
  background-color: #ecf5ff !important;
}

.mine-tag {
  margin-left: 5px;
  color: #409EFF;
  font-size: 12px;
}

.ranking-table {
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.empty-result {
  padding: 40px 0;
  text-align: center;
}

.highlight {
  color: #409EFF;
  font-weight: bold;
}

.rank-badge {
  display: inline-block;
  width: 28px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  border-radius: 50%;
  font-weight: bold;
}

.rank-first {
  background-color: #f56c6c;
  color: white;
}

.rank-second {
  background-color: #e6a23c;
  color: white;
}

.rank-third {
  background-color: #67c23a;
  color: white;
}
</style>