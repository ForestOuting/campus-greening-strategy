const fs = require('fs');
const path = require('path');

console.log('=== 简单构建脚本 ===');
console.log('当前目录:', process.cwd());

try {
  // 确保dist目录存在
  const distPath = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
    console.log('清理旧的dist目录');
  }
  
  fs.mkdirSync(distPath, { recursive: true });
  console.log('创建dist目录');
  
  // 复制文件
  const publicPath = path.join(process.cwd(), 'public');
  const files = fs.readdirSync(publicPath);
  
  for (const file of files) {
    const src = path.join(publicPath, file);
    const dest = path.join(distPath, file);
    
    if (fs.statSync(src).isDirectory()) {
      // 复制目录
      fs.cpSync(src, dest, { recursive: true });
      console.log(`复制目录: ${file}`);
    } else {
      // 复制文件
      fs.copyFileSync(src, dest);
      console.log(`复制文件: ${file}`);
    }
  }
  
  console.log('✅ 构建成功！');
} catch (error) {
  console.error('❌ 构建失败:', error.message);
  process.exit(1);
} 