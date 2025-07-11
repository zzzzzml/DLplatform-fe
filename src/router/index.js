import { createRouter, createWebHistory } from 'vue-router'

// 公共路由
const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/common/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/common/Register.vue')
  },
  // 学生端路由
  {
    path: '/student',
    name: 'StudentLayout',
    component: () => import('../layouts/StudentLayout.vue'),
    redirect: '/student/home',
    children: [
      {
        path: 'home',
        name: 'StudentHome',
        component: () => import('../views/student/Home.vue')
      },
      {
        path: 'experiment-list',
        name: 'StudentExperimentList',
        component: () => import('../views/student/experiment/ExperimentList.vue')
      },
      {
        path: 'experiment-detail/:id',
        name: 'StudentExperimentDetail',
        component: () => import('../views/student/experiment/ExperimentDetail.vue')
      },
      {
        path: 'experiment-submit/:id',
        name: 'StudentExperimentSubmit',
        component: () => import('../views/student/experiment/ExperimentSubmit.vue')
      },
      {
        path: 'result',
        name: 'StudentResult',
        component: () => import('../views/student/result/ResultList.vue')
      },
      {
        path: 'profile',
        name: 'StudentProfile',
        component: () => import('../views/student/profile/Profile.vue')
      }
    ]
  },
  // 教师端路由
  {
    path: '/teacher',
    name: 'TeacherLayout',
    component: () => import('../layouts/TeacherLayout.vue'),
    redirect: '/teacher/home',
    children: [
      {
        path: 'home',
        name: 'TeacherHome',
        component: () => import('../views/teacher/Home.vue')
      },
      {
        path: 'experiment-manage',
        name: 'ExperimentManage',
        component: () => import('../views/teacher/experiment/ExperimentManage.vue')
      },
      {
        path: 'experiment-create',
        name: 'ExperimentCreate',
        component: () => import('../views/teacher/experiment/ExperimentCreate.vue')
      },
      {
        path: 'experiment-edit/:id',
        name: 'ExperimentEdit',
        component: () => import('../views/teacher/experiment/ExperimentEdit.vue')
      },
      {
        path: 'experiment-detail/:id',
        name: 'TeacherExperimentDetail',
        component: () => import('../views/teacher/experiment/ExperimentDetail.vue')
      },
      {
        path: 'evaluation',
        name: 'EvaluationManage',
        component: () => import('../views/teacher/evaluation/EvaluationManage.vue')
      },
      {
        path: 'evaluation-detail/:id',
        name: 'EvaluationDetail',
        component: () => import('../views/teacher/evaluation/EvaluationDetail.vue')
      },
      {
        path: 'class-manage',
        name: 'ClassManage',
        component: () => import('../views/teacher/class/ClassManage.vue')
      },
      {
        path: 'profile',
        name: 'TeacherProfile',
        component: () => import('../views/teacher/profile/Profile.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  console.log('导航到:', to.path)
  // 获取登录状态
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  
  console.log('当前登录状态:', { token: !!token, role })
  
  // 登录和注册页面不需要验证
  if (to.path === '/' || to.path === '/register') {
    // 如果已登录，根据角色重定向到对应首页
    if (token) {
      console.log('用户已登录，角色:', role)
      if (role === 'teacher') {
        next('/teacher/home')
      } else if (role === 'student') {
        next('/student/home')
      } else {
        // 如果角色无效，清除登录状态并保持在登录页
        console.log('角色无效，清除登录状态')
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        localStorage.removeItem('role')
        next()
      }
    } else {
      next()
    }
  } else {
    // 如果未登录，重定向到登录页
    if (!token) {
      console.log('未登录，重定向到登录页')
      next('/')
      return
    }
    
    // 权限控制：确保用户只能访问对应角色的页面
    const isTeacherRoute = to.path.startsWith('/teacher')
    const isStudentRoute = to.path.startsWith('/student')
    
    if (isTeacherRoute && role !== 'teacher') {
      console.log('学生尝试访问教师页面，重定向到学生首页')
      next('/student/home')
    } else if (isStudentRoute && role !== 'student') {
      console.log('教师尝试访问学生页面，重定向到教师首页')
      next('/teacher/home')
    } else {
      // 正常放行
      console.log('权限验证通过，允许访问:', to.path)
      next()
    }
  }
})

export default router 