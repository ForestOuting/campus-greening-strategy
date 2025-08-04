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
npm run build
```

## Netlify 部署

项目已配置为自动部署到 Netlify。构建过程包括：

1. 运行 `npm run build` 命令
2. 将 `public` 目录的内容复制到 `dist` 目录
3. 部署 `dist` 目录的内容

### 构建配置

- **构建命令**: `npm run build`
- **发布目录**: `dist`
- **Node.js 版本**: 18

### 修复的问题

- 修复了构建脚本中的跨平台兼容性问题
- 使用 Node.js 脚本替代了 Windows 批处理命令
- 确保在 Unix/Linux 环境（如 Netlify）中正常工作

## 文件结构

```
├── public/          # 源代码目录
│   ├── index.html   # 主页面
│   └── assets/      # 静态资源
├── dist/            # 构建输出目录（自动生成）
├── build.js         # 构建脚本
├── package.json     # 项目配置
└── netlify.toml    # Netlify 配置
``` 