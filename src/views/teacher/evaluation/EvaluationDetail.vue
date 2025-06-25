<template>
  <div class="evaluation-detail">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <h2>实验评价详情</h2>
          <el-button @click="goBack">返回列表</el-button>
        </div>
      </template>
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>
      <div v-else class="evaluation-content">
        <el-descriptions title="基本信息" :column="2" border>
          <el-descriptions-item label="实验名称">{{ submission.experimentTitle }}</el-descriptions-item>
          <el-descriptions-item label="学生姓名">{{ submission.studentName }}</el-descriptions-item>
          <el-descriptions-item label="班级">{{ submission.className }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ formatDate(submission.submitTime) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(submission.status)">
              {{ getStatusText(submission.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="得分" v-if="submission.status === 2">
            {{ submission.score }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="section-title">实验内容</div>
        <div class="experiment-content">
          <div class="content-section">
            <h3>实验报告</h3>
            <div v-html="submission.report" class="report-content"></div>
          </div>
          
          <div class="content-section" v-if="submission.attachments && submission.attachments.length">
            <h3>附件列表</h3>
            <ul class="attachment-list">
              <li v-for="(attachment, index) in submission.attachments" :key="index">
                <el-link type="primary" :href="attachment.url" target="_blank">
                  {{ attachment.name }}
                </el-link>
              </li>
            </ul>
          </div>
        </div>

        <div class="section-title">评价区域</div>
        <el-form 
          :model="evaluationForm" 
          :rules="rules" 
          ref="evaluationFormRef" 
          label-width="100px" 
          class="evaluation-form"
          :disabled="isSubmitted && !isReEvaluate"
        >
          <el-form-item label="得分" prop="score">
            <el-input-number 
              v-model="evaluationForm.score" 
              :min="0" 
              :max="100" 
              :step="5"
              :disabled="isSubmitted && !isReEvaluate"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="评语" prop="comment">
            <el-input 
              v-model="evaluationForm.comment" 
              type="textarea" 
              rows="4" 
              placeholder="请输入评价内容"
              :disabled="isSubmitted && !isReEvaluate"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button 
              type="primary" 
              @click="submitEvaluation" 
              v-if="!isSubmitted || isReEvaluate"
            >
              {{ isReEvaluate ? '重新评价' : '提交评价' }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSubmissionDetail, evaluateSubmission } from '@/api/experiment'

const route = useRoute()
const router = useRouter()
const submissionId = route.params.id
const isReEvaluate = computed(() => route.query.reEvaluate === 'true')
const loading = ref(true)
const evaluationFormRef = ref(null)

const submission = ref({
  id: '',
  experimentId: '',
  experimentTitle: '',
  studentId: '',
  studentName: '',
  className: '',
  submitTime: '',
  status: 0,
  report: '',
  attachments: [],
  score: null,
  comment: ''
})

const evaluationForm = reactive({
  score: 0,
  comment: ''
})

const rules = {
  score: [
    { required: true, message: '请输入分数', trigger: 'blur' }
  ],
  comment: [
    { required: true, message: '请输入评语', trigger: 'blur' }
  ]
}

// 是否已评价
const isSubmitted = computed(() => submission.value.status === 2)

onMounted(async () => {
  await fetchSubmissionDetail()
})

// 获取提交详情
const fetchSubmissionDetail = async () => {
  loading.value = true
  try {
    const data = await getSubmissionDetail(submissionId)
    submission.value = data
    
    // 如果已经评价过，填充评价表单
    if (data.status === 2) {
      evaluationForm.score = data.score
      evaluationForm.comment = data.comment
    }
  } catch (error) {
    console.error('获取提交详情失败', error)
    ElMessage.error('获取提交详情失败')
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

// 提交评价
const submitEvaluation = async () => {
  if (!evaluationFormRef.value) return
  
  await evaluationFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isSubmitted.value && !isReEvaluate.value) {
          return
        }
        
        if (isSubmitted.value && isReEvaluate.value) {
          // 重新评价确认
          await ElMessageBox.confirm(
            '您确定要重新评价此实验提交吗？',
            '重新评价',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
            }
          )
        }
        
        await evaluateSubmission(submissionId, {
          score: evaluationForm.score,
          comment: evaluationForm.comment
        })
        
        ElMessage.success('评价提交成功')
        // 重新获取详情数据
        await fetchSubmissionDetail()
        
        // 如果是重新评价，去掉URL参数
        if (isReEvaluate.value) {
          router.replace(`/teacher/evaluation-detail/${submissionId}`)
        }
      } catch (error) {
        if (error === 'cancel') return
        console.error('提交评价失败', error)
        ElMessage.error('提交评价失败，请重试')
      }
    } else {
      return false
    }
  })
}

// 返回列表
const goBack = () => {
  router.push('/teacher/evaluation')
}
</script>

<style scoped>
.evaluation-detail {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.loading-container {
  padding: 20px 0;
}

.evaluation-content {
  margin-top: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin: 25px 0 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.experiment-content {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
}

.content-section {
  margin-bottom: 20px;
}

.content-section h3 {
  margin-bottom: 10px;
  font-size: 16px;
}

.report-content {
  line-height: 1.6;
}

.attachment-list {
  list-style: none;
  padding: 0;
}

.attachment-list li {
  padding: 5px 0;
  border-bottom: 1px dashed #eee;
}

.evaluation-form {
  margin-top: 20px;
  max-width: 600px;
}
</style> 