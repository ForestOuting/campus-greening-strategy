# 部署说明

## 本地开发

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm start
```

3. 构建生产版本：
```bash
npm run build          # 详细构建脚本
npm run build:simple   # 简单构建脚本
```

## Netlify 部署

项目已配置为自动部署到 Netlify。构建过程包括：

1. 运行 `npm run build:simple` 命令
2. 将 `public` 目录的内容复制到 `dist` 目录
3. 部署 `dist` 目录的内容

### 构建配置

- **构建命令**: `npm run build:simple`
- **发布目录**: `dist`
- **Node.js 版本**: 18
- **基本目录**: `.` (项目根目录)

### 修复的问题

- ✅ 修复了构建脚本中的跨平台兼容性问题
- ✅ 使用 Node.js 脚本替代了 Windows 批处理命令
- ✅ 添加了详细的错误处理和调试信息
- ✅ 提供了两个构建脚本选项（详细版和简单版）
- ✅ 确保在 Unix/Linux 环境（如 Netlify）中正常工作

## 文件结构

```
├── public/              # 源代码目录
│   ├── index.html       # 主页面
│   └── assets/          # 静态资源
├── dist/                # 构建输出目录（自动生成）
├── build.js             # 详细构建脚本
├── build-simple.js      # 简单构建脚本
├── package.json         # 项目配置
└── netlify.toml        # Netlify 配置
```

## 故障排除

### 问题1: MODULE_NOT_FOUND 错误
**原因**: 构建脚本路径问题
**解决方案**: 
- 使用 `npm run build:simple` 替代 `npm run build`
- 确保所有文件都在正确的位置

### 问题2: 构建失败
**检查项**:
1. 确认 `public` 目录存在
2. 确认 `package.json` 中的脚本正确
3. 确认 `netlify.toml` 配置正确

### 问题3: 文件未正确复制
**解决方案**:
- 检查构建日志中的文件列表
- 确认 `dist` 目录包含所有必要文件

## 构建脚本说明

### build.js (详细版)
- 包含详细的日志输出
- 提供错误堆栈信息
- 适合调试问题

### build-simple.js (简单版)
- 使用更简单的逻辑
- 更少的依赖
- 适合生产环境

## 验证部署

部署成功后，您应该能看到：
- ✅ 构建日志显示"构建成功"
- ✅ `dist` 目录包含所有文件
- ✅ 网站正常访问和显示 