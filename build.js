const fs = require('fs');
const path = require('path');

console.log('开始构建...');
console.log('当前工作目录:', process.cwd());
console.log('Node.js版本:', process.version);

// 构建脚本
function build() {
  const distDir = path.join(process.cwd(), 'dist');
  const publicDir = path.join(process.cwd(), 'public');
  
  console.log('目标目录:', distDir);
  console.log('源目录:', publicDir);
  
  try {
    // 检查public目录是否存在
    if (!fs.existsSync(publicDir)) {
      throw new Error(`源目录不存在: ${publicDir}`);
    }
    
    console.log('源目录存在，开始构建...');
    
    // 删除dist目录（如果存在）
    if (fs.existsSync(distDir)) {
      fs.rmSync(distDir, { recursive: true, force: true });
      console.log('已删除旧的dist目录');
    }
    
    // 创建dist目录
    fs.mkdirSync(distDir, { recursive: true });
    console.log('已创建dist目录');
    
    // 复制public目录内容到dist
    copyDirectory(publicDir, distDir);
    console.log('文件复制完成');
    
    // 验证构建结果
    const distFiles = fs.readdirSync(distDir);
    console.log('构建后的文件:', distFiles);
    
    console.log('✅ 构建完成！文件已复制到dist目录。');
  } catch (error) {
    console.error('❌ 构建失败:', error.message);
    console.error('错误堆栈:', error.stack);
    process.exit(1);
  }
}

// 递归复制目录
function copyDirectory(src, dest) {
  console.log(`复制目录: ${src} -> ${dest}`);
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const items = fs.readdirSync(src);
  console.log(`源目录内容: ${items.join(', ')}`);
  
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      console.log(`复制子目录: ${item}`);
      copyDirectory(srcPath, destPath);
    } else {
      console.log(`复制文件: ${item}`);
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 运行构建
build(); 