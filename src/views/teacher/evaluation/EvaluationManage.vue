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
                :label="item.title || item.experiment_name"
                :value="item.id || item.experiment_id"
              ></el-option>
            </el-select>
            <el-select v-model="filter.classId" placeholder="选择班级" clearable @change="fetchEvaluations">
              <el-option
                v-for="item in classes"
                :key="item.id"
                :label="item.name || item.class_name"
                :value="item.id || item.class_id"
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
        <el-button type="primary" @click="handleEvaluateAll" style="margin-bottom: 10px;">
          一键评测
        </el-button>
        <el-table
          v-loading="loading"
          :data="evaluationList"
          style="width: 100%"
          border
        >
          <el-table-column prop="experiment_title" label="实验名称" min-width="120">
            <template #default="scope">
              {{ scope.row.experiment_title || '未知实验' }}
            </template>
          </el-table-column>
          <el-table-column prop="student_name" label="学生姓名" min-width="100">
            <template #default="scope">
              {{ scope.row.student_name || '未知学生' }}
            </template>
          </el-table-column>
          <el-table-column prop="class_name" label="班级" min-width="100">
            <template #default="scope">
              {{ scope.row.class_name || '未分配班级' }}
            </template>
          </el-table-column>
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
              {{ scope.row.score !== null && scope.row.score !== undefined ? scope.row.score : '未评分' }}
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
import { ElMessage, ElLoading } from 'element-plus'
import { getTeacherExperiments, getEvaluations, evaluateAll } from '@/api/experiment'
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
  // 不管是否有值，都刷新数据
  fetchEvaluations()
})

const fetchExperiments = async () => {
  try {
    const res = await getTeacherExperiments()
    console.log('获取实验列表响应:', res)
    
    if (res && res.data) {
      experiments.value = res.data
      console.log('实验列表数据:', experiments.value)
      
      // 移除自动选择第一个实验的逻辑
      // if (!filter.experimentId && experiments.value.length > 0) {
      //   // 使用id或experiment_id字段
      //   filter.experimentId = experiments.value[0].id || experiments.value[0].experiment_id
      //   console.log('自动选择第一个实验:', filter.experimentId)
      // }
    } else {
      experiments.value = []
      console.warn('获取实验列表返回数据格式异常:', res)
    }
  } catch (error) {
    console.error('获取实验列表失败:', error)
    ElMessage.error('获取实验列表失败: ' + (error.message || '未知错误'))
    experiments.value = []
  }
}

const fetchClasses = async () => {
  try {
    const res = await getClasses()
    console.log('获取班级列表响应:', res)
    
    if (res && res.data) {
      classes.value = res.data
      console.log('班级列表数据:', classes.value)
    } else {
      classes.value = []
      console.warn('获取班级列表返回数据格式异常:', res)
    }
  } catch (error) {
    console.error('获取班级列表失败:', error)
    ElMessage.error('获取班级列表失败: ' + (error.message || '未知错误'))
    classes.value = []
  }
}

const fetchEvaluations = async () => {
  loading.value = true
  try {
    // 移除必须选择实验的限制
    // if (!filter.experimentId) {
    //   ElMessage.warning('请先选择一个实验')
    //   loading.value = false
    //   return
    // }

    const params = {
      page: pagination.currentPage,
      limit: pagination.pageSize
    }
    
    // 如果选择了实验，添加到参数中
    if (filter.experimentId) {
      params.experiment_id = filter.experimentId
    }
    
    if (filter.classId) params.class_id = filter.classId
    if (filter.status !== '' && filter.status !== null && filter.status !== undefined) params.status = filter.status

    console.log('请求参数:', params)
    console.log('用户信息:', JSON.parse(localStorage.getItem('userInfo') || '{}'))
    
    const res = await getEvaluations(params)
    console.log('获取评价列表响应:', res)
    
    if (res && res.data && res.data.list) {
      evaluationList.value = res.data.list
      pagination.total = res.data.total || evaluationList.value.length
      console.log('评价列表数据:', evaluationList.value)
      
      if (evaluationList.value.length === 0) {
        console.warn('评价列表为空，可能是实验ID不正确或没有提交记录')
        ElMessage.warning('未找到提交记录')
      }
    } else {
      evaluationList.value = []
      pagination.total = 0
      console.warn('获取评价列表返回数据格式异常:', res)
      ElMessage.error('获取评价列表数据格式异常')
    }
  } catch (error) {
    console.error('获取评价列表失败:', error)
    ElMessage.error('获取评价列表失败: ' + (error.message || '未知错误'))
    evaluationList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

const downloadFile = async (row) => {
  if (!row.id) {
    ElMessage.error('无法下载：缺少提交ID');
    return;
  }
  
  try {
    // 显示加载状态
    const loadingInstance = ElLoading.service({
      lock: true,
      text: '正在准备下载...',
      background: 'rgba(0, 0, 0, 0.7)'
    });
    
    // 构建下载URL
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const downloadUrl = `${baseURL}/download/submission/${row.id}`;
    
    console.log('下载URL:', downloadUrl);
    
    // 使用fetch API获取文件
    const response = await fetch(downloadUrl);
    
    if (!response.ok) {
      // 尝试解析错误响应
      let errorMessage = '下载失败';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || `下载失败 (${response.status})`;
      } catch (e) {
        errorMessage = `下载失败: HTTP ${response.status}`;
      }
      
      ElMessage.error(errorMessage);
      loadingInstance.close();
      return;
    }
    
    // 获取文件名
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'download.zip';
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }
    
    // 将响应转换为Blob
    const blob = await response.blob();
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    // 添加到文档并触发点击
    document.body.appendChild(link);
    link.click();
    
    // 清理
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
    
    // 关闭加载状态
    loadingInstance.close();
    ElMessage.success('文件下载已开始');
    
  } catch (error) {
    ElMessage.error('下载失败: ' + (error.message || '未知错误'));
    console.error('下载文件失败:', error);
  }
}

const handleAutoEvaluate = async (row) => {
  if (row._evaluating || row.status === 3) return
  row._evaluating = true
  try {
    // 使用行数据中的experiment_id，而不是filter中的
    const experimentId = row.experiment_id
    if (!experimentId) {
      ElMessage.error('无法确定实验ID，无法进行评测')
      return
    }
    
    ElMessage.info(`正在评测 ${row.student_name} 的提交，请稍候...`)
    console.log(`开始评测学生 ${row.student_name} 的提交，实验ID: ${experimentId}`)
    
    const res = await fetch(`/test?experimentId=${experimentId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }).then(r => r.json())
    
    if (res.code === 200) {
      // 查找当前学生的评测结果
      const studentResult = res.data?.results?.find(r => r.student_id === row.student_id)
      
      if (studentResult) {
        if (studentResult.status === 'success') {
          ElMessage.success(`${row.student_name} 评测完成，得分: ${studentResult.score}`)
        } else {
          ElMessage.warning(`${row.student_name} 评测完成，但存在问题: ${studentResult.message}`)
        }
      } else {
        ElMessage.success(`${row.student_name} 评测完成`)
      }
      
      // 刷新列表获取最新状态
      await fetchEvaluations()
    } else {
      ElMessage.error(res.message || '评测失败')
    }
  } catch (e) {
    console.error(`评测学生 ${row.student_name} 的提交失败:`, e)
    ElMessage.error(`评测失败: ${e.message || '未知错误'}`)
  } finally {
    row._evaluating = false
  }
}

// 一键评测
const handleEvaluateAll = async () => {
  if (!filter.experimentId) {
    ElMessage.warning('请先选择一个实验进行批量操作')
    return
  }
  try {
    loading.value = true
    ElMessage.info('正在进行一键评测，请稍候...')
    
    console.log(`开始一键评测，实验ID: ${filter.experimentId}`)
    const res = await evaluateAll(filter.experimentId)
    
    if (res.code === 200) {
      const evaluatedCount = res.data?.evaluated_count || 0
      const totalSubmissions = res.data?.total_submissions || 0
      
      // 检查是否有详细结果
      if (res.data?.results) {
        console.log('评测详细结果:', res.data.results)
        
        // 检查是否有失败的评测
        const failedResults = res.data.results.filter(r => r.status !== 'success')
        if (failedResults.length > 0) {
          console.warn('存在失败的评测:', failedResults)
          
          // 显示更详细的错误信息
          const errorMessages = failedResults.map(r => 
            `学生ID ${r.student_id}: ${r.message || '未知错误'}`
          ).join('\n');
          
          ElMessage({
            type: 'warning',
            message: `评测完成，但有 ${failedResults.length} 个评测未成功。详细错误已记录到控制台`,
            duration: 5000
          })
          
          // 如果错误不多，可以直接显示在界面上
          if (failedResults.length <= 3) {
            failedResults.forEach(result => {
              ElMessage({
                type: 'warning',
                message: `学生ID ${result.student_id} 评测失败: ${result.message}`,
                duration: 5000
              })
            })
          }
        } else {
          ElMessage.success(`一键评测完成，成功评测了 ${evaluatedCount}/${totalSubmissions} 个模型`)
        }
      } else {
        ElMessage.success(res.message || `一键评测完成，共评测了 ${evaluatedCount}/${totalSubmissions} 个模型`)
      }
      
      // 刷新列表
      await fetchEvaluations()
    } else {
      ElMessage.error(res.message || '一键评测失败')
    }
  } catch (e) {
    console.error('一键评测失败:', e)
    
    // 提取更详细的错误信息
    let errorMessage = e.message || '未知错误'
    if (e.response && e.response.data && e.response.data.message) {
      errorMessage = e.response.data.message
    }
    
    ElMessage.error(`一键评测失败: ${errorMessage}`)
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