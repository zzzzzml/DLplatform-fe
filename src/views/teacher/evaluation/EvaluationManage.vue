<template>
  <div class="evaluation-manage">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <h2>实验评价管理</h2>
          <div class="filter-container">
            <el-select v-model="filter.experimentId" placeholder="选择实验" clearable @change="fetchEvaluations">
              <el-option
                v-for="item in experiments"
                :key="item.id"
                :label="item.title"
                :value="item.id"
              ></el-option>
            </el-select>
            <el-select v-model="filter.classId" placeholder="选择班级" clearable @change="fetchEvaluations">
              <el-option
                v-for="item in classes"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
            <el-select v-model="filter.status" placeholder="提交状态" clearable @change="fetchEvaluations">
              <el-option label="已提交" :value="1"></el-option>
              <el-option label="未提交" :value="0"></el-option>
              <el-option label="已评价" :value="2"></el-option>
            </el-select>
            <el-button type="primary" @click="fetchEvaluations">查询</el-button>
          </div>
        </div>
      </template>
      <div class="evaluation-table">
        <el-table
          v-loading="loading"
          :data="evaluationList"
          style="width: 100%"
          border
        >
          <el-table-column prop="experimentTitle" label="实验名称" min-width="120"></el-table-column>
          <el-table-column prop="studentName" label="学生姓名" min-width="100"></el-table-column>
          <el-table-column prop="className" label="班级" min-width="100"></el-table-column>
          <el-table-column prop="submitTime" label="提交时间" min-width="150">
            <template #default="scope">
              {{ scope.row.submitTime ? formatDate(scope.row.submitTime) : '未提交' }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" min-width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="score" label="得分" min-width="80">
            <template #default="scope">
              {{ scope.row.score !== null ? scope.row.score : '未评分' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="150" fixed="right">
            <template #default="scope">
              <el-button
                v-if="scope.row.status >= 1"
                type="primary"
                size="small"
                @click="handleViewDetail(scope.row)"
              >
                {{ scope.row.status === 2 ? '查看评价' : '评价' }}
              </el-button>
              <el-button
                v-if="scope.row.status === 2"
                type="warning"
                size="small"
                @click="handleReEvaluate(scope.row)"
              >
                重新评价
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getExperimentList } from '@/api/experiment'
import { getEvaluations } from '@/api/experiment'
import { getClasses } from '@/api/class'

const router = useRouter()
const loading = ref(false)
const evaluationList = ref([])
const experiments = ref([])
const classes = ref([])

const filter = reactive({
  experimentId: '',
  classId: '',
  status: '',
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

onMounted(async () => {
  await Promise.all([fetchExperiments(), fetchClasses()])
  fetchEvaluations()
})

// 获取实验列表
const fetchExperiments = async () => {
  try {
    const data = await getExperimentList()
    experiments.value = data
  } catch (error) {
    console.error('获取实验列表失败', error)
    ElMessage.error('获取实验列表失败')
  }
}

// 获取班级列表
const fetchClasses = async () => {
  try {
    const data = await getClasses()
    classes.value = data
  } catch (error) {
    console.error('获取班级列表失败', error)
    ElMessage.error('获取班级列表失败')
  }
}

// 获取评价列表
const fetchEvaluations = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      ...filter
    }
    const { data, total } = await getEvaluations(params)
    evaluationList.value = data
    pagination.total = total
  } catch (error) {
    console.error('获取评价列表失败', error)
    ElMessage.error('获取评价列表失败')
  } finally {
    loading.value = false
  }
}

// 日期格式化
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case 0: return 'info'     // 未提交
    case 1: return 'warning'  // 已提交未评价
    case 2: return 'success'  // 已评价
    default: return 'info'
  }
}

// 获取状态文字
const getStatusText = (status) => {
  switch (status) {
    case 0: return '未提交'
    case 1: return '待评价'
    case 2: return '已评价'
    default: return '未知'
  }
}

// 查看/评价详情
const handleViewDetail = (row) => {
  router.push(`/teacher/evaluation-detail/${row.id}`)
}

// 重新评价
const handleReEvaluate = (row) => {
  router.push(`/teacher/evaluation-detail/${row.id}?reEvaluate=true`)
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.pageSize = size
  fetchEvaluations()
}

const handleCurrentChange = (page) => {
  pagination.currentPage = page
  fetchEvaluations()
}
</script>

<style scoped>
.evaluation-manage {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.filter-container {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.filter-container .el-select {
  width: 180px;
}

.evaluation-table {
  margin-top: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 