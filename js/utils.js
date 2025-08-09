// 工具函数模块
function getInitialGameState() {
    return {
        currentMatter: new OmegaNum(10),
        matterPerSecond: new OmegaNum(1),
        generatorCost: new OmegaNum(10),
        enhancerCost: new OmegaNum(100),
        enhancerMultiplier: new OmegaNum(1),
        matterMultiplier: new OmegaNum(1),
        softCapMultiplier: new OmegaNum(1),
        lastUpdateTime: Date.now(),
        antimatter: new OmegaNum(0),
        antimatterMultiplier: new OmegaNum(1),
        antimatterUnlocked: false,
        antimatterExplosionUnlocked: false,
        automationUnlocked: false,
        challengeUnlocked: false,
        annihilationEnergy: new OmegaNum(0),
        annihilationEnergyPeak: new OmegaNum(0),
        achievements: {},
        upgrades: {
            density: false,
            compress: false,
            warehouse: false,
            antimatterWarehouse: false
        },
        challengeState: {
            inChallenge: false,
            challengeId: null,
            completed: {}
        },
        // 挑战奖励状态
        challenge4Reward: false,
        challenge5Reward: false,
        challenge6Reward: false,
        challenge7Reward: false,
        challenge8Reward: false,
        // 挑战开始时间
        challenge7StartTime: null,
        // 距离系统解锁状态
        distanceUnlocked: false,
        // 距离系统状态
        distance: new OmegaNum(0),
        // 距离能量：购买的+生产的
        distanceEnergyBought: new OmegaNum(0),
        distanceEnergyProduced: new OmegaNum(0),
        distanceEnergyProduction: new OmegaNum(0), // 每秒生产速度
        // 跞禼能量：购买的+生产的
        kuaEnergyBought: new OmegaNum(0),
        kuaEnergyProduced: new OmegaNum(0),
        kuaEnergyProduction: new OmegaNum(0), // 每秒生产速度
        // 跠禽能量：购买的+生产的
        genQinEnergyBought: new OmegaNum(0),
        genQinEnergyProduced: new OmegaNum(0),
        genQinEnergyProduction: new OmegaNum(0), // 每秒生产速度
        // 跠禾能量：购买的+生产的
        kuoHeEnergyBought: new OmegaNum(0),
        kuoHeEnergyProduced: new OmegaNum(0),
        kuoHeEnergyProduction: new OmegaNum(0), // 每秒生产速度
        
        // 对话标志
        euclidarDialogShown: false, // 距离之神对话是否已显示
        firstSoftCapDialogShown: false, // 一重软上限对话是否已显示
        secondSoftCapDialogShown: false, // 二重软上限对话是否已显示
        hardCapDialogShown: false, // 硬上限对话是否已显示
        // 能量成本
        distanceEnergyCost: new OmegaNum('1e6'),
        kuaEnergyCost: new OmegaNum('1e10'),
        genQinEnergyCost: new OmegaNum('1e15'),
        kuoHeEnergyCost: new OmegaNum('9.461e18'), // 10光年转换为毫米
        
        // 距离献祭系统
        annihilatedDistance: new OmegaNum(0), // 湮灭距离，用于增幅距离每秒生成
        maxDistance: new OmegaNum(0), // 最大距离记录
        
        // 初始化生成器和增强器数组
        generators: {},
        boosters: {},
        generatorCount: 1,
        enhancerCount: 0,
        
        // 黑洞系统
        blackholeMass: 0,
        blackHoleUnlocked: false,
        challenge9Reward: false,
        challenge10Reward: false,
        
        // 黑洞碎片系统
        blackholeFragments: new OmegaNum(0), // 当前黑洞碎片数量
        maxBlackholeFragments: new OmegaNum(0), // 历史最大黑洞碎片数量
        
        // 时间能量系统
        timeEnergy: new OmegaNum(0), // 当前时间能量
        timeEnergyProduction: new OmegaNum(0), // 时间能量生产速率
        timeEnergyMultiplier: new OmegaNum(1), // 时间能量提供的增益倍率
        

    };
}

const Utils = {
    // 缓存格式化结果
    formatCache: new Map(),
    formatCacheSize: 1000,
    
    // 通知系统优化
    notificationContainer: null,
    activeNotifications: new Set(),
    
    // 一次性对话框系统
    oneTimeDialogs: new Set(),
    
    formatOmegaNum(num, precision = 2) {
        if (!(num instanceof OmegaNum)) return '0';
        
        // 使用缓存
        const cacheKey = num.toString() + '_' + precision;
        if (this.formatCache.has(cacheKey)) {
            return this.formatCache.get(cacheKey);
        }
        
        let result;
        // 使用Format-OmegaNum.js的高级格式化功能
        if (typeof format !== 'undefined') {
            result = format(num, precision);
        } else {
            // 回退到原有的简单格式化
            if (num.lt(1e6)) {
                result = Math.round(num.toNumber()).toLocaleString();
            } else {
                result = num.toExponential(2).replace('+', '');
            }
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
    
    // 格式化整数（无小数）
    formatWhole(num) {
        return this.formatOmegaNum(num, 0);
    },
    
    // 格式化小数（更高精度）
    formatSmall(num, precision = 2) {
        if (!(num instanceof OmegaNum)) return '0';
        if (typeof formatSmall !== 'undefined') {
            return formatSmall(num, precision);
        }
        return this.formatOmegaNum(num, precision);
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
        notification.style.opacity = '0.7';
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
            notification.style.color = 'white';
            notification.style.borderLeft = '6px solid #388E3C';
        }
        
        this.notificationContainer.appendChild(notification);
        
        // 3秒后自动消失
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    autoSaveInterval: null,

    startAutoSave(intervalMinutes = 5) {
        this.stopAutoSave();
        this.autoSaveInterval = setInterval(() => this.saveGameManually(true), intervalMinutes * 60 * 1000);
    },

    saveGameManually(isAutoSave = false) {
        if (SaveSystem.saveGameState()) {
            if (!isAutoSave) {
                this.showNotification('游戏已保存');
            }
        }
    },

    resetGameState() {
        if (confirm('你确定要重置所有游戏数据吗？这将删除你的存档，并且无法恢复！')) {
            try {
                // 停止自动存档
                this.stopAutoSave();
                
                // 删除本地存档
                localStorage.removeItem('matterIdleSave');
                
                // 设置重置标记，防止页面刷新后自动加载存档
                localStorage.setItem('gameJustReset', 'true');
                
                // 重置游戏状态为初始状态
                if (window.getInitialGameState) {
                    Game.state = getInitialGameState();
                } else {
                    console.error('未找到getInitialGameState函数，无法安全重置。');
                    Game.state.currentMatter = new OmegaNum(10);
                }
                
                // 确保currentMatter为正常值
                if (!Game.state.currentMatter || Game.state.currentMatter.toString() === 'Infinity' || !Game.state.currentMatter.isFinite()) {
                    Game.state.currentMatter = new OmegaNum(10);
                }
                
                // 确保timeEnergyMultiplier为正常值
                if (!Game.state.timeEnergyMultiplier || Game.state.timeEnergyMultiplier.toString() === 'Infinity' || !Game.state.timeEnergyMultiplier.isFinite()) {
                    Game.state.timeEnergyMultiplier = new OmegaNum(1);
                }
                
                // 清理UI和缓存
                if (window.UI) {
                    UI.updateUI();
                    UI.updateUpgradeButtons();
                }
                this.clearFormatCache();
                
                this.showNotification('游戏已完全重置', 'success');
                
                // 立即刷新页面以确保所有内容都回到初始状态
                // 不重新启动自动存档，让页面刷新后自然启动
                setTimeout(() => window.location.reload(), 500);

            } catch (error) {
                console.error('重置游戏时发生错误:', error);
                this.showNotification('重置失败，详情请查看控制台', 'error');
            }
        }
    },

    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    },
    
    // 重置游戏进度（用于进入挑战等场景），确保逻辑与坍缩重置一致
    resetGameProgress() {
        // 执行基于坍缩逻辑的游戏进度重置



        // 使用更彻底的坍缩重置作为基础
        Game.collapseReset();

        // 挑战奖励和坍缩能量等状态已在collapseReset中正确处理。
        // 此函数不再需要任何额外的状态恢复操作。
        // 游戏进度已通过坍缩逻辑完全重置

        // UI更新已在collapseReset中处理
    },

    // 重置游戏进度（用于进入挑战），此版本确保与普通重置行为一致，保留挑战奖励
    resetGameProgressWithUpgrades() {
        // 执行进入挑战的重置（保留奖励）
        // 经过您的指正，此函数现在与resetGameProgress行为保持一致
        // 直接调用resetGameProgress以确保逻辑统一且正确
        this.resetGameProgress();
    },

    loadGameManually() {
        if (SaveSystem.loadGameState()) {
            this.showNotification('游戏已加载');
        } else {
            this.showNotification('未找到存档或加载失败', 'error');
        }
    },
    
    exportGame() {
        try {
            const saveData = localStorage.getItem('matterLdleSave');
            if (saveData) {
                const encodedData = btoa(saveData);
                prompt('这是你的存档码，请复制并妥善保管:', encodedData);
            } else {
                this.showNotification('没有找到存档可供导出', 'error');
            }
        } catch (e) {
            this.showNotification('导出失败', 'error');
        }
    },
    
    importGame() {
        const encodedData = prompt('请输入你的存档码:');
        if (encodedData) {
            try {
                const saveData = atob(encodedData);
                localStorage.setItem('matterLdleSave', saveData);
                window.location.reload();
            } catch (e) {
                this.showNotification('存档码无效或已损坏', 'error');
            }
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
        // 性能统计记录
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

// 自定义对话框函数
Utils.createCustomDialog = function(options = {}) {
    // 默认选项
    const defaults = {
        title: '提示',
        content: '这是一个对话框',
        titleColor: '#ffffff',
        titleBgColor: '#2196F3',
        contentColor: '#ffffff',
        bgColor: '#1a1a1a',
        buttons: [{ text: '确定', color: '#ffffff', bgColor: '#4CAF50' }],
        width: '350px',
        height: 'auto',
        animation: 'fadeIn 0.3s',
        onClose: null,
        oneTime: false, // 新增：是否为一次性对话框
        dialogId: null  // 新增：对话框唯一标识符
    };

    // 合并选项
    const settings = { ...defaults, ...options };

    // 检查一次性对话框是否已显示
    if (settings.oneTime && settings.dialogId) {
        if (Utils.oneTimeDialogs.has(settings.dialogId)) {
            return null; // 已显示过，不再显示
        }
        Utils.oneTimeDialogs.add(settings.dialogId);
    }

    // 创建对话框容器
    const modalOverlay = document.createElement('div');
    modalOverlay.style.position = 'fixed';
    modalOverlay.style.top = '0';
    modalOverlay.style.left = '0';
    modalOverlay.style.width = '100%';
    modalOverlay.style.height = '100%';
    modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modalOverlay.style.display = 'flex';
    modalOverlay.style.alignItems = 'center';
    modalOverlay.style.justifyContent = 'center';
    modalOverlay.style.zIndex = '9999';
    modalOverlay.style.animation = settings.animation;

    // 创建对话框
    const dialog = document.createElement('div');
    dialog.style.width = settings.width;
    dialog.style.height = settings.height;
    dialog.style.backgroundColor = settings.bgColor;
    dialog.style.borderRadius = '0px';
    dialog.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
    dialog.style.overflow = 'hidden';
    dialog.style.display = 'flex';
    dialog.style.flexDirection = 'column';

    // 创建标题
    const titleBar = document.createElement('div');
    titleBar.style.padding = '15px';
    titleBar.style.backgroundColor = settings.titleBgColor;
    titleBar.style.color = settings.titleColor;
    titleBar.style.fontWeight = 'bold';
    titleBar.style.fontSize = '18px';
    titleBar.style.textAlign = 'center';
    titleBar.textContent = settings.title;
    dialog.appendChild(titleBar);

    // 创建内容
    const content = document.createElement('div');
    content.style.padding = '20px';
    content.style.color = settings.contentColor;
    content.style.fontSize = '16px';
    content.style.lineHeight = '1.5';
    content.style.textAlign = 'center';
    content.style.flex = '1';
    content.style.overflowY = 'auto';
    content.style.display = 'flex';
    content.style.alignItems = 'center';
    content.style.justifyContent = 'center';
    content.innerHTML = settings.content;
    dialog.appendChild(content);

    // 创建按钮容器
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.style.padding = '15px';
    buttonContainer.style.gap = '10px';

    // 添加按钮
    settings.buttons.forEach(buttonConfig => {
        const button = document.createElement('button');
        button.textContent = buttonConfig.text;
        button.style.padding = '8px 16px';
        button.style.backgroundColor = buttonConfig.bgColor || '#4CAF50';
        button.style.color = buttonConfig.color || '#ffffff';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';
        button.style.fontSize = '14px';
        button.style.fontWeight = 'bold';
        button.style.transition = 'transform 0.2s, box-shadow 0.2s';

        // 悬停效果
        button.onmouseover = () => {
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
        };
        button.onmouseout = () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = 'none';
        };

        // 点击事件
        button.onclick = () => {
            if (buttonConfig.onClick) {
                buttonConfig.onClick();
            }
            document.body.removeChild(modalOverlay);
            if (settings.onClose) {
                settings.onClose();
            }
        };

        buttonContainer.appendChild(button);
    });

    dialog.appendChild(buttonContainer);
    modalOverlay.appendChild(dialog);
    document.body.appendChild(modalOverlay);

    // 移除点击背景关闭对话框的功能，防止意外跳过重要对话
    // modalOverlay.addEventListener('click', (e) => {
    //     if (e.target === modalOverlay) {
    //         document.body.removeChild(modalOverlay);
    //         if (settings.onClose) {
    //             settings.onClose();
    //         }
    //     }
    // });

    // 返回对话框元素，以便进一步操作
    return { overlay: modalOverlay, dialog: dialog };
};

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

// 连续对话框函数
Utils.showDialogSequence = function(dialogs, onComplete, sequenceId = null) {
    let currentIndex = 0;
    
    // 检查一次性对话框序列是否已显示
    if (sequenceId && Utils.oneTimeDialogs.has(sequenceId)) {
        if (onComplete) onComplete();
        return; // 已显示过，直接返回
    }
    
    function showNext() {
        if (currentIndex >= dialogs.length) {
            if (onComplete) onComplete();
            return;
        }
        
        const dialog = dialogs[currentIndex];
        const isLast = currentIndex === dialogs.length - 1;
        
        // 支持自定义尺寸，默认为正方形
        const dialogWidth = dialog.width || '400px';
        const dialogHeight = dialog.height || '400px';
        const waitTime = dialog.waitTime || 0; // 等待时间（秒），0表示无等待
        
        const dialogResult = Utils.createCustomDialog({
            title: dialog.title || '提示',
            content: dialog.content || '',
            titleColor: dialog.titleColor || '#ffffff',
            titleBgColor: dialog.titleBgColor || '#2196F3',
            contentColor: dialog.contentColor || '#ffffff',
            bgColor: dialog.bgColor || '#1a1a1a',
            width: dialogWidth,
            height: dialogHeight,
            buttons: [{
                text: isLast ? '确定' : '下一步',
                color: '#ffffff',
                bgColor: isLast ? '#4CAF50' : '#2196F3',
                onClick: () => {
                    currentIndex++;
                    if (dialog.onClose) dialog.onClose();
                    setTimeout(showNext, 100); // 短暂延迟让对话框关闭动画完成
                }
            }]
        });
        
        // 如果设置了等待时间，则禁用按钮一段时间
        if (waitTime > 0) {
            const button = dialogResult.dialog.querySelector('button');
            if (button) {
                button.disabled = true;
                button.style.opacity = '0.5';
                button.style.cursor = 'not-allowed';
                
                // 显示倒计时
                const originalText = button.textContent;
                let remainingTime = waitTime;
                
                const countdown = setInterval(() => {
                    button.textContent = `${originalText} (${remainingTime}s)`;
                    remainingTime--;
                    
                    if (remainingTime < 0) {
                        clearInterval(countdown);
                        button.textContent = originalText;
                        button.disabled = false;
                        button.style.opacity = '1';
                        button.style.cursor = 'pointer';
                    }
                }, 1000);
            }
        }
    }
    
    showNext();
};

// 确认对话框函数
Utils.showConfirmDialog = function(title, content, onConfirm, onCancel) {
    return Utils.createCustomDialog({
        title: title,
        content: content,
        buttons: [
            {
                text: '取消',
                color: '#ffffff',
                bgColor: '#666666',
                onClick: onCancel || function() {}
            },
            {
                text: '确定',
                color: '#ffffff', 
                bgColor: '#4CAF50',
                onClick: onConfirm || function() {}
            }
        ]
    });
};

window.Utils = Utils;