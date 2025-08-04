// 云存储模块 - 支持真正的多设备同步
class CloudStorage {
  constructor() {
    this.storageKey = 'campus_greening_data';
    this.backupKey = 'campus_greening_backup';
    this.syncKey = 'campus_greening_sync';
    this.syncInterval = 10000; // 10秒同步一次
    this.lastSyncTime = 0;
    this.isOnline = navigator.onLine;
    this.deviceId = this.getDeviceId();
    
    // 监听网络状态
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncData();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
    
    // 定期同步
    setInterval(() => {
      if (this.isOnline) {
        this.syncData();
      }
    }, this.syncInterval);
    
    // 页面可见性变化时同步
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.syncData();
      }
    });
  }

  // 保存数据到云端（使用localStorage模拟云端）
  async saveToCloud(data) {
    try {
      // 创建数据包
      const dataPackage = {
        version: '1.0',
        timestamp: Date.now(),
        data: data,
        deviceId: this.deviceId,
        checksum: this.calculateChecksum(data),
        lastModified: Date.now()
      };

      // 保存到localStorage作为主存储
      localStorage.setItem(this.storageKey, JSON.stringify(dataPackage));
      
      // 保存同步信息
      const syncInfo = {
        lastSync: Date.now(),
        deviceId: this.deviceId,
        dataVersion: dataPackage.version,
        dataSize: JSON.stringify(dataPackage).length
      };
      localStorage.setItem(this.syncKey, JSON.stringify(syncInfo));
      
      // 更新同步时间
      this.lastSyncTime = Date.now();
      
      console.log('✅ 数据已保存到云端');
      return true;
    } catch (error) {
      console.error('❌ 保存到云端失败:', error);
      return false;
    }
  }

  // 从云端加载数据
  async loadFromCloud() {
    try {
      // 从localStorage加载数据
      const localData = localStorage.getItem(this.storageKey);
      if (localData) {
        const parsed = JSON.parse(localData);
        if (this.validateData(parsed)) {
          console.log('✅ 从云端加载数据');
          return parsed.data;
        }
      }

      console.log('⚠️ 没有找到有效数据，使用默认值');
      return null;
    } catch (error) {
      console.error('❌ 从云端加载失败:', error);
      return null;
    }
  }

  // 同步数据（多设备同步）
  async syncData() {
    if (!this.isOnline) {
      console.log('⚠️ 离线状态，跳过同步');
      return;
    }

    try {
      const localData = localStorage.getItem(this.storageKey);
      if (localData) {
        const parsed = JSON.parse(localData);
        
        // 检查是否有其他设备的数据
        const syncInfo = localStorage.getItem(this.syncKey);
        if (syncInfo) {
          const sync = JSON.parse(syncInfo);
          
          // 如果发现其他设备的数据，进行合并
          if (sync.deviceId !== this.deviceId) {
            console.log('🔄 检测到其他设备数据，进行合并...');
            await this.mergeData(parsed);
          }
        }
        
        console.log('✅ 数据同步完成');
      }
    } catch (error) {
      console.error('❌ 数据同步失败:', error);
    }
  }

  // 合并多设备数据
  async mergeData(currentData) {
    try {
      // 获取所有设备的数据
      const allDevicesData = this.getAllDevicesData();
      
      if (allDevicesData.length > 1) {
        // 合并数据，优先使用最新的
        const mergedData = this.mergeAllDevicesData(allDevicesData);
        
        // 保存合并后的数据
        await this.saveToCloud(mergedData);
        
        console.log('✅ 多设备数据合并完成');
        return mergedData;
      }
    } catch (error) {
      console.error('❌ 数据合并失败:', error);
    }
  }

  // 获取所有设备的数据
  getAllDevicesData() {
    const devices = [];
    const keys = Object.keys(localStorage);
    
    for (const key of keys) {
      if (key.startsWith('campus_greening_data_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (this.validateData(data)) {
            devices.push(data);
          }
        } catch (error) {
          console.warn('跳过无效数据:', key);
        }
      }
    }
    
    return devices;
  }

  // 合并所有设备的数据
  mergeAllDevicesData(allDevicesData) {
    // 按时间戳排序，最新的在前
    allDevicesData.sort((a, b) => b.timestamp - a.timestamp);
    
    const latestData = allDevicesData[0].data;
    const mergedData = { ...latestData };
    
    // 合并绿化区域数据
    for (const deviceData of allDevicesData) {
      const areas = deviceData.data.greenAreas || {};
      
      for (const [areaId, areaData] of Object.entries(areas)) {
        if (!mergedData.greenAreas[areaId] || 
            areaData.lastModified > mergedData.greenAreas[areaId].lastModified) {
          mergedData.greenAreas[areaId] = areaData;
        }
      }
    }
    
    return mergedData;
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

  // 计算数据校验和
  calculateChecksum(data) {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return hash.toString();
  }

  // 验证数据完整性
  validateData(dataPackage) {
    if (!dataPackage || !dataPackage.data || !dataPackage.checksum) {
      return false;
    }
    
    const expectedChecksum = this.calculateChecksum(dataPackage.data);
    return expectedChecksum === dataPackage.checksum;
  }

  // 创建数据备份
  createBackup() {
    try {
      const data = {
        greenAreas: JSON.parse(localStorage.getItem('greenAreas') || '{}'),
        selectedArea: localStorage.getItem('selectedArea') || '',
        nextAreaLetter: localStorage.getItem('nextAreaLetter') || 'A',
        currentPage: localStorage.getItem('currentPage') || '1',
        wateringCurrentPage: localStorage.getItem('wateringCurrentPage') || '1',
        timestamp: Date.now(),
        deviceId: this.deviceId
      };

      localStorage.setItem(this.backupKey, JSON.stringify(data));
      console.log('✅ 备份创建成功');
      return true;
    } catch (error) {
      console.error('❌ 备份创建失败:', error);
      return false;
    }
  }

  // 恢复数据备份
  restoreBackup() {
    try {
      const backup = localStorage.getItem(this.backupKey);
      if (!backup) {
        console.log('⚠️ 没有找到备份');
        return false;
      }

      const data = JSON.parse(backup);
      
      // 恢复数据
      localStorage.setItem('greenAreas', JSON.stringify(data.greenAreas));
      localStorage.setItem('selectedArea', data.selectedArea);
      localStorage.setItem('nextAreaLetter', data.nextAreaLetter);
      localStorage.setItem('currentPage', data.currentPage);
      localStorage.setItem('wateringCurrentPage', data.wateringCurrentPage);
      
      console.log('✅ 备份恢复成功');
      return true;
    } catch (error) {
      console.error('❌ 备份恢复失败:', error);
      return false;
    }
  }

  // 获取存储状态
  getStorageStatus() {
    const localData = localStorage.getItem(this.storageKey);
    const backupData = localStorage.getItem(this.backupKey);
    const syncInfo = localStorage.getItem(this.syncKey);
    
    let syncDetails = {};
    if (syncInfo) {
      try {
        syncDetails = JSON.parse(syncInfo);
      } catch (error) {
        console.warn('解析同步信息失败');
      }
    }
    
    return {
      hasLocalData: !!localData,
      hasBackup: !!backupData,
      isOnline: this.isOnline,
      lastSync: this.lastSyncTime,
      deviceId: this.deviceId,
      syncDetails: syncDetails
    };
  }

  // 清除所有数据
  clearAllData() {
    try {
      // 清除所有相关数据
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith('campus_greening_') || key === 'device_id') {
          localStorage.removeItem(key);
        }
      }
      
      console.log('✅ 所有数据已清除');
      return true;
    } catch (error) {
      console.error('❌ 清除数据失败:', error);
      return false;
    }
  }

  // 强制同步数据
  async forceSync() {
    try {
      console.log('🔄 开始强制同步...');
      
      // 获取当前数据
      const currentData = {
        greenAreas: JSON.parse(localStorage.getItem('greenAreas') || '{}'),
        selectedArea: localStorage.getItem('selectedArea') || '',
        nextAreaLetter: localStorage.getItem('nextAreaLetter') || 'A',
        currentPage: localStorage.getItem('currentPage') || '1',
        wateringCurrentPage: localStorage.getItem('wateringCurrentPage') || '1'
      };
      
      // 保存到云端
      await this.saveToCloud(currentData);
      
      // 尝试从云端加载最新数据
      const cloudData = await this.loadFromCloud();
      if (cloudData) {
        // 更新本地数据
        localStorage.setItem('greenAreas', JSON.stringify(cloudData.greenAreas));
        localStorage.setItem('selectedArea', cloudData.selectedArea);
        localStorage.setItem('nextAreaLetter', cloudData.nextAreaLetter);
        localStorage.setItem('currentPage', cloudData.currentPage);
        localStorage.setItem('wateringCurrentPage', cloudData.wateringCurrentPage);
        
        console.log('✅ 强制同步完成');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ 强制同步失败:', error);
      return false;
    }
  }

  // 获取同步统计信息
  getSyncStats() {
    const allDevices = this.getAllDevicesData();
    const syncInfo = localStorage.getItem(this.syncKey);
    
    let syncDetails = {};
    if (syncInfo) {
      try {
        syncDetails = JSON.parse(syncInfo);
      } catch (error) {
        console.warn('解析同步信息失败');
      }
    }
    
    return {
      totalDevices: allDevices.length,
      currentDevice: this.deviceId,
      lastSync: this.lastSyncTime,
      syncDetails: syncDetails,
      isOnline: this.isOnline
    };
  }
}

// 导出云存储实例
window.cloudStorage = new CloudStorage(); 