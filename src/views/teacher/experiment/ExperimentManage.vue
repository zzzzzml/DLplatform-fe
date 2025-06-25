<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getTeacherExperiments, deleteExperiment } from '../../../api/experiment'

const router = useRouter()

const loading = ref(false)
const experiments = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchKeyword = ref('')

// 获取教师的实验列表
const fetchExperiments = async () => {
  loading.value = true
  try {
    const res = await getTeacherExperiments({
      page: currentPage.value,
      limit: pageSize.value,
      keyword: searchKeyword.value
    })
    experiments.value = res.data
    total.value = res.total
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

// 查看提交列表
const viewSubmissions = (id) => {
  router.push({
    path: '/teacher/evaluation',
    query: { experimentId: id }
  })
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
      :data="experiments"
      border
      style="width: 100%"
    >
      <el-table-column prop="title" label="实验名称" min-width="200" />
      <el-table-column prop="startTime" label="开始时间" width="180" />
      <el-table-column prop="endTime" label="截止时间" width="180" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'">
            {{ row.status === 'active' ? '进行中' : '已结束' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="submissionCount" label="提交数量" width="100" />
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button 
            type="primary" 
            size="small" 
            @click="editExperiment(row.id)"
          >
            编辑
          </el-button>
          <el-button 
            type="info" 
            size="small" 
            @click="viewSubmissions(row.id)"
          >
            查看提交
          </el-button>
          <el-button 
            type="danger" 
            size="small" 
            @click="handleDelete(row.id)"
          >
            删除
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