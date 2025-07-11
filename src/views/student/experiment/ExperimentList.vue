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

const router = useRouter()

const loading = ref(false)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 静态实验数据（不含状态字段，由计算属性自动生成）
const experiments = ref([
  {
    id: 1,
    title: "基于Vue3的组件化开发实践",
    teacherName: "张教授",
    startTime: "2025-06-01 09:00:00",
    endTime: "2025-07-10 23:59:59", // 未来时间（进行中）
    submitted: false
  },
  {
    id: 2,
    title: "Element Plus组件库综合应用",
    teacherName: "李老师",
    startTime: "2025-05-15 08:30:00",
    endTime: "2025-07-05 23:59:59", // 未来时间（进行中）
    submitted: true
  },
  {
    id: 3,
    title: "Vue Router路由守卫实现",
    teacherName: "王教授",
    startTime: "2025-04-20 10:00:00",
    endTime: "2025-06-30 23:59:59", // 过去时间（已结束）
    submitted: true
  },
  {
    id: 4,
    title: "Pinia状态管理高级用法",
    teacherName: "赵老师",
    startTime: "2025-06-05 14:00:00",
    endTime: "2025-07-15 23:59:59", // 未来时间（进行中）
    submitted: false
  },
  {
    id: 5,
    title: "Vue3组合式API实战",
    teacherName: "刘教授",
    startTime: "2025-03-10 09:00:00",
    endTime: "2025-06-20 23:59:59", // 过去时间（已结束）
    submitted: true
  },
  {
    id: 6,
    title: "响应式原理与双向绑定实现",
    teacherName: "孙老师",
    startTime: "2025-06-10 10:30:00",
    endTime: "2025-07-20 23:59:59", // 未来时间（进行中）
    submitted: false
  },
  {
    id: 7,
    title: "Vue项目性能优化策略",
    teacherName: "周教授",
    startTime: "2025-05-01 09:00:00",
    endTime: "2025-06-15 23:59:59", // 过去时间（已结束）
    submitted: true
  },
  {
    id: 8,
    title: "单元测试与Vue Test Utils",
    teacherName: "吴老师",
    startTime: "2025-06-15 13:30:00",
    endTime: "2025-07-30 23:59:59", // 未来时间（进行中）
    submitted: false
  },
  {
    id: 9,
    title: "TypeScript与Vue3结合使用",
    teacherName: "郑教授",
    startTime: "2025-04-01 08:00:00",
    endTime: "2025-06-01 23:59:59", // 过去时间（已结束）
    submitted: true
  },
  {
    id: 10,
    title: "Vue3+Vite项目构建流程",
    teacherName: "陈老师",
    startTime: "2025-06-08 15:00:00",
    endTime: "2025-07-08 23:59:59", // 未来时间（进行中）
    submitted: false
  }
])

// 计算属性：自动生成状态（基于当前时间与截止时间对比）
const filteredExperiments = computed(() => {
  const now = new Date()
  return experiments.value
    // 搜索过滤
    .filter(experiment => 
      experiment.title.includes(searchKeyword.value)
    )
    // 补充状态字段
    .map(experiment => {
      const endTime = new Date(experiment.endTime)
      return {
        ...experiment,
        status: endTime > now ? 'active' : 'completed'
      }
    })
    // 分页处理
    .slice(
      (currentPage.value - 1) * pageSize.value,
      currentPage.value * pageSize.value
    )
})

// 总数量计算
const total = computed(() => {
  return experiments.value.filter(experiment => 
    experiment.title.includes(searchKeyword.value)
  ).length
})

// 上传实验
const uploadExperiment = (id) => {
  router.push(`/student/experiment-upload/${id}`)
}

// 查看实验详情
const viewExperiment = (id) => {
  router.push(`/student/score/${id}`)
}

// 处理分页变化
const handlePageChange = (page) => {
  currentPage.value = page
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
}

onMounted(() => {
  // 模拟加载延迟
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 800)
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