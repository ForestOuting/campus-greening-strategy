// 测试存储系统
console.log('🔄 正在加载 test-storage.js...');

// 简单的存储系统
const TestStorage = {
  storageKey: 'test_greening_data',
  backupKey: 'test_greening_backup',
  deviceId: 'test_device_' + Date.now(),

  // 保存数据
  saveData(data) {
    try {
      const dataPackage = {
        version: '1.0',
        timestamp: Date.now(),
        deviceId: this.deviceId,
        data: data
      };

      localStorage.setItem(this.storageKey, JSON.stringify(dataPackage));
      console.log('✅ 测试数据保存成功');
      return true;
    } catch (error) {
      console.error('❌ 测试数据保存失败:', error);
      return false;
    }
  },

  // 加载数据
  loadData() {
    try {
      const savedData = localStorage.getItem(this.storageKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.data) {
          console.log('✅ 测试数据加载成功');
          return parsed.data;
        }
      }
      console.log('⚠️ 没有找到测试数据');
      return null;
    } catch (error) {
      console.error('❌ 测试数据加载失败:', error);
      return null;
    }
  },

  // 创建备份
  createBackup() {
    try {
      const data = this.loadData();
      if (data) {
        localStorage.setItem(this.backupKey, JSON.stringify(data));
        console.log('✅ 测试备份创建成功');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ 测试备份创建失败:', error);
      return false;
    }
  },

  // 恢复备份
  restoreBackup() {
    try {
      const backup = localStorage.getItem(this.backupKey);
      if (backup) {
        const data = JSON.parse(backup);
        this.saveData(data);
        console.log('✅ 测试备份恢复成功');
        return true;
      }
      console.log('⚠️ 没有找到测试备份');
      return false;
    } catch (error) {
      console.error('❌ 测试备份恢复失败:', error);
      return false;
    }
  },

  // 清除所有数据
  clearAllData() {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.backupKey);
      console.log('✅ 测试数据已清除');
      return true;
    } catch (error) {
      console.error('❌ 测试数据清除失败:', error);
      return false;
    }
  },

  // 获取存储状态
  getStorageStatus() {
    const hasData = !!localStorage.getItem(this.storageKey);
    const hasBackup = !!localStorage.getItem(this.backupKey);
    
    return {
      hasData: hasData,
      hasBackup: hasBackup,
      deviceId: this.deviceId,
      lastModified: hasData ? new Date().toLocaleString() : '从未保存'
    };
  }
};

// 导出测试存储实例
window.testStorage = TestStorage;
console.log('✅ test-storage.js 加载完成，测试存储系统已创建'); 