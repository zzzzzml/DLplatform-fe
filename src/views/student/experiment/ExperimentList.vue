<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useExperimentStore } from '../../../stores/experiment'
import { ElMessage } from 'element-plus'

const router = useRouter()
const experimentStore = useExperimentStore()

const loading = ref(false)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 获取实验列表
const fetchExperiments = async () => {
  loading.value = true
  try {
    await experimentStore.fetchExperiments({
      page: currentPage.value,
      limit: pageSize.value,
      keyword: searchKeyword.value
    })
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

// 处理分页变化
const handlePageChange = (page) => {
  currentPage.value = page
  fetchExperiments()
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchExperiments()
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
      :data="experimentStore.experiments"
      border
      style="width: 100%"
    >
      <el-table-column prop="title" label="实验名称" min-width="200" />
      <el-table-column prop="teacherName" label="发布教师" width="120" />
      <el-table-column prop="startTime" label="开始时间" width="180" />
      <el-table-column prop="endTime" label="截止时间" width="180" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'">
            {{ row.status === 'active' ? '进行中' : '已结束' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="submitted" label="提交状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.submitted ? 'success' : 'warning'">
            {{ row.submitted ? '已提交' : '未提交' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button 
            type="primary" 
            size="small" 
            @click="viewExperiment(row.id)"
          >
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        background
        layout="total, prev, pager, next"
        :total="experimentStore.total"
        :current-page="currentPage"
        :page-size="pageSize"
        @current-change="handlePageChange"
      />
    </div>
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