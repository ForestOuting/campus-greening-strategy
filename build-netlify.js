const fs = require('fs');
const path = require('path');

console.log('=== Netlify 构建脚本 ===');
console.log('当前目录:', process.cwd());
console.log('Node.js版本:', process.version);

try {
  // 检查当前目录结构
  console.log('检查目录结构...');
  const currentDir = process.cwd();
  const items = fs.readdirSync(currentDir);
  console.log('当前目录内容:', items);
  
  // 检查public目录
  const publicPath = path.join(currentDir, 'public');
  if (!fs.existsSync(publicPath)) {
    throw new Error(`public目录不存在: ${publicPath}`);
  }
  
  const publicItems = fs.readdirSync(publicPath);
  console.log('public目录内容:', publicItems);
  
  // 创建dist目录
  const distPath = path.join(currentDir, 'dist');
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
    console.log('清理旧的dist目录');
  }
  
  fs.mkdirSync(distPath, { recursive: true });
  console.log('创建dist目录');
  
  // 复制所有文件
  for (const item of publicItems) {
    const src = path.join(publicPath, item);
    const dest = path.join(distPath, item);
    
    if (fs.statSync(src).isDirectory()) {
      fs.cpSync(src, dest, { recursive: true });
      console.log(`复制目录: ${item}`);
    } else {
      fs.copyFileSync(src, dest);
      console.log(`复制文件: ${item}`);
    }
  }
  
  // 验证结果
  const distItems = fs.readdirSync(distPath);
  console.log('dist目录内容:', distItems);
  
  console.log('✅ Netlify构建成功！');
} catch (error) {
  console.error('❌ 构建失败:', error.message);
  console.error('错误详情:', error);
  process.exit(1);
} 