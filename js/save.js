// 存档系统模块
// 确保只初始化一次SaveSystem实例
window.SaveSystem = window.SaveSystem || {};
const SaveSystem = window.SaveSystem;

// 缓存系统
const SaveCache = {
    lastSaveData: null,
    lastSaveHash: null,
    saveThrottle: {
        lastSave: 0,
        throttleTime: 1000 // 1秒内不重复保存
    }
};

// 简单的哈希函数
function simpleHash(obj) {
    return JSON.stringify(obj).split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
}

// 工具函数：深拷贝，支持对象和数组（优化版本）
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof OmegaNum) return new OmegaNum(obj);
    if (Array.isArray(obj)) return obj.map(deepClone);
    
    const result = {};
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            result[key] = deepClone(obj[key]);
        }
    }
    return result;
}

// 工具函数：递归序列化 OmegaNum（优化版本）
function serializeOmegaNums(obj) {
    if (obj instanceof OmegaNum) {
        return { type: 'OmegaNum', value: obj.toString() };
    }
    if (Array.isArray(obj)) {
        const result = new Array(obj.length);
        for (let i = 0; i < obj.length; i++) {
            result[i] = serializeOmegaNums(obj[i]);
        }
        return result;
    }
    if (obj && typeof obj === 'object') {
        const result = {};
        const keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                result[key] = serializeOmegaNums(obj[key]);
            }
        }
        return result;
    }
    return obj;
}

// 工具函数：递归反序列化 OmegaNum（优化版本）
function restoreOmegaNums(obj) {
    if (!obj) return obj;
    if (Array.isArray(obj)) {
        const result = new Array(obj.length);
        for (let i = 0; i < obj.length; i++) {
            result[i] = restoreOmegaNums(obj[i]);
        }
        return result;
    }
    if (typeof obj === 'object') {
        if (obj.type === 'OmegaNum') {
            return new OmegaNum(obj.value);
        }
        const result = {};
        const keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                result[key] = restoreOmegaNums(obj[key]);
            }
        }
        return result;
    }
    return obj;
}

// 工具函数：深度合并，支持对象和数组（数组直接覆盖）（优化版本）
function deepMerge(target, source) {
    if (Array.isArray(source)) {
        return source.slice(); // 直接覆盖数组
    }
    if (source && typeof source === 'object') {
        const keys = Object.keys(source);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!target[key] || typeof target[key] !== 'object') target[key] = {};
                    target[key] = deepMerge(target[key], source[key]);
                } else {
                    target[key] = deepClone(source[key]);
                }
            }
        }
    }
    return target;
}

Object.assign(SaveSystem, {
    isInitialized: SaveSystem.isInitialized ?? false,
    hasShownLoadNotification: SaveSystem.hasShownLoadNotification ?? false,

    // 保存游戏状态到localStorage（优化版本）
    saveGameState() {
        try {
            const now = Date.now();
            
            // 节流检查
            if (now - SaveCache.saveThrottle.lastSave < SaveCache.saveThrottle.throttleTime) {
                return true; // 跳过保存
            }
            
            const stateToSave = deepClone(Game.state);
            
            // 计算哈希值检查是否有变化
            const currentHash = simpleHash(stateToSave);
            if (SaveCache.lastSaveHash === currentHash) {
                return true; // 数据没有变化，跳过保存
            }
            
            // 保存成就状态
            if (window.Achievements && Achievements.getSaveData) {
                stateToSave.achievements = Achievements.getSaveData();
            }
            // 保存挑战状态
            if (typeof saveChallengeState === 'function') {
                stateToSave.challengeState = saveChallengeState();
            }
            // 保存黑洞系统状态
            if (window.BlackholeSystem && BlackholeSystem.saveState) {
                stateToSave.blackholeState = BlackholeSystem.saveState();
            }
            // 保存一次性对话框状态
            if (window.Utils && Utils.oneTimeDialogs) {
                stateToSave.oneTimeDialogs = Array.from(Utils.oneTimeDialogs);
            }
            
            const serialized = serializeOmegaNums(stateToSave);
            const serializedString = JSON.stringify(serialized);
            
            localStorage.setItem('matterIdleSave', serializedString);
            
            // 更新缓存
            SaveCache.lastSaveData = serializedString;
            SaveCache.lastSaveHash = currentHash;
            SaveCache.saveThrottle.lastSave = now;
            
            // 反物质解锁逻辑
            if (!Game.state.antimatterUnlocked && (Game.state.currentMatter && Game.state.currentMatter.gte && Game.state.currentMatter.gte(new OmegaNum('5e8')) || (Game.state.antimatter && Game.state.antimatter.gte && Game.state.antimatter.gte(new OmegaNum(1))))) {
                Game.state.antimatterUnlocked = true;
                const btn = document.getElementById('antimatterTabBtn');
                if (btn) {
                    btn.style.display = '';
                    btn.click();
                }
            }
            return true;
        } catch (e) {
            console.error('保存失败:', e);
            return false;
        }
    },

    // 从localStorage加载游戏状态（优化版本）
    loadGameState() {
        try {
            const savedState = localStorage.getItem('matterIdleSave');
            if (!savedState) return false;
            
            let parsedState = JSON.parse(savedState);
            parsedState = restoreOmegaNums(parsedState);
            
            // 关键修复：加载前，先将游戏状态重置为“出厂设置”
            Game.state = getInitialGameState();
            // 然后再将存档数据合并进去
            Game.state = deepMerge(Game.state, parsedState);

            // 根据加载的湮灭能量，强制更新解锁状态，修复UI显示bug
            if (Game.state.annihilationEnergy && Game.state.annihilationEnergy.gt(0)) {
                Game.state.antimatterUnlocked = true;
                Game.state.automationUnlocked = true; // 假设自动化也是此时解锁
            }
            
            // 还原成就状态
            if (window.Achievements && Achievements.loadSaveData && Game.state.achievements) {
                Achievements.loadSaveData(Game.state.achievements);
            }
            // 还原挑战状态
            if (typeof loadChallengeState === 'function' && Game.state.challengeState) {
                loadChallengeState(Game.state.challengeState);
            }
            // 还原黑洞系统状态
            if (window.BlackholeSystem && BlackholeSystem.loadState && Game.state.blackholeState) {
                BlackholeSystem.loadState(Game.state.blackholeState);
            }
            // 还原一次性对话框状态
            if (window.Utils && parsedState.oneTimeDialogs) {
                Utils.oneTimeDialogs = new Set(parsedState.oneTimeDialogs);
            }
            
            // 关键属性类型安全
            const omegaNumProperties = [
                'currentMatter', 'currentAntimatter', 'currentDistance', 'matterPerSecond', 'antimatterPerSecond', 'distancePerSecond',
                'generatorCost', 'enhancerCost', 'enhancerMultiplier', 'matterMultiplier', 'softCapMultiplier', 'offlineEnergy', 
                'antimatterMultiplier', 'antimatter', 'annihilationEnergy', 'annihilationEnergyPeak',
                // 距离系统相关的OmegaNum字段
                'distance', 'maxDistance', 'annihilatedDistance',
                // 距离能量系统：购买的+生产的
                'distanceEnergyBought', 'distanceEnergyProduced',
                'kuaEnergyBought', 'kuaEnergyProduced',
                'genQinEnergyBought', 'genQinEnergyProduced', 
                'kuoHeEnergyBought', 'kuoHeEnergyProduced',
                // 能量成本
                'distanceEnergyCost', 'kuaEnergyCost', 'genQinEnergyCost', 'kuoHeEnergyCost',
                // 黑洞系统相关的OmegaNum字段
                'blackholeMass', 'blackholeFragments', 'maxBlackholeFragments', 'timeEnergy', 'timeEnergyMultiplier'
            ];
            
            // 还原developerMode
            if (parsedState.developerMode !== undefined) {
                Game.state.developerMode = parsedState.developerMode;
            }
            // 还原maxMatter和automationUnlocked
            if (parsedState.maxMatter !== undefined) {
                Game.state.maxMatter = new OmegaNum(parsedState.maxMatter);
            }
            if (parsedState.automationUnlocked !== undefined) {
                Game.state.automationUnlocked = parsedState.automationUnlocked;
            }
            // 还原challengeUnlocked为布尔值
            if (parsedState.challengeUnlocked !== undefined) {
                Game.state.challengeUnlocked = !!parsedState.challengeUnlocked;
            }
            // 还原挑战奖励状态
            if (parsedState.challenge1Reward !== undefined) {
                Game.state.challenge1Reward = !!parsedState.challenge1Reward;
            }
            if (parsedState.challenge2Reward !== undefined) {
                Game.state.challenge2Reward = !!parsedState.challenge2Reward;
            }
            if (parsedState.challenge9Reward !== undefined) {
                Game.state.challenge9Reward = !!parsedState.challenge9Reward;
            }
            if (parsedState.challenge10Reward !== undefined) {
                Game.state.challenge10Reward = !!parsedState.challenge10Reward;
            }
            
            // 还原距离系统解锁状态
            if (parsedState.distanceUnlocked !== undefined) {
                Game.state.distanceUnlocked = !!parsedState.distanceUnlocked;
            }
            
            // 还原黑洞系统解锁状态
            if (parsedState.blackHoleUnlocked !== undefined) {
                Game.state.blackHoleUnlocked = !!parsedState.blackHoleUnlocked;
            }
            
            // 还原距离系统生成器数量（确保为整数）
            // 距离能量生成器已移除，不再需要加载
            if (parsedState.kuaEnergyGenerators !== undefined) {
                Game.state.kuaEnergyGenerators = parseInt(parsedState.kuaEnergyGenerators) || 0;
            }
            if (parsedState.genQinEnergyGenerators !== undefined) {
                Game.state.genQinEnergyGenerators = parseInt(parsedState.genQinEnergyGenerators) || 0;
            }
            if (parsedState.kuoHeEnergyGenerators !== undefined) {
                Game.state.kuoHeEnergyGenerators = parseInt(parsedState.kuoHeEnergyGenerators) || 0;
            }
            
            // 批量处理OmegaNum属性
            for (let i = 0; i < omegaNumProperties.length; i++) {
                const prop = omegaNumProperties[i];
                if (!(Game.state[prop] instanceof OmegaNum)) {
                    // 特殊处理antimatterMultiplier，重置时强制为1
                    if (prop === 'antimatterMultiplier') {
                        Game.state[prop] = new OmegaNum(1);
                    } else {
                        // 其他属性若不存在，给默认值0
                        Game.state[prop] = new OmegaNum(Game.state[prop] !== undefined ? Game.state[prop] : 0);
                    }
                }
            }
            
            // 特殊修复：检查currentMatter是否为异常值
            if (Game.state.currentMatter && (Game.state.currentMatter.toString() === 'Infinity' || !Game.state.currentMatter.isFinite())) {
                console.warn('检测到currentMatter异常值，重置为初始值');
                Game.state.currentMatter = new OmegaNum(10);
                // 强制更新UI显示
                setTimeout(() => {
                    if (window.UI && UI.updateUI) {
                        UI.frameCounter = 0; // 重置帧计数器，强制立即更新
                        UI.updateUI();
                    }
                }, 100);
            }
            
            // 确保currentMatter至少为初始值
            if (!Game.state.currentMatter || Game.state.currentMatter.lt(10)) {
                Game.state.currentMatter = new OmegaNum(10);
                // 强制更新UI显示
                setTimeout(() => {
                    if (window.UI && UI.updateUI) {
                        UI.frameCounter = 0; // 重置帧计数器，强制立即更新
                        UI.updateUI();
                    }
                }, 100);
            }

            // 根据加载的湮灭能量，强制更新解锁状态，修复UI显示bug
            if (Game.state.annihilationEnergy && Game.state.annihilationEnergy.gt(0)) {
                Game.state.antimatterUnlocked = true;
                Game.state.automationUnlocked = true; // 假设自动化也是此时解锁
            }
            
            // 清除缓存，因为加载了新数据
            SaveCache.lastSaveData = null;
            SaveCache.lastSaveHash = null;
            
            return true;
        } catch (e) {
            console.error('加载失败:', e);
            return false;
        }
    },

    // 删除存档
    deleteSave() {
        localStorage.removeItem('matterIdleSave');
        // 清除缓存
        SaveCache.lastSaveData = null;
        SaveCache.lastSaveHash = null;
        return true;
    },

    autoSaveInterval: null,

    startAutoSave() {
        if (!this.autoSaveInterval) {
            this.autoSaveInterval = setInterval(() => {
                if (window.Utils && Utils.saveGameManually) {
                    Utils.saveGameManually(true);
                } else {
                    this.saveGameState();
                }
            }, 5000);
        }
    },

    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    },

    init() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    
    // 检查是否是重置后的启动
    const justReset = localStorage.getItem('gameJustReset');
    let loadSuccess = false;
    if (justReset !== 'true') {
        loadSuccess = this.loadGameState();
    } else {
        // SaveSystem检测到重置标记，跳过存档加载
    }
    const loadNotificationShown = localStorage.getItem('loadNotificationShown') === 'true';
    if (!loadNotificationShown) {
        if (loadSuccess) {
                if (window.Utils && Utils.showNotification) {
            Utils.showNotification('存档加载成功');
                }
        setTimeout(() => {
                    if (window.UI && UI.updateUI) UI.updateUI();
        }, 1000);
    } else {
                if (window.Utils && Utils.showNotification) {
            Utils.showNotification('未找到存档，开始新游戏');
                }
            }
            localStorage.setItem('loadNotificationShown', 'true');
        }
    const autoSaveEnabled = localStorage.getItem('autoSaveEnabled') === 'true';
    if (autoSaveEnabled) {
        this.startAutoSave();
            const autoSaveToggle = document.getElementById('autoSaveToggle');
            if (autoSaveToggle) {
                autoSaveToggle.checked = true;
        }
    }
    }
});

window.SaveSystem = SaveSystem;
window.addEventListener('load', () => {
    setTimeout(() => SaveSystem.init(), 0);
}, { once: true });