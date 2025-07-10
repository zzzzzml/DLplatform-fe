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
              <el-option label="已评测" :value="3"></el-option>
              <el-option label="已评价" :value="2"></el-option>
            </el-select>
            <el-button type="primary" @click="fetchEvaluations">查询</el-button>
          </div>
        </div>
      </template>
      <div class="evaluation-table">
        <el-button type="primary" @click="downloadAndEvaluateAll" style="margin-bottom: 10px;">
          一键下载+评测所有
        </el-button>
        <el-table
          v-loading="loading"
          :data="evaluationList"
          style="width: 100%"
          border
        >
          <el-table-column prop="experiment_title" label="实验名称" min-width="120"></el-table-column>
          <el-table-column prop="student_name" label="学生姓名" min-width="100"></el-table-column>
          <el-table-column prop="class_name" label="班级" min-width="100"></el-table-column>
          <el-table-column prop="submit_time" label="提交时间" min-width="150">
            <template #default="scope">
              {{ scope.row.submit_time ? formatDate(scope.row.submit_time) : '未提交' }}
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
          <el-table-column label="操作" min-width="260" fixed="right">
            <template #default="scope">
              <el-button
                v-if="scope.row.status >= 1"
                type="primary"
                size="small"
                @click="handleViewDetail(scope.row)"
              >
                评价
              </el-button>
              <el-button
                v-if="scope.row.status >= 1 && scope.row.status !== 3"
                type="info"
                size="small"
                :loading="scope.row._evaluating"
                :disabled="scope.row._evaluating"
                @click="handleAutoEvaluate(scope.row)"
              >
                评测
              </el-button>
              <el-button
                v-if="scope.row.file_path && scope.row.file_name"
                type="success"
                size="small"
                @click="downloadFile(scope.row)"
              >
                下载
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
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getTeacherExperiments, getEvaluations } from '@/api/experiment'
import { getClasses } from '@/api/class'

const router = useRouter()
const loading = ref(false)
const experiments = ref([])
const classes = ref([])
const evaluationList = ref([])

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

watch(() => filter.experimentId, (val) => {
  if (val) fetchEvaluations()
})

const fetchExperiments = async () => {
  try {
    const res = await getTeacherExperiments()
    experiments.value = res.data || res || []
    if (!filter.experimentId && experiments.value.length > 0) {
      filter.experimentId = experiments.value[0].id
    }
  } catch (error) {
    ElMessage.error('获取实验列表失败')
  }
}

const fetchClasses = async () => {
  try {
    const res = await getClasses()
    classes.value = res.data || res || []
  } catch (error) {
    ElMessage.error('获取班级列表失败')
  }
}

const fetchEvaluations = async () => {
  loading.value = true
  try {
    const params = {
      experiment_id: filter.experimentId,
      page: pagination.currentPage,
      limit: pagination.pageSize
    }
    if (filter.classId) params.class_id = filter.classId
    if (filter.status !== '' && filter.status !== null && filter.status !== undefined) params.status = filter.status

    const res = await getEvaluations(params)
    evaluationList.value = res.data?.list || res.list || res.data || []
    pagination.total = res.data?.total || res.total || (evaluationList.value ? evaluationList.value.length : 0)
  } catch (error) {
    ElMessage.error('获取评价列表失败')
  } finally {
    loading.value = false
  }
}

const downloadFile = (row) => {
  if (!row.file_path || !row.file_name) return
  const link = document.createElement('a')
  link.href = `/static/${row.file_path}/${row.file_name}`
  link.download = row.file_name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const handleAutoEvaluate = async (row) => {
  if (row._evaluating || row.status === 3) return
  row._evaluating = true
  try {
    const res = await fetch(`/test?experiment_id=${filter.experimentId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }).then(r => r.json())
    if (res.code === 200) {
      ElMessage.success(`${row.student_name} 评测完成`)
      fetchEvaluations()
    } else {
      ElMessage.error(res.message || '评测失败')
    }
  } catch (e) {
    ElMessage.error('评测失败')
  } finally {
    row._evaluating = false
  }
}

// 一键下载并评测所有
const downloadAndEvaluateAll = async () => {
  if (!filter.experimentId) {
    ElMessage.warning('请选择实验')
    return
  }
  try {
    loading.value = true
    // 先请求后端一键下载+评测接口，假设接口为 /test?experiment_id=xxx
    const res = await fetch(`/test?experiment_id=${filter.experimentId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }).then(r => r.json())
    if (res.code === 200 && res.download_url) {
      // 下载文件
      window.open(res.download_url, '_blank')
      ElMessage.success(res.message || '一键下载并评测完成')
      fetchEvaluations()
    } else if (res.code === 200) {
      ElMessage.success(res.message || '一键评测完成')
      fetchEvaluations()
    } else {
      ElMessage.error(res.message || '一键下载并评测失败')
    }
  } catch (e) {
    ElMessage.error('一键下载并评测失败')
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const getStatusType = (status) => {
  switch (status) {
    case 0: return 'info'
    case 1: return 'warning'
    case 2: return 'success'
    case 3: return 'primary'
    default: return 'info'
  }
}
const getStatusText = (status) => {
  switch (status) {
    case 0: return '未提交'
    case 1: return '待评测'
    case 2: return '已评价'
    case 3: return '已评测'
    default: return '未知'
  }
}

const handleViewDetail = (row) => {
  router.push(`/teacher/evaluation-detail/${row.id}`)
}

const handleReEvaluate = (row) => {
  router.push(`/teacher/evaluation-detail/${row.id}?reEvaluate=true`)
}

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