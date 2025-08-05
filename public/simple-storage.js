// 简化的数据存储系统
console.log('🔄 正在加载 simple-storage.js...');

class SimpleStorage {
  constructor() {
    console.log('🔄 初始化 SimpleStorage...');
    this.storageKey = 'campus_greening_data';
    this.backupKey = 'campus_greening_backup';
    this.deviceId = this.getDeviceId();
    console.log('✅ SimpleStorage 初始化完成，设备ID:', this.deviceId);
  }

  // 获取设备ID
  getDeviceId() {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  }

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
      console.log('✅ 数据保存成功:', {
        设备ID: this.deviceId,
        区域数量: Object.keys(data.greenAreas || {}).length,
        时间戳: new Date().toLocaleString()
      });
      return true;
    } catch (error) {
      console.error('❌ 数据保存失败:', error);
      return false;
    }
  }

  // 加载数据
  loadData() {
    try {
      const savedData = localStorage.getItem(this.storageKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.data) {
          console.log('✅ 数据加载成功:', {
            设备ID: parsed.deviceId,
            区域数量: Object.keys(parsed.data.greenAreas || {}).length,
            时间戳: new Date(parsed.timestamp).toLocaleString()
          });
          return parsed.data;
        }
      }
      console.log('⚠️ 没有找到保存的数据');
      return null;
    } catch (error) {
      console.error('❌ 数据加载失败:', error);
      return null;
    }
  }

  // 创建备份
  createBackup() {
    try {
      const data = this.loadData();
      if (data) {
        localStorage.setItem(this.backupKey, JSON.stringify(data));
        console.log('✅ 备份创建成功');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ 备份创建失败:', error);
      return false;
    }
  }

  // 恢复备份
  restoreBackup() {
    try {
      const backup = localStorage.getItem(this.backupKey);
      if (backup) {
        const data = JSON.parse(backup);
        this.saveData(data);
        console.log('✅ 备份恢复成功');
        return true;
      }
      console.log('⚠️ 没有找到备份');
      return false;
    } catch (error) {
      console.error('❌ 备份恢复失败:', error);
      return false;
    }
  }

  // 清除所有数据
  clearAllData() {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.backupKey);
      console.log('✅ 所有数据已清除');
      return true;
    } catch (error) {
      console.error('❌ 清除数据失败:', error);
      return false;
    }
  }

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
}

// 导出存储实例
console.log('🔄 创建 SimpleStorage 实例...');
window.simpleStorage = new SimpleStorage();
console.log('✅ simple-storage.js 加载完成，实例已创建:', window.simpleStorage); 