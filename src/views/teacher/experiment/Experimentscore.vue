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
    
    <!-- 统计卡片区域 -->
    <div class="header-info" v-if="!searchKeyword.trim()">
      <div class="info-card">
        <h3>实验名称</h3>
        <div class="value">Vue3组件化开发实战</div>
      </div>
      <div class="info-card">
        <h3>参与人数</h3>
        <div class="value">{{ allStudents.length }}人</div>
      </div>
      <div class="info-card">
        <h3>平均分数</h3>
        <div class="value">{{ averageScore.toFixed(1) }}分</div>
      </div>
      <div class="info-card">
        <h3>最高分数</h3>
        <div class="value">{{ maxScore }}分</div>
      </div>
    </div>
    
    <!-- 搜索结果提示 -->
    <div class="search-result" v-if="searchKeyword.trim()">
      <span class="result-count">找到 {{ filteredRankings.length }} 个匹配结果</span>
      <span class="search-indicator">搜索词: "{{ searchKeyword }}"</span>
      <el-button class="reset-btn" type="info" size="small" @click="resetSearch">重置搜索</el-button>
    </div>
    
    <!-- 排名表格 -->
    <el-table
      :data="pagedRankings"
      border
      class="ranking-table"
      v-loading="loading"
    >
      <el-table-column label="序号" width="80" align="center">
        <template #default="{ $index }">
          {{ (currentPage - 1) * pageSize + $index + 1 }}
        </template>
      </el-table-column>
      
      <el-table-column label="排名" width="80" align="center">
        <template #default="{ row }">
          <span class="rank-cell">{{ row.calculatedRank }}</span>
        </template>
      </el-table-column>
      
      <el-table-column label="姓名" min-width="120">
        <template #default="{ row }">
          <span v-html="highlightKeyword(row.name)"></span>
        </template>
      </el-table-column>
      
      <el-table-column prop="className" label="班级" min-width="150" />
      
      <el-table-column label="分数" width="100" align="center">
        <template #default="{ row }">
          <span class="score-cell">{{ row.score }}</span>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 无结果提示 -->
    <div class="empty-result" v-if="searchKeyword.trim() && !filteredRankings.length">
      <el-empty description="未找到匹配的学生">
        <el-button type="primary" @click="resetSearch">重置搜索</el-button>
      </el-empty>
    </div>
    
    <!-- 分页控件 -->
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 状态管理
const loading = ref(false)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 学生数据
const allStudents = ref([
  { id: 1, name: '王芳', className: '人工智能3班', score: 98 },
  { id: 2, name: '张明', className: '计算机科学与技术1班', score: 96 },
  { id: 3, name: '陈晓', className: '计算机科学与技术1班', score: 95 },
  { id: 4, name: '李华', className: '软件工程2班', score: 92 },
  { id: 5, name: '赵静', className: '网络工程2班', score: 90 },
  { id: 6, name: '刘伟', className: '数据科学1班', score: 88 },
  { id: 7, name: '周涛', className: '人工智能1班', score: 87 },
  { id: 8, name: '徐丽', className: '数据科学2班', score: 85 },
  { id: 9, name: '杨帆', className: '软件工程3班', score: 83 },
  { id: 10, name: '孙浩', className: '网络工程1班', score: 92 },
  { id: 11, name: '马超', className: '计算机科学与技术2班', score: 81 },
  { id: 12, name: '刘晓', className: '软件工程1班', score: 79 },
  { id: 13, name: '赵敏', className: '人工智能3班', score: 95 },
  { id: 14, name: '钱明', className: '网络工程2班', score: 88 },
])

// 计算排名
const rankedStudents = computed(() => {
  const sorted = [...allStudents.value].sort((a, b) => b.score - a.score)
  
  let currentRank = 1
  let previousScore = null
  let sameRankCount = 0
  
  return sorted.map((student, index) => {
    if (previousScore !== null && student.score !== previousScore) {
      currentRank += sameRankCount
      sameRankCount = 1
    } else {
      sameRankCount += 1
    }
    
    previousScore = student.score
    
    return {
      ...student,
      calculatedRank: currentRank
    }
  })
})

// 计算统计数据
const averageScore = computed(() => {
  const total = allStudents.value.reduce((sum, student) => sum + student.score, 0)
  return total / allStudents.value.length
})

const maxScore = computed(() => {
  return Math.max(...allStudents.value.map(student => student.score))
})

// 搜索过滤
const filteredRankings = computed(() => {
  if (!searchKeyword.value.trim()) {
    return rankedStudents.value
  }
  
  const keyword = searchKeyword.value.toLowerCase()
  return rankedStudents.value.filter(student => 
    student.name.toLowerCase().includes(keyword)
  )
})

// 分页处理
const pagedRankings = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredRankings.value.slice(start, start + pageSize.value)
})

// 搜索处理
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  
  loading.value = true
  currentPage.value = 1
  
  // 模拟搜索延迟
  setTimeout(() => {
    loading.value = false
  }, 600)
}

// 重置搜索
const resetSearch = () => {
  searchKeyword.value = ''
  currentPage.value = 1
}

// 分页处理
const handlePageChange = (page) => {
  currentPage.value = page
}

// 高亮搜索关键词
const highlightKeyword = (text) => {
  if (!searchKeyword.value.trim()) return text
  
  const regex = new RegExp(`(${searchKeyword.value})`, 'gi')
  return text.replace(
    regex, 
    '<span class="highlight">$1</span>'
  )
}
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-count {
  font-weight: 500;
  color: #409eff;
}

.search-indicator {
  background: #e6f7ff;
  color: #1890ff;
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px solid #91d5ff;
  margin-left: 10px;
}

.header-info {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  background: #f0f7ff;
  padding: 15px;
  border-radius: 12px;
  border: 1px solid #d9ecff;
}

.info-card {
  padding: 12px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.info-card h3 {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.info-card .value {
  font-size: 24px;
  font-weight: 700;
  color: #409eff;
}

.ranking-table {
  width: 100%;
  margin-bottom: 20px;
  border-color: #ebeef5;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.highlight {
  background-color: #fff2d6;
  color: #ff7d00;
  padding: 0 2px;
  border-radius: 2px;
  font-weight: 600;
}

.empty-result {
  padding: 40px 0;
}

.reset-btn {
  margin-left: 15px;
}

.rank-cell, .score-cell {
  font-weight: 500;
  color: #303133;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .page-header h2 {
    margin-bottom: 15px;
  }
  
  .search-box {
    width: 100%;
    margin-top: 15px;
  }
  
  .header-info {
    flex-direction: column;
  }
  
  .search-result {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}
</style>