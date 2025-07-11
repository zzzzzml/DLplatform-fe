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

    <!-- 搜索结果统计 -->
    <div class="search-result" v-if="searchKeyword">
      <span class="result-count">找到 {{ filteredRankings.length }} 个匹配结果</span>
    </div>

    <!-- 置顶的个人数据 -->
    <el-table
      v-if="mySearchData"
      v-loading="loading"
      :data="[mySearchData]"
      border
      class="my-data-table"
      :row-class-name="rowClassName"
    >
      <el-table-column label="序号" width="80">
        <template #default="{ row }">
          {{ row.index }}
        </template>
      </el-table-column>
      
      <el-table-column label="排名" width="80">
        <template #default="{ row }">
          {{ row.rank }}
        </template>
      </el-table-column>
      
      <el-table-column label="姓名" min-width="120">
        <template #default="{ row }">
          {{ row.name }}<span class="mine-tag">（我）</span>
        </template>
      </el-table-column>
      
      <el-table-column prop="className" label="班级" min-width="150" />
      <el-table-column prop="score" label="分数" width="100" />
    </el-table>

    <!-- 搜索结果列表 -->
    <el-table
      v-loading="loading"
      :data="pagedRankings"
      border
      class="ranking-table"
    >
      <el-table-column label="序号" width="80">
        <template #default="{ row }">
          {{ row.index }}
        </template>
      </el-table-column>
      
      <el-table-column label="排名" width="80">
        <template #default="{ row }">
          {{ row.rank }}
        </template>
      </el-table-column>
      
      <el-table-column label="姓名" min-width="120">
        <template #default="{ row }">
          <!-- 高亮搜索关键词 -->
          <span v-html="highlightKeyword(row.name)"></span>
        </template>
      </el-table-column>
      
      <el-table-column prop="className" label="班级" min-width="150" />
      <el-table-column prop="score" label="分数" width="100" />
    </el-table>

    <div class="pagination" v-if="filteredRankings.length > 0">
      <el-pagination
        background
        layout="total, prev, pager, next"
        :total="filteredRankings.length"
        :current-page="currentPage"
        :page-size="pageSize"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 无搜索结果提示 -->
    <div class="empty-result" v-else-if="searchKeyword && filteredRankings.length === 0">
      <el-empty description="未找到匹配的学生"></el-empty>
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
const students = ref([]) // 改为空数组，通过API获取数据

// 获取实验ID
const experimentId = computed(() => route.params.id || route.query.experimentId)

// 获取当前登录用户ID
const currentUserId = computed(() => userStore.userInfo?.id || 11)

// 高亮搜索关键词
const highlightKeyword = (text) => {
  if (!searchKeyword.value) return text
  
  const regex = new RegExp(`(${searchKeyword.value})`, 'gi')
  return text.replace(regex, '<span class="highlight">$1</span>')
}

// 计算所有数据的排名和序号（完整列表）
const allRankings = computed(() => {
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
const filteredRankings = computed(() => {
  if (!searchKeyword.value) {
    return allRankings.value
  }
  
  const keyword = searchKeyword.value.toLowerCase()
  return allRankings.value.filter(student => 
    student.name.toLowerCase().includes(keyword)
  )
})

// 从搜索结果中获取我的数据（核心逻辑）
const mySearchData = computed(() => {
  return filteredRankings.value.find(item => item.id === currentUserId.value) || null
})

// 分页处理
const pagedRankings = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = currentPage.value * pageSize.value
  return filteredRankings.value.slice(start, end)
})

// 分页变化处理
const handlePageChange = (page) => {
  currentPage.value = page
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
}

// 搜索关键词变化时重置分页
watch(searchKeyword, () => {
  currentPage.value = 1
})

// 我的数据样式
const rowClassName = () => {
  return 'my-data-row'
}

// 获取实验排名数据
const fetchExperimentRanking = async () => {
  if (!experimentId.value) {
    ElMessage.error('缺少实验ID')
    console.log('实验ID:', experimentId.value)
    return
  }

  console.log('开始获取实验排名，实验ID:', experimentId.value)
  console.log('当前用户ID:', currentUserId.value)

  try {
    loading.value = true
    console.log('调用API:', `/student/experiment/scores`, { experiment_id: experimentId.value })
    
    // 修正：移除currentUserId参数，获取完整的实验排名数据
    const response = await getExperimentRanking(experimentId.value)
    console.log('API响应:', response)
    
    if (response && response.code === 200 && response.data) {
      students.value = response.data
      console.log('成功获取数据，学生数量:', students.value.length)
    } else {
      console.error('API返回错误:', response)
      ElMessage.error(response?.message || '获取数据失败')
      students.value = []
    }
  } catch (error) {
    console.error('获取实验排名失败:', error)
    console.error('错误详情:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    })
    ElMessage.error('获取实验排名失败')
    // 如果API调用失败，可以回退到测试数据
    students.value = [
      { id: 1, name: '张明', className: '计算机科学与技术1班', score: 93 },
      { id: 2, name: '李华', className: '软件工程2班', score: 89 },
      { id: 3, name: '王芳', className: '人工智能3班', score: 93 },
      { id: 4, name: '刘伟', className: '数据科学1班', score: 85 },
      { id: 5, name: '赵静', className: '网络工程2班', score: 93 },
      { id: 6, name: '陈晓', className: '计算机科学与技术1班', score: 91 },
      { id: 7, name: '杨帆', className: '软件工程3班', score: 87 },
      { id: 8, name: '周涛', className: '人工智能1班', score: 88 },
      { id: 9, name: '徐丽', className: '数据科学2班', score: 90 },
      { id: 10, name: '孙浩', className: '网络工程1班', score: 92 },
      { id: 11, name: '马超', className: '计算机科学与技术2班', score: 86 },
      { id: 12, name: '林小雨', className: '人工智能2班', score: 94 },
      { id: 13, name: '郑阳', className: '软件工程1班', score: 83 },
      { id: 14, name: '吴佳', className: '数据科学3班', score: 90 },
      { id: 15, name: '孙婷婷', className: '网络工程3班', score: 88 }
    ]
  } finally {
    loading.value = false
  }
}

// 页面加载
onMounted(async () => {
  console.log('=== 页面加载调试信息 ===')
  console.log('路由参数:', route.params)
  console.log('路由查询:', route.query)
  console.log('完整路由对象:', route)
  console.log('用户信息:', userStore.userInfo)
  console.log('用户ID:', currentUserId.value)
  console.log('实验ID:', experimentId.value)
  console.log('=======================')
  await fetchExperimentRanking()
})
</script>

<style scoped>
.score-rank-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.page-header h2 {
  font-size: 18px;
  color: #333;
  margin: 0;
  font-weight: 600;
}

.search-box {
  width: 300px;
}

.search-result {
  margin-bottom: 15px;
  color: #666;
  font-size: 14px;
}

.result-count {
  font-weight: 500;
  color: #409eff;
}

/* 置顶的个人数据表格样式 */
.my-data-table {
  width: 100%;
  margin-bottom: 20px;
  border-color: #1890ff;
}

/* 原始数据表格样式 */
.ranking-table {
  width: 100%;
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 我的数据行样式 */
.my-data-row {
  background-color: #e6f7ff;
}

.my-data-row td {
  font-weight: 600;
}

/* （我）标注样式 */
.mine-tag {
  color: #1890ff;
  font-size: 12px;
  margin-left: 5px;
  padding: 1px 4px;
  border-radius: 3px;
  border: 1px solid #1890ff;
}

/* 搜索关键词高亮样式 */
.highlight {
  background-color: #fff2d6;
  color: #ff7d00;
  padding: 0 2px;
  border-radius: 2px;
}

/* 空结果样式 */
.empty-result {
  padding: 40px 0;
}
</style>