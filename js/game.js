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
        this.state = getInitialGameState();
        
        // 添加一些在getInitialGameState中没有的状态
        this.state.isPaused = false;
        this.state.isOfflineMode = false;
        this.state.offlineStartTime = null;
        this.state.offlineEnergy = new OmegaNum(0);
        this.state.isOfflineBonusActive = false;
        this.state.matterPerSecond = new OmegaNum(0);
        this.state.generatorCount = 0;
        this.state.generatorCost = new OmegaNum(10);
        this.state.enhancerCount = 0;
        this.state.enhancerCost = new OmegaNum(100);
        this.state.enhancerMultiplier = new OmegaNum(1);
        this.state.developerMode = false;
        this.state.maxMatter = new OmegaNum(10);
        this.state.maxAntimatter = new OmegaNum(0);
        this.state.automationUnlocked = false;
        this.state.annihilationUnlocked = false;
        this.state.annihilationTime = 0;
        this.state.challengeUnlocked = false;
        this.state.challenge1Reward = false;
        this.state.challenge2Reward = false;
        this.state.challenge3Reward = false;
        this.state.challenge9Reward = false;
        this.state.challenge10Reward = false;
        this.state.saveCreationTime = Date.now();
        this.state.onlineTimeSeconds = 0;
        this.state.offlineTimeSeconds = 0;
        this.state.offlineModeTimeTotal = 0;
        this.state.antimatterExplosionUnlocked = false;
        this.state.newEraUnlocked = false;
        
window.Game = Game;
        this.lastUpdateTime = Date.now();
        
        // 缓存常用DOM元素
        this.cacheDOMElements();
        
        // 检查是否是重置后的启动
        const justReset = localStorage.getItem('gameJustReset');
        if (justReset === 'true') {
            // 清除重置标记
            localStorage.removeItem('gameJustReset');
            // 检测到重置标记，跳过存档加载
        } else {
            // 正常启动时自动加载存档
            SaveSystem.loadGameState();
        }
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
        // 4. 检查距离选项卡显示
        const distanceTabBtn = this.cachedElements.distanceTabBtn;
        // 距离系统解锁逻辑已移除，现在需要通过正常游戏进度解锁
        
        // 确保距离系统相关字段都已正确初始化
        if (!this.state.distance) {
            this.state.distance = new OmegaNum(0);
            // 初始化距离字段
        }
        // 初始化最大距离字段
        if (!this.state.maxDistance) {
            this.state.maxDistance = new OmegaNum(0);
            // 初始化最大距离字段
        }
        // 初始化新的距离能量系统：购买的+生产的
        if (!this.state.distanceEnergyBought) {
            this.state.distanceEnergyBought = new OmegaNum(0);
            // 初始化距离能量购买字段
        }
        if (!this.state.distanceEnergyProduced) {
            this.state.distanceEnergyProduced = new OmegaNum(0);
            // 初始化距离能量生产字段
        }
        if (!this.state.distanceEnergyProduction) {
            this.state.distanceEnergyProduction = new OmegaNum(0);
            // 初始化距离能量生产字段
        }
        // 距离能量生成器已移除，不再需要初始化
        
        // 初始化跞禼能量系统：购买的+生产的
        if (!this.state.kuaEnergyBought) {
            this.state.kuaEnergyBought = new OmegaNum(0);
            // 初始化跞禼能量购买字段
        }
        if (!this.state.kuaEnergyProduced) {
            this.state.kuaEnergyProduced = new OmegaNum(0);
            // 初始化跞禼能量生产字段
        }
        if (!this.state.kuaEnergyProduction) {
            this.state.kuaEnergyProduction = new OmegaNum(0);
            // 初始化跞禼能量生产字段
        }
        if (this.state.kuaEnergyGenerators === undefined) {
            this.state.kuaEnergyGenerators = 0;
            // 初始化跞禼能量生成器数量
        }
        
        // 初始化跠禽能量系统：购买的+生产的
        if (!this.state.genQinEnergyBought) {
            this.state.genQinEnergyBought = new OmegaNum(0);
            // 初始化跠禽能量购买字段
        }
        if (!this.state.genQinEnergyProduced) {
            this.state.genQinEnergyProduced = new OmegaNum(0);
            // 初始化跠禽能量生产字段
        }
        if (!this.state.genQinEnergyProduction) {
            this.state.genQinEnergyProduction = new OmegaNum(0);
            // 初始化跟禽能量生产字段
        }
        if (this.state.genQinEnergyGenerators === undefined) {
            this.state.genQinEnergyGenerators = 0;
            // 初始化跟禽能量生成器数量
        }
        
        if (!this.state.kuoHeEnergy) {
            this.state.kuoHeEnergy = new OmegaNum(0);
            // 初始化跠禾能量字段
        }
        if (!this.state.kuoHeEnergyProduction) {
            this.state.kuoHeEnergyProduction = new OmegaNum(0);
            // 初始化跠禾能量生产字段
        }
        if (this.state.kuoHeEnergyGenerators === undefined) {
            this.state.kuoHeEnergyGenerators = 0;
            // 初始化跠禾能量生成器数量
        }
        
        // 初始化距离献祭系统
        if (!this.state.annihilatedDistance) {
            this.state.annihilatedDistance = new OmegaNum(0);
            // 初始化湮灭距离字段
        }
        
        // 距离系统状态初始化完成
        // 距离能量生成器已移除
        if (distanceTabBtn) distanceTabBtn.style.display = this.state.distanceUnlocked ? '' : 'none';
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
            distanceTabBtn: document.getElementById('distanceTabBtn'),
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
        
        // 软上限通知元素现在在HTML中固定位置，无需动态创建
    },
    
    // 更新软上限通知 (已禁用简单提示)
    updateSoftCapNotice() {
        return;
    },

    startAutoPurchasing() {
        // 确保只存在一个自动购买间隔
        if (this.autoPurchaseInterval) clearInterval(this.autoPurchaseInterval);
        // 挑战3完成后自动化间隔变为2秒
        const interval = this.state.challenge3Reward ? 2000 : 5000;
        this.autoPurchaseInterval = setInterval(() => this.autoPurchasing(), interval);
        // 自动购买功能已启动
    },

    autoPurchasing() {
        if (!this.state.automationUnlocked) return;
        
        // 投喂黑洞期间禁用自动化
        if (window.blackholeChallenge && window.blackholeChallenge.inChallenge) return;
        
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
            let densityBuyAttempts = 0;
            while (!this.state.upgrades.density && this.state.currentMatter.gte(UPGRADE_COSTS.density) && densityBuyAttempts < 5) {
                const cost = UPGRADE_COSTS.density;
                // 挑战5效果：购买后物质变成负值（购买前的负值）
                if (typeof isChallenge5Active === 'function' && isChallenge5Active()) {
                    const matterBeforePurchase = this.state.currentMatter;
                    this.state.currentMatter = this.state.currentMatter.sub(cost);
                    this.state.currentMatter = matterBeforePurchase.neg();
                } else {
                    this.state.currentMatter = this.state.currentMatter.sub(cost);
                    // 挑战5奖励：购买升级时返还50%物质消耗
                    if (this.state.challenge5Reward) {
                        this.state.currentMatter = this.state.currentMatter.add(cost.mul(0.5));
                    }
                }
                this.state.upgrades.density = true;
                // this.state.matterMultiplier = this.state.matterMultiplier.mul(new OmegaNum(2)); // 引起数值爆炸的bug代码，暂时注释
                this.invalidateCalculationCache();
                this.updateMatterPerSecond();
                UI.updateUpgradeButtons();
                UI.updateUI();
                densityBuyAttempts++;
            }

            // 自动购买压缩物质升级
            let compressBuyAttempts = 0;
            while (!this.state.upgrades.compress && this.state.currentMatter.gte(UPGRADE_COSTS.compress) && this.state.currentMatter.gt(0) && compressBuyAttempts < 5) {
                const cost = UPGRADE_COSTS.compress;
                // 挑战5效果：购买后物质变成负值（购买前的负值）
                if (typeof isChallenge5Active === 'function' && isChallenge5Active()) {
                    const matterBeforePurchase = this.state.currentMatter;
                    this.state.currentMatter = this.state.currentMatter.sub(cost);
                    this.state.currentMatter = matterBeforePurchase.neg();
                } else {
                    this.state.currentMatter = this.state.currentMatter.sub(cost);
                    // 挑战5奖励：购买升级时返还50%物质消耗
                    if (this.state.challenge5Reward) {
                        this.state.currentMatter = this.state.currentMatter.add(cost.mul(0.5));
                    }
                }
                this.state.upgrades.compress = true;
                this.invalidateCalculationCache();
                this.updateMatterPerSecond();
                UI.updateUpgradeButtons();
                UI.updateUI();
                compressBuyAttempts++;
            }
        }

        // 自动购买生成器（仅当复选框勾选时）
        if (autoBuyGenerators) {
            let generatorBuyCount = 0;
            const maxGeneratorBuys = 100; // 防止无限循环
            while (this.state.currentMatter.gte(this.state.generatorCost) && generatorBuyCount < maxGeneratorBuys) {
                if (!this.buyGenerator()) break; // 如果购买失败，跳出循环
                generatorBuyCount++;
            }
        }

        // 自动购买增强器（仅当复选框勾选时）
        if (autoBuyEnhancers) {
            let enhancerBuyCount = 0;
            const maxEnhancerBuys = 50; // 防止无限循环
            while (this.state.currentMatter.gte(this.state.enhancerCost) && enhancerBuyCount < maxEnhancerBuys) {
                if (!this.buyEnhancer()) break; // 如果购买失败，跳出循环
                enhancerBuyCount++;
            }
        }
        
        // 距离里程碑自动化功能
        this.performDistanceMilestoneAutomation();
    },

    // 使计算缓存失效
    invalidateCalculationCache() {
        this.calculationCache.cacheValid = false;
    },

    generateMatter(deltaTime) {
        if (this.state.isOfflineMode) return;
        
        // 根据每秒物质和时间增量生成物质
        let matterToAdd = this.state.matterPerSecond.mul(new OmegaNum(deltaTime / 1000));
        
        // 投喂黑洞效果：物质获取变为严苛的限制公式
        if (window.blackholeChallenge && window.blackholeChallenge.inChallenge) {
            if (matterToAdd.gt(0)) {
                // 修复：直接使用黑洞碎片作为基础生产速率
                let baseMatter = new OmegaNum(this.state.blackholeFragments || 0).mul(deltaTime / 1000);
                
                // 计算时间能量增益倍率
                let timeEnergyBonus = new OmegaNum(1);
                if (this.state.timeEnergyMultiplier && this.state.timeEnergyMultiplier.gt(1)) {
                    // 时间能量倍增器效果放大：原倍率的平方根再乘以2
                    timeEnergyBonus = this.state.timeEnergyMultiplier.sqrt().mul(2);
                }
                
                // 计算黑洞升级增益倍率
                let blackholeUpgradeBonus = new OmegaNum(1);
                if (typeof BlackholeSystem !== 'undefined') {
                    const upgradeMultiplier = BlackholeSystem.getSlowdownReductionMultiplier();
                    // 黑洞升级效果放大：原倍率的1.5次方
                    blackholeUpgradeBonus = upgradeMultiplier.pow(1.5);
                }
                
                // 应用新时代升级效果
                let newEraBonus = new OmegaNum(1);
                if (typeof BlackholeSystem !== 'undefined') {
                    newEraBonus = BlackholeSystem.getNewEraMultiplier();
                }
                
                // 最终公式：黑洞碎片速率 × 黑洞升级增益 × 时间能量增益 × 新时代增益
                matterToAdd = baseMatter.mul(blackholeUpgradeBonus).mul(timeEnergyBonus).mul(newEraBonus);
            }
        }
        
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
        // 挑战8：单一生成器 - 禁止购买生成器
        if (typeof isChallenge8Active === 'function' && isChallenge8Active()) {
            return false; // 禁止购买
        }
        
        if (this.state.currentMatter.gte(this.state.generatorCost)) {
            // 1mm里程碑：生成器不消耗物质
            const freePurchase = this.state.distance && this.state.distance.gte(1);
            
            if (!freePurchase) {
                // 挑战5效果：购买后物质变成负值（购买前的负值）
                if (typeof isChallenge5Active === 'function' && isChallenge5Active()) {
                    const matterBeforePurchase = this.state.currentMatter;
                    this.state.currentMatter = this.state.currentMatter.sub(this.state.generatorCost);
                    this.state.currentMatter = matterBeforePurchase.neg();
                } else {
                    this.state.currentMatter = this.state.currentMatter.sub(this.state.generatorCost);
                }
            }
            
            this.state.generatorCount++;
            this.invalidateCalculationCache();
            this.updateMatterPerSecond();
            
            // 基础成本增长
            if (this.state.generatorCount % 10 === 0) {
                this.state.generatorCost = this.state.generatorCost.mul(new OmegaNum(10));
            }
            
            // 挑战9不再有额外成本增加效果
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

                // 只更新累计离线时间
                this.state.offlineTimeSeconds += secondsDiff;

                this.state.offlineStartTime = null;
            }
        }
        if (window.UI && UI.updateTimeStats) UI.updateTimeStats();        },
        
        // 距离折叠专用重置函数（不重置挑战状态）
        distanceFoldReset() {
            // 执行距离折叠重置
            
            // 重置基础资源
            this.state.currentMatter = new OmegaNum(10);
            this.state.matterPerSecond = new OmegaNum(0);
            this.state.generatorCount = 1; // 修复：初始应该有1个生成器
            this.state.generatorCost = new OmegaNum(10);
            this.state.enhancerCount = 0;
            this.state.enhancerCost = new OmegaNum(100);
            this.state.enhancerMultiplier = new OmegaNum(1);
            
            // 重置反物质
            this.state.antimatter = new OmegaNum(0);
            
            // 重置升级状态
            this.state.upgrades = {};
            this.state.matterMultiplier = new OmegaNum(1);
            this.state.softCapMultiplier = new OmegaNum(0.5);
            this.state.newEraUnlocked = false;
            
            // 重置生成器和增强器数组
            this.state.generators = {};
            this.state.boosters = {};
            
            // 重置所有升级增益（但保留反物质爆炸升级）
            this.state.matterGainMultiplier = new OmegaNum(1);
            this.state.generatorEfficiency = new OmegaNum(1);
            this.state.enhancerBoost = new OmegaNum(1);
            this.state.compressionBonus = new OmegaNum(1);
            this.state.densityBonus = new OmegaNum(1);
            this.state.singularityMultiplier = new OmegaNum(1);
            this.state.quantumBoost = new OmegaNum(1);
            this.state.timeWarpFactor = new OmegaNum(1);
            this.state.prestigeBonus = new OmegaNum(1);
            this.state.challengeBonus = new OmegaNum(1);
            this.state.achievementMultipliers = {};
            this.state.wastedCollapse = false;
            
            // 重置离线模式相关
            this.state.isOfflineMode = false;
            this.state.offlineStartTime = null;
            this.state.offlineEnergy = new OmegaNum(0);
            this.state.isOfflineBonusActive = false;
            
            // 重置距离系统状态（除了解锁状态、湮灭距离、当前距离和四种能量）
            // 注意：distance、maxDistance 和四种能量不应该被重置，因为它们都属于距离系统的核心组成部分
            // 距离折叠只重置基础资源（物质、反物质、升级），但保留距离系统的所有进度
            
            // 注意：以下内容不会被重置
            // - challengeUnlocked, challenge1Reward ~ challenge10Reward (挑战状态和奖励)
            // - achievements (成就状态)
            // - annihilationEnergy, annihilationEnergyPeak, annihilationTime, annihilationUnlocked (湮灭能量相关)
            // - annihilatedDistance (湮灭距离 - 这是永久进度)
            // - distanceUnlocked (距离系统解锁状态)
            // - antimatterUnlocked (反物质解锁状态)
            // - automationUnlocked (自动化解锁状态)
            // - antimatterExplosionUnlocked, antimatterMultiplier (反物质爆炸升级)
            // - maxMatter, maxAntimatter (历史最大值)
            // - developerMode (开发者模式)
            // - saveCreationTime, onlineTimeSeconds, offlineTimeSeconds, offlineModeTimeTotal (时间统计)
            
            // 更新UI
            this.invalidateCalculationCache();
            if (window.UI && UI.updateUI) UI.updateUI();
            if (window.UI && UI.updateUpgradeButtons) UI.updateUpgradeButtons();
        },

        // 离线能量功能已移除
        enableOfflineBonus() {
            // 离线能量功能已移除
        },
        
        // 版本号编辑功能
        toggleVersionEdit() {
            const versionEditContainer = document.getElementById('versionEditContainer');
            if (versionEditContainer) {
                const isVisible = versionEditContainer.style.display !== 'none';
                versionEditContainer.style.display = isVisible ? 'none' : 'block';
            }
        },
        
        saveVersionNumber() {
            const versionInput = document.getElementById('versionInput');
            const versionNumber = document.getElementById('versionNumber');
            if (versionInput && versionNumber) {
                const newVersion = versionInput.value.trim();
                versionNumber.textContent = newVersion;
                this.toggleVersionEdit();
                
                // 检查是否解锁成就111和112
                if (window.Achievements) {
                    // 任何版本号修改都解锁成就111
                    Achievements.unlockHidden(111);
                    
                    // 特定版本号解锁成就112
                    if (newVersion === '1.79e308') {
                        Achievements.unlockHidden(112);
                    }
                }
            }
        },
        
        // 破碎之地成就解锁
        unlockBrokenLands() {
            if (window.Achievements) {
                Achievements.unlockHidden(113);
            }
        },

        buyEnhancer() {
        // 挑战9：终极湮灭 - 禁止购买增强器
        if (typeof isChallenge9Active === 'function' && isChallenge9Active()) {
            return false; // 禁止购买
        }
        
        if (this.state.currentMatter.gte(this.state.enhancerCost)) {
            // 1mm里程碑：增强器不消耗物质
            const freePurchase = this.state.distance && this.state.distance.gte(1);
            
            if (!freePurchase) {
                // 挑战5效果：购买后物质变成负值（购买前的负值）
                if (typeof isChallenge5Active === 'function' && isChallenge5Active()) {
                    const matterBeforePurchase = this.state.currentMatter;
                    this.state.currentMatter = this.state.currentMatter.sub(this.state.enhancerCost);
                    this.state.currentMatter = matterBeforePurchase.neg();
                } else {
                    this.state.currentMatter = this.state.currentMatter.sub(this.state.enhancerCost);
                }
            }
            
            this.state.enhancerCount++;
            const newBonus = new OmegaNum(1.5).mul(this.state.enhancerCount);
            this.state.enhancerMultiplier = this.state.enhancerMultiplier.mul(newBonus.max(1.1));
            // 移除价格上限限制，允许无限增长
            if (this.state.enhancerCost.gt(new OmegaNum(1e6))) {
                this.state.enhancerCost = this.state.enhancerCost.mul(2).pow(1.5);
            } else {
                this.state.enhancerCost = this.state.enhancerCost.mul(2).pow(1.1);
            }
            
            // 挑战9不再有额外成本增加效果
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
        // 投喂黑洞期间：禁止购买升级
        if (window.blackholeChallenge && window.blackholeChallenge.inChallenge) {
            return false;
        }
        
        // 挑战2和挑战3期间禁用扩大仓库升级
        if (window.isChallenge2Active && isChallenge2Active && isChallenge2Active()) {
            return false;
        }
        if (!this.state.upgrades.warehouse && this.state.currentMatter.gte(new OmegaNum('1e8'))) {
            // 挑战5效果：购买后物质变成负值（购买前的负值）
            if (typeof isChallenge5Active === 'function' && isChallenge5Active()) {
                const matterBeforePurchase = this.state.currentMatter;
                this.state.currentMatter = this.state.currentMatter.sub(new OmegaNum('1e8'));
                this.state.currentMatter = matterBeforePurchase.neg();
            } else {
                this.state.currentMatter = this.state.currentMatter.sub(new OmegaNum('1e8'));
                // 挑战5奖励：购买升级时返还50%物质消耗
                if (this.state.challenge5Reward) {
                    this.state.currentMatter = this.state.currentMatter.add(new OmegaNum('1e8').mul(0.5));
                }
            }
            this.state.upgrades.warehouse = true;
            this.state.softCapMultiplier = new OmegaNum(0.1);
            this.invalidateCalculationCache();
            if (window.UI && UI.updateUpgradeButtons) UI.updateUpgradeButtons();
            if (window.UI && UI.updateUI) UI.updateUI();
            return true;
        }
        return false;
    },

        // 计算完整的正常matterPerSecond（用于UI显示）
        calculateFullMatterPerSecond() {
            // 临时保存投喂黑洞状态
            const wasInBlackholeChallenge = window.blackholeChallenge && window.blackholeChallenge.inChallenge;
            
            // 临时禁用投喂黑洞状态以计算完整值
            if (wasInBlackholeChallenge) {
                window.blackholeChallenge.inChallenge = false;
            }
            
            // 保存当前matterPerSecond
            const originalMPS = this.state.matterPerSecond;
            
            // 重新计算完整的matterPerSecond
            this.updateMatterPerSecond();
            const fullMPS = this.state.matterPerSecond;
            
            // 恢复原始状态
            this.state.matterPerSecond = originalMPS;
            if (wasInBlackholeChallenge) {
                window.blackholeChallenge.inChallenge = true;
            }
            
            return fullMPS;
        },

        updateMatterPerSecond() {
            if (this.state.isOfflineMode) return;
            
            // 检查缓存是否有效
            const now = Date.now();
            if (this.calculationCache.cacheValid && 
                now - this.calculationCache.lastUpdateTime < 100) { // 100ms内缓存有效
                return;
            }
            
            // 投喂黑洞期间：使用黑洞碎片作为基础速率
            if (window.blackholeChallenge && window.blackholeChallenge.inChallenge) {
                // 基础物质生产：黑洞碎片速率
                this.state.matterPerSecond = new OmegaNum(this.state.blackholeFragments || 0);
                
                // 计算时间能量增益倍率
                if (this.state.timeEnergyMultiplier && this.state.timeEnergyMultiplier.gt(1)) {
                    const timeEnergyBonus = this.state.timeEnergyMultiplier.sqrt().mul(2);
                    this.state.matterPerSecond = this.state.matterPerSecond.mul(timeEnergyBonus);
                }
                
                // 计算黑洞升级增益倍率
                if (typeof BlackholeSystem !== 'undefined') {
                    const blackholeUpgradeBonus = BlackholeSystem.getSlowdownReductionMultiplier().pow(1.5);
                    this.state.matterPerSecond = this.state.matterPerSecond.mul(blackholeUpgradeBonus);
                }
                
                // 应用新时代升级效果
                if (typeof BlackholeSystem !== 'undefined') {
                    const newEraBonus = BlackholeSystem.getNewEraMultiplier();
                    this.state.matterPerSecond = this.state.matterPerSecond.mul(newEraBonus);
                }
                
                // 更新缓存
                this.calculationCache.lastMatterPerSecond = this.state.matterPerSecond;
                this.calculationCache.lastUpdateTime = now;
                this.calculationCache.cacheValid = true;
                
                if (window.UI && UI.updateUpgradeButtons) UI.updateUpgradeButtons();
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
                // 挑战1奖励加成：密度和压缩物质升级效果×2
                if (Game.state.challenge1Reward) {
                    // 密度升级倍率×2
                    if (this.state.upgrades.density) multiplier = multiplier.mul(2);
                    // 压缩物质效果×2
                    if (this.state.upgrades.compress) compressEffect = compressEffect * 2;
                }
                // 挑战2奖励：软上限消失
                if (Game.state.challenge2Reward) {
                    softCapMultiplier = new OmegaNum(0);
                }
            }
            
            // 离线能量功能已移除
            if (this.state.isOfflineBonusActive) {
                this.state.isOfflineBonusActive = false;
            }
            
            // 湮灭能量倍率（投喂黑洞期间禁用）
            const isBlackholeChallenge = window.blackholeChallenge && window.blackholeChallenge.inChallenge;
            const annihilationBonus = isBlackholeChallenge ? new OmegaNum(1) : this.getAnnihilationBonus();
            
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
                // 安全地计算对数值
                let logValue;
                try {
                    const matterRatio = this.state.currentMatter.div(new OmegaNum(10000));
                    if (matterRatio.gte(new OmegaNum('1e100'))) {
                        logValue = new OmegaNum(230); // ln(1e100) ≈ 230
                    } else if (matterRatio.gt(0)) {
                        logValue = matterRatio.ln();
                    } else {
                        logValue = new OmegaNum(100); // 默认高对数值
                    }
                } catch (e) {
                    logValue = new OmegaNum(100); // 出错时使用默认值
                }
                
                // 10000km里程碑：削弱反物质软上限
                let effectiveSoftCapMultiplier = softCapMultiplier;
                if (this.state.distance && this.state.distance.gte(10000000)) { // 10000km = 10000000mm
                    effectiveSoftCapMultiplier = softCapMultiplier.mul(0.5); // 软上限效果减半
                }
                
                // 挑战2期间软上限最后一个乘数为3
                if (window.isChallenge2Active && isChallenge2Active && isChallenge2Active()) {
                    this.state.matterPerSecond = this.state.matterPerSecond.div(new OmegaNum(1).add(logValue.mul(3)));
                } else {
                    this.state.matterPerSecond = this.state.matterPerSecond.div(new OmegaNum(1).add(logValue.mul(effectiveSoftCapMultiplier)));
                }
                
                // 只在物质选项卡显示软上限提示
                if (softCapNotice) {
                    const matterTab = document.getElementById('matterTab');
                    if (matterTab && matterTab.style.display === 'block') {
                        softCapNotice.style.display = '';
                    } else {
                        softCapNotice.style.display = 'none';
                    }
                }
            } else {
                if (softCapNotice) softCapNotice.style.display = 'none';
            }
            
            // 二重软上限机制（挑战6或挑战6激活时）
            const doubleSoftCapThreshold = new OmegaNum('1.79e308');
            const doubleSoftCapNotice = document.getElementById('doubleSoftCapNotice');
            
            if ((typeof window.isChallenge6Active === 'function' && window.isChallenge6Active()) || 
                (this.state.currentMatter.gte(new OmegaNum(10000)) && this.state.currentMatter.gte(doubleSoftCapThreshold))) {
                
                if (this.state.currentMatter.gte(doubleSoftCapThreshold)) {
                    // 安全地计算二重软上限对数值
                    let logValue;
                    try {
                        const matterRatio = this.state.currentMatter.div(doubleSoftCapThreshold);
                        if (matterRatio.gte(new OmegaNum('1e100'))) {
                            logValue = new OmegaNum(230); // ln(1e100) ≈ 230
                        } else if (matterRatio.gt(0)) {
                            logValue = matterRatio.ln();
                        } else {
                            logValue = new OmegaNum(100); // 默认高对数值
                        }
                    } catch (e) {
                        logValue = new OmegaNum(100); // 出错时使用默认值
                    }
                    
                    // 挑战6完成后乘数降为10，否则为20
                    let doubleSoftCapMultiplier = this.state.challenge6Reward ? 10 : 20;
                    
                    // 10000km里程碑：削弱反物质软上限（包括二重软上限）
                    if (this.state.distance && this.state.distance.gte(10000000)) { // 10000km = 10000000mm
                        doubleSoftCapMultiplier = doubleSoftCapMultiplier * 0.5; // 二重软上限效果减半
                    }
                    
                    this.state.matterPerSecond = this.state.matterPerSecond.div(new OmegaNum(1).add(logValue.mul(doubleSoftCapMultiplier)));
                    
                    // 显示二重软上限提示
                    if (doubleSoftCapNotice) {
                        const matterTab = document.getElementById('matterTab');
                        if (matterTab && matterTab.style.display === 'block') {
                            doubleSoftCapNotice.style.display = '';
                        } else {
                            doubleSoftCapNotice.style.display = 'none';
                        }
                    }
                } else if (typeof window.isChallenge6Active === 'function' && window.isChallenge6Active()) {
                    // 挑战6激活时，从1万物质开始就有二重软上限
                    if (this.state.currentMatter.gte(new OmegaNum(10000))) {
                        // 安全地计算挑战6二重软上限对数值
                        let logValue;
                        try {
                            const matterRatio = this.state.currentMatter.div(new OmegaNum(10000));
                            if (matterRatio.gte(new OmegaNum('1e100'))) {
                                logValue = new OmegaNum(230); // ln(1e100) ≈ 230
                            } else if (matterRatio.gt(0)) {
                                logValue = matterRatio.ln();
                            } else {
                                logValue = new OmegaNum(100); // 默认高对数值
                            }
                        } catch (e) {
                            logValue = new OmegaNum(100); // 出错时使用默认值
                        }
                        
                        // 10000km里程碑：削弱反物质软上限（包括挑战6的二重软上限）
                        let challenge6DoubleSoftCapMultiplier = 10;
                        if (this.state.distance && this.state.distance.gte(10000000)) { // 10000km = 10000000mm
                            challenge6DoubleSoftCapMultiplier = challenge6DoubleSoftCapMultiplier * 0.5; // 效果减半
                        }
                        
                        this.state.matterPerSecond = this.state.matterPerSecond.div(new OmegaNum(1).add(logValue.mul(challenge6DoubleSoftCapMultiplier)));
                        
                        // 显示二重软上限提示
                        if (doubleSoftCapNotice) {
                            const matterTab = document.getElementById('matterTab');
                            if (matterTab && matterTab.style.display === 'block') {
                                doubleSoftCapNotice.style.display = '';
                            } else {
                                doubleSoftCapNotice.style.display = 'none';
                            }
                        }
                    }
                }
            } else {
                if (doubleSoftCapNotice) doubleSoftCapNotice.style.display = 'none';
            }
            
            // 挑战4效果：物质产量降低为正常的1/10
            if (typeof window.isChallenge4Active === 'function' && window.isChallenge4Active()) {
                this.state.matterPerSecond = this.state.matterPerSecond.mul(0.1);
            }
            
            // 挑战7效果：熵增定律 - 物质生成速度减少10%+时间*5%
            if (typeof window.isChallenge7Active === 'function' && window.isChallenge7Active()) {
                if (!this.state.challenge7StartTime) {
                    this.state.challenge7StartTime = Date.now();
                }
                const timeElapsed = (Date.now() - this.state.challenge7StartTime) / 1000; // 秒
                const reductionRate = Math.min(1.0, 0.1 + timeElapsed * 0.05); // 生成速度减少10%+时间*5%，最高100%
                this.state.matterPerSecond = this.state.matterPerSecond.mul(1 - reductionRate);
            }
            
            // 挑战8效果：熵增末日 - 物质产量持续衰减
            if (typeof window.isChallenge8Active === 'function' && window.isChallenge8Active()) {
                if (this.state.tempMatterReduction) {
                    this.state.matterPerSecond = this.state.matterPerSecond.mul(this.state.tempMatterReduction);
                }
            }
            
            // 挑战4奖励：物质生产速度永久提升50%
            if (this.state.challenge4Reward) {
                this.state.matterPerSecond = this.state.matterPerSecond.mul(1.5);
            }
            
            // 挑战7奖励：物质对物质本身进行增益（动态上限）
            if (this.state.challenge7Reward && this.state.currentMatter && this.state.currentMatter.gt(1)) {
                // 改进公式：对超大数字更友好的增幅计算
                const matterValue = this.state.currentMatter;
                const logValue = matterValue.log10();
                
                let bonus;
                if (logValue.lte(50)) {
                    // 小于1e50时使用原公式：log10(物质) / 5 + 1
                    bonus = logValue.div(5).add(1);
                } else {
                    // 大于1e50时使用更强的公式：log10(物质) / 2 + 1
                    bonus = logValue.div(2).add(1);
                }
                
                // 动态上限：基础50倍，每1e100物质增加50倍上限
                const dynamicCap = logValue.div(100).floor().mul(50).add(50);
                const cappedBonus = OmegaNum.min(bonus, dynamicCap);
                this.state.matterPerSecond = this.state.matterPerSecond.mul(cappedBonus);
            }
            
            // 挑战6奖励：反物质对物质产生极低增幅效果（无上限）
            if (this.state.challenge6Reward && this.state.antimatter && this.state.antimatter.gt(0)) {
                // 公式：增幅 = log10(反物质/1e4) * 1.5 + 1，无上限
                const antimatterValue = this.state.antimatter;
                const baseValue = new OmegaNum('1e4');
                
                if (antimatterValue.gte(baseValue)) {
                    const logValue = antimatterValue.div(baseValue).log10();
                    const bonus = logValue.mul(1.5).add(1);
                    this.state.matterPerSecond = this.state.matterPerSecond.mul(bonus);
                }
            }
            
            // 挑战9效果已简化为禁止购买增强器
            
            // 距离里程碑效果
            if (this.state.maxDistance) {
                const isBlackholeChallenge = window.blackholeChallenge && window.blackholeChallenge.inChallenge;
                
                // 100km里程碑：湮灭距离的效果同样会增益到物质上（投喂黑洞期间禁用）
                if (this.state.maxDistance.gte(1e8) && this.state.annihilatedDistance && this.state.annihilatedDistance.gt(0) && !isBlackholeChallenge) {
                    // 削弱公式：基于湮灭距离本身，log10(湮灭距离+1e6) * 0.8 + (湮灭距离^0.15) / 1e12 + 1
                    const logBonus = this.state.annihilatedDistance.add(1e6).log10().mul(0.8);
                    const powerBonus = this.state.annihilatedDistance.pow(0.15).div(1e12);
                    const annihilationBonus = logBonus.add(powerBonus).add(1);
                    
                    this.state.matterPerSecond = this.state.matterPerSecond.mul(annihilationBonus);
                }
                
                // 1km里程碑：距离以强力增幅公式增益物质
                if (this.state.maxDistance.gte(1e6)) {
                    const distanceKm = this.state.maxDistance.div(1e6);
                    // 平衡增量游戏公式：log10(距离公里+1) * 1.5 + (距离公里^0.3) * 0.8 + 1
                    const logComponent = distanceKm.add(1).log10().mul(1.5);
                    const powerComponent = distanceKm.pow(0.3).mul(0.8);
                    let matterBonus = logComponent.add(powerComponent).add(1);
                    
                    // 投喂黑洞时削弱：log10(增益)
                    if (isBlackholeChallenge) {
                        matterBonus = matterBonus.log10();
                    }
                    
                    this.state.matterPerSecond = this.state.matterPerSecond.mul(matterBonus);
                }
                
                // 1光年里程碑：物质被自身增幅（比挑战7更强的公式）（投喂黑洞期间禁用）
                if (this.state.maxDistance.gte(new OmegaNum('9.461e15')) && this.state.currentMatter && this.state.currentMatter.gt(1) && !isBlackholeChallenge) {
                    const matterValue = this.state.currentMatter;
                    const logValue = matterValue.log10();
                    
                    let bonus;
                    if (logValue.lte(50)) {
                        // 小于1e50时使用更强公式：log10(物质) / 3 + 1
                        bonus = logValue.div(3).add(1);
                    } else {
                        // 大于1e50时使用超强公式：log10(物质) / 1.5 + 1
                        bonus = logValue.div(1.5).add(1);
                    }
                    
                    // 更高的动态上限：基础100倍，每1e50物质增加100倍上限
                    const dynamicCap = logValue.div(50).floor().mul(100).add(100);
                    const cappedBonus = OmegaNum.min(bonus, dynamicCap);
                    this.state.matterPerSecond = this.state.matterPerSecond.mul(cappedBonus);
                }
            }
            
            // 挑战9奖励：现实操控者 - 所有效果×10
            if (this.state.challenge9Reward) {
                this.state.matterPerSecond = this.state.matterPerSecond.mul(10);
            }
            
            // 时间能量增益：根据时间能量提供物质生产增益
            if (this.state.timeEnergyMultiplier && this.state.timeEnergyMultiplier.gt(1)) {
                this.state.matterPerSecond = this.state.matterPerSecond.mul(this.state.timeEnergyMultiplier);
            }

            // 黑洞升级增益：物质增益强化
            if (typeof BlackholeUpgrades !== 'undefined') {
                const matterBoostMultiplier = BlackholeUpgrades.getMatterBoostMultiplier();
                if (matterBoostMultiplier.gt(1)) {
                    this.state.matterPerSecond = this.state.matterPerSecond.mul(matterBoostMultiplier);
                }
                
                // 黑洞升级增益：吞噬物质转化
                const matterDevourMultiplier = BlackholeUpgrades.getMatterDevourMultiplier();
                if (matterDevourMultiplier.gt(1)) {
                    this.state.matterPerSecond = this.state.matterPerSecond.mul(matterDevourMultiplier);
                }
                
                // 物质路径三：时间加速 - 物质获取^1.1
                const matterTimeAcceleration = BlackholeUpgrades.getMatterTimeAccelerationMultiplier();
                if (matterTimeAcceleration.gt(1)) {
                    this.state.matterPerSecond = this.state.matterPerSecond.pow(matterTimeAcceleration);
                }
            }

            // 黑洞质量不再提供物质增益（已移除）

            // 更新缓存
            this.calculationCache.lastMatterPerSecond = this.state.matterPerSecond;
            this.calculationCache.lastUpdateTime = now;
            this.calculationCache.cacheValid = true;
            
            if (window.UI && UI.updateUpgradeButtons) UI.updateUpgradeButtons();
        },
        
        // 坍缩重置函数 - 重置大部分状态但保留重要进度
        collapseReset() {
            // 执行坍缩重置
            
            // 重置基础资源
            this.state.currentMatter = new OmegaNum(10);
            this.state.matterPerSecond = new OmegaNum(0);
            this.state.generatorCount = 1; // 修复：初始应该有1个生成器
            this.state.generatorCost = new OmegaNum(10);
            this.state.enhancerCount = 0;
            this.state.enhancerCost = new OmegaNum(100);
            this.state.enhancerMultiplier = new OmegaNum(1);
            
            // 重置反物质
            this.state.antimatter = new OmegaNum(0);
            
            // 重置升级状态
            this.state.upgrades = {};
            this.state.matterMultiplier = new OmegaNum(1);
            this.state.softCapMultiplier = new OmegaNum(0.5);
            this.state.newEraUnlocked = false;
            
            // 重置生成器和增强器数组
            this.state.generators = {};
            this.state.boosters = {};
            
            // 重置时间统计
            this.state.saveCreationTime = Date.now();
            this.state.onlineTimeSeconds = 0;
            this.state.offlineTimeSeconds = 0;
            this.state.offlineModeTimeTotal = 0;
            
            // 重置所有升级增益（但保留反物质爆炸升级）
            // this.state.antimatterExplosionUnlocked = false; // 保留反物质爆炸解锁状态
            // this.state.antimatterMultiplier = new OmegaNum(1); // 保留反物质爆炸倍率
            this.state.matterGainMultiplier = new OmegaNum(1);
            this.state.generatorEfficiency = new OmegaNum(1);
            this.state.enhancerBoost = new OmegaNum(1);
            this.state.compressionBonus = new OmegaNum(1);
            this.state.densityBonus = new OmegaNum(1);
            this.state.singularityMultiplier = new OmegaNum(1);
            this.state.quantumBoost = new OmegaNum(1);
            this.state.timeWarpFactor = new OmegaNum(1);
            this.state.prestigeBonus = new OmegaNum(1);
            this.state.challengeBonus = new OmegaNum(1);
            this.state.achievementMultipliers = {};
            this.state.wastedCollapse = false;
            

            
            // 重置离线模式相关
            this.state.isOfflineMode = false;
            this.state.offlineStartTime = null;
            this.state.offlineEnergy = new OmegaNum(0);
            this.state.isOfflineBonusActive = false;
            
            // 注意：以下内容不会被重置
            // - challengeUnlocked, challenge1Reward ~ challenge10Reward (挑战状态和奖励)
            // - achievements (成就状态)
            // - annihilationEnergy, annihilationEnergyPeak, annihilationTime, annihilationUnlocked (湮灭能量相关)
            // - distanceUnlocked (距离系统解锁状态)
            // - antimatterUnlocked (反物质解锁状态)
            // - automationUnlocked (自动化解锁状态)
            // - antimatterExplosionUnlocked, antimatterMultiplier (反物质爆炸升级)
            // - maxMatter, maxAntimatter (历史最大值)
            // - developerMode (开发者模式)
            
            // 更新UI
            this.invalidateCalculationCache();
            if (window.UI && UI.updateUI) UI.updateUI();
            if (window.UI && UI.updateUpgradeButtons) UI.updateUpgradeButtons();
        },

        startGameLoop() {
            if (!this.gameLoopRunning) {
                this.gameLoopRunning = true;
                this.gameLoop();
            }
        },

        stopGameLoop() {
            this.gameLoopRunning = false;
        },

        update(deltaTime) {
            // 检查离线模式
            if (this.state.isOfflineMode) {
                this.state.offlineModeTimeTotal += deltaTime;
                this.state.offlineTimeSeconds += deltaTime / 1000;
                // 在离线模式下，物质不会自然增长，而是依赖于离线能量
            } else {
                this.state.onlineTimeSeconds += deltaTime / 1000;
                // 正常游戏逻辑
                this.generateMatter(deltaTime);
            }

            // 更新UI
            if (window.UI && UI.updateUI) {
                UI.updateUI();
            }

            // 检查并触发成就
            if (window.Achievements && Achievements.check) {
                Achievements.check();
            }
        },

        gameLoop() {
            if (this.state.isPaused) {
                // 如果游戏暂停，则不执行任何操作，但保持循环以待恢复
                this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
                return;
            }

            const now = Date.now();
            let deltaTime = now - this.lastUpdateTime;
            this.lastUpdateTime = now;

            this.update(deltaTime);

            // 递归调用，形成游戏循环
            this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
        },

// ...

        gameLoop() {
            if (this.state.isPaused) {
                requestAnimationFrame(() => this.gameLoop());
                return;
            }

            const now = Date.now();
            if (this.lastUpdateTime && now < this.lastUpdateTime) {
                // 检测到时间倒流，判定为作弊，清空存档并刷新
                // 检测到时间作弊，存档已清空
                if (window.SaveSystem) {
                    SaveSystem.deleteSave();
                }
                setTimeout(() => location.reload(), 1500);
                return;
            }

            // 更新在线时间
            if (!this.state.isOfflineMode) {
                const deltaSeconds = (now - this.lastUpdateTime) / 1000;
                this.state.onlineTimeSeconds += deltaSeconds;

                // 每秒更新一次时间统计
                if (window.TimeStats && TimeStats.updateTimeStats) {
                    TimeStats.updateTimeStats();
                }
            }

            if (this.state.isOfflineMode) {
                // 离线模式下不更新时间，等待用户关闭时结算能量
                // 但要记录离线模式开启的总时长
                const deltaSeconds = Math.floor((now - this.lastUpdateTime) / 1000);
                if (deltaSeconds > 0) {
                    this.state.offlineModeTimeTotal += deltaSeconds;
                }
                requestAnimationFrame(() => this.gameLoop());
                return;
            }
            // 离线能量功能已移除
            if (this.state.isOfflineBonusActive) {
                this.state.isOfflineBonusActive = false;
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
            // 已解锁反物质
            const antimatterTabBtn = this.cachedElements.antimatterTabBtn;
            if (antimatterTabBtn) {
                antimatterTabBtn.style.display = '';
                // antimatterTabBtn.click(); // 禁用自动切换，让玩家自行决定何时查看
            }
        }
        // 挑战8废稿代码已删除，新版挑战8逻辑在antimatter.js中
        
        this.generateMatter(deltaTime);
        if (typeof updateAntimatterDisplay === 'function') updateAntimatterDisplay();
        if (this.state.antimatterUnlocked) {
            // 投喂黑洞期间禁用反物质生成
            if (window.blackholeChallenge && window.blackholeChallenge.inChallenge) {
                // 在投喂黑洞时不生成反物质
            } else {
                let antimatterToAdd = this.state.currentMatter.div(new OmegaNum('5e8')).mul(new OmegaNum(deltaTime / 1000));

            // 应用反物质爆炸升级效果
            if (this.state.antimatterExplosionUnlocked) {
                antimatterToAdd = antimatterToAdd.mul(this.state.antimatterMultiplier);
            }
            
            // 应用反物质软上限
            if (this.state.antimatter.gte(new OmegaNum(500))) {
                // 安全地计算对数值，避免超大数字导致的问题
                let logValue;
                try {
                    const antimatterRatio = this.state.antimatter.div(new OmegaNum(500));
                    if (antimatterRatio.gte(new OmegaNum('1e100'))) {
                        // 对于极大数字，使用固定的高对数值
                        logValue = 100;
                    } else {
                        const antimatterValue = antimatterRatio.toNumber();
                        if (isFinite(antimatterValue) && antimatterValue > 0) {
                            logValue = Math.log10(antimatterValue);
                        } else {
                            logValue = 50; // 默认高对数值
                        }
                    }
                } catch (e) {
                    logValue = 50; // 出错时使用默认值
                }
                
                // 如果有扩大反物质仓库升级，减益较为缓和
                if (Game.state.upgrades && Game.state.upgrades.antimatterWarehouse) {
                    // 缓和的软上限计算公式
                    if (logValue <= 0) {
                        // 基础减益
                        const softCapDebuff = 0.8; // 只削减20%
                        antimatterToAdd = antimatterToAdd.mul(softCapDebuff);
                    } else {
                        // 使用较缓和的对数公式，限制最大减益
                        const softCapDebuff = Math.max(0.1, 0.8 / (1 + 0.5 * Math.min(logValue, 20)));
                        antimatterToAdd = antimatterToAdd.mul(softCapDebuff);
                    }
                } else {
                    // 未升级版本，减益较为明显但不过分
                    if (logValue <= 0) {
                        // 基础减益
                        const softCapDebuff = 0.6; // 削减40%
                        antimatterToAdd = antimatterToAdd.mul(softCapDebuff);
                    } else {
                        // 使用平方根而非平方，减轻减益强度，限制最大减益
                        const softCapDebuff = Math.max(0.05, 0.6 / (1 + 0.7 * Math.min(logValue, 30)));
                        antimatterToAdd = antimatterToAdd.mul(softCapDebuff);
                    }
                }
            }
            
                // 应用时间能量增益
                if (this.state.timeEnergyMultiplier && this.state.timeEnergyMultiplier.gt(1)) {
                    antimatterToAdd = antimatterToAdd.mul(this.state.timeEnergyMultiplier);
                }
                
                // 应用黑洞升级的反物质增益效果
                if (window.BlackholeUpgrades) {
                    const antimatterBoost = BlackholeUpgrades.getAntimatterBoostMultiplier();
                    if (antimatterBoost.gt(1)) {
                        antimatterToAdd = antimatterToAdd.mul(antimatterBoost);
                    }
                }
                
                this.state.antimatter = this.state.antimatter.add(antimatterToAdd);
            }
        }
        // 距离系统更新
        this.updateDistanceSystem(deltaTime);
        
        // 时间能量系统更新
        this.updateTimeEnergySystem(deltaTime);
        
        // 黑洞系统更新（降低更新频率）
        if (typeof BlackholeSystem !== 'undefined' && BlackholeSystem.updateUI) {
            if (!this.blackholeUICache) {
                this.blackholeUICache = { lastUpdate: 0 };
            }
            
            const now = Date.now();
            if (now - this.blackholeUICache.lastUpdate > 500) {
                // 每500ms更新一次黑洞UI，避免频繁更新导致闪烁
                BlackholeSystem.updateUI();
                this.blackholeUICache.lastUpdate = now;
            }
        }
        
        // 挑战完成检测
        if (typeof checkChallenge1Complete === 'function') checkChallenge1Complete();
        if (typeof checkChallenge2Complete === 'function') checkChallenge2Complete();
        if (typeof checkChallenge3Complete === 'function') checkChallenge3Complete();
        if (typeof checkChallenge4Complete === 'function') checkChallenge4Complete();
        if (typeof checkChallenge5Complete === 'function') checkChallenge5Complete();
        if (typeof checkChallenge6Complete === 'function') checkChallenge6Complete();
        if (typeof checkChallenge7Complete === 'function') checkChallenge7Complete();
        if (typeof checkChallenge8Complete === 'function') checkChallenge8Complete();
        if (typeof checkChallenge9Complete === 'function') checkChallenge9Complete();

        UI.updateUI?.();
        
        // 性能保护：当检测到超大数字时降低游戏循环频率
        let frameDelay = 0;
        if (this.state.currentMatter && this.state.currentMatter.gte(new OmegaNum('1e1000'))) {
            frameDelay = 50; // 超大数字时延迟50ms
        } else if (this.state.currentMatter && this.state.currentMatter.gte(new OmegaNum('1e500'))) {
            frameDelay = 20; // 大数字时延迟20ms
        }
        
        if (frameDelay > 0) {
            setTimeout(() => {
                requestAnimationFrame(() => this.gameLoop());
            }, frameDelay);
        } else {
            requestAnimationFrame(() => this.gameLoop());
        }
    },

    // 距离系统更新
    updateDistanceSystem(deltaTime) {
        // 只有在距离系统解锁后才执行更新
        if (!this.state.distanceUnlocked) {
            return;
        }
        
        // 投喂黑洞期间禁用距离系统更新
        if (window.blackholeChallenge && window.blackholeChallenge.inChallenge) {
            return;
        }
        
        // 确保距离字段存在
        if (!this.state.distance) {
            this.state.distance = new OmegaNum(0);
        }
        
        // 检查是否刚刚执行了距离献祭，如果是则暂停距离生产2秒
        if (this.state.distanceSacrificeTime && (Date.now() - this.state.distanceSacrificeTime) < 2000) {
            return; // 暂停距离系统更新
        }
        // 清除距离献祭标记
        if (this.state.distanceSacrificeTime && (Date.now() - this.state.distanceSacrificeTime) >= 2000) {
            this.state.distanceSacrificeTime = null;
        }
        
        const deltaSeconds = deltaTime / 1000;
        
        // 获取总能量（购买的+生产的）
        const totalDistanceEnergy = this.state.distanceEnergyBought.add(this.state.distanceEnergyProduced);
        const totalKuaEnergy = this.state.kuaEnergyBought.add(this.state.kuaEnergyProduced);
        const totalGenQinEnergy = this.state.genQinEnergyBought.add(this.state.genQinEnergyProduced);
        

        
        // 距离能量生产距离（每秒生成1毫米，每买10个效果*2）
        if (this.state.distanceEnergyBought.add(this.state.distanceEnergyProduced).gte(1)) {
            // 使用总距离能量（购买的+生产的）
            const totalDistanceEnergy = this.state.distanceEnergyBought.add(this.state.distanceEnergyProduced);
            let baseProduction = totalDistanceEnergy.mul(10); // 提高基础生产让增益效果更明显
            
            // 1000km里程碑：距离能量以强化公式增益
            let multiplier;
            if (this.state.maxDistance && this.state.maxDistance.gte(1e9)) {
                // 强化增量游戏公式：log10(距离能量+2) * 2.5 + (距离能量^0.4) * 1.8 + 距离能量/3 + 1
                const logComponent = totalDistanceEnergy.add(2).log10().mul(2.5);
                const powerComponent = totalDistanceEnergy.pow(0.4).mul(1.8);
                const linearComponent = totalDistanceEnergy.div(3);
                multiplier = logComponent.add(powerComponent).add(linearComponent).add(1);
            } else {
                multiplier = new OmegaNum(2).pow(totalDistanceEnergy.div(10).floor());
            }
            
            // 湮灭距离增益：创意对数公式增幅距离生成（投喂黑洞期间禁用）
            const isBlackholeChallenge = window.blackholeChallenge && window.blackholeChallenge.inChallenge;
            if (this.state.annihilatedDistance && this.state.annihilatedDistance.gt(0) && !isBlackholeChallenge) {
                const annihilatedLightYears = this.state.annihilatedDistance.div(new OmegaNum('9.461e15'));
                // 极致增量游戏公式：log10(湮灭光年+1) * 100 + (湮灭光年^0.8) * 50 + 1
                const logComponent = annihilatedLightYears.add(1).log10().mul(100);
                const powerComponent = annihilatedLightYears.pow(0.8).mul(50);
                const annihilationBonus = logComponent.add(powerComponent).add(1);
                baseProduction = baseProduction.mul(annihilationBonus);
            }
            
            // 10光年里程碑：距离生成速度以削弱公式增益
            if (this.state.maxDistance && this.state.maxDistance.gte('9.461e16')) {
                // 削弱公式：基于最大距离本身，log10(最大距离+1e15) * 0.6 + (最大距离^0.12) / 1e18 + 1
                const logComponent = this.state.maxDistance.add(1e15).log10().mul(0.6);
                const powerComponent = this.state.maxDistance.pow(0.12).div(1e18);
                const distanceBonus = logComponent.add(powerComponent).add(1);
                baseProduction = baseProduction.mul(distanceBonus);
            }
            
            // 应用时间能量增益
            if (this.state.timeEnergyMultiplier && this.state.timeEnergyMultiplier.gt(1)) {
                baseProduction = baseProduction.mul(this.state.timeEnergyMultiplier);
            }
            
            let distanceProduction = baseProduction.mul(multiplier).mul(1000).mul(deltaSeconds);
            
            // 距离软硬上限系统
            const currentDistanceLightYears = this.state.distance.div(new OmegaNum('9.461e15'));
            const firstSoftCap = new OmegaNum('1e60'); // 1e60光年
            const secondSoftCap = new OmegaNum('1e120'); // 1e120光年
            const hardCap = new OmegaNum('1e200'); // 1e200光年
            
            // 检查硬上限
            if (currentDistanceLightYears.gte(hardCap)) {
                // 硬上限：完全停止距离生产
                distanceProduction = new OmegaNum(0);
                // 显示硬上限提示
                const hardCapNotice = document.getElementById('distanceHardCapNotice');
                if (hardCapNotice) {
                    const distanceTab = document.getElementById('distanceTab');
                    if (distanceTab && distanceTab.style.display === 'block') {
                        hardCapNotice.style.display = '';
                    } else {
                        hardCapNotice.style.display = 'none';
                    }
                }
            } else {
                const hardCapNotice = document.getElementById('distanceHardCapNotice');
                if (hardCapNotice) hardCapNotice.style.display = 'none';
                
                // 应用软上限削弱
                if (currentDistanceLightYears.gte(secondSoftCap)) {
                    // 二重软上限：距离生产除以(当前距离/1e120)^2
                    const softCapFactor = currentDistanceLightYears.div(secondSoftCap).pow(2);
                    distanceProduction = distanceProduction.div(softCapFactor);
                    // 显示二重软上限提示
                    const secondSoftCapNotice = document.getElementById('distanceSecondSoftCapNotice');
                    if (secondSoftCapNotice) {
                        const distanceTab = document.getElementById('distanceTab');
                        if (distanceTab && distanceTab.style.display === 'block') {
                            secondSoftCapNotice.style.display = '';
                        } else {
                            secondSoftCapNotice.style.display = 'none';
                        }
                    }
                    // 隐藏一重软上限提示
                    const firstSoftCapNotice = document.getElementById('distanceFirstSoftCapNotice');
                    if (firstSoftCapNotice) firstSoftCapNotice.style.display = 'none';
                } else if (currentDistanceLightYears.gte(firstSoftCap)) {
                    // 一重软上限：距离生产除以(当前距离/1e60)^1.5
                    const softCapFactor = currentDistanceLightYears.div(firstSoftCap).pow(1.5);
                    distanceProduction = distanceProduction.div(softCapFactor);
                    // 显示一重软上限提示
                    const firstSoftCapNotice = document.getElementById('distanceFirstSoftCapNotice');
                    if (firstSoftCapNotice) {
                        const distanceTab = document.getElementById('distanceTab');
                        if (distanceTab && distanceTab.style.display === 'block') {
                            firstSoftCapNotice.style.display = '';
                        } else {
                            firstSoftCapNotice.style.display = 'none';
                        }
                    }
                    // 隐藏二重软上限提示
                    const secondSoftCapNotice = document.getElementById('distanceSecondSoftCapNotice');
                    if (secondSoftCapNotice) secondSoftCapNotice.style.display = 'none';
                } else {
                    // 隐藏所有软上限提示
                    const firstSoftCapNotice = document.getElementById('distanceFirstSoftCapNotice');
                    const secondSoftCapNotice = document.getElementById('distanceSecondSoftCapNotice');
                    if (firstSoftCapNotice) firstSoftCapNotice.style.display = 'none';
                    if (secondSoftCapNotice) secondSoftCapNotice.style.display = 'none';
                }
            }
            
            this.state.distance = this.state.distance.add(distanceProduction);
            
            // 更新最大距离
            if (this.state.distance.gt(this.state.maxDistance)) {
                this.state.maxDistance = this.state.distance;
            }
            
            // 检查是否达到50光年，触发距离之神对话（独立于距离更新逻辑）
            const fiftyLightYears = new OmegaNum('4.7305e17'); // 50光年 = 50 * 9.461e15毫米
            if (this.state.maxDistance.gte(fiftyLightYears) && !this.state.euclidarDialogShown) {
                this.state.euclidarDialogShown = true;
                this.showEuclidarDialog();
            }
        }
        
        // 跞禼能量生产距离能量（每秒生成，倍率基于购买数值）
        if (this.state.kuaEnergyBought.add(this.state.kuaEnergyProduced).gte(1)) {
            const totalKuaEnergy = this.state.kuaEnergyBought.add(this.state.kuaEnergyProduced);
            // 基础生产量调整为更合理的数值：每个跞禼能量每秒生产0.1个距离能量
            const baseProduction = totalKuaEnergy.mul(0.1);
            
            // 倍率计算基于购买的数量
            let multiplier;
            if (this.state.maxDistance && this.state.maxDistance.gte(1e12)) {
                // 1000000km里程碑后：跞禼能量以超强公式增益
                // 超强增量游戏公式：log10(跞禼能量+3) * 3 + (跞禼能量^0.5) * 2 + 跞禼能量/2 + 1
                const kuaCount = this.state.kuaEnergyBought;
                const logComponent = kuaCount.add(3).log10().mul(3);
                const powerComponent = kuaCount.pow(0.5).mul(2);
                const linearComponent = kuaCount.div(2);
                multiplier = logComponent.add(powerComponent).add(linearComponent).add(1);
            } else {
                // 普通情况：每10个购买的跞禼能量效果×2
                multiplier = new OmegaNum(2).pow(this.state.kuaEnergyBought.div(10).floor());
            }
            
            // 应用时间能量增益
            let finalProduction = baseProduction.mul(multiplier);
            if (this.state.timeEnergyMultiplier && this.state.timeEnergyMultiplier.gt(1)) {
                finalProduction = finalProduction.mul(this.state.timeEnergyMultiplier);
            }
            
            // 计算每秒生产速度
            this.state.distanceEnergyProduction = finalProduction;
            const distanceProduction = this.state.distanceEnergyProduction.mul(deltaSeconds);
            this.state.distanceEnergyProduced = this.state.distanceEnergyProduced.add(distanceProduction);
        } else {
            this.state.distanceEnergyProduction = new OmegaNum(0);
        }
        
        // 跟禽能量生产跞禼能量（每秒生成，倍率基于购买数值）
        if (this.state.genQinEnergyBought.add(this.state.genQinEnergyProduced).gte(1)) {
            const totalGenQinEnergy = this.state.genQinEnergyBought.add(this.state.genQinEnergyProduced);
            const baseProduction = totalGenQinEnergy;
            const multiplier = new OmegaNum(2).pow(this.state.genQinEnergyBought.div(10).floor());
            // 应用时间能量增益
            let finalProduction = baseProduction.mul(multiplier);
            if (this.state.timeEnergyMultiplier && this.state.timeEnergyMultiplier.gt(1)) {
                finalProduction = finalProduction.mul(this.state.timeEnergyMultiplier);
            }
            
            // 计算每秒生产速度
            this.state.kuaEnergyProduction = finalProduction;
            const kuaProduction = this.state.kuaEnergyProduction.mul(deltaSeconds);
            this.state.kuaEnergyProduced = this.state.kuaEnergyProduced.add(kuaProduction);
        } else {
            this.state.kuaEnergyProduction = new OmegaNum(0);
        }
        
        // 跠禾能量生产跟禽能量（每秒生成，倍率基于购买数值）
        if (this.state.kuoHeEnergyBought.add(this.state.kuoHeEnergyProduced).gte(1)) {
            const totalKuoHeEnergy = this.state.kuoHeEnergyBought.add(this.state.kuoHeEnergyProduced);
            const baseProduction = totalKuoHeEnergy;
            const multiplier = new OmegaNum(2).pow(this.state.kuoHeEnergyBought.div(10).floor());
            // 应用时间能量增益
            let finalProduction = baseProduction.mul(multiplier);
            if (this.state.timeEnergyMultiplier && this.state.timeEnergyMultiplier.gt(1)) {
                finalProduction = finalProduction.mul(this.state.timeEnergyMultiplier);
            }
            
            // 计算每秒生产速度
            this.state.genQinEnergyProduction = finalProduction;
            const genQinProduction = this.state.genQinEnergyProduction.mul(deltaSeconds);
            this.state.genQinEnergyProduced = this.state.genQinEnergyProduced.add(genQinProduction);
        } else {
            this.state.genQinEnergyProduction = new OmegaNum(0);
        }
        
        // 跠禾能量本身没有被其他能量生产，但需要设置生产速度为0以保持一致性
        if (!this.state.kuoHeEnergyBought.gte(1)) {
            this.state.kuoHeEnergyProduction = new OmegaNum(0);
        }
    },
    
    // 手动触发距离之神对话（用于开发者模式或调试）
    triggerEuclidarDialog() {
        // 检查一次性对话框是否已显示
        if (window.Utils && Utils.oneTimeDialogs && Utils.oneTimeDialogs.has('euclidar_antimar_dialog')) {
            return false; // 已显示过
        }
        this.showEuclidarDialog();
        return true;
    },
    
    // 距离之神Euclidar对话
    showEuclidarDialog() {
        const dialogs = [
            {
                title: 'Euclidar',
                content: '哎，跑得还挺快啊',
                titleBgColor: '#0066CC', // 蓝色
                width: '400px',
                height: '400px',
                waitTime: 1
            },
            {
                title: 'Euclidar',
                content: '我是这里最弱的神，距离',
                titleBgColor: '#0066CC',
                width: '400px',
                height: '400px',
                waitTime: 1
            },
            {
                title: 'Euclidar',
                content: 'Antimar给你做的新手引导怎么样?',
                titleBgColor: '#0066CC',
                width: '400px',
                height: '400px',
                waitTime: 1
            },
            {
                title: 'Antimar',
                content: '在想我的事？',
                titleBgColor: '#8B0000', // 深红色
                width: '400px',
                height: '400px',
                waitTime: 1
            },
            {
                title: 'Euclidar',
                content: '这里不是有结界吗?你怎么进来的?',
                titleBgColor: '#0066CC',
                width: '400px',
                height: '400px',
                waitTime: 1
            },
            {
                title: 'Antimar',
                content: '不必在意。你现在已经找到了那个最终挑战，挑战九，现在，随我来吧。',
                titleBgColor: '#8B0000',
                width: '400px',
                height: '400px',
                waitTime: 1
            }
        ];
        
        // 显示一次性对话序列
        if (window.Utils && Utils.showDialogSequence) {
            Utils.showDialogSequence(dialogs, () => {
                // 距离之神对话完成
                // 设置距离之神对话完成标记
                this.state.euclidarDialogCompleted = true;
                // 显示挑战9卡片
                const challenge9Card = document.getElementById('challenge9Card');
                if (challenge9Card) {
                    challenge9Card.style.display = 'flex';
                    // 挑战9卡片已解锁显示
                }
                // 更新挑战UI
                if (window.updateChallengeTabUI) {
                    updateChallengeTabUI();
                }
            }, 'euclidar_antimar_dialog'); // 设置为一次性对话框序列
        }
    },
    
    // 距离上限提示对话
    showDistanceCapDialog(capType) {
        let dialogs = [];
        
        if (capType === 'first') {
            dialogs = [
                {
                    title: '宇宙边界警告',
                    content: '你已经跑完了整个宇宙的面积！',
                    titleBgColor: '#FF6600', // 橙色
                    width: '400px',
                    height: '300px',
                    waitTime: 2
                },
                {
                    title: '系统提示',
                    content: '距离获取受到一重软上限限制，效率开始下降。',
                    titleBgColor: '#FF6600',
                    width: '400px',
                    height: '300px',
                    waitTime: 2
                }
            ];
        } else if (capType === 'second') {
            dialogs = [
                {
                    title: '多元宇宙边界警告',
                    content: '你已经跑完了整个多元宇宙！',
                    titleBgColor: '#CC0000', // 红色
                    width: '400px',
                    height: '300px',
                    waitTime: 2
                },
                {
                    title: '系统提示',
                    content: '距离获取受到二重软上限限制，效率大幅下降。',
                    titleBgColor: '#CC0000',
                    width: '400px',
                    height: '300px',
                    waitTime: 2
                }
            ];
        } else if (capType === 'hard') {
            dialogs = [
                {
                    title: '虚无墙',
                    content: '你撞上了虚无墙！',
                    titleBgColor: '#000000', // 黑色
                    width: '400px',
                    height: '300px',
                    waitTime: 3
                },
                {
                    title: '系统提示',
                    content: '再也没法跑了，距离获取完全停止。',
                    titleBgColor: '#000000',
                    width: '400px',
                    height: '300px',
                    waitTime: 3
                }
            ];
        }
        
        // 显示对话序列
        if (window.Utils && Utils.showDialogSequence && dialogs.length > 0) {
            Utils.showDialogSequence(dialogs, null, `distance_cap_${capType}`);
        }
    },
    
    // 距离献祭功能
    sacrificeDistance() {
        // 检查是否有足够的距离进行献祭（至少需要10公里）
         const tenKilometers = new OmegaNum('1e7'); // 10公里 = 1e7毫米
         if (!this.state.distance || this.state.distance.lt(tenKilometers)) {
            return false;
        }
        
        // 在重置之前保存当前距离和最大距离
        const currentDistance = this.state.distance || new OmegaNum(0);
        const currentMaxDistance = this.state.maxDistance || new OmegaNum(0);
        
        // 将距离转换为湮灭距离
        if (!this.state.annihilatedDistance) {
            this.state.annihilatedDistance = new OmegaNum(0);
        }
        this.state.annihilatedDistance = this.state.annihilatedDistance.add(currentDistance);
        
        // 执行基础重置，但不重置四种能量
        // 重置基础资源
        this.state.currentMatter = new OmegaNum(10);
        this.state.matterPerSecond = new OmegaNum(0);
        this.state.generatorCount = 0;
        this.state.generatorCost = new OmegaNum(10);
        this.state.enhancerCount = 0;
        this.state.enhancerCost = new OmegaNum(100);
        this.state.enhancerMultiplier = new OmegaNum(1);
        
        // 重置反物质
        this.state.antimatter = new OmegaNum(0);
        
        // 重置升级状态
        this.state.upgrades = {};
        this.state.matterMultiplier = new OmegaNum(1);
        this.state.softCapMultiplier = new OmegaNum(0.5);
        this.state.newEraUnlocked = false;
        
        // 重置生成器和增强器数组
        this.state.generators = {};
        this.state.boosters = {};
        
        // 重置所有升级增益（但保留反物质爆炸升级）
        this.state.matterGainMultiplier = new OmegaNum(1);
        this.state.generatorEfficiency = new OmegaNum(1);
        this.state.enhancerBoost = new OmegaNum(1);
        this.state.compressionBonus = new OmegaNum(1);
        this.state.densityBonus = new OmegaNum(1);
        this.state.singularityMultiplier = new OmegaNum(1);
        this.state.quantumBoost = new OmegaNum(1);
        this.state.timeWarpFactor = new OmegaNum(1);
        this.state.prestigeBonus = new OmegaNum(1);
        this.state.challengeBonus = new OmegaNum(1);
        this.state.achievementMultipliers = {};
        this.state.wastedCollapse = false;
        
        // 重置离线模式相关
        this.state.isOfflineMode = false;
        this.state.offlineStartTime = null;
        this.state.offlineEnergy = new OmegaNum(0);
        this.state.isOfflineBonusActive = false;
        
        // 注意：距离献祭不重置四种能量的购买量和生产量，这是与距离折叠的区别
        
        // 强制重置当前距离和湮灭能量为零
        this.state.distance = new OmegaNum(0);
        this.state.annihilationEnergy = new OmegaNum(0);
        
        // 保持最大距离不被重置
        this.state.maxDistance = currentMaxDistance;
        
        // 设置距离献祭标记，暂停距离生产一小段时间
        this.state.distanceSacrificeTime = Date.now();
        
        // 更新UI
        this.invalidateCalculationCache();
        if (window.UI && UI.updateUI) UI.updateUI();
        if (window.UI && UI.updateUpgradeButtons) UI.updateUpgradeButtons();
        
        return true;
    },
    
    // 计算湮灭能量倍率（前期弱后期强的公式）
    getAnnihilationBonus() {
        let annihilationBonus = new OmegaNum(1);
        if (this.state.annihilationEnergy && this.state.annihilationEnergy.gt(0)) {
            const E = this.state.annihilationEnergy;
            try {
                // 前期弱后期强的湮灭能量公式：log10(湮灭能量+1) * 1.2 + (湮灭能量^0.35) * 0.3 + 1
                // 提高对数部分系数和幂函数指数，让后期增长更强
                const logComponent = E.add(1).log10().mul(1.2);
                const powerComponent = E.pow(0.35).mul(0.3);
                annihilationBonus = logComponent.add(powerComponent).add(1);
            } catch (e) {
                annihilationBonus = new OmegaNum(2); // 出错时使用默认值
            }
        }
        
        // 反物质路径三：湮灭一切 - 增幅湮灭能量增益公式
        if (typeof BlackholeUpgrades !== 'undefined') {
            const antimatterAnnihilateAllMultiplier = BlackholeUpgrades.getAntimatterAnnihilateAllMultiplier();
            if (antimatterAnnihilateAllMultiplier.gt(1)) {
                annihilationBonus = annihilationBonus.mul(antimatterAnnihilateAllMultiplier);
            }
        }
        
        // 挑战9效果：湮灭能量增益开平方
        if (this.state.tempAnnihilationSqrt && annihilationBonus.gt(1)) {
            // 对增益部分开平方：sqrt(bonus - 1) + 1
            const bonusPart = annihilationBonus.sub(1);
            annihilationBonus = bonusPart.sqrt().add(1);
        }
        
        return annihilationBonus;
    },

    // 使用湮灭能量前进距离
    useAnnihilationEnergyForDistance() {
        // 确保距离字段已初始化
        if (!this.state.distance) {
            this.state.distance = new OmegaNum(0);
        }
        
        if (this.state.annihilationEnergy.gte(1)) {
            // 获取当前湮灭能量数量
            let energyAmount = this.state.annihilationEnergy;
            
            // 应用湮灭距离增益：削弱公式增幅距离折叠效果（投喂黑洞期间禁用）
            const isBlackholeChallenge = window.blackholeChallenge && window.blackholeChallenge.inChallenge;
            if (this.state.annihilatedDistance && this.state.annihilatedDistance.gt(0) && !isBlackholeChallenge) {
                // 削弱公式：基于湮灭距离本身，log10(湮灭距离+1e9) * 1.2 + (湮灭距离^0.2) / 1e15 + 1
                const logComponent = this.state.annihilatedDistance.add(1e9).log10().mul(1.2);
                const powerComponent = this.state.annihilatedDistance.pow(0.2).div(1e15);
                const annihilationBonus = logComponent.add(powerComponent).add(1);
                energyAmount = energyAmount.mul(annihilationBonus);
            }
            
            // 前进距离 = 湮灭能量数量 × 湮灭距离增益（毫米）
            this.state.distance = this.state.distance.add(energyAmount);
            
            // 更新最大距离
            if (this.state.distance.gt(this.state.maxDistance)) {
                this.state.maxDistance = this.state.distance;
            }
            
            // 检查是否达到50光年，触发距离之神对话（距离折叠也能触发）
            const fiftyLightYears = new OmegaNum('4.7305e17'); // 50光年 = 50 * 9.461e15毫米
            if (this.state.maxDistance.gte(fiftyLightYears) && !this.state.euclidarDialogShown) {
                this.state.euclidarDialogShown = true;
                this.showEuclidarDialog();
            }
            
            // 距离折叠专用重置（不重置挑战状态）
            this.distanceFoldReset();
            
            // 重置湮灭能量为零
            this.state.annihilationEnergy = new OmegaNum(0);
            
            // 移除通知以减少干扰
            return true;
        }
        return false;
    },
    
    // 购买距离能量
    buyDistanceEnergy() {
        // 确保距离字段已初始化
        if (!this.state.distance) {
            this.state.distance = new OmegaNum(0);
        }
        if (!this.state.distanceEnergyCost) {
            this.state.distanceEnergyCost = new OmegaNum('1e6');
        }
        
        if (this.state.distance.gte(this.state.distanceEnergyCost)) {
            this.state.distance = this.state.distance.sub(this.state.distanceEnergyCost);
            this.state.distanceEnergyBought = this.state.distanceEnergyBought.add(1);
            
            // 每买10个价格*10
            if (this.state.distanceEnergyBought.mod(10).eq(0)) {
                this.state.distanceEnergyCost = this.state.distanceEnergyCost.mul(10);
            }
            
            // 移除通知以减少干扰
            return true;
        }
        return false;
    },
    
    // 购买跞禼能量
    buyKuaEnergy() {
        // 确保距离字段已初始化
        if (!this.state.distance) {
            this.state.distance = new OmegaNum(0);
        }
        if (!this.state.kuaEnergyCost) {
            this.state.kuaEnergyCost = new OmegaNum('1e10');
        }
        
        if (this.state.distance.gte(this.state.kuaEnergyCost)) {
            this.state.distance = this.state.distance.sub(this.state.kuaEnergyCost);
            this.state.kuaEnergyBought = this.state.kuaEnergyBought.add(1);
            
            // 每买一个价格*1000
            this.state.kuaEnergyCost = this.state.kuaEnergyCost.mul(1000);
            
            // 移除通知以减少干扰
            return true;
        }
        return false;
    },
    
    // 购买跟禽能量
    buyGenQinEnergy() {
        // 确保距离字段已初始化
        if (!this.state.distance) {
            this.state.distance = new OmegaNum(0);
        }
        if (!this.state.genQinEnergyCost) {
            this.state.genQinEnergyCost = new OmegaNum('1e15');
        }
        
        if (this.state.distance.gte(this.state.genQinEnergyCost)) {
            this.state.distance = this.state.distance.sub(this.state.genQinEnergyCost);
            this.state.genQinEnergyBought = this.state.genQinEnergyBought.add(1);
            
            // 每买一个价格*10000000
            this.state.genQinEnergyCost = this.state.genQinEnergyCost.mul(10000000);
            
            // 移除通知以减少干扰
            return true;
        }
        return false;
    },
    
    // 购买跠禾能量
    buyKuoHeEnergy() {
        // 确保距离字段已初始化
        if (!this.state.distance) {
            this.state.distance = new OmegaNum(0);
        }
        if (!this.state.kuoHeEnergyCost) {
            this.state.kuoHeEnergyCost = new OmegaNum('9.461e18');
        }
        
        if (this.state.distance.gte(this.state.kuoHeEnergyCost)) {
            this.state.distance = this.state.distance.sub(this.state.kuoHeEnergyCost);
            this.state.kuoHeEnergyBought = this.state.kuoHeEnergyBought.add(1);
            
            // 每买一个价格*1e15
            this.state.kuoHeEnergyCost = this.state.kuoHeEnergyCost.mul(new OmegaNum('1e15'));
            
            // 移除通知以减少干扰
            return true;
        }
        return false;
    },
    
    // 获取各种能量成本的函数
    getDistanceEnergyCost() {
        return this.state.distanceEnergyCost;
    },
    
    getKuaEnergyCost() {
        return this.state.kuaEnergyCost;
    },
    
    getGenQinEnergyCost() {
        return this.state.genQinEnergyCost;
    },
    
    getKuoHeEnergyCost() {
        return this.state.kuoHeEnergyCost;
    },
    
    // 开始挑战的方法
    startChallenge(challengeNumber) {
        // 根据挑战编号调用相应的激活函数
        switch(challengeNumber) {
            case 5:
                if (typeof window.activateChallenge5 === 'function') {
                    window.activateChallenge5();
                }
                break;
            case 6:
                if (typeof window.activateChallenge6 === 'function') {
                    window.activateChallenge6();
                }
                break;
            case 7:
                if (typeof window.activateChallenge7 === 'function') {
                    window.activateChallenge7();
                }
                break;
            case 8:
                if (typeof window.activateChallenge8 === 'function') {
                    window.activateChallenge8();
                }
                break;
            case 9:
                if (typeof window.activateChallenge9 === 'function') {
                    window.activateChallenge9();
                }
                break;
            default:
                console.warn(`挑战 ${challengeNumber} 不存在或未实现`);
        }
    },
    
    // 距离里程碑自动化功能
    performDistanceMilestoneAutomation() {
        if (!this.state.distance) return;
        
        // 投喂黑洞期间禁用距离里程碑自动化
        if (window.blackholeChallenge && window.blackholeChallenge.inChallenge) return;
        
        const distance = this.state.distance;
        
        // 1e6光年：自动购买反物质升级
        if (distance.gte(new OmegaNum('9.461e21')) && document.getElementById('autoAntimatterUpgrades')?.checked) {
            this.autoAntimatterUpgrades();
        }
        
        // 1e10光年：自动湮灭反物质（每秒获得1%反物质的湮灭能量）
        if (distance.gte(new OmegaNum('9.461e25')) && document.getElementById('autoAnnihilateAntimatter')?.checked) {
            this.autoAnnihilateAntimatter();
        }
        
        // 1e20光年：自动购买四种能量
        if (distance.gte(new OmegaNum('9.461e35')) && document.getElementById('autoEnergyPurchase')?.checked) {
            this.autoEnergyPurchase();
        }
        
        // 1e50光年：自动湮灭距离（每秒获得1%距离的湮灭距离）
        if (distance.gte(new OmegaNum('9.461e65')) && document.getElementById('autoAnnihilateDistance')?.checked) {
            this.autoAnnihilateDistance();
        }
    },
    
    // 自动购买反物质升级
    autoAntimatterUpgrades() {
        if (!this.state.antimatterUnlocked) return;
        
        // 自动购买新时代升级
        if (!this.state.newEraUnlocked && this.state.antimatter.gte(new OmegaNum(100))) {
            if (window.upgradeNewEra && typeof window.upgradeNewEra === 'function') {
                window.upgradeNewEra();
            }
        }
        
        // 自动购买反物质爆炸升级
        if (!this.state.antimatterExplosionUnlocked && this.state.antimatter.gte(new OmegaNum(500))) {
            if (window.upgradeAntimatterExplosion && typeof window.upgradeAntimatterExplosion === 'function') {
                window.upgradeAntimatterExplosion();
            }
        }
        
        // 自动购买扩大仓库-反物质升级
        if (!this.state.upgrades.antimatterWarehouse && this.state.antimatter.gte(new OmegaNum(10000))) {
            if (window.upgradeExpandAntimatterWarehouse && typeof window.upgradeExpandAntimatterWarehouse === 'function') {
                window.upgradeExpandAntimatterWarehouse();
            }
        }
    },
    
    // 自动湮灭反物质（每秒获得1%反物质的湮灭能量，反物质升级2时变为20%）
    autoAnnihilateAntimatter() {
        if (!this.state.antimatterUnlocked || !this.state.antimatter || this.state.antimatter.lte(0)) return;
        
        // 检查是否购买了反物质升级2：打破质量守恒
        const hasAntimatterUpgrade2 = this.state.blackholeUpgrades && this.state.blackholeUpgrades.antimatterUpgrade2;
        const percentage = hasAntimatterUpgrade2 ? 0.2 : 0.01;
        
        // 每秒获得对应百分比反物质的湮灭能量
        const annihilationGain = this.state.antimatter.mul(percentage);
        if (!this.state.annihilationEnergy) {
            this.state.annihilationEnergy = new OmegaNum(0);
        }
        this.state.annihilationEnergy = this.state.annihilationEnergy.add(annihilationGain);
        
        // 不重置反物质，只是获得湮灭能量
    },
    
    // 自动购买四种能量
    autoEnergyPurchase() {
        if (!this.state.distanceUnlocked) return;
        
        // 自动购买距离能量
        if (this.state.distance && this.state.distance.gte(new OmegaNum('1e6'))) {
            this.buyDistanceEnergy();
        }
        
        // 自动购买跞禼能量
        if (this.state.distance && this.state.distance.gte(new OmegaNum('1e10'))) {
            this.buyKuaEnergy();
        }
        
        // 自动购买跟禽能量
        if (this.state.distance && this.state.distance.gte(new OmegaNum('1e15'))) {
            this.buyGenQinEnergy();
        }
        
        // 自动购买跠禾能量
        if (this.state.distance && this.state.distance.gte(new OmegaNum('9.461e15'))) {
            this.buyKuoHeEnergy();
        }
    },
    
    // 自动湮灭距离（每秒获得1%距离的湮灭距离）
    autoAnnihilateDistance() {
        if (!this.state.distanceUnlocked || !this.state.distance || this.state.distance.lte(0)) return;
        
        // 每秒获得1%距离的湮灭距离
        const distanceGain = this.state.distance.mul(0.01);
        if (!this.state.annihilatedDistance) {
            this.state.annihilatedDistance = new OmegaNum(0);
        }
        this.state.annihilatedDistance = this.state.annihilatedDistance.add(distanceGain);
        
        // 不重置距离，只是获得湮灭距离
    },
    
    // 更新时间能量系统
    updateTimeEnergySystem(deltaTime) {
        // 确保时间能量字段已初始化
        if (!this.state.timeEnergy) {
            this.state.timeEnergy = new OmegaNum(0);
        }
        if (!this.state.timeEnergyMultiplier) {
            this.state.timeEnergyMultiplier = new OmegaNum(1);
        }
        
        // 黑洞碎片每秒生产时间能量（碎片数量 = 时间能量生产量）
        if (this.state.blackholeFragments && this.state.blackholeFragments.gt(0)) {
            let timeEnergyGain = this.state.blackholeFragments.mul(deltaTime / 1000);
            
            // 应用黑洞升级2：时间加速的增益
            if (this.state.blackholeUpgrade2Bought && typeof getBlackholeUpgrade2Multiplier === 'function') {
                const upgrade2Multiplier = getBlackholeUpgrade2Multiplier();
                timeEnergyGain = timeEnergyGain.mul(upgrade2Multiplier);
            }
            
            this.state.timeEnergy = this.state.timeEnergy.add(timeEnergyGain);
        }
        
        // 添加缓存机制，避免每帧都计算时间能量倍率
        if (!this.timeEnergyCache) {
            this.timeEnergyCache = { lastUpdate: 0, cacheValid: false };
        }
        
        const now = Date.now();
        if (!this.timeEnergyCache.cacheValid || now - this.timeEnergyCache.lastUpdate > 500) {
            // 每500ms更新一次时间能量倍率，减少计算频率
            this.updateTimeEnergyMultiplier();
            this.timeEnergyCache.lastUpdate = now;
            this.timeEnergyCache.cacheValid = true;
        }
    },
    
    // 计算时间能量增益倍率
    updateTimeEnergyMultiplier() {
        if (!this.state.timeEnergy || this.state.timeEnergy.lte(0)) {
            this.state.timeEnergyMultiplier = new OmegaNum(1);
            return;
        }
        
        const timeEnergy = this.state.timeEnergy;
        
        try {
            // 对超大数字进行分层处理，避免复杂计算
            if (timeEnergy.gte(new OmegaNum('1e1000'))) {
                // 超超大数值：使用极简公式
                const logTE = timeEnergy.log10();
                this.state.timeEnergyMultiplier = logTE.mul(0.1).add(1);
            } else if (timeEnergy.gte(new OmegaNum('1e100'))) {
                // 超大数值：使用对数公式防止溢出
                const logTE = timeEnergy.log10();
                this.state.timeEnergyMultiplier = logTE.mul(0.3).add(1);
            } else if (timeEnergy.gte(new OmegaNum('1e10'))) {
                // 大数值：使用简化公式
                const logTE = timeEnergy.log10();
                this.state.timeEnergyMultiplier = logTE.mul(0.5).add(1);
            } else {
                // 标准数值：使用原始公式
                const numerator = timeEnergy.pow(0.6);
                const denominator = timeEnergy.pow(0.4).add(20);
                this.state.timeEnergyMultiplier = numerator.div(denominator).add(1);
            }
            
            // 移除上限限制，让时间能量增益可以无限增长
        } catch (e) {
            // 出错时使用安全的简化公式
            console.warn('时间能量倍率计算出错，使用简化公式:', e);
            this.state.timeEnergyMultiplier = timeEnergy.log10().add(1);
        }
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
    
    // 绑定破碎之地按钮事件
    const brokenLandsBtn = document.getElementById('brokenLandsBtn');
    if (brokenLandsBtn) {
        brokenLandsBtn.addEventListener('click', function() {
            Game.unlockBrokenLands();
            alert('你发现了一片破碎之地，这里曾经存在过的功能已被移除...');
        });
    }
    
    // 绑定黑洞测试按钮事件（彩蛋）
    const testBlackholeBtn = document.getElementById('testBlackholeBtn');
    if (testBlackholeBtn) {
        testBlackholeBtn.addEventListener('click', function() {
            // 显示自定义对话框
            Utils.createCustomDialog({
                title: '黑洞测试',
                titleColor: '#ffffff',
                titleBgColor: '#673AB7',
                content: '<span style="font-size: 20px; font-weight: bold;">警告：黑洞已激活！</span><br><br>' +
                         '<div style="text-align:center; font-size:60px; animation: spin 2s linear infinite;">🌀</div><br>' +
                         '<style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>' +
                         '<div style="color:#ff5555;">你的游戏数据正在被吸入黑洞...</div>' +
                         '<div style="color:#ff5555; font-size:12px; margin-top:5px;">（开玩笑的，你的数据很安全）</div>',
                contentColor: '#ffffff',
                bgColor: '#2a2a2a',
                buttons: [
                    { 
                        text: '啊啊啊！救命！', 
                        color: '#ffffff', 
                        bgColor: '#673AB7',
                        onClick: function() {
                            alert('哈哈，逗你玩的！你的游戏数据很安全 😄');
                        }
                    },
                    {
                        text: '我就知道是骗人的', 
                        color: '#333333', 
                        bgColor: '#cccccc',
                        onClick: function() {
                            // 黑洞测试对话框关闭
                        }
                    }
                ],
                width: '400px'
            });
        });
    }
    
    // 绑定特别鸣谢QqQe308点击事件
    const specialThanksQqQe308 = document.getElementById('specialThanksQqQe308');
    if (specialThanksQqQe308) {
        // 初始化计数器
        if (!window.easterEggClicks) window.easterEggClicks = 0;
        if (!window.boredButtonClicks) window.boredButtonClicks = 0;
        
        specialThanksQqQe308.addEventListener('click', function() {
            // 增加彩蛋点击次数
            window.easterEggClicks++;
            
            // 根据点击次数解锁成就
            if (window.Achievements) {
                // 彩蛋狂热者成就 - 点击5次
                if (window.easterEggClicks >= 5) {
                    Achievements.unlockHidden(103);
                }
                
                // 你是没事儿干吗成就 - 点击20次
                if (window.easterEggClicks >= 20) {
                    Achievements.unlockHidden(104);
                }
            }
            
            // 显示自定义对话框
            Utils.createCustomDialog({
                title: '彩蛋发现！',
                titleColor: '#ffffff',
                titleBgColor: '#e94560',
                content: '<span style="font-size: 24px; font-weight: bold; color: #5ee6eb;">超市QqQe308！</span><br><br>恭喜你发现了隐藏彩蛋！' + 
                         (window.easterEggClicks >= 5 ? '<br>你已解锁"彩蛋狂热者"成就！' : '') + 
                         (window.easterEggClicks >= 20 ? '<br>你已解锁"你是没事儿干吗？"成就！' : ''),
                contentColor: '#ffffff',
                bgColor: '#2a2a2a',
                buttons: [
                    { 
                        text: '太棒了！', 
                        color: '#ffffff', 
                        bgColor: '#4CAF50',
                        onClick: function() {
                            // 彩蛋对话框关闭
                        }
                    },
                    { 
                        text: '我很无聊', 
                        color: '#ffffff', 
                        bgColor: '#e94560',
                        onClick: function() {
                            // 增加无聊按钮点击次数
                            window.boredButtonClicks++;
                            
                            // 解锁"那是真的很无聊了"成就 - 点击5次
                            if (window.boredButtonClicks >= 5 && window.Achievements) {
                                Achievements.unlockHidden(115);
                            }
                            
                            // 再次显示一个对话框
                            Utils.createCustomDialog({
                                title: '真的吗？',
                                titleColor: '#ffffff',
                                titleBgColor: '#673AB7',
                                content: '既然你这么无聊，那就再看一个对话框吧！' + 
                                         (window.boredButtonClicks >= 5 ? '<br><br><span style="color: #FFD700;">你已解锁"那是真的很无聊了"成就！</span>' : ''),
                                contentColor: '#ffffff',
                                bgColor: '#333333',
                                buttons: [
                                    { 
                                        text: '好吧', 
                                        color: '#ffffff', 
                                        bgColor: '#FF9800' 
                                    }
                                ],
                                width: '300px'
                            });
                        }
                    }
                ],
                width: '400px'
            });
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