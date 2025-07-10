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
      <el-table-column prop="title" label="实验名称" min-width="200" />
      <el-table-column prop="teacherName" label="发布教师" width="120" />
      <el-table-column prop="startTime" label="开始时间" width="180" />
      <el-table-column prop="endTime" label="截止时间" width="180" />
      <el-table-column label="状态" width="100">
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
            @click="uploadExperiment(row.id)"
          >
            上传
          </el-button>  
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
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getStudentExperiments } from '../../../api/experiment'

const router = useRouter()

const loading = ref(false)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 实验数据（从后端加载）
const experiments = ref([])

// 计算属性：自动生成状态（基于当前时间与截止时间对比）
const filteredExperiments = computed(() => {
  const now = new Date()
  return experiments.value
    // 补充状态字段
    .map(experiment => {
      const endTime = new Date(experiment.endTime || experiment.deadline)
      return {
        ...experiment,
        status: endTime > now ? 'active' : 'completed'
      }
    })
})

// 总数量
const total = ref(0)

// 上传实验
const uploadExperiment = (id) => {
  router.push(`/student/experiment-upload/${id}`)
}

// 查看实验详情
const viewExperiment = (id) => {
  router.push(`/student/score`)
}

// 加载实验列表
const fetchExperiments = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      keyword: searchKeyword.value
    }
    const res = await getStudentExperiments(params)
    // 兼容后端返回格式
    experiments.value = res.data || res.list || res || []
    total.value = res.total || (experiments.value ? experiments.value.length : 0)
  } catch (e) {
    ElMessage.error('实验列表加载失败')
    experiments.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
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