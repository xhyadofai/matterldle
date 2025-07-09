// 游戏核心逻辑模块
const Game = {
    // 缓存DOM元素
    cachedElements: {},
    
    // 缓存计算结果
    calculationCache: {
        lastMatterPerSecond: null,
        lastUpdateTime: 0,
        cacheValid: false
    },
    
    init() {
        // 初始化游戏状态
        this.state = {
            isOfflineMode: false,
            offlineStartTime: null,
            offlineEnergy: new OmegaNum(0),
            isOfflineBonusActive: false,
            upgrades: { density: false, compress: false },
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
window.Game = Game;
        this.lastUpdateTime = Date.now();
        
        // 缓存常用DOM元素
        this.cacheDOMElements();
        
        // 初始化时自动加载存档
        SaveSystem.loadGameState();
        // 加载后检查并更新UI状态
        // 1. 检查反物质解锁状态
        if (!this.state.antimatterUnlocked && (this.state.currentMatter.gte(new OmegaNum('5e8')) || this.state.antimatter.gte(new OmegaNum(1)))) {
            this.state.antimatterUnlocked = true;
        }
        // 2. 检查自动机解锁状态
        if (this.state.upgrades.automator) {
            const automationTabBtn = this.cachedElements.automationTabBtn;
            if (automationTabBtn) automationTabBtn.style.display = '';
        }
        // 3. 检查反物质选项卡显示
        const antimatterTabBtn = this.cachedElements.antimatterTabBtn;
        if (antimatterTabBtn) antimatterTabBtn.style.display = this.state.antimatterUnlocked ? '' : 'none';
        // 初始化新纪元升级按钮状态
        if (typeof updateNewEraButtonState === 'function') updateNewEraButtonState();
        // 初始化挑战UI状态
        if (typeof updateChallengeTabUI === 'function') updateChallengeTabUI();
        // 启动自动存档（每5分钟）
        Utils.startAutoSave(5 / 60);
        this.gameLoop();
        this.startAutoPurchasing();
    },

    // 缓存DOM元素
    cacheDOMElements() {
        this.cachedElements = {
            automationTabBtn: document.getElementById('automationTabBtn'),
            antimatterTabBtn: document.getElementById('antimatterTabBtn'),
            softCapNotice: document.getElementById('softCapNotice'),
            currentMatter: document.getElementById('currentMatter'),
            matterPerSecond: document.getElementById('matterPerSecond'),
            generatorCount: document.getElementById('generatorCount'),
            generatorCost: document.getElementById('generatorCost'),
            enhancerCount: document.getElementById('enhancerCount'),
            enhancerCost: document.getElementById('enhancerCost'),
            buyGenerator: document.getElementById('buyGenerator'),
            buyEnhancer: document.getElementById('buyEnhancer')
        };
    },

    startAutoPurchasing() {
        // 确保只存在一个自动购买间隔
        if (this.autoPurchaseInterval) clearInterval(this.autoPurchaseInterval);
        // 挑战3完成后自动化间隔变为2秒
        const interval = this.state.challenge3Reward ? 2000 : 5000;
        this.autoPurchaseInterval = setInterval(() => this.autoPurchasing(), interval);
        console.log(`自动购买功能已启动，间隔${interval}ms`);
    },

    autoPurchasing() {
        if (!this.state.automationUnlocked) return;
        // 挑战期间禁用自动化
        if (window.isUpgradeDisabled && isUpgradeDisabled && isUpgradeDisabled()) return;
        if (window.isChallenge2Active && isChallenge2Active && isChallenge2Active()) return;
        if (window.isChallenge3Active && isChallenge3Active && isChallenge3Active()) return;

        const UPGRADE_COSTS = {
            density: new OmegaNum(100),
            compress: new OmegaNum(500)
        };

        // 获取复选框状态
        const autoBuyUpgrades = document.getElementById('autoBuyUpgrades')?.checked || false;
        const autoBuyEnhancers = document.getElementById('autoBuyEnhancers')?.checked || false;
        const autoBuyGenerators = document.getElementById('autoBuyGenerators')?.checked || false;

        // 自动购买升级（仅当复选框勾选时）
        if (autoBuyUpgrades) {
            // 自动购买密度升级
            while (!this.state.upgrades.density && this.state.currentMatter.gte(UPGRADE_COSTS.density)) {
                this.state.currentMatter = this.state.currentMatter.sub(UPGRADE_COSTS.density);
                this.state.upgrades.density = true;
                this.state.matterMultiplier = this.state.matterMultiplier.mul(new OmegaNum(2));
                this.invalidateCalculationCache();
                this.updateMatterPerSecond();
                UI.updateUpgradeButtons();
                UI.updateUI();
            }

            // 自动购买压缩物质升级
            while (!this.state.upgrades.compress && this.state.currentMatter.gte(UPGRADE_COSTS.compress) && this.state.currentMatter.gt(0)) {
                this.state.currentMatter = this.state.currentMatter.sub(UPGRADE_COSTS.compress);
                this.state.upgrades.compress = true;
                this.invalidateCalculationCache();
                this.updateMatterPerSecond();
                UI.updateUpgradeButtons();
                UI.updateUI();
            }
        }

        // 自动购买生成器（仅当复选框勾选时）
        if (autoBuyGenerators) {
            while (this.state.currentMatter.gte(this.state.generatorCost)) {
                this.buyGenerator();
            }
        }

        // 自动购买增强器（仅当复选框勾选时）
        if (autoBuyEnhancers) {
            while (this.state.currentMatter.gte(this.state.enhancerCost)) {
                this.buyEnhancer();
            }
        }
    },

    // 使计算缓存失效
    invalidateCalculationCache() {
        this.calculationCache.cacheValid = false;
    },

    generateMatter(deltaTime) {
        if (this.state.isOfflineMode) return;
        // 根据每秒物质和时间增量生成物质
        const matterToAdd = this.state.matterPerSecond.mul(new OmegaNum(deltaTime / 1000));
        this.state.currentMatter = this.state.currentMatter.add(matterToAdd);
        // 记录历史最大物质
        if (!this.state.maxMatter) {
            this.state.maxMatter = new OmegaNum(10);
        }
        if (this.state.currentMatter.gt(this.state.maxMatter)) {
            this.state.maxMatter = this.state.currentMatter;
        }
        this.updateMatterPerSecond();
    },

    buyGenerator() {
        if (this.state.currentMatter.gte(this.state.generatorCost)) {
            this.state.currentMatter = this.state.currentMatter.sub(this.state.generatorCost);
            this.state.generatorCount++;
            this.invalidateCalculationCache();
            this.updateMatterPerSecond();
            if (this.state.generatorCount % 10 === 0) {
                this.state.generatorCost = this.state.generatorCost.mul(new OmegaNum(10));
            }
            return true;
        }
        return false;
    },

    toggleOfflineMode() {
            this.state.isOfflineMode = !this.state.isOfflineMode;
            if (this.state.isOfflineMode) {
                this.state.offlineStartTime = Date.now();
            } else {
            if (this.state.offlineStartTime) {
                const endTime = Date.now();
                const timeDiffMs = endTime - this.state.offlineStartTime;
                const secondsDiff = Math.floor(timeDiffMs / 1000);
                this.state.offlineEnergy = this.state.offlineEnergy.add(new OmegaNum(secondsDiff));
                this.state.offlineStartTime = null;
            }
        }
        if (window.UI && UI.updateOfflineEnergy) UI.updateOfflineEnergy();
        },

        enableOfflineBonus() {
            if (this.state.offlineEnergy.gte(new OmegaNum(1023))) {
                this.state.isOfflineBonusActive = true;
            this.state.offlineEnergy = this.state.offlineEnergy.sub(new OmegaNum(1023));
                this.invalidateCalculationCache();
                this.updateMatterPerSecond();
            if (window.UI && UI.updateOfflineEnergy) UI.updateOfflineEnergy();
            } else {
            console.log('离线能量不足，无法开启收益');
            }
        },

        buyEnhancer() {
        if (this.state.currentMatter.gte(this.state.enhancerCost)) {
            this.state.currentMatter = this.state.currentMatter.sub(this.state.enhancerCost);
            this.state.enhancerCount++;
            const newBonus = new OmegaNum(1.5).mul(this.state.enhancerCount);
            this.state.enhancerMultiplier = this.state.enhancerMultiplier.mul(newBonus.max(1.1));
            if (this.state.enhancerCost.gt(new OmegaNum(1e6))) {
                this.state.enhancerCost = this.state.enhancerCost.mul(2).pow(1.5);
            } else {
                this.state.enhancerCost = this.state.enhancerCost.mul(2).pow(1.1);
            }
            if (this.state.antimatterDriveUnlocked) {
                this.state.enhancerCost = this.state.enhancerCost.div(10);
            }
            this.invalidateCalculationCache();
            this.updateMatterPerSecond();
            return true;
        }
        return false;
    },

    buyExpandWarehouse() {
        // 挑战2和挑战3期间禁用扩大仓库升级
        if (window.isChallenge2Active && isChallenge2Active && isChallenge2Active()) {
            return false;
        }
        if (!this.state.upgrades.warehouse && this.state.currentMatter.gte(new OmegaNum('1e8'))) {
            this.state.currentMatter = this.state.currentMatter.sub(new OmegaNum('1e8'));
            this.state.upgrades.warehouse = true;
            this.state.softCapMultiplier = new OmegaNum(0.1);
            this.invalidateCalculationCache();
            if (window.UI && UI.updateUpgradeButtons) UI.updateUpgradeButtons();
            if (window.UI && UI.updateUI) UI.updateUI();
            return true;
        }
        return false;
    },

        updateMatterPerSecond() {
            if (this.state.isOfflineMode) return;
            
            // 检查缓存是否有效
            const now = Date.now();
            if (this.calculationCache.cacheValid && 
                now - this.calculationCache.lastUpdateTime < 100) { // 100ms内缓存有效
                return;
            }
            
            // 挑战期间升级全部无效
            let multiplier = this.state.matterMultiplier;
            let enhancerMultiplier = this.state.enhancerMultiplier;
            let softCapMultiplier = this.state.softCapMultiplier;
            let compressEffect = null;
            
            // 判断挑战状态
            if (window.isUpgradeDisabled && isUpgradeDisabled && isUpgradeDisabled()) {
                multiplier = new OmegaNum(1);
                // 增强器在所有挑战中都有效，除非明确禁用
                // enhancerMultiplier = new OmegaNum(1); // 注释掉这行，让增强器保持有效
                softCapMultiplier = new OmegaNum(0.5);
            } else {
                // 挑战1奖励加成
                if (Game.state.challenge1Reward) {
                    // 密度升级倍率*4
                    if (this.state.upgrades.density) multiplier = multiplier.mul(4);
                    // 压缩物质sqrt(log(matter))*2
                    if (this.state.upgrades.compress) compressEffect = 2;
                    // 仓库容量0.05
                    if (this.state.upgrades.warehouse) softCapMultiplier = new OmegaNum(0.05);
                }
                // 挑战2奖励：软上限消失
                if (Game.state.challenge2Reward) {
                    softCapMultiplier = new OmegaNum(0);
                }
            }
            
            if (this.state.isOfflineBonusActive) {
                multiplier = multiplier.mul(1024);
                UI.updateUI();
            }
            
            // 湮灭能量倍率
            let annihilationBonus = 1;
            if (this.state.annihilationEnergy && this.state.annihilationEnergy.gt(0)) {
                const E = this.state.annihilationEnergy;
                const ln = Math.log;
                annihilationBonus = 1 + (ln(E.plus(1).toNumber()) / ln(2e5 + 1)) * (1 + 0.5 * Math.sqrt(E.div(1e5).toNumber()));
            }
            
            this.state.matterPerSecond = new OmegaNum(this.state.generatorCount)
                .mul(enhancerMultiplier)
                .mul(multiplier)
                .mul(annihilationBonus);
                
            if (this.state.upgrades.compress) {
                const logValue = this.state.currentMatter.gt(1) ? this.state.currentMatter.log(10) : new OmegaNum(1);
                let sqrtLogValue = logValue.max(1).sqrt();
                if (compressEffect) sqrtLogValue = sqrtLogValue.mul(compressEffect);
                this.state.matterPerSecond = this.state.matterPerSecond.mul(sqrtLogValue);
            }
            
            // 软上限机制及提示
            const softCapNotice = this.cachedElements.softCapNotice;
            if (this.state.currentMatter.gte(new OmegaNum(10000)) && softCapMultiplier.gt(0)) {
                const matterAmount = this.state.currentMatter.toNumber();
                const logValue = new OmegaNum(Math.log(matterAmount / 10000));
                // 挑战2期间软上限最后一个乘数为3
                if (window.isChallenge2Active && isChallenge2Active && isChallenge2Active()) {
                    this.state.matterPerSecond = this.state.matterPerSecond.div(new OmegaNum(1).add(logValue.mul(3)));
                } else {
                    this.state.matterPerSecond = this.state.matterPerSecond.div(new OmegaNum(1).add(logValue.mul(softCapMultiplier)));
                }
                if (softCapNotice) softCapNotice.style.display = '';
            } else {
                if (softCapNotice) softCapNotice.style.display = 'none';
            }
            
            // 更新缓存
            this.calculationCache.lastMatterPerSecond = this.state.matterPerSecond;
            this.calculationCache.lastUpdateTime = now;
            this.calculationCache.cacheValid = true;
            
            if (window.UI && UI.updateUpgradeButtons) UI.updateUpgradeButtons();
        },
        
        gameLoop() {
            const now = Date.now();
            if (this.lastUpdateTime && now < this.lastUpdateTime) {
                // 检测到时间倒流，判定为作弊，清空存档并刷新
                console.log('检测到时间作弊，存档已清空！');
                if (window.SaveSystem) {
                    SaveSystem.deleteSave();
                }
                setTimeout(() => location.reload(), 1500);
                return;
            }
            if (this.state.isOfflineMode) {
                // 离线模式下不更新时间，等待用户关闭时结算能量
                requestAnimationFrame(() => this.gameLoop());
                return;
            }
            if (this.state.isOfflineBonusActive) {
                const energyCost = new OmegaNum(1023);
                if (this.state.offlineEnergy.gte(energyCost)) {
                    this.state.offlineEnergy = this.state.offlineEnergy.sub(energyCost);
                    UI.updateOfflineEnergy();
                } else {
                    this.state.isOfflineBonusActive = false;
                }
            }

        const deltaTime = now - this.lastUpdateTime;
        this.lastUpdateTime = now;

        // 记录历史最大物质
        if (!this.state.maxMatter) {
            this.state.maxMatter = new OmegaNum(10);
        }
        if (this.state.currentMatter.gt(this.state.maxMatter)) {
            this.state.maxMatter = this.state.currentMatter;
        }

        // 自动化解锁逻辑：历史物质达到1e8即永久解锁
        if (!this.state.automationUnlocked && this.state.maxMatter.gte(new OmegaNum('1e8'))) {
            this.state.automationUnlocked = true;
        }
        const automationTabBtn = this.cachedElements.automationTabBtn;
        if (automationTabBtn) {
            // 挑战期间隐藏自动化选项卡
            const inChallenge = (window.isUpgradeDisabled && isUpgradeDisabled && isUpgradeDisabled()) || 
                               (window.isChallenge2Active && isChallenge2Active && isChallenge2Active()) ||
                               (window.isChallenge3Active && isChallenge3Active && isChallenge3Active());
            automationTabBtn.style.display = (this.state.automationUnlocked && !inChallenge) ? '' : 'none';
        }

        // 反物质解锁逻辑：历史物质达到5e8或拥有反物质即永久解锁
        if (!this.state.antimatterUnlocked && (
            (this.state.maxMatter && this.state.maxMatter.gte && this.state.maxMatter.gte(new OmegaNum('5e8')))
            || (this.state.antimatter && this.state.antimatter.gte && this.state.antimatter.gte(new OmegaNum(1)))
        )) {
            this.state.antimatterUnlocked = true;
            console.log('已解锁反物质！');
            const antimatterTabBtn = this.cachedElements.antimatterTabBtn;
            if (antimatterTabBtn) {
                antimatterTabBtn.style.display = '';
                antimatterTabBtn.click();
            }
        }
        this.generateMatter(deltaTime);
        if (typeof updateAntimatterDisplay === 'function') updateAntimatterDisplay();
        if (this.state.antimatterUnlocked) {
            const antimatterToAdd = this.state.currentMatter.div(new OmegaNum('5e8')).mul(new OmegaNum(deltaTime / 1000));
            this.state.antimatter = this.state.antimatter.add(antimatterToAdd);
        }
        // 挑战完成检测
        if (typeof checkChallenge1Complete === 'function') checkChallenge1Complete();
        if (typeof checkChallenge2Complete === 'function') checkChallenge2Complete();
        if (typeof checkChallenge3Complete === 'function') checkChallenge3Complete();
        UI.updateUI?.();
        requestAnimationFrame(() => this.gameLoop());
    }
};

// 暴露到全局作用域
window.Game = Game;

// 在UI层绑定按钮事件
window.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('buyExpandWarehouse');
    if (btn) {
        btn.addEventListener('click', function() {
            Game.buyExpandWarehouse();
        });
    }
});

// 在UI层更新按钮状态
if (!window.UI) window.UI = {};
UI.updateUpgradeButtons = function() {
    const warehouseBtn = document.getElementById('buyExpandWarehouse');
    if (warehouseBtn) {
        if (Game.state.upgrades && Game.state.upgrades.warehouse) {
            warehouseBtn.classList.add('purchased');
            warehouseBtn.textContent = '已购买';
            warehouseBtn.disabled = true;
        } else if (
            Game.state.currentMatter &&
            Game.state.currentMatter.gte(new OmegaNum('1e8')) &&
            !(window.isChallenge2Active && isChallenge2Active && isChallenge2Active()) &&
            !(window.isChallenge3Active && isChallenge3Active && isChallenge3Active())
        ) {
            warehouseBtn.classList.add('affordable');
            warehouseBtn.disabled = false;
        } else {
            warehouseBtn.classList.remove('affordable', 'purchased');
            warehouseBtn.disabled = true;
        }
    }
};