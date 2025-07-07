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
        <el-button type="primary" @click="downloadAllPth" style="margin-bottom: 10px;">
          一键下载全部
        </el-button>
        <el-button type="warning" @click="autoEvaluateAll" style="margin-bottom: 10px; margin-left: 10px;">
          一键评测所有
        </el-button>
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
                v-if="scope.row.pthUrl"
                type="success"
                size="small"
                @click="downloadPth(scope.row)"
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
// import { getExperimentList } from '@/api/experiment'
// import { getEvaluations } from '@/api/experiment'
// import { getClasses } from '@/api/class'

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
  // fetchEvaluations 会在 filter.experimentId 变化时自动调用
})

// 监听实验选择，自动拉取评价列表
watch(() => filter.experimentId, (val) => {
  if (val) fetchEvaluations()
})

// 获取实验列表（静态数据）
const fetchExperiments = async () => {
  try {
    const data = [
      { id: 1, title: '实验一：图像分类' },
      { id: 2, title: '实验二：目标检测' }
    ]
    experiments.value = data
    // 默认选中第一个实验
    if (!filter.experimentId && data.length > 0) {
      filter.experimentId = data[0].id
    }
  } catch (error) {
    console.error('获取实验列表失败', error)
    ElMessage.error('获取实验列表失败')
  }
}

// 获取班级列表（静态数据）
const fetchClasses = async () => {
  try {
    const data = [
      { id: 1, name: '2021级1班' },
      { id: 2, name: '2021级2班' }
    ]
    classes.value = data
  } catch (error) {
    console.error('获取班级列表失败', error)
    ElMessage.error('获取班级列表失败')
  }
}

// 获取评价列表（静态数据）
const fetchEvaluations = async () => {
  loading.value = true
  try {
    // 静态数据模拟不同实验
    let data = []
    if (filter.experimentId === 1) {
      data = [
        {
          id: 101,
          experimentTitle: '实验一：图像分类',
          studentName: '张三',
          className: '2021级1班',
          submitTime: '2024-06-01 10:00:00',
          status: 1, // 1: 已提交，2: 已评价，3: 已评测
          score: null,
          pthUrl: '/static/pth/zhangsan.pth',
          _evaluating: false
        },
        {
          id: 102,
          experimentTitle: '实验一：图像分类',
          studentName: '李四',
          className: '2021级1班',
          submitTime: '2024-06-01 10:10:00',
          status: 1,
          score: null,
          pthUrl: '/static/pth/lisi.pth',
          _evaluating: false
        }
      ]
    } else if (filter.experimentId === 2) {
      data = [
        {
          id: 201,
          experimentTitle: '实验二：目标检测',
          studentName: '王五',
          className: '2021级2班',
          submitTime: '2024-06-02 09:00:00',
          status: 1,
          score: null,
          pthUrl: '/static/pth/wangwu.pth',
          _evaluating: false
        }
      ]
    }
    evaluationList.value = data
    pagination.total = data.length
  } catch (error) {
    console.error('获取评价列表失败', error)
    ElMessage.error('获取评价列表失败')
  } finally {
    loading.value = false
  }
}

// 下载单个pth
const downloadPth = (row) => {
  if (!row.pthUrl) return
  const link = document.createElement('a')
  link.href = row.pthUrl
  link.download = `${row.studentName}.pth`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 一键下载全部pth（静态模拟，实际可用zip.js等打包）
const downloadAllPth = () => {
  let hasFile = false
  evaluationList.value.forEach(row => {
    if (row.pthUrl) {
      hasFile = true
      const link = document.createElement('a')
      link.href = row.pthUrl
      link.download = `${row.studentName}.pth`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  })
  if (hasFile) {
    ElMessage.success('已开始下载全部文件')
  } else {
    ElMessage.warning('没有可下载的文件')
  }
}

// 单个自动评测
const handleAutoEvaluate = (row) => {
  if (row._evaluating || row.status === 3) return
  row._evaluating = true
  setTimeout(() => {
    row.score = Math.floor(Math.random() * 21) + 80 // 80-100分
    row.status = 3 // 3: 已评测
    row._evaluating = false
    ElMessage.success(`${row.studentName} 评测完成`)
  }, 1000)
}

// 一键评测所有
const autoEvaluateAll = () => {
  let toEval = evaluationList.value.filter(row => row.status !== 3 && row.pthUrl)
  if (toEval.length === 0) {
    ElMessage.info('没有需要评测的学生')
    return
  }
  let finished = 0
  toEval.forEach(row => {
    row._evaluating = true
    setTimeout(() => {
      row.score = Math.floor(Math.random() * 21) + 80
      row.status = 3
      row._evaluating = false
      finished++
      if (finished === toEval.length) {
        ElMessage.success('全部评测完成')
      }
    }, 1000 + Math.random() * 1000)
  })
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
    case 1: return 'warning'  // 已提交未评测
    case 2: return 'success'  // 已评价
    case 3: return 'primary'  // 已评测
    default: return 'info'
  }
}

// 获取状态文字
const getStatusText = (status) => {
  switch (status) {
    case 0: return '未提交'
    case 1: return '待评测'
    case 2: return '已评价'
    case 3: return '已评测'
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