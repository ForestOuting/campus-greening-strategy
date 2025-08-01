# Netlify 部署指南

## 项目配置

### 1. 项目结构
```
campus-greening-strategy-main/
├── public/
│   ├── index.html          # 主页面
│   └── assets/
│       ├── SchoolMap.png   # 校园地图
│       ├── ShanDa.png      # 山大logo
│       └── Result.png      # 结果图片
├── package.json            # 项目配置
├── netlify.toml           # Netlify配置
└── build.bat              # Windows构建脚本
```

### 2. Netlify配置设置

在Netlify控制台中，请按以下设置配置：

#### 基本设置：
- **基本目录 (Base directory)**: `public`
- **包目录 (Package directory)**: `public`
- **构建命令 (Build command)**: `npm run build`
- **发布目录 (Publish directory)**: `dist`
- **函数目录 (Function directory)**: `netlify/functions`

#### 部署设置：
- **部署日志可见性**: 公共日志
- **生成状态**: 活动构建

### 3. 部署步骤

1. **注册Netlify账号**
   - 访问 [https://netlify.com](https://netlify.com)
   - 使用GitHub账号登录

2. **连接GitHub仓库**
   - 点击"New site from Git"
   - 选择GitHub
   - 选择您的仓库：`campus-greening-strategy`

3. **配置构建设置**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base directory: `public`

4. **部署**
   - 点击"Deploy site"
   - 等待构建完成

### 4. 访问网站

部署完成后，您的网站地址为：
```
https://your-site-name.netlify.app
```

### 5. 其他设备访问

- **手机**: 打开浏览器，输入网站地址
- **电脑**: 打开浏览器，输入网站地址
- **微信**: 复制链接到微信分享

## 故障排除

### 问题1: 构建失败
**解决方案**:
- 检查package.json中的构建脚本
- 确认public目录存在
- 查看构建日志

### 问题2: 图片无法显示
**解决方案**:
- 确认assets文件夹已上传
- 检查图片路径是否正确

### 问题3: 功能异常
**解决方案**:
- 检查浏览器控制台错误
- 确认所有JavaScript文件正常加载

## 更新网站

1. 修改代码后推送到GitHub
2. Netlify会自动重新构建和部署
3. 几分钟后网站内容自动更新 