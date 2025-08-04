// 云存储模块 - 支持数据同步和备份
class CloudStorage {
  constructor() {
    this.storageKey = 'campus_greening_data';
    this.backupKey = 'campus_greening_backup';
    this.syncInterval = 30000; // 30秒同步一次
    this.lastSyncTime = 0;
    this.isOnline = navigator.onLine;
    
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
  }

  // 保存数据到云端
  async saveToCloud(data) {
    try {
      // 创建数据包
      const dataPackage = {
        version: '1.0',
        timestamp: Date.now(),
        data: data,
        deviceId: this.getDeviceId(),
        checksum: this.calculateChecksum(data)
      };

      // 保存到localStorage作为备份
      localStorage.setItem(this.storageKey, JSON.stringify(dataPackage));
      
      // 尝试保存到云端（使用IndexedDB模拟）
      await this.saveToIndexedDB(dataPackage);
      
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
      // 首先尝试从localStorage加载
      const localData = localStorage.getItem(this.storageKey);
      if (localData) {
        const parsed = JSON.parse(localData);
        if (this.validateData(parsed)) {
          console.log('✅ 从本地缓存加载数据');
          return parsed.data;
        }
      }

      // 尝试从IndexedDB加载
      const cloudData = await this.loadFromIndexedDB();
      if (cloudData && this.validateData(cloudData)) {
        // 更新localStorage
        localStorage.setItem(this.storageKey, JSON.stringify(cloudData));
        console.log('✅ 从云端加载数据');
        return cloudData.data;
      }

      console.log('⚠️ 没有找到有效数据，使用默认值');
      return null;
    } catch (error) {
      console.error('❌ 从云端加载失败:', error);
      return null;
    }
  }

  // 同步数据
  async syncData() {
    if (!this.isOnline) {
      console.log('⚠️ 离线状态，跳过同步');
      return;
    }

    try {
      const localData = localStorage.getItem(this.storageKey);
      if (localData) {
        const parsed = JSON.parse(localData);
        await this.saveToIndexedDB(parsed);
        console.log('✅ 数据同步完成');
      }
    } catch (error) {
      console.error('❌ 数据同步失败:', error);
    }
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

  // 保存到IndexedDB（模拟云端存储）
  async saveToIndexedDB(dataPackage) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('CampusGreeningDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['data'], 'readwrite');
        const store = transaction.objectStore('data');
        
        const saveRequest = store.put(dataPackage, 'main');
        saveRequest.onsuccess = () => resolve();
        saveRequest.onerror = () => reject(saveRequest.error);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('data')) {
          db.createObjectStore('data');
        }
      };
    });
  }

  // 从IndexedDB加载数据
  async loadFromIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('CampusGreeningDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['data'], 'readonly');
        const store = transaction.objectStore('data');
        
        const getRequest = store.get('main');
        getRequest.onsuccess = () => resolve(getRequest.result);
        getRequest.onerror = () => reject(getRequest.error);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('data')) {
          db.createObjectStore('data');
        }
      };
    });
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
        timestamp: Date.now()
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
    
    return {
      hasLocalData: !!localData,
      hasBackup: !!backupData,
      isOnline: this.isOnline,
      lastSync: this.lastSyncTime,
      deviceId: this.getDeviceId()
    };
  }

  // 清除所有数据
  clearAllData() {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.backupKey);
      
      // 清除IndexedDB
      const request = indexedDB.deleteDatabase('CampusGreeningDB');
      request.onsuccess = () => console.log('✅ 所有数据已清除');
      
      return true;
    } catch (error) {
      console.error('❌ 清除数据失败:', error);
      return false;
    }
  }
}

// 导出云存储实例
window.cloudStorage = new CloudStorage(); 