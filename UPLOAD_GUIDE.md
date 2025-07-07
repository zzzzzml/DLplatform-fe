# 实验文件上传功能使用指南

## 功能概述

本系统支持学生上传Python实验文件（.py格式），用于提交深度学习实验作业。

## 主要功能

### 1. 文件上传
- ✅ **拖拽上传**：支持拖拽文件到上传区域
- ✅ **点击上传**：点击上传区域选择文件
- ✅ **文件验证**：自动验证文件类型和大小
- ✅ **进度显示**：实时显示上传进度
- ✅ **错误处理**：友好的错误提示

### 2. 文件要求
- **文件格式**：仅支持 .py 文件
- **文件大小**：不超过 10MB
- **文件内容**：完整的Python源代码

### 3. 上传流程
1. 在实验列表页面点击"上传"按钮
2. 进入上传页面，查看实验信息
3. 拖拽或点击选择Python文件
4. 系统自动验证文件格式和大小
5. 点击"提交实验"按钮
6. 确认提交后开始上传
7. 上传成功后自动返回实验列表

## 使用方法

### 步骤1：访问上传页面
```
1. 登录系统（用户名：123，密码：123）
2. 选择学生角色
3. 进入实验列表页面
4. 点击任意实验的"上传"按钮
```

### 步骤2：选择文件
```
1. 准备一个Python文件（.py格式）
2. 拖拽文件到上传区域，或点击选择文件
3. 系统会自动验证文件格式
```

### 步骤3：提交文件
```
1. 确认文件信息正确
2. 点击"提交实验"按钮
3. 在弹出的确认对话框中点击"确定"
4. 等待上传完成
```

## 测试文件

项目根目录下提供了测试文件 `test_experiment.py`，包含：
- 完整的Python实验代码
- 机器学习模型训练
- 数据可视化功能
- 详细的代码注释

### 测试文件特点
- **文件大小**：约 8KB
- **依赖库**：numpy, matplotlib, sklearn
- **功能**：模拟Vue3组件化开发的数据处理流程

## 技术实现

### 前端技术
- **Vue 3**：响应式框架
- **Element Plus**：UI组件库
- **Axios**：HTTP请求库

### 上传组件
```javascript
// 文件上传配置
const uploadConfig = {
  accept: '.py',           // 只接受Python文件
  limit: 1,               // 限制上传1个文件
  maxSize: 10 * 1024 * 1024, // 最大10MB
  autoUpload: false       // 手动触发上传
}
```

### API接口
```javascript
// 上传文件API
POST /api/experiments/upload
Content-Type: multipart/form-data

// 请求参数
{
  file: File,           // 上传的文件
  experimentId: Number, // 实验ID
  studentId: Number     // 学生ID
}
```

## 错误处理

### 常见错误及解决方案

1. **文件格式错误**
   - 错误：`只能上传Python文件！`
   - 解决：确保文件扩展名为 .py

2. **文件过大**
   - 错误：`文件大小不能超过10MB！`
   - 解决：压缩文件或分割代码

3. **网络错误**
   - 错误：`文件上传失败，请重试`
   - 解决：检查网络连接，重新上传

4. **权限错误**
   - 错误：`上传权限不足`
   - 解决：确认已登录且具有上传权限

## 开发说明

### 文件结构
```
DLplatform-fe/
├── src/
│   ├── views/student/experiment/
│   │   └── ExperimentUpload.vue    # 上传页面
│   ├── api/
│   │   └── upload.js               # 上传API
│   └── router/
│       └── index.js                # 路由配置
├── test_experiment.py              # 测试文件
└── UPLOAD_GUIDE.md                 # 使用指南
```

### 自定义配置

#### 修改文件大小限制
```javascript
// 在 ExperimentUpload.vue 中修改
const isLt10M = file.size / 1024 / 1024 < 10  // 修改数字10
```

#### 修改支持的文件类型
```javascript
// 在 ExperimentUpload.vue 中修改
const isPython = file.type === 'text/x-python' || file.name.endsWith('.py')
// 添加其他文件类型
```

#### 修改上传API地址
```javascript
// 在 upload.js 中修改
export function uploadExperimentFile(data) {
  return request({
    url: '/your-custom-api/upload',  // 修改API地址
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
```

## 注意事项

1. **文件安全**：上传的文件会进行安全检查，防止恶意代码
2. **数据备份**：建议在上传前备份重要文件
3. **网络稳定**：确保网络连接稳定，避免上传中断
4. **浏览器兼容**：建议使用现代浏览器（Chrome、Firefox、Safari、Edge）

## 故障排除

### 上传失败
1. 检查文件格式是否为 .py
2. 检查文件大小是否超过限制
3. 检查网络连接
4. 刷新页面重试

### 页面无法访问
1. 确认已正确登录
2. 检查路由配置
3. 清除浏览器缓存
4. 重启开发服务器

### 文件验证失败
1. 确保文件是有效的Python代码
2. 检查文件编码（建议使用UTF-8）
3. 确保文件没有损坏

## 联系支持

如果遇到问题，请：
1. 查看浏览器控制台错误信息
2. 检查网络请求状态
3. 联系技术支持团队 