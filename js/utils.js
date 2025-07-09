// 工具函数模块
const Utils = {
    // 缓存格式化结果
    formatCache: new Map(),
    formatCacheSize: 1000,
    
    // 通知系统优化
    notificationContainer: null,
    activeNotifications: new Set(),
    
    formatOmegaNum(num) {
        if (!(num instanceof OmegaNum)) return '0';
        
        // 使用缓存
        const cacheKey = num.toString();
        if (this.formatCache.has(cacheKey)) {
            return this.formatCache.get(cacheKey);
        }
        
        let result;
        if (num.lt(1e6)) {
            result = Math.round(num.toNumber()).toLocaleString();
        } else {
            result = num.toExponential(2).replace('+', '');
        }
        
        // 缓存结果
        if (this.formatCache.size >= this.formatCacheSize) {
            // 清除最旧的缓存项
            const firstKey = this.formatCache.keys().next().value;
            this.formatCache.delete(firstKey);
        }
        this.formatCache.set(cacheKey, result);
        
        return result;
    },
    
    // 清除格式化缓存
    clearFormatCache() {
        this.formatCache.clear();
    },
    
    showNotification(message, type = 'success') {
        // 获取或创建通知容器
        if (!this.notificationContainer) {
            this.notificationContainer = document.getElementById('notificationContainer');
            if (!this.notificationContainer) {
                this.notificationContainer = document.createElement('div');
                this.notificationContainer.id = 'notificationContainer';
                this.notificationContainer.style.position = 'fixed';
                this.notificationContainer.style.bottom = '30px';
                this.notificationContainer.style.right = '30px';
                this.notificationContainer.style.zIndex = '9999';
                this.notificationContainer.style.display = 'flex';
                this.notificationContainer.style.flexDirection = 'column';
                this.notificationContainer.style.gap = '10px';
                document.body.appendChild(this.notificationContainer);
            }
        }
        
        // 创建新通知
        const notification = document.createElement('div');
        notification.style.padding = '14px 28px';
        notification.style.borderRadius = '6px';
        notification.style.fontWeight = 'bold';
        notification.style.fontSize = '18px';
        notification.style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)';
        notification.style.opacity = '0.98';
        notification.style.transition = 'opacity 0.3s';
        notification.textContent = message;
        
        // 类型样式
        if (type === 'error') {
            notification.style.background = '#ff4444';
            notification.style.color = '#fff';
            notification.style.borderLeft = '6px solid #cc0000';
        } else if (type === 'achievement') {
            notification.style.background = '#FFD700';
            notification.style.color = '#222';
            notification.style.borderLeft = '6px solid #FF9800';
        } else {
            notification.style.background = '#4CAF50';
            notification.style.color = '#fff';
            notification.style.borderLeft = '6px solid #00796b';
        }
        
        this.notificationContainer.appendChild(notification);
        this.activeNotifications.add(notification);
        
        // 3秒后自动消失
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                    this.activeNotifications.delete(notification);
                }
            }, 300);
        }, 3000);
    },

    autoSaveInterval: null,

    startAutoSave(intervalMinutes = 5) {
        if (this.autoSaveInterval) clearInterval(this.autoSaveInterval);
        this.autoSaveInterval = setInterval(() => this.saveGameManually(true), intervalMinutes * 60 * 1000);
    },

    saveGameManually(isAutoSave = false) {
        if (SaveSystem.saveGameState()) {
            return true;
        }
        return false;
    },

    resetGameState() {
        // 清除浏览器本地存储存档
        localStorage.removeItem('matterIdleSave');
        
        // 清除缓存
        this.clearFormatCache();
        
        // 清除成就状态
        if (window.Achievements) {
            Achievements.unlocked = {};
            Achievements.hiddenUnlocked = {};
            if (Achievements.render) Achievements.render();
        }
        
        // 清除挑战状态
        if (typeof challengeState !== 'undefined') {
            challengeState.inChallenge = false;
            challengeState.challengeId = null;
            challengeState.completed = {};
        }
        
        // 停止自动存档定时器
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
        
        // 重置游戏状态到初始值
        Game.state = {
            isOfflineMode: false,
            offlineStartTime: null,
            offlineEnergy: new OmegaNum(0),
            isOfflineBonusActive: false,
            upgrades: { density: false, compress: false, warehouse: false },
            matterMultiplier: new OmegaNum(1),
            softCapMultiplier: new OmegaNum(0.5),
            antimatter: new OmegaNum(0),
            antimatterUnlocked: false,
            newEraUnlocked: false,
            currentMatter: new OmegaNum(10),
            matterPerSecond: new OmegaNum(0),
            generatorCount: 0,
            generatorCost: new OmegaNum(10),
            enhancerCount: 0,
            enhancerCost: new OmegaNum(100),
            enhancerMultiplier: new OmegaNum(1),
            developerMode: false,
            maxMatter: new OmegaNum(10),
            maxAntimatter: new OmegaNum(0),
            automationUnlocked: false,
            // 坍缩与挑战相关
            annihilationUnlocked: false,
            annihilationEnergy: new OmegaNum(0),
            annihilationEnergyPeak: new OmegaNum(0),
            annihilationTime: 0,
            challengeUnlocked: false,
            challenge1Reward: false,
            challenge2Reward: false,
            challenge3Reward: false
        };
        
        // 清除游戏缓存
        if (Game.calculationCache) {
            Game.calculationCache.cacheValid = false;
        }
        
        // 更新UI显示
        UI.updateUI();
        // 重新初始化挑战UI状态
        if (typeof updateChallengeTabUI === 'function') updateChallengeTabUI();
        // 恢复所有选项卡显示状态
        const automationTabBtn = document.getElementById('automationTabBtn');
        if (automationTabBtn) automationTabBtn.style.display = 'none';
        const upgradesTab = document.querySelector('.tab[data-tab="upgrades"]');
        if (upgradesTab) upgradesTab.style.display = '';
        // 重新启动自动存档
        this.startAutoSave(5 / 60);
    },

    // 新增：重置游戏进度（不包括湮灭能量等元进度）
    resetGameProgress() {
        // 保存升级状态和增益，坍缩不应该重置这些
        const savedUpgrades = { ...Game.state.upgrades };
        const savedMatterMultiplier = Game.state.matterMultiplier;
        const savedNewEraUnlocked = Game.state.newEraUnlocked;
        
        console.log('[重置调试] 保存的升级状态:', savedUpgrades);
        console.log('[重置调试] 保存的物质倍率:', savedMatterMultiplier.toString());
        
        Game.state.currentMatter = new OmegaNum(10);
        Game.state.generatorCount = 0;
        Game.state.generatorCost = new OmegaNum(10);
        Game.state.enhancerCount = 0;
        Game.state.enhancerCost = new OmegaNum(100);
        Game.state.enhancerMultiplier = new OmegaNum(1);
        Game.state.antimatter = new OmegaNum(0);
        Game.state.antimatterUnlocked = false;
        
        // 恢复升级状态和增益
        Game.state.upgrades = savedUpgrades;
        Game.state.matterMultiplier = savedMatterMultiplier;
        Game.state.newEraUnlocked = savedNewEraUnlocked;
        
        Game.state.challenge1Reward = false;
        Game.state.challenge2Reward = false;
        Game.state.challenge3Reward = false;
        
        console.log('[重置调试] 恢复后的升级状态:', Game.state.upgrades);
        console.log('[重置调试] 恢复后的物质倍率:', Game.state.matterMultiplier.toString());
        
        // 清除缓存
        if (Game.invalidateCalculationCache) Game.invalidateCalculationCache();
        if (window.Game && Game.updateMatterPerSecond) Game.updateMatterPerSecond();
        if (window.UI && UI.updateUI) UI.updateUI();
        if (window.UI && UI.updateUpgradeButtons) UI.updateUpgradeButtons();
    },

    // 新增：重置游戏进度（包括升级状态）
    resetGameProgressWithUpgrades() {
        Game.state.currentMatter = new OmegaNum(10);
        Game.state.generatorCount = 0;
        Game.state.generatorCost = new OmegaNum(10);
        Game.state.enhancerCount = 0;
        Game.state.enhancerCost = new OmegaNum(100);
        Game.state.enhancerMultiplier = new OmegaNum(1);
        Game.state.antimatter = new OmegaNum(0);
        Game.state.antimatterUnlocked = false;
        
        // 重置升级状态
        Game.state.upgrades = { density: false, compress: false, warehouse: false };
        Game.state.matterMultiplier = new OmegaNum(1);
        Game.state.newEraUnlocked = false;
        
        Game.state.challenge1Reward = false;
        Game.state.challenge2Reward = false;
        Game.state.challenge3Reward = false;
        
        console.log('[挑战重置调试] 升级状态已重置');
        
        // 清除缓存
        if (Game.invalidateCalculationCache) Game.invalidateCalculationCache();
        if (window.Game && Game.updateMatterPerSecond) Game.updateMatterPerSecond();
        if (window.UI && UI.updateUI) UI.updateUI();
        if (window.UI && UI.updateUpgradeButtons) UI.updateUpgradeButtons();
    },

    loadGameManually() {
        const loadSuccess = SaveSystem.loadGameState();
        if (loadSuccess) {
            Utils.showNotification('游戏已加载！');
            // 重新初始化挑战UI状态
            if (typeof updateChallengeTabUI === 'function') updateChallengeTabUI();
            // 重新初始化新纪元升级按钮状态
            if (typeof updateNewEraButtonState === 'function') updateNewEraButtonState();
            // 重新初始化成就
            if (window.Achievements && Achievements.render) Achievements.render();
            // 重新启动自动存档
            Utils.startAutoSave(5 / 60);
        } else {
            Utils.showNotification('加载失败！', 'error');
        }
    }
};

// 性能监控模块
const PerformanceMonitor = {
    metrics: {
        frameTime: [],
        updateTime: [],
        saveTime: [],
        renderTime: []
    },
    
    maxSamples: 100,
    
    startTime: null,
    
    startTimer() {
        this.startTime = performance.now();
    },
    
    endTimer(metricType) {
        if (!this.startTime) return;
        
        const duration = performance.now() - this.startTime;
        this.metrics[metricType].push(duration);
        
        // 保持样本数量限制
        if (this.metrics[metricType].length > this.maxSamples) {
            this.metrics[metricType].shift();
        }
        
        this.startTime = null;
    },
    
    getAverage(metricType) {
        const samples = this.metrics[metricType];
        if (samples.length === 0) return 0;
        
        const sum = samples.reduce((a, b) => a + b, 0);
        return sum / samples.length;
    },
    
    getStats() {
        const stats = {};
        for (const metricType in this.metrics) {
            const avg = this.getAverage(metricType);
            const max = Math.max(...this.metrics[metricType]);
            const min = Math.min(...this.metrics[metricType]);
            stats[metricType] = { avg, max, min, samples: this.metrics[metricType].length };
        }
        return stats;
    },
    
    logStats() {
        const stats = this.getStats();
        console.log('性能统计:', stats);
    },
    
    clear() {
        for (const metricType in this.metrics) {
            this.metrics[metricType] = [];
        }
    }
};

// 暴露到全局
window.PerformanceMonitor = PerformanceMonitor;

// 在游戏循环中添加性能监控
const originalGameLoop = Game.gameLoop;
Game.gameLoop = function() {
    PerformanceMonitor.startTimer();
    originalGameLoop.call(this);
    PerformanceMonitor.endTimer('frameTime');
};

// 在UI更新中添加性能监控
const originalUpdateUI = UI.updateUI;
UI.updateUI = function() {
    PerformanceMonitor.startTimer();
    originalUpdateUI.call(this);
    PerformanceMonitor.endTimer('renderTime');
};

// 在存档中添加性能监控
const originalSaveGameState = SaveSystem.saveGameState;
SaveSystem.saveGameState = function() {
    PerformanceMonitor.startTimer();
    const result = originalSaveGameState.call(this);
    PerformanceMonitor.endTimer('saveTime');
    return result;
};

// 定期输出性能统计（开发模式）
if (Game.state && Game.state.developerMode) {
    setInterval(() => {
        PerformanceMonitor.logStats();
    }, 10000); // 每10秒输出一次
}

// 暴露到全局作用域
// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-10px); }
    }
`;
document.head.appendChild(style);

window.Utils = Utils;