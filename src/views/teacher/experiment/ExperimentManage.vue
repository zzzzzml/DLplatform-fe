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
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row)">
            {{ getStatusText(row) }}
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
            查看排名
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

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'

const router = useRouter()

// 静态测试数据 - 移除了status字段，状态将动态计算
const staticExperiments = [
  {
    id: 1,
    title: 'Vue3组件化开发实战',
    startTime: '2025-06-01 09:00:00',
    endTime: '2025-06-30 23:59:59',
    submissionCount: 28,
    teacherName: '张教授'
  },
  {
    id: 2,
    title: 'Node.js后端接口设计',
    startTime: '2025-05-10 08:30:00',
    endTime: '2025-05-25 23:59:59',
    submissionCount: 32,
    teacherName: '李老师'
  },
  {
    id: 3,
    title: 'React Hooks状态管理',
    startTime: '2025-06-05 10:00:00',
    endTime: '2025-07-05 23:59:59',
    submissionCount: 19,
    teacherName: '王教授'
  },
  {
    id: 4,
    title: 'MySQL数据库优化实验',
    startTime: '2025-04-20 09:00:00',
    endTime: '2025-05-10 23:59:59',
    submissionCount: 25,
    teacherName: '赵老师'
  },
  {
    id: 5,
    title: 'TypeScript类型系统实践',
    startTime: '2025-06-10 14:00:00',
    endTime: '2025-07-15 23:59:59',
    submissionCount: 15,
    teacherName: '刘教授'
  },
  {
    id: 6,
    title: '微信小程序开发入门',
    startTime: '2025-05-05 08:30:00',
    endTime: '2025-05-20 23:59:59',
    submissionCount: 30,
    teacherName: '孙老师'
  },
  {
    id: 7,
    title: 'Docker容器化部署实验',
    startTime: '2025-06-15 09:00:00',
    endTime: '2025-07-20 23:59:59',
    submissionCount: 12,
    teacherName: '周老师'
  },
  {
    id: 8,
    title: 'RESTful API设计规范',
    startTime: '2025-03-15 10:00:00',
    endTime: '2025-04-05 23:59:59',
    submissionCount: 22,
    teacherName: '吴教授'
  },
  {
    id: 9,
    title: '前端性能优化策略',
    startTime: '2025-06-20 09:30:00',
    endTime: '2025-07-30 23:59:59',
    submissionCount: 8,
    teacherName: '郑老师'
  },
  {
    id: 10,
    title: 'Python数据分析基础',
    startTime: '2025-04-10 08:00:00',
    endTime: '2025-04-30 23:59:59',
    submissionCount: 27,
    teacherName: '陈教授'
  }
]

// 响应式变量
const loading = ref(false)
const allExperiments = ref(staticExperiments) // 存储所有静态数据
const currentPage = ref(1)
const pageSize = ref(10)
const searchKeyword = ref('')
const currentTime = ref(Date.now()) // 当前时间戳，用于动态计算状态

// 每秒更新当前时间，确保状态实时性
setInterval(() => {
  currentTime.value = Date.now()
}, 1000)

// 计算属性：根据搜索关键词和分页条件过滤数据
const experiments = computed(() => {
  // 搜索过滤
  const filtered = allExperiments.value.filter(exp => 
    exp.title.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
  
  // 分页处理
  const startIndex = (currentPage.value - 1) * pageSize.value
  return filtered.slice(startIndex, startIndex + pageSize.value)
})

// 计算总条数（用于分页）
const total = computed(() => {
  return allExperiments.value.filter(exp => 
    exp.title.toLowerCase().includes(searchKeyword.value.toLowerCase())
  ).length
})

// 获取状态文本
const getStatusText = (row) => {
  const endTime = new Date(row.endTime).getTime()
  const startTime = new Date(row.startTime).getTime()
  
  if (currentTime.value > endTime) {
    return '已结束'
  } else if (currentTime.value < startTime) {
    return '未开始'
  } else {
    return '进行中'
  }
}

// 获取状态标签类型
const getStatusType = (row) => {
  const endTime = new Date(row.endTime).getTime()
  const startTime = new Date(row.startTime).getTime()
  
  if (currentTime.value > endTime) {
    return 'info' // 已结束-蓝色
  } else if (currentTime.value < startTime) {
    return 'warning' // 未开始-橙色
  } else {
    return 'success' // 进行中-绿色
  }
}

// 模拟获取实验列表（带加载效果）
const fetchExperiments = async () => {
  loading.value = true
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  loading.value = false
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
    
    // 从静态数据中移除
    allExperiments.value = allExperiments.value.filter(exp => exp.id !== id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete failed:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 查看提交列表
const viewSubmissions = (id) => {
  router.push(`/teacher/tscore/${id}`)
}

// 处理分页变化
const handlePageChange = (page) => {
  currentPage.value = page
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1 // 重置到第一页
}

// 页面加载时初始化数据
onMounted(() => {
  fetchExperiments()
})
</script>

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