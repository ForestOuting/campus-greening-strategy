// 多设备数据同步系统
console.log('🔄 正在加载 multi-device-sync.js...');

const MultiDeviceSync = {
  // 存储键名
  storageKey: 'greening_sync_data',
  backupKey: 'greening_sync_backup',
  deviceId: 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now(),
  
  // 数据版本控制
  dataVersion: '1.0.0',
  
  // 初始化
  init() {
    console.log('📱 设备ID:', this.deviceId);
    this.createBackup();
    return this;
  },

  // 保存数据到本地存储
  saveData(data) {
    try {
      const dataPackage = {
        version: this.dataVersion,
        timestamp: Date.now(),
        deviceId: this.deviceId,
        lastModified: new Date().toISOString(),
        data: data
      };

      localStorage.setItem(this.storageKey, JSON.stringify(dataPackage));
      console.log('✅ 数据保存成功');
      return true;
    } catch (error) {
      console.error('❌ 数据保存失败:', error);
      return false;
    }
  },

  // 从本地存储加载数据
  loadData() {
    try {
      const savedData = localStorage.getItem(this.storageKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.data) {
          console.log('✅ 数据加载成功');
          return parsed.data;
        }
      }
      console.log('⚠️ 没有找到本地数据');
      return null;
    } catch (error) {
      console.error('❌ 数据加载失败:', error);
      return null;
    }
  },

  // 导出数据为文件
  exportData() {
    try {
      const data = this.loadData();
      if (!data) {
        throw new Error('没有可导出的数据');
      }

      const exportPackage = {
        version: this.dataVersion,
        exportTimestamp: Date.now(),
        exportDeviceId: this.deviceId,
        exportDate: new Date().toISOString(),
        data: data
      };

      const blob = new Blob([JSON.stringify(exportPackage, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `greening-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('✅ 数据导出成功');
      return true;
    } catch (error) {
      console.error('❌ 数据导出失败:', error);
      return false;
    }
  },

  // 从文件导入数据
  importData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          const importedData = JSON.parse(content);
          
          // 验证数据格式
          if (!importedData.data || !importedData.version) {
            throw new Error('无效的数据格式');
          }

          // 保存导入的数据
          const success = this.saveData(importedData.data);
          
          if (success) {
            console.log('✅ 数据导入成功');
            console.log('📅 导入时间:', new Date(importedData.exportDate).toLocaleString());
            console.log('📱 来源设备:', importedData.exportDeviceId);
            resolve(importedData);
          } else {
            reject(new Error('数据保存失败'));
          }
        } catch (error) {
          console.error('❌ 数据导入失败:', error);
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };

      reader.readAsText(file);
    });
  },

  // 创建备份
  createBackup() {
    try {
      const data = this.loadData();
      if (data) {
        const backupPackage = {
          version: this.dataVersion,
          backupTimestamp: Date.now(),
          deviceId: this.deviceId,
          data: data
        };
        
        localStorage.setItem(this.backupKey, JSON.stringify(backupPackage));
        console.log('✅ 备份创建成功');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ 备份创建失败:', error);
      return false;
    }
  },

  // 恢复备份
  restoreBackup() {
    try {
      const backup = localStorage.getItem(this.backupKey);
      if (backup) {
        const backupData = JSON.parse(backup);
        if (backupData.data) {
          this.saveData(backupData.data);
          console.log('✅ 备份恢复成功');
          return true;
        }
      }
      console.log('⚠️ 没有找到备份数据');
      return false;
    } catch (error) {
      console.error('❌ 备份恢复失败:', error);
      return false;
    }
  },

  // 获取同步状态
  getSyncStatus() {
    const hasData = !!localStorage.getItem(this.storageKey);
    const hasBackup = !!localStorage.getItem(this.backupKey);
    
    let lastModified = '从未保存';
    if (hasData) {
      try {
        const savedData = localStorage.getItem(this.storageKey);
        const parsed = JSON.parse(savedData);
        lastModified = new Date(parsed.timestamp).toLocaleString();
      } catch (e) {
        lastModified = '未知';
      }
    }
    
    return {
      hasData: hasData,
      hasBackup: hasBackup,
      deviceId: this.deviceId,
      lastModified: lastModified,
      version: this.dataVersion
    };
  },

  // 清除所有数据
  clearAllData() {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.backupKey);
      console.log('✅ 所有数据已清除');
      return true;
    } catch (error) {
      console.error('❌ 数据清除失败:', error);
      return false;
    }
  },

  // 验证数据完整性
  validateData(data) {
    if (!data) return false;
    
    // 检查必要的数据结构
    const requiredFields = ['areas', 'plants', 'tasks'];
    for (const field of requiredFields) {
      if (!data[field] || !Array.isArray(data[field])) {
        console.warn(`⚠️ 缺少必要字段: ${field}`);
        return false;
      }
    }
    
    return true;
  },

  // 合并数据（处理冲突）
  mergeData(localData, importedData) {
    try {
      const merged = { ...localData };
      
      // 合并区域数据
      if (importedData.areas) {
        merged.areas = this.mergeArrays(merged.areas || [], importedData.areas);
      }
      
      // 合并植物数据
      if (importedData.plants) {
        merged.plants = this.mergeArrays(merged.plants || [], importedData.plants);
      }
      
      // 合并任务数据
      if (importedData.tasks) {
        merged.tasks = this.mergeArrays(merged.tasks || [], importedData.tasks);
      }
      
      console.log('✅ 数据合并成功');
      return merged;
    } catch (error) {
      console.error('❌ 数据合并失败:', error);
      return localData;
    }
  },

  // 合并数组（去重）
  mergeArrays(localArray, importedArray) {
    const merged = [...localArray];
    const localIds = new Set(localArray.map(item => item.id));
    
    for (const item of importedArray) {
      if (!localIds.has(item.id)) {
        merged.push(item);
      }
    }
    
    return merged;
  }
};

// 导出到全局
window.multiDeviceSync = MultiDeviceSync.init();
console.log('✅ multi-device-sync.js 加载完成，多设备同步系统已创建'); 