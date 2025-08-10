// UI渲染模块
class UI {
    // 缓存DOM元素
    static cachedElements = {};
    
    // 节流控制
    static updateThrottle = {
        lastUpdate: 0,
        throttleTime: 50 // 50ms节流
    }
    
    // 绑定距离系统事件
    static bindDistanceEvents() {
        // 防止重复绑定
        if (this.eventsAlreadyBound) {
            return;
        }
        this.eventsAlreadyBound = true;
        
        // 湮灭能量折叠距离按钮
        const useAnnihilationBtn = document.getElementById('useAnnihilationForDistance');
        if (useAnnihilationBtn) {
            useAnnihilationBtn.addEventListener('click', () => {
                if (Game.state.annihilationEnergy.gte(1)) {
                    Game.useAnnihilationEnergyForDistance();
                    // 立即更新UI显示
                    UI.updateUI();
                }
            });
        }
        
        // 距离能量购买按钮
        const buyDistanceEnergyBtn = document.getElementById('buyDistanceEnergy');
        if (buyDistanceEnergyBtn) {
            buyDistanceEnergyBtn.addEventListener('click', () => {
                Game.buyDistanceEnergy();
                UI.updateUI();
            });
        }
        
        // 跞禼能量购买按钮
        const buyKuaEnergyBtn = document.getElementById('buyKuaEnergy');
        if (buyKuaEnergyBtn) {
            buyKuaEnergyBtn.addEventListener('click', () => {
                Game.buyKuaEnergy();
                UI.updateUI();
            });
        }
        
        // 跠禽能量购买按钮
        const buyGenQinEnergyBtn = document.getElementById('buyGenQinEnergy');
        if (buyGenQinEnergyBtn) {
            buyGenQinEnergyBtn.addEventListener('click', () => {
                Game.buyGenQinEnergy();
                UI.updateUI();
            });
        }
        
        // 跠禾能量购买按钮
        const buyKuoHeEnergyBtn = document.getElementById('buyKuoHeEnergy');
        if (buyKuoHeEnergyBtn) {
            buyKuoHeEnergyBtn.addEventListener('click', () => {
                Game.buyKuoHeEnergy();
                UI.updateUI();
            });
        }
        
        // 距离献祭按钮
        const sacrificeDistanceBtn = document.getElementById('sacrificeDistance');
        if (sacrificeDistanceBtn) {
            sacrificeDistanceBtn.addEventListener('click', () => {
                if (Game.sacrificeDistance()) {
                    UI.updateUI();
                }
            });
        }

    };
    // 新增：UI每10帧刷新一次
    static frameCounter = 0;
    static frameInterval = 10;
    
    static init() {
        this.cacheDOMElements();
        this.initOfflineModeButtons();
        this.bindEvents();
        this.startNewsTicker();
        
        // 确保成就描述框存在
        if (!document.getElementById('achievementDescBox')) {
            const descBox = document.createElement('div');
            descBox.id = 'achievementDescBox';
            descBox.className = 'achievement-desc-box';
            descBox.style.display = 'none';
            document.body.appendChild(descBox);
        }
        
        this.updateUI();
        this.initOfflineModeButtons();
        if (window.Achievements) Achievements.render();
        
        // 确保成就描述框在正确位置
        this.ensureAchievementDescBoxPlacement();
        
        // 在DOM完全加载后再次确保成就描述框位置
        setTimeout(() => {
            this.ensureAchievementDescBoxPlacement();
        }, 500);
    }
    
    // 确保成就描述框在正确位置
    static ensureAchievementDescBoxPlacement() {
        const achievementDescBox = document.getElementById('achievementDescBox');
        if (!achievementDescBox) return;
        
        // 查找当前活动的选项卡内容
        const activeTab = document.querySelector('.tab-content[style*="display: block"]');
        if (!activeTab) return;
        
        // 查找当前活动的子选项卡内容
        const activeSubTab = activeTab.querySelector('.sub-tab-content[style*="display: block"]');
        
        // 如果找到活动的子选项卡，将描述框移动到其中
        if (activeSubTab) {
            // 从原来的位置移除
            achievementDescBox.remove();
            // 添加到活动的子选项卡内容中
            activeSubTab.appendChild(achievementDescBox);
            // 成就描述框已移动到活动的子选项卡
        }
    }

    // 缓存DOM元素
    static cacheDOMElements() {
        this.cachedElements = {
            // 存档相关
            saveGame: document.getElementById('saveGame'),
            loadGame: document.getElementById('loadGame'),
            autoSaveToggle: document.getElementById('autoSaveToggle'),
            deleteSave: document.getElementById('deleteSave'),
            
            // 升级按钮
            buyDensityUpgrade: document.getElementById('buyDensityUpgrade'),
            buyCompressMatter: document.getElementById('buyCompressMatter'),
            buyExpandWarehouse: document.getElementById('buyExpandWarehouse'),
            
            // 购买按钮
            buyGenerator: document.getElementById('buyGenerator'),
            buyEnhancer: document.getElementById('buyEnhancer'),
            
            // 显示元素
            currentMatter: document.getElementById('currentMatter'),
            matterPerSecond: document.getElementById('matterPerSecond'),
            generatorCount: document.getElementById('generatorCount'),
            generatorCost: document.getElementById('generatorCost'),
            enhancerCount: document.getElementById('enhancerCount'),
            enhancerCost: document.getElementById('enhancerCost'),
            
            // 自动化相关
            autoBuyUpgrades: document.getElementById('autoBuyUpgrades'),
            autoBuyEnhancers: document.getElementById('autoBuyEnhancers'),
            autoBuyGenerators: document.getElementById('autoBuyGenerators'),
            
            // 选项卡
            tabs: document.querySelectorAll('.tab'),
            subTabs: document.querySelectorAll('.sub-tab'),
            tabContents: document.querySelectorAll('.tab-content'),
            subTabContents: document.querySelectorAll('.sub-tab-content'),
            
            // 黑洞选项卡
            blackholeTabBtn: document.getElementById('blackholeTabBtn'),
            blackholeTab: document.getElementById('blackholeTab'),
            testBlackholeBtn: document.getElementById('testBlackholeBtn'),

            // 杂项
            pauseGameBtn: document.getElementById('pauseGameBtn')
        };
    }

    static bindEvents() {
        // 绑定距离系统事件
        this.bindDistanceEvents();
        
        // 全局点击事件 - 用于关闭成就描述
        document.addEventListener('click', (e) => {
            const achievementDescBox = document.getElementById('achievementDescBox');
            if (!achievementDescBox) return;
            
            // 检查点击是否在成就图标上
            const isAchievementClick = e.target.closest('.achievement-box');
            if (!isAchievementClick) {
                achievementDescBox.style.display = 'none';
            }
        });

        // 黑洞测试按钮事件
        if (this.cachedElements.testBlackholeBtn) {
            this.cachedElements.testBlackholeBtn.addEventListener('click', () => {
                // 触发"想得美"隐藏成就
                if (typeof window.Achievements !== 'undefined') {
                    window.Achievements.unlockHidden(116);
                    // 移除无意义通知
                }
            });
        }

        // 挑战5-8按钮事件
        document.getElementById('startChallenge5Btn')?.addEventListener('click', () => {
            if (Game.state.challenge5Reward) {
                // 移除重复通知
                return;
            }
            Game.startChallenge(5);
        });
        
        document.getElementById('startChallenge6Btn')?.addEventListener('click', () => {
            if (Game.state.challenge6Reward) {
                // 移除重复通知
                return;
            }
            Game.startChallenge(6);
        });
        
        document.getElementById('startChallenge7Btn')?.addEventListener('click', () => {
            if (Game.state.challenge7Reward) {
                // 移除重复通知
                return;
            }
            Game.startChallenge(7);
        });
        
        document.getElementById('startChallenge8Btn')?.addEventListener('click', () => {
            if (Game.state.challenge8Reward) {
                // 移除重复通知
                return;
            }
            Game.startChallenge(8);
        });

        // 挑战九按钮事件 - 修复：应该启动挑战而不是直接完成
        document.getElementById('startChallenge9Btn')?.addEventListener('click', () => {
            if (Game.state.challenge9Reward) {
                // 移除重复通知
                return;
            }
            Game.startChallenge(9);
        });

        // 挑战十按钮事件
        document.getElementById('startChallenge10Btn')?.addEventListener('click', () => {
            Game.state.challenge10Reward = true;
            document.getElementById('challenge10Status').textContent = '挑战完成！';
            document.getElementById('startChallenge10Btn').style.display = 'none';
            document.getElementById('giveUpChallenge10Btn').style.display = 'none';
            Game.ui.showMessage('挑战十完成！解锁了终极奥秘...');
            
            // 完全解锁黑洞功能
            if (this.cachedElements.blackholeTab) {
                this.cachedElements.blackholeTab.style.display = 'block';
            }
        });

        // 黑洞功能按钮事件
        document.getElementById('feedBlackhole')?.addEventListener('click', () => {
            if (Game.state.challenge9Reward && Game.state.currentMatter.gte(1000)) {
                Game.state.currentMatter = Game.state.currentMatter.sub(1000);
                Game.state.blackholeMass = (Game.state.blackholeMass || 0) + 1;
                Game.ui.showMessage('投喂了黑洞！黑洞质量增加了！', 'purple');
                this.updateUI();
            } else {
                Game.ui.showMessage('需要至少1000物质来投喂黑洞！', 'red');
            }
        });

        document.getElementById('harvestRadiation')?.addEventListener('click', () => {
            if (Game.state.challenge9Reward && (Game.state.blackholeMass || 0) > 0) {
                const radiation = Math.floor((Game.state.blackholeMass || 0) * 10);
                Game.state.currentMatter = Game.state.currentMatter.add(radiation);
                Game.ui.showMessage(`收集了${radiation}单位的霍金辐射！`, 'purple');
                this.updateUI();
            } else {
                Game.ui.showMessage('黑洞质量不足，无法收集辐射！', 'red');
            }
        });

        document.getElementById('manipulateSpacetime')?.addEventListener('click', () => {
            if (Game.state.challenge9Reward && (Game.state.blackholeMass || 0) >= 10) {
                Game.state.blackholeMass = (Game.state.blackholeMass || 0) - 5;
                Game.state.matterMultiplier = Game.state.matterMultiplier.mul(1.1);
                Game.ui.showMessage('操控时空成功！物质生成速率提升了！', 'purple');
                this.updateUI();
            } else {
                Game.ui.showMessage('需要至少10单位黑洞质量来操控时空！', 'red');
            }
        });

        // 存档相关事件绑定
        this.cachedElements.saveGame?.addEventListener('click', () => {
            Utils.saveGameManually();
        });

        this.cachedElements.loadGame?.addEventListener('click', () => {
            Utils.loadGameManually();
        });

        this.cachedElements.autoSaveToggle?.addEventListener('change', (e) => {
            const enabled = e.target.checked;
            localStorage.setItem('autoSaveEnabled', enabled.toString());
            if (enabled) {
                SaveSystem.startAutoSave();
                Utils.showNotification('自动存档已开启');
            } else {
                SaveSystem.stopAutoSave();
                Utils.showNotification('自动存档已关闭');
            }
        });

        this.cachedElements.deleteSave?.addEventListener('click', () => {
            if (confirm('确定要删除所有存档数据吗？此操作不可恢复！')) {
                Utils.resetGameState();
            }
        });

        // 升级按钮事件
        this.cachedElements.buyDensityUpgrade?.addEventListener('click', () => {
            
            const UPGRADE_COSTS = {
                density: new OmegaNum(100),
                compress: new OmegaNum(500),
                };
            const UPGRADE_MULTIPLIERS = {
                density: new OmegaNum(2)
            };

            if (!Game.state.upgrades.density && Game.state.currentMatter.gte(UPGRADE_COSTS.density)) {
                const cost = UPGRADE_COSTS.density;
                // 挑战5效果：购买后物质变成负值（购买前的负值）
                if (typeof isChallenge5Active === 'function' && isChallenge5Active()) {
                    const matterBeforePurchase = Game.state.currentMatter;
                    Game.state.currentMatter = Game.state.currentMatter.sub(cost);
                    Game.state.currentMatter = matterBeforePurchase.neg();
                } else {
                    Game.state.currentMatter = Game.state.currentMatter.sub(cost);
                    // 挑战5奖励：购买升级时返还50%物质消耗
                    if (Game.state.challenge5Reward) {
                        Game.state.currentMatter = Game.state.currentMatter.add(cost.mul(0.5));
                    }
                }
                Game.state.upgrades.density = true;
                Game.state.matterMultiplier = Game.state.matterMultiplier.mul(UPGRADE_MULTIPLIERS.density);
                Game.updateMatterPerSecond(); // 立即更新物质生成速率
                this.updateUpgradeButtons();
                this.updateUI();
            }
        });

        this.cachedElements.buyCompressMatter?.addEventListener('click', () => {
            
            const UPGRADE_COSTS = {
                density: new OmegaNum(100),
                compress: new OmegaNum(500),
                automator: new OmegaNum('1e8')
            };

            if (!Game.state.upgrades.compress && Game.state.currentMatter.gte(UPGRADE_COSTS.compress) && Game.state.currentMatter.gt(0)) {
                const cost = UPGRADE_COSTS.compress;
                // 挑战5效果：购买后物质变成负值（购买前的负值）
                if (typeof isChallenge5Active === 'function' && isChallenge5Active()) {
                    const matterBeforePurchase = Game.state.currentMatter;
                    Game.state.currentMatter = Game.state.currentMatter.sub(cost);
                    Game.state.currentMatter = matterBeforePurchase.neg();
                } else {
                    Game.state.currentMatter = Game.state.currentMatter.sub(cost);
                    // 挑战5奖励：购买升级时返还50%物质消耗
                    if (Game.state.challenge5Reward) {
                        Game.state.currentMatter = Game.state.currentMatter.add(cost.mul(0.5));
                    }
                }
                Game.state.upgrades.compress = true;
                // 移除一次性物质加成，改为持续产量加成
                this.updateUpgradeButtons();
                this.updateUI();
            }
        });
    
        // 选项卡切换逻辑
        this.cachedElements.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.cachedElements.tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.cachedElements.tabContents.forEach(content => content.style.display = 'none');
                const tabId = tab.getAttribute('data-tab') + 'Tab';
                const tabContent = document.getElementById(tabId);
                if (tabContent) {
                    tabContent.style.display = 'block';
                    
                    // 物质tab切换时刷新软上限提示
                    if (tab.getAttribute('data-tab') === 'matter' && window.Game && typeof Game.updateSoftCapNotice === 'function') {
                        try {
                            // 确保软上限提示框在正确位置
                            const softCapNotice = document.getElementById('softCapNotice');
                            const matterTab = document.getElementById('matterTab');
                            if (softCapNotice && matterTab && !matterTab.contains(softCapNotice)) {
                                matterTab.insertBefore(softCapNotice, matterTab.firstChild);
                            }
                            // 延迟调用确保DOM更新完成
                            setTimeout(() => Game.updateSoftCapNotice(), 100);
                        } catch (e) {
                            console.error('更新软上限提示失败:', e);
                        }
                    }
                    
                    // 统计tab切换时刷新
                    if (tab.getAttribute('data-tab') === 'stats' && window.UI && UI.updateStatsTab) {
                        UI.updateStatsTab();
                    }
                    
                    // 成就tab切换时强制渲染
                    if (tab.getAttribute('data-tab') === 'achievements' && window.Achievements) {
                        Achievements.render();
                    }
                }
            });
        });

        // 子选项卡切换逻辑（统一标准实现）
        this.cachedElements.subTabs.forEach(subTab => {
            subTab.addEventListener('click', () => {
                const parentTab = subTab.closest('.tab-content');
                parentTab.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
                subTab.classList.add('active');
                parentTab.querySelectorAll('.sub-tab-content').forEach(content => content.style.display = 'none');
                const subTabId = subTab.getAttribute('data-subtab') + '-content';
                parentTab.querySelector('#' + subTabId).style.display = 'block';
                
                // 坍缩tab特殊处理
                if (subTab.getAttribute('data-subtab') === 'collapse' && typeof updateCollapseTabUI === 'function') {
                    updateCollapseTabUI();
                }
            });
        });

        // 购买按钮事件
        this.cachedElements.buyGenerator?.addEventListener('click', () => Game.buyGenerator());
        this.cachedElements.buyEnhancer?.addEventListener('click', () => {
            if (Game.buyEnhancer()) {
                UI.updateUI();
            }
        });

        // 暂停游戏按钮
        if (this.cachedElements.pauseGameBtn) {
            this.cachedElements.pauseGameBtn.addEventListener('click', () => {
                alert('游戏已暂停。关闭此对话框以继续。');
            });
        }
        
        // 黑洞描述按钮事件
        document.getElementById('blackholeDescBtn')?.addEventListener('click', () => {
            if (typeof showBlackholeDescription === 'function') {
                showBlackholeDescription();
            }
        });
        

        

        
        // 距离系统事件监听器
        this.bindDistanceEvents();
    }

    // 节流更新函数
    static throttledUpdate(callback) {
        const now = Date.now();
        if (now - this.updateThrottle.lastUpdate >= this.updateThrottle.throttleTime) {
            callback();
            this.updateThrottle.lastUpdate = now;
        }
    }

    // 程序化切换选项卡
    static switchTab(tabName) {
        // 移除所有选项卡的激活状态
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(t => t.classList.remove('active'));
        
        // 隐藏所有选项卡内容
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => content.style.display = 'none');
        
        // 激活指定选项卡
        const targetTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (targetTab) {
            targetTab.classList.add('active');
        }
        
        // 显示指定选项卡内容
        const targetContent = document.getElementById(tabName + 'Tab');
        if (targetContent) {
            targetContent.style.display = 'block';
            
            // 特殊处理逻辑
            if (tabName === 'matter' && window.Game && typeof Game.updateSoftCapNotice === 'function') {
                try {
                    const softCapNotice = document.getElementById('softCapNotice');
                    const matterTab = document.getElementById('matterTab');
                    if (softCapNotice && matterTab && !matterTab.contains(softCapNotice)) {
                        matterTab.insertBefore(softCapNotice, matterTab.firstChild);
                    }
                    setTimeout(() => Game.updateSoftCapNotice(), 100);
                } catch (e) {
                    console.error('更新软上限提示失败:', e);
                }
            }
            
            if (tabName === 'stats' && window.UI && UI.updateStatsTab) {
                UI.updateStatsTab();
            }
            
            if (tabName === 'achievements' && window.Achievements) {
                Achievements.render();
            }
        }
    }

    static updateUpgradeButtons() {
        const densityBuyButton = this.cachedElements.buyDensityUpgrade;
        const compressBuyButton = this.cachedElements.buyCompressMatter;
        const expandWarehouseButton = this.cachedElements.buyExpandWarehouse;
        const UPGRADE_COSTS = {
            density: new OmegaNum(100),
            compress: new OmegaNum(500),
            warehouse: new OmegaNum('1e8')
        };

        if (densityBuyButton) {
            if (Game.state.upgrades.density) {
                densityBuyButton.classList.add('purchased');
                densityBuyButton.textContent = '已购买';
                densityBuyButton.disabled = true;
            } else if (Game.state.currentMatter.gte(UPGRADE_COSTS.density)) {
                densityBuyButton.classList.add('affordable');
                densityBuyButton.disabled = false;
            } else {
                densityBuyButton.classList.remove('affordable', 'purchased');
                densityBuyButton.disabled = true;
            }
        }

        if (compressBuyButton) {
            if (Game.state.upgrades.compress) {
                compressBuyButton.classList.add('purchased');
                compressBuyButton.textContent = '已购买';
                compressBuyButton.disabled = true;
            } else if (Game.state.currentMatter.gte(UPGRADE_COSTS.compress) && Game.state.currentMatter.gt(0)) {
                compressBuyButton.classList.add('affordable');
                compressBuyButton.disabled = false;
            } else {
                compressBuyButton.classList.remove('affordable', 'purchased');
                compressBuyButton.disabled = true;
            }
        }

        if (expandWarehouseButton) {
            if (Game.state.upgrades && Game.state.upgrades.warehouse) {
                expandWarehouseButton.classList.add('purchased');
                expandWarehouseButton.textContent = '已购买';
                expandWarehouseButton.disabled = true;
            } else if (Game.state.currentMatter && Game.state.currentMatter.gte(UPGRADE_COSTS.warehouse) && !(window.isChallenge2Active && isChallenge2Active && isChallenge2Active())) {
                expandWarehouseButton.classList.add('affordable');
                expandWarehouseButton.disabled = false;
            } else {
                expandWarehouseButton.classList.remove('affordable', 'purchased');
                expandWarehouseButton.disabled = true;
            }
        }
    }

    static startNewsTicker() {
        const newsItems = [
            "科技已经这么发达了吗，都有K65路公交车了，比葛立恒数还大！",
            "红鲨在坐车回家的路上，因为速度(受软上限限制)、超级折算|路程，迟迟到不了家",
            "1+1 = 1.414213562373095048(受软上限限制)",
            "比赛时的成绩往往比不过平时的，是因为（处于挑战之中）",
            "这个游戏5小时后更新",
            "刚刚复习完的你正在玩游戏休息，突然你脑中出现一道信息： 遗忘度 超过 记忆度 ，进行一次无奖励的 知识重置",
            "你在突发兴致一下子喝了十杯水后，胃里突然出现了一个 杯水 生成器",
            "| '0'''''1'''''2'''''2.7'''''3.1'''''3.4'''''3.6'''''3.75'''''3.85'''''3.95'''''4 | 是的，这是一把尺子，但(受软上限限制)",
            "科学家始终无法合成新序号的元素，原因是还没有足够的 能量 去解锁",
            "5小时｜究极折算 后更新！究极折算（300% ^28）",
            "1+1=1（受硬上限限制）",
            "你的移动速度过快的时候，时间流速将受软上限限制。",
            "妈妈：什么时候写作业 我：五小时后",
            "小明：小红你的增量游戏加了软上限怎么增长更快了 小红：我给生成器价格加了软上限",
            "你的（10^考试成绩）是1e308，你将解锁无限成绩，他将大幅提升你的（10^考试成绩），在达到1e750后将解锁考试增量的下一个机制。",
            "红绿灯上面的时间是99秒，但是现实时间过了100秒后红绿灯上面的时间还是99秒，因为红绿灯上面的时间流逝速度（受软上限限制）",
            "数学考试偶遇解题速度(受软上限限制)，超级折算|分数，拼尽全力无法及格",
            "G(64)=68（受软上限限制）",
            "物质放置是世界上最好玩的增量游戏，一天不玩物质放置1.79e308次，就像是有308只QqQe308在我身上爬",
            "我要超市QqQe308",
            "你在考试时遇到了一个问题，问题是：1+1=？ 你：1.414213562373095048（受软上限限制）",
            "我已经迷上了QqQe308甲沟炎里的脓，看见他因为不小心而微微露出来的样子，我简直微博了。",
            "元神是世界上最好玩的游戏，一天不玩元神就像有114514个孙笑川在我身上爬",
            "Error:news is not found.",
            "我正在寻找一波暴涨，突然听见了一个平静而可怕的声音:已达软上限",
            "物质生成器的原理是在地上随便抓一把物质，这是我找到的最合理的解释了。",
            "风灵作成是世界上最好玩的增量游戏，一天不玩风灵作成就像是有308个序数增量吧吧友在我身上爬",
            "冷知识：K1e15比葛立恒数还要大",
            "你以为是指数增长，其实是对数增长。",
            "开发者：你们的产量太快了，我都来不及加新内容。",
            "有玩家挂机三天，回来发现还没买起下一个升级。",
            "科学家警告：过度挂机可能导致时间错觉。",
            "你以为你在玩游戏，其实游戏在玩你。",
            "增量游戏的尽头，是一串很长很长的零。",
            "有玩家表示：我已经忘了上次点按钮是什么时候了。",
            "你获得了成就：‘挂机之神’。",
            "开发者上线新版本，玩家：存档没了？",
            "你发现自己在梦里也在点升级按钮。",
            "‘再玩五分钟就睡觉’——增量玩家的最大谎言。",
            "你已经连续三天没关过这个网页了。",
            "有玩家试图用物理外挂加速产量，结果被软上限温柔劝退。",
            "你以为你能肝穿游戏，结果被肝穿了。",
            "增量游戏：让你体会到什么叫‘时间的尽头’。",
            "你获得了隐藏成就：‘看完所有新闻’。",
            "开发者：你们的产量太快了，我都来不及加新内容。",
            "有玩家挂机三天，回来发现还没买起下一个升级。",
            "科学家警告：过度挂机可能导致时间错觉。",
            "你以为你在玩游戏，其实游戏在玩你。",
            "增量游戏的尽头，是一串很长很长的零。",
            "有玩家表示：我已经忘了上次点按钮是什么时候了。",
            "你获得了成就：‘挂机之神’。",
            "开发者上线新版本，玩家：存档没了？",
            "你发现自己在梦里也在点升级按钮。",
            "‘再玩五分钟就睡觉’——增量玩家的最大谎言。",
            "你已经连续三天没关过这个网页了。",
            "有玩家试图用物理外挂加速产量，结果被软上限温柔劝退。",
            "你以为你能肝穿游戏，结果被肝穿了。",
            "增量游戏：让你体会到什么叫‘时间的尽头’。",
            "你获得了隐藏成就：‘看完所有新闻’。",
            "你以为是线性增长，其实是‘线性’增长。",
            "‘你还在玩吗？’——来自你的朋友。",
            "妈妈：‘你在干嘛？’ 我：‘在研究宇宙的终极奥秘。’",
            "有玩家表示：我已经把这个游戏当成了日历。",
            "‘你怎么还没通关？’——开发者也想知道。",
            "你获得了新称号：‘增量哲学家’。",
            "有玩家发现，点升级按钮的手指变粗了。",
            "‘你还记得你上次重置是什么时候吗？’",
            "开发者：‘你们的产量太快了，我都来不及加新内容。’",
            "‘再点一次就升级了’——你已经说了100遍。",
            "有玩家表示：‘我已经忘了这个游戏的终极目标是什么了。’",
            "‘挂机收益已到账，请查收。’",
            "‘你获得了新称号：挂机达人’",
            "‘你已经超越了99%的玩家（其实只有你一个人在玩）’",
            "‘你已经解锁了所有内容，接下来请期待下次更新。’",
            "‘你获得了隐藏成就：坚持不懈’",
            "‘你已经连续三天没关过这个网页了。’",
            "‘你获得了新称号：增量哲学家’",
            "‘你已经点了10000次升级按钮’",
            "‘你获得了隐藏成就：手指抽筋’",
            "有玩家表示：‘我玩这个游戏的时间比学习还多。’",
            "‘你获得了新称号：时间管理大师’",
            "‘你已经超越了99%的玩家（其实只有你一个人在玩）’",
            "‘你已经解锁了所有内容，接下来请期待下次更新。’",
            "‘你获得了隐藏成就：坚持不懈’",
            "‘你已经连续三天没关过这个网页了。’",
            "‘你获得了新称号：增量哲学家’",
            "‘你已经点了10000次升级按钮’",
            "‘你获得了隐藏成就：手指抽筋’",
            "你发现物质增长速度越来越慢，原来是软上限在背后默默努力。",
            "软上限：你可以无限加速，但我永远在前方等你。",
            "开发者：软上限不是bug，是feature！",
            "软上限其实是宇宙的安全带，保护你不被产量甩飞。",
            "你在软上限面前反复横跳，最终选择了躺平。",
            "软上限的存在，是为了让你更珍惜每一次增长。",
            "软上限：我不是终点，只是新的起点。"
        ];

        const ticker = document.getElementById('newsTickertape');
        // 初始化为随机索引
        let currentNewsIndex = Math.floor(Math.random() * newsItems.length);
        let currentCharIndex = 0;
        let isDeleting = false;
        let isPausing = false;

        function typeNews() {
            const currentNews = newsItems[currentNewsIndex];
            if (isDeleting) {
                ticker.textContent = currentNews.substring(0, currentCharIndex - 1);
                currentCharIndex--;
            } else {
                ticker.textContent = currentNews.substring(0, currentCharIndex + 1);
                currentCharIndex++;
            }

            if (!isDeleting && currentCharIndex === currentNews.length) {
                isDeleting = true; // 开始删除当前新闻
                isPausing = true;
                setTimeout(typeNews, 1000); // 新闻打完后停留1秒
            } else if (isDeleting && currentCharIndex === 0) {
                isDeleting = false;
                // 随机选择下一条不同的新闻
                let newIndex;
                do {
                    newIndex = Math.floor(Math.random() * newsItems.length);
                } while (newIndex === currentNewsIndex && newsItems.length > 1);
                currentNewsIndex = newIndex;
                setTimeout(typeNews, 200); // 删除完后停留0.2秒
            } else if (!isPausing) {
                // 根据新闻长度动态调整打字速度
                const newsLength = currentNews.length;
                // 基础延迟200ms，每增加1个字减少2ms，最小20ms，最大300ms
                const typeDelay = Math.max(20, Math.min(300, 200 - (newsLength * 2)));
                const speed = isDeleting ? 20 : typeDelay;
                setTimeout(typeNews, speed);
            } else {
                isPausing = false;
                setTimeout(typeNews, 200);
            }
        }

        typeNews();
    }

    static updateOfflineEnergy() {
        const offlineEnergyEl = document.getElementById('offlineEnergy');
        if (offlineEnergyEl) {
            offlineEnergyEl.textContent = Utils.formatOmegaNum(Game.state.offlineEnergy);
        }
        // 离线能量变化时刷新加成开关可用性
        const enableBox = document.getElementById('enableOfflineBonus');
        if (enableBox) {
            if (Game.state.offlineEnergy.gte(new OmegaNum(1023))) {
                enableBox.disabled = false;
            } else {
                enableBox.disabled = true;
                enableBox.checked = false;
                Game.state.isOfflineBonusActive = false;
            }
        }
    }

    static initOfflineModeButtons() {
        const toggleBox = document.getElementById('toggleOfflineMode');
        const enableBox = document.getElementById('enableOfflineBonus');
        function updateEnableBoxState() {
            if (!enableBox) return;
            if (Game.state.offlineEnergy.gte(new OmegaNum(1023))) {
                enableBox.disabled = false;
            } else {
                enableBox.disabled = true;
                enableBox.checked = false;
                Game.state.isOfflineBonusActive = false;
            }
        }
        if (toggleBox) {
            toggleBox.checked = Game.state.isOfflineMode;
            toggleBox.addEventListener('change', () => {
                Game.toggleOfflineMode();
                UI.updateOfflineModeButton();
                UI.updateOfflineEnergy();
                updateEnableBoxState();
            });
        }
        if (enableBox) {
            enableBox.checked = Game.state.isOfflineBonusActive;
            enableBox.addEventListener('change', () => {
                if (enableBox.checked) {
                    Game.enableOfflineBonus();
                } else {
                    Game.state.isOfflineBonusActive = false;
                    Game.updateMatterPerSecond();
                    UI.updateOfflineEnergy();
                }
                updateEnableBoxState();
            });
        }
        updateEnableBoxState();
    }

    static updateOfflineModeButton() {
        const toggleBtn = document.getElementById('toggleOfflineMode');
        if (toggleBtn) {
            toggleBtn.textContent = Game.state.isOfflineMode ? '停止离线收益模式' : '启动离线收益模式';
        }
    }

    static updateStatsTab() {
        // 更新基础统计
        const basicStatsContent = document.getElementById('basic-stats-content');
        if (basicStatsContent) {
            let html = '';
            
            // 增强器卡片
            html += '<div class="stat-box" style="margin-bottom:15px;">';
            html += '<div style="font-size:18px;color:#fff;margin-bottom:10px;">增强器效果</div>';
            
            const enhancerMultiplier = Game.state.enhancerMultiplier ? Game.state.enhancerMultiplier : new OmegaNum(1);
            
            html += `<div style="margin:5px 0;">增强器数量: <span style="color:#4CAF50;font-weight:bold;">${Game.state.enhancerCount || 0}</span></div>`;
            html += `<div style="margin:5px 0;">增强器倍率: <span style="color:#4CAF50;font-weight:bold;">${Utils.formatOmegaNum(enhancerMultiplier)}</span></div>`;
            html += '</div>';
            
            // 软上限卡片
            html += '<div class="stat-box">';
            html += '<div style="font-size:18px;color:#fff;margin-bottom:10px;">软上限效果</div>';
            
            let debuff = 1;
            if (Game.state.currentMatter && Game.state.currentMatter.gte(new OmegaNum(10000))) {
                // 安全地计算对数值，避免超大数字导致的问题
                let logValue;
                try {
                    const matterRatio = Game.state.currentMatter.div(new OmegaNum(10000));
                    if (matterRatio.gte(new OmegaNum('1e100'))) {
                        logValue = 230; // ln(1e100) ≈ 230
                    } else if (matterRatio.gt(0)) {
                        logValue = matterRatio.ln().toNumber();
                    } else {
                        logValue = 100; // 默认高对数值
                    }
                } catch (e) {
                    logValue = 100; // 出错时使用默认值
                }
                const multiplier = Game.state.softCapMultiplier ? Game.state.softCapMultiplier.toNumber() : 0.5;
                debuff = 1 / (1 + logValue * multiplier);
            }
            
            html += `<div style="margin:5px 0;">软上限起点: <span style="color:#ff8800;font-weight:bold;">${Utils.formatOmegaNum ? Utils.formatOmegaNum(new OmegaNum(10000)) : '10,000'}</span></div>`;
            html += `<div style="margin:5px 0;">当前减益: <span style="color:${debuff < 0.5 ? '#ff4444' : '#ffff00'};font-weight:bold;">${Utils.formatOmegaNum ? Utils.formatOmegaNum(new OmegaNum(debuff), 4) : debuff.toFixed(4)}</span></div>`;
            const multiplierValue = Game.state.softCapMultiplier ? Game.state.softCapMultiplier.toNumber() : 0.5;
            const formula = Game.state.softCapMultiplier && Game.state.softCapMultiplier.eq(0) ? '软上限已消失' : 
                          `1 / (1 + log(物质/10000) × ${multiplierValue})`;
            html += `<div style="margin:5px 0;">计算公式: <span style="color:#aaaaaa;">${formula}</span></div>`;
            
            // 仓库升级状态
            const warehouseUpgraded = Game.state.upgrades && Game.state.upgrades.warehouse;
            html += `<div style="margin:5px 0;">仓库扩展: ${warehouseUpgraded ? '<span style="color:#4CAF50;font-weight:bold;">已升级</span>' : '<span style="color:#ff4444;font-weight:bold;">未升级</span>'}</div>`;
            html += '</div>';
            
            // 压缩效果卡片
            html += '<div class="stat-box" style="margin-top:15px;">';
            html += '<div style="font-size:18px;color:#fff;margin-bottom:10px;">压缩物质效果</div>';
            
            let compressEffect = 1;
            if (Game.state.upgrades && Game.state.upgrades.compress && Game.state.currentMatter && Game.state.currentMatter.gt(1)) {
                try {
                    const logValue = Game.state.currentMatter.log(10);
                    const sqrtValue = logValue.max(1).sqrt();
                    if (sqrtValue.gte(new OmegaNum('1e100'))) {
                        compressEffect = 1e100; // 限制最大值
                    } else {
                        compressEffect = sqrtValue.toNumber();
                    }
                } catch (e) {
                    compressEffect = 1000; // 出错时使用默认值
                }
            }
            
            const compressUpgraded = Game.state.upgrades && Game.state.upgrades.compress;
            html += `<div style="margin:5px 0;">升级状态: ${compressUpgraded ? '<span style="color:#4CAF50;font-weight:bold;">已升级</span>' : '<span style="color:#ff4444;font-weight:bold;">未升级</span>'}</div>`;
            html += `<div style="margin:5px 0;">当前倍率: <span style="color:#2196F3;font-weight:bold;">${Utils.formatOmegaNum ? Utils.formatOmegaNum(new OmegaNum(compressEffect), 4) : compressEffect.toFixed(4)}</span></div>`;
            
            if (compressUpgraded) {
                const formula = Game.state.challenge1Reward ? '2 × √log10(物质)' : '√log10(物质)';
                html += `<div style="margin:5px 0;">计算公式: <span style="color:#aaaaaa;">${formula}</span></div>`;
            }
            
            html += '</div>';
            
            basicStatsContent.innerHTML = html;
        }
        
        // 更新反物质统计
        const antimatterStatsContent = document.getElementById('antimatter-stats-content');
        if (antimatterStatsContent) {
            let html = '';
            
            // 创建反物质总览卡片
            html += '<div class="stat-box" style="margin-bottom:15px;">';
            html += '<div style="font-size:18px;color:#fff;margin-bottom:10px;">反物质总览</div>';
            html += `<div style="margin:5px 0;">当前反物质: <span style="color:#fff;font-weight:bold;">${Utils.formatOmegaNum(Game.state.antimatter)}</span></div>`;
            html += `<div style="margin:5px 0;">历史最高: <span style="color:#ffff00;font-weight:bold;">${Utils.formatOmegaNum(Game.state.maxAntimatter || new OmegaNum(0))}</span></div>`;
            html += '</div>';
            
            // 创建反物质软上限卡片
            html += '<div class="stat-box">';
            html += '<div style="font-size:18px;color:#fff;margin-bottom:10px;">反物质软上限</div>';
            
            let antimatterDebuff = 1;
            if (Game.state.antimatter && Game.state.antimatter.gte(new OmegaNum(500))) {
                // 安全地计算对数值，避免超大数字导致的问题
                let logValue;
                try {
                    const antimatterRatio = Game.state.antimatter.div(new OmegaNum(500));
                    if (antimatterRatio.gte(new OmegaNum('1e100'))) {
                        logValue = 100; // 对于极大数字，使用固定的高对数值
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
                
                if (Game.state.upgrades && Game.state.upgrades.antimatterWarehouse) {
                    // 有仓库升级
                    if (logValue <= 0) {
                        antimatterDebuff = 0.8; // 只削减20%
                    } else {
                        antimatterDebuff = Math.max(0.1, 0.8 / (1 + 0.5 * Math.min(logValue, 20)));
                    }
                } else {
                    // 未升级版本
                    if (logValue <= 0) {
                        antimatterDebuff = 0.6; // 削减40%
                    } else {
                        antimatterDebuff = Math.max(0.05, 0.6 / (1 + 0.7 * Math.min(logValue, 30)));
                    }
                }
            }
            
            html += `<div style="margin:5px 0;">软上限起点: <span style="color:#ff8800;font-weight:bold;">${Utils.formatOmegaNum ? Utils.formatOmegaNum(new OmegaNum(500)) : '500'}</span></div>`;
            html += `<div style="margin:5px 0;">当前减益: <span style="color:${antimatterDebuff < 0.3 ? '#ff4444' : (antimatterDebuff < 0.6 ? '#ff8800' : '#ffff00')};font-weight:bold;">${Utils.formatOmegaNum ? Utils.formatOmegaNum(new OmegaNum(antimatterDebuff), 4) : antimatterDebuff.toFixed(4)}</span></div>`;
            html += `<div style="margin:5px 0;">计算公式: <span style="color:#aaaaaa;">${Game.state.upgrades && Game.state.upgrades.antimatterWarehouse ? 
                "有仓库升级: 0.8 / (1 + 0.5 * log10(反物质/500))" : 
                "无仓库升级: 0.6 / (1 + 0.7 * log10(反物质/500))"}</span></div>`;
            html += '</div>';
            
            // 创建挑战奖励卡片
            html += '<div class="stat-box" style="margin-top:15px;">';
            html += '<div style="font-size:18px;color:#fff;margin-bottom:10px;">挑战奖励状态</div>';
            html += `<div style="margin:5px 0;">挑战1: ${Game.state.challenge1Reward ? '<span style="color:#4CAF50;font-weight:bold;">已获得</span>' : '<span style="color:#ff4444;font-weight:bold;">未获得</span>'}</div>`;
            html += `<div style="margin:5px 0;">挑战2: ${Game.state.challenge2Reward ? '<span style="color:#4CAF50;font-weight:bold;">已获得</span>' : '<span style="color:#ff4444;font-weight:bold;">未获得</span>'}</div>`;
            html += `<div style="margin:5px 0;">挑战3: ${Game.state.challenge3Reward ? '<span style="color:#4CAF50;font-weight:bold;">已获得</span>' : '<span style="color:#ff4444;font-weight:bold;">未获得</span>'}</div>`;
            html += '</div>';
            
            antimatterStatsContent.innerHTML = html;
        }
    }

    static updateUI() {
        // 每10帧才刷新一次UI
        this.frameCounter = (this.frameCounter + 1) % this.frameInterval;
        if (this.frameCounter !== 0) {
            requestAnimationFrame(() => UI.updateUI());
            return;
        }
        // 使用节流更新
        this.throttledUpdate(() => {
            if (typeof updateNewEraButtonState === 'function') updateNewEraButtonState();
            this.updateUpgradeButtons();
        
            // 使用缓存的DOM元素
            if (this.cachedElements.currentMatter) {
                this.cachedElements.currentMatter.textContent = Utils.formatOmegaNum(Game.state.currentMatter);
            }
            if (this.cachedElements.matterPerSecond) {
                // 投喂黑洞时显示实际获取速度（应用黑洞效应后的值）
                if (window.blackholeChallenge && window.blackholeChallenge.inChallenge) {
                    // 计算完整的正常matterPerSecond（不使用简化版本）
                    const fullMPS = Game.calculateFullMatterPerSecond ? Game.calculateFullMatterPerSecond() : Game.state.matterPerSecond;
                    if (fullMPS.gt(0)) {
                        // 计算黑洞效应后的实际获取速度：sqrt(原值) / 500 + 0.0001
                        const baseMatter = fullMPS.sqrt().div(500).add(0.0001);
                        
                        // 计算时间能量增益倍率
                        let timeEnergyBonus = new OmegaNum(1);
                        if (Game.state.timeEnergyMultiplier && Game.state.timeEnergyMultiplier.gt(1)) {
                            timeEnergyBonus = Game.state.timeEnergyMultiplier.sqrt().mul(2);
                        }
                        
                        // 计算黑洞升级增益倍率
                        let blackholeUpgradeBonus = new OmegaNum(1);
                        if (typeof BlackholeSystem !== 'undefined') {
                            const upgradeMultiplier = BlackholeSystem.getSlowdownReductionMultiplier();
                            blackholeUpgradeBonus = upgradeMultiplier.pow(1.5);
                        }
                        
                        // 最终实际获取速度
                        const actualMPS = baseMatter.mul(blackholeUpgradeBonus).mul(timeEnergyBonus);
                        this.cachedElements.matterPerSecond.textContent = Utils.formatOmegaNum(actualMPS) + ' (黑洞效应)';
                    } else {
                        this.cachedElements.matterPerSecond.textContent = '0.0001 (黑洞效应)';
                    }
                } else {
                    this.cachedElements.matterPerSecond.textContent = Utils.formatOmegaNum(Game.state.matterPerSecond);
                }
            }
            if (this.cachedElements.generatorCount) {
                this.cachedElements.generatorCount.textContent = Utils.formatOmegaNum(new OmegaNum(Game.state.generatorCount));
            }
            if (this.cachedElements.generatorCost) {
                this.cachedElements.generatorCost.textContent = Utils.formatOmegaNum(Game.state.generatorCost);
            }
            if (this.cachedElements.enhancerCount) {
                this.cachedElements.enhancerCount.textContent = Utils.formatOmegaNum(new OmegaNum(Game.state.enhancerCount));
            }
            if (this.cachedElements.enhancerCost) {
                this.cachedElements.enhancerCost.textContent = Utils.formatOmegaNum(Game.state.enhancerCost);
            }

            // 更新反物质显示
            if (Game.state.antimatterUnlocked) {
                const productionRate = Game.state.currentMatter.div(new OmegaNum('5e8'));
                const antimatterProduction = document.getElementById('antimatterProduction');
                const antimatter = document.getElementById('antimatter');
                if (antimatterProduction) antimatterProduction.textContent = Utils.formatOmegaNum(productionRate);
                if (antimatter) antimatter.textContent = Utils.formatOmegaNum(Game.state.antimatter);
            }

            // 更新按钮状态
            if (this.cachedElements.buyGenerator) {
                this.cachedElements.buyGenerator.disabled = Game.state.currentMatter.lt(Game.state.generatorCost);
            }
            if (this.cachedElements.buyEnhancer) {
                // 挑战9激活时禁用增强器购买
                const challenge9Active = typeof window.isChallenge9Active === 'function' && window.isChallenge9Active();
                this.cachedElements.buyEnhancer.disabled = Game.state.currentMatter.lt(Game.state.enhancerCost) || challenge9Active;
            }

            // 更新挑战1状态显示
            const challenge1Status = document.getElementById('challenge1Status');
            if (challenge1Status) {
                if (typeof window.isChallenge1Active === 'function' && window.isChallenge1Active()) {
                    challenge1Status.textContent = '挑战1进行中：升级无效';
                    challenge1Status.style.display = 'block';
                } else if (Game.state.challenge1Reward) {
                    challenge1Status.textContent = '挑战1已完成：密度和压缩物质升级效果×2';
                    challenge1Status.style.display = 'block';
                } else {
                    challenge1Status.style.display = 'none';
                }
            }

            // 更新挑战2状态显示
            const challenge2Status = document.getElementById('challenge2Status');
            if (challenge2Status) {
                if (typeof window.isChallenge2Active === 'function' && window.isChallenge2Active()) {
                    challenge2Status.textContent = '挑战2进行中：软上限极巨';
                    challenge2Status.style.display = 'block';
                } else if (Game.state.challenge2Reward) {
                    challenge2Status.textContent = '挑战2已完成：软上限消失';
                    challenge2Status.style.display = 'block';
                } else {
                    challenge2Status.style.display = 'none';
                }
            }

            // 更新挑战3状态显示
            const challenge3Status = document.getElementById('challenge3Status');
            if (challenge3Status) {
                if (typeof window.isChallenge3Active === 'function' && window.isChallenge3Active()) {
                    challenge3Status.textContent = '挑战3进行中：双重打击（升级无效+软上限极巨）';
                    challenge3Status.style.display = 'block';
                } else if (Game.state.challenge3Reward) {
                    challenge3Status.textContent = '挑战3已完成：自动化间隔变为2秒';
                    challenge3Status.style.display = 'block';
                } else {
                    challenge3Status.style.display = 'none';
                }
            }

            // 更新挑战4状态显示
            const challenge4Status = document.getElementById('challenge4Status');
            if (challenge4Status) {
                if (typeof window.isChallenge4Active === 'function' && window.isChallenge4Active()) {
                    challenge4Status.textContent = '挑战4进行中：维度折叠，物质生产速度降低为1/10';
                    challenge4Status.style.display = 'block';
                } else if (Game.state.challenge4Reward) {
                    challenge4Status.textContent = '挑战4已完成：物质生产速度永久提升50%';
                    challenge4Status.style.display = 'block';
                } else {
                    challenge4Status.style.display = 'none';
                }
            }

            // 更新挑战5状态显示
            const challenge5Status = document.getElementById('challenge5Status');
            if (challenge5Status) {
                if (typeof window.isChallenge5Active === 'function' && window.isChallenge5Active()) {
                    challenge5Status.textContent = '挑战5进行中：能量守恒，购买升级物质变负值';
                    challenge5Status.style.display = 'block';
                } else if (Game.state.challenge5Reward) {
                    challenge5Status.textContent = '挑战5已完成：购买升级时返还50%物质消耗';
                    challenge5Status.style.display = 'block';
                } else {
                    challenge5Status.style.display = 'none';
                }
            }

            // 更新挑战6状态显示
            const challenge6Status = document.getElementById('challenge6Status');
            if (challenge6Status) {
                if (Game.state.challenge6Reward) {
                    // 确保antimatter存在，如果不存在则初始化为0
                    if (!Game.state.antimatter) {
                        Game.state.antimatter = new OmegaNum(0);
                    }
                    
                    // 计算反物质增幅倍数（与game.js中的逻辑保持一致）
                    const antimatterValue = Game.state.antimatter;
                    const baseValue = new OmegaNum('1e4');
                    
                    if (antimatterValue.gte(baseValue)) {
                        const logValue = antimatterValue.div(baseValue).log10();
                        const bonus = logValue.mul(1.5).add(1);
                        challenge6Status.textContent = `反物质增幅效果：×${Utils.formatOmegaNum(bonus)}`;
                    } else {
                        challenge6Status.textContent = `反物质增幅效果：无效果（需要≥${Utils.formatOmegaNum(baseValue)}反物质，当前：${Utils.formatOmegaNum(antimatterValue)}）`;
                    }
                    challenge6Status.style.display = 'block';
                } else if (typeof window.isChallenge6Active === 'function' && window.isChallenge6Active()) {
                    challenge6Status.textContent = '挑战6进行中：二重软上限激活';
                    challenge6Status.style.display = 'block';
                } else {
                    challenge6Status.style.display = 'none';
                }
            }

            // 更新挑战7状态显示
            const challenge7Status = document.getElementById('challenge7Status');
            if (challenge7Status) {
                if (typeof window.isChallenge7Active === 'function' && window.isChallenge7Active()) {
                    if (Game.state.challenge7StartTime) {
                        const timeElapsed = (Date.now() - Game.state.challenge7StartTime) / 1000;
                        const reductionRate = Math.min(0.99, 0.1 + timeElapsed * 0.05);
                        const currentMPS = Game.calculateMatterPerSecond ? Game.calculateMatterPerSecond() : new OmegaNum(0);
                        challenge7Status.textContent = `熵增肆虐中：生成速度 -${Utils.formatOmegaNum ? Utils.formatOmegaNum(new OmegaNum(reductionRate * 100), 1) : (reductionRate * 100).toFixed(1)}% (已坚持${Utils.formatOmegaNum ? Utils.formatOmegaNum(new OmegaNum(timeElapsed), 0) : timeElapsed.toFixed(0)}秒) | 当前：${Utils.formatOmegaNum(currentMPS)}/秒`;
                    } else {
                        challenge7Status.textContent = '熵增肆虐中：宇宙正在走向热寂...';
                    }
                    challenge7Status.style.display = 'block';
                } else if (Game.state.challenge7Reward) {
                    // 计算物质自增益倍数（与game.js保持一致）
                    if (Game.state.currentMatter && Game.state.currentMatter.gt(1)) {
                        const matterValue = Game.state.currentMatter;
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
                        challenge7Status.textContent = `物质自增益：×${Utils.formatOmegaNum(cappedBonus)} (上限×${Utils.formatOmegaNum(dynamicCap)})`;
                    } else {
                        challenge7Status.textContent = '物质自增益：无效果（需要>1物质）';
                    }
                    challenge7Status.style.display = 'block';
                } else {
                    challenge7Status.style.display = 'none';
                }
            }

            // 更新挑战8状态显示
            const challenge8Status = document.getElementById('challenge8Status');
            if (challenge8Status) {
                if (typeof window.isChallenge8Active === 'function' && window.isChallenge8Active()) {
                    challenge8Status.textContent = '挑战8进行中：单一生成器，禁止购买生成器';
                    challenge8Status.style.display = 'block';
                } else if (Game.state.challenge8Reward) {
                    challenge8Status.textContent = '挑战8已完成：无奖励';
                    challenge8Status.style.display = 'block';
                } else {
                    challenge8Status.style.display = 'none';
                }
            }

            // 更新挑战9状态显示
            const challenge9Status = document.getElementById('challenge9Status');
            if (challenge9Status) {
                if (typeof window.isChallenge9Active === 'function' && window.isChallenge9Active()) {
                    challenge9Status.textContent = '挑战9进行中：终极湮灭，禁止购买增强器，湮灭能量增益开平方';
                    challenge9Status.style.display = 'block';
                } else if (Game.state.challenge9Reward) {
                    challenge9Status.textContent = '挑战9已完成：解锁黑洞系统';
                    challenge9Status.style.display = 'block';
                } else {
                    challenge9Status.style.display = 'none';
                }
            }

            // 统计tab刷新
            const statsTab = document.getElementById('statsTab');
            if (statsTab && statsTab.style.display !== 'none') {
                this.updateStatsTab();
            }
            
            // 距离系统UI更新
            if (Game.state.distanceUnlocked) {
                updateDistanceUI();
            }
            
            // 黑洞系统UI更新
            if (window.BlackholeSystem && BlackholeSystem.updateUI) {
                BlackholeSystem.updateUI();
            }
            
            // 更新黑洞状态显示
            if (typeof updateBlackholeStatus === 'function') {
                updateBlackholeStatus();
            }
            
            // 距离里程碑自动化选项显示控制
            if (Game.state.distanceUnlocked && Game.state.distance) {
                const currentDistance = Game.state.distance;
                
                // 1e6光年：自动购买反物质升级 (1e6 * 9.461e15 = 9.461e21)
                const autoAntimatterUpgradesGroup = document.getElementById('autoAntimatterUpgradesGroup');
                if (autoAntimatterUpgradesGroup) {
                    autoAntimatterUpgradesGroup.style.display = currentDistance.gte(new OmegaNum('9.461e21')) ? 'block' : 'none';
                }
                
                // 1e10光年：自动湮灭反物质 (1e10 * 9.461e15 = 9.461e25)
                const autoAnnihilateAntimatterGroup = document.getElementById('autoAnnihilateAntimatterGroup');
                if (autoAnnihilateAntimatterGroup) {
                    autoAnnihilateAntimatterGroup.style.display = currentDistance.gte(new OmegaNum('9.461e25')) ? 'block' : 'none';
                }
                
                // 1e20光年：自动购买四种能量 (1e20 * 9.461e15 = 9.461e35)
                const autoEnergyPurchaseGroup = document.getElementById('autoEnergyPurchaseGroup');
        if (autoEnergyPurchaseGroup) {
            autoEnergyPurchaseGroup.style.display = currentDistance.gte(new OmegaNum('9.461e35')) ? 'block' : 'none';
        }
                
                // 1e50光年：自动湮灭距离 (1e50 * 9.461e15 = 9.461e65)
                const autoAnnihilateDistanceGroup = document.getElementById('autoAnnihilateDistanceGroup');
                if (autoAnnihilateDistanceGroup) {
                    autoAnnihilateDistanceGroup.style.display = currentDistance.gte(new OmegaNum('9.461e65')) ? 'block' : 'none';
                }
            }
            
            // 黑洞选项卡显示逻辑
            if (Game.state.challenge9Reward) {
                // 挑战9完成后显示黑洞选项卡
                if (this.cachedElements.blackholeTabBtn) {
                    this.cachedElements.blackholeTabBtn.style.display = 'block';
                }
                
                // 隐藏解锁提示，显示黑洞功能
                const blackholeUnlockHint = document.getElementById('blackholeUnlockHint');
                if (blackholeUnlockHint) {
                    blackholeUnlockHint.style.display = 'none';
                }
                
                // 启用黑洞功能按钮
                const feedBlackhole = document.getElementById('feedBlackhole');
                const harvestRadiation = document.getElementById('harvestRadiation');
                const manipulateSpacetime = document.getElementById('manipulateSpacetime');
                
                if (feedBlackhole) feedBlackhole.disabled = false;
                if (harvestRadiation) harvestRadiation.disabled = false;
                if (manipulateSpacetime) manipulateSpacetime.disabled = false;
                
                // 更新黑洞状态信息
                const blackholeMassElement = document.getElementById('blackholeMass');
                const hawkingRadiationElement = document.getElementById('hawkingRadiation');
                const accretionDiskElement = document.getElementById('accretionDisk');
                const spacetimeWarpElement = document.getElementById('spacetimeWarp');
                
                if (blackholeMassElement) {
                    blackholeMassElement.textContent = `${Game.state.blackholeMass || 0} 太阳质量`;
                }
                if (hawkingRadiationElement) {
                    const radiation = Math.floor((Game.state.blackholeMass || 0) * 10);
                    hawkingRadiationElement.textContent = `${radiation} 单位/秒`;
                }
                if (accretionDiskElement) {
                    const energy = Math.floor((Game.state.blackholeMass || 0) * 5);
                    accretionDiskElement.textContent = `${energy} 焦耳`;
                }
                if (spacetimeWarpElement) {
                    const warp = Utils.formatOmegaNum ? Utils.formatOmegaNum(new OmegaNum((Game.state.blackholeMass || 0) * 0.1), 2) : ((Game.state.blackholeMass || 0) * 0.1).toFixed(2);
                    spacetimeWarpElement.textContent = `${warp}%`;
                }
            } else {
                // 挑战9未完成时隐藏黑洞选项卡
                if (this.cachedElements.blackholeTabBtn) {
                    this.cachedElements.blackholeTabBtn.style.display = 'none';
                }
            }
            
            // 更新黑洞状态显示
            if (typeof updateBlackholeStatus === 'function') {
                updateBlackholeStatus();
            }
        });

        // 使用requestAnimationFrame进行下一帧更新
        requestAnimationFrame(() => UI.updateUI());
    }
}

// 确保window.UI可用
window.UI = UI;

// 开发者模式入口逻辑
window.addEventListener('DOMContentLoaded', () => {
    // 添加暂停按钮
    const settingsOptions = document.querySelector('.settings-options');
    if (settingsOptions) {
        const pauseBtn = document.createElement('button');
        pauseBtn.id = 'pauseBtn';
        pauseBtn.className = 'settings-button';
        pauseBtn.textContent = '暂停游戏';
        settingsOptions.appendChild(pauseBtn);

        pauseBtn.addEventListener('click', function() {
            if (Game.state.isPaused) {
                Game.state.isPaused = false;
                Game.startGameLoop();
                Utils.showNotification('游戏已继续');
            } else {
                Game.state.isPaused = true;
                Utils.showNotification('游戏已暂停');
            }
        });
    }

    const devBtn = document.getElementById('devModeBtn');
    // 彩蛋页面访问计数器
    window.eggPageVisits = 0;
    // 捐款按钮点击计数器
    window.donationClicks = 0;
    // 成就点击计数器
    window.achievement108Clicks = 0;
    
    console.log("初始化计数器：", {
        eggPageVisits: window.eggPageVisits,
        donationClicks: window.donationClicks,
        achievement108Clicks: window.achievement108Clicks
    });
    
    if (devBtn) {
        devBtn.addEventListener('click', () => {
            const pwd = document.getElementById('devModePassword').value;
            const msg = document.getElementById('devModeMsg');
            
            // 检查特定密码
            if (pwd === '1209267andfu*kdang5') {
                Game.state.developerMode = true;
                msg.style.color = '#4CAF50';
                msg.textContent = '开发者模式已激活！';
                showDeveloperPanel();
                
                // 隐藏成就109：通过查看源码找到开发者密码并成功进入开发者模式
                if (window.Achievements) Achievements.unlockHidden(109);
            } else if (pwd === 'woshishenjingbing') {
                // 隐藏成就102：在开发者模式密码框里面输入 woshishenjingbing
                if (window.Achievements) Achievements.unlockHidden(102);
                msg.style.color = '#ff8800';
                msg.textContent = '你是神经病吗？';
            } else if (pwd === '我是神经病') {
                // 隐藏成就107：在开发者模式输入框输入"我是神经病"
                if (window.Achievements) Achievements.unlockHidden(107);
                msg.style.color = '#ff8800';
                msg.textContent = '没错，你就是神经病！';
            } else if (pwd === '我不是神经病') {
                // 隐藏成就114：在开发者模式密码框输入"我不是神经病"
                if (window.Achievements) Achievements.unlockHidden(114);
                msg.style.color = '#ff8800';
                msg.textContent = '你越描越黑了...';
            } else {
                // 隐藏成就101：乱输开发者模式密码，还指望自己能作弊
                if (window.Achievements) Achievements.unlockHidden(101);
                msg.style.color = '#ff4444';
                msg.textContent = '密码错误';
            }
        });
    }
    
    // 彩蛋页面访问事件
    const eggPageLink = document.getElementById('eggPageLink');
    if (eggPageLink) {
        eggPageLink.addEventListener('click', (e) => {
            window.eggPageVisits++;
            
            // 隐藏成就103：在一次游戏中查看5次彩蛋页面
            if (window.eggPageVisits >= 5 && window.Achievements) {
                Achievements.unlockHidden(103);
            }
            
            // 隐藏成就104：在一次游戏中查看20次彩蛋页面
            if (window.eggPageVisits >= 20 && window.Achievements) {
                Achievements.unlockHidden(104);
            }
        });
    }
    
    // 捐款按钮点击事件 - 使用ID选择器
    const donateButton = document.getElementById('donateButton');
    if (donateButton) {
        donateButton.addEventListener('click', function(e) {
            // 阻止默认行为（不打开链接）
            e.preventDefault();
            
            // 初始化计数器
            if (!window.donationClicks) window.donationClicks = 0;
            window.donationClicks++;
            
            // 捐款按钮点击次数记录
            
            // 隐藏成就105：点击5次捐款按钮才能打开链接
            if (window.donationClicks >= 5 && window.Achievements) {
                // 解锁成就
                Achievements.unlockHidden(105);
                // 解锁成就：犹豫不决
                
                // 成就解锁后，打开链接
                window.open('https://afdian.tv/a/matterldle', '_blank');
                
                // 重置计数器，让用户可以正常使用按钮
                window.donationClicks = 0;
            } else {
                // 未解锁成就时，显示提示
                // 移除调试通知
            }
        });
    } else {
        console.error('捐款按钮未找到！');
    }
});

function showDeveloperPanel() {
    if (document.getElementById('developerPanel')) return;
    const panel = document.createElement('div');
    panel.id = 'developerPanel';
    panel.style = 'position:fixed;top:20px;right:20px;background:#333;color:white;padding:15px;border-radius:5px;z-index:9999;';
    panel.innerHTML = `
        <h3>开发者模式</h3>
        <div>
            <label>物质数量:</label>
            <input type='text' id='matterInput' style='width:150px;margin:5px;'>
            <button id='setMatterBtn'>设置</button>
        </div>
        <div style="margin-top:10px;">
            <label>游戏版本:</label>
            <input type='text' id='versionInput' style='width:150px;margin:5px;' value="1.0.0">
            <button id='setVersionBtn'>修改</button>
        </div>
        <div style="margin-top:10px;">
            <button id='activateBtn' style='width:100%;margin:5px;'>激活</button>
        </div>
        <div style="margin-top:10px;">
            <button id='deletedFeatureBtn' style='width:100%;margin:5px;'>使用已删除功能</button>
        </div>
        <div style="margin-top:10px;">
            <button id='triggerEuclidarBtn' style='width:100%;margin:5px;'>触发距离之神对话</button>
        </div>
    `;
    document.body.appendChild(panel);
    
    // 设置物质数量
    document.getElementById('matterInput').value = Utils.formatOmegaNum ? Utils.formatOmegaNum(Game.state.currentMatter) : Game.state.currentMatter.toString();
    document.getElementById('setMatterBtn').onclick = function() {
        const val = document.getElementById('matterInput').value;
        try {
            const num = new OmegaNum(val);
            if (!num.isNaN()) {
                Game.state.currentMatter = num;
                if (window.UI && UI.updateUI) UI.updateUI();
            } else {
                alert('请输入有效的数字或科学计数法，如1e6');
            }
        } catch (e) {
            alert('请输入有效的数字或科学计数法，如1e6');
        }
    };
    
    // 修改游戏版本号
    document.getElementById('setVersionBtn').onclick = function() {
        const val = document.getElementById('versionInput').value;
        try {
            // 隐藏成就111：修改游戏版本号
            if (window.Achievements) Achievements.unlockHidden(111);
            
            // 隐藏成就112：将版本号改为1.79e308
            if (val === '1.79e308' && window.Achievements) {
                Achievements.unlockHidden(112);
            }
            
            // 显示修改成功提示
            Utils.showNotification(`游戏版本已修改为 ${val}`, 'success');
        } catch (e) {
            alert('修改版本号失败');
        }
    };
    
    // 激活按钮点击事件 - 已删除成就相关逻辑
    document.getElementById('activateBtn').onclick = function() {
        Utils.showNotification('此功能已禁用', 'info');
    };
    
    // 使用已删除功能按钮点击事件
    document.getElementById('deletedFeatureBtn').onclick = function() {
        // 隐藏成就113：尝试使用已被删除的功能
        if (window.Achievements) Achievements.unlockHidden(113);
        Utils.showNotification('此功能已被删除', 'error');
    };
    
    // 触发距离之神对话按钮点击事件
     document.getElementById('triggerEuclidarBtn').onclick = function() {
         if (Game && Game.triggerEuclidarDialog) {
             const result = Game.triggerEuclidarDialog();
             if (result) {
                 Utils.showNotification('距离之神对话已触发！', 'success');
             } else {
                 Utils.showNotification('对话已经显示过了', 'info');
             }
         } else {
             Utils.showNotification('游戏未正确加载', 'error');
         }
     };
}

// 统计选项卡和子选项卡切换逻辑
// Tab切换逻辑已移至UI.init()中，避免重复绑定

// checkChallenge4Complete函数已移至antimatter.js中，避免重复定义

// 距离系统UI更新函数
function updateDistanceUI() {
    if (!Game.state.distanceUnlocked) return;
    
    // 更新距离显示
    const distanceDisplay = document.getElementById('currentDistance');
    if (distanceDisplay) {
        distanceDisplay.textContent = formatDistance(Game.state.distance || new OmegaNum(0));
    }
    
    // 更新最大距离显示
    const maxDistanceDisplay = document.getElementById('maxDistance');
    if (maxDistanceDisplay) {
        maxDistanceDisplay.textContent = formatDistance(Game.state.maxDistance || new OmegaNum(0));
    }
    
    // 更新湮灭距离显示
    const annihilatedDistanceDisplay = document.getElementById('annihilatedDistance');
    if (annihilatedDistanceDisplay) {
        annihilatedDistanceDisplay.textContent = formatDistance(Game.state.annihilatedDistance || new OmegaNum(0));
    }
    
    // 更新距离增益显示
    const distanceBonusDisplay = document.getElementById('distanceBonus');
    if (distanceBonusDisplay) {
        if (Game.state.annihilatedDistance && Game.state.annihilatedDistance.gt(0)) {
            // 削弱公式：基于湮灭距离本身，log10(湮灭距离+1e9) * 1.2 + (湮灭距离^0.2) / 1e15 + 1
            const logComponent = Game.state.annihilatedDistance.add(1e9).log10().mul(1.2);
            const powerComponent = Game.state.annihilatedDistance.pow(0.2).div(1e15);
            const annihilationBonus = logComponent.add(powerComponent).add(1);
            distanceBonusDisplay.textContent = Utils.formatOmegaNum(annihilationBonus);
        } else {
            distanceBonusDisplay.textContent = '1.00';
        }
    }
    

    
    // 更新距离能量生产距离的速度显示
    const distanceProductionRateDisplay = document.getElementById('distanceProductionRate');
    if (distanceProductionRateDisplay) {
        const totalDistanceEnergy = Game.state.distanceEnergyBought.add(Game.state.distanceEnergyProduced);
        if (totalDistanceEnergy.gte(1)) {
            let baseProduction = totalDistanceEnergy.mul(10); // 提高基础生产让增益效果更明显
            
            // 1000km里程碑：距离能量以强化公式增益
            let multiplier;
            if (Game.state.maxDistance && Game.state.maxDistance.gte(1e9)) {
                // 强化增量游戏公式：log10(距离能量+2) * 2.5 + (距离能量^0.4) * 1.8 + 距离能量/3 + 1
                const logComponent = totalDistanceEnergy.add(2).log10().mul(2.5);
                const powerComponent = totalDistanceEnergy.pow(0.4).mul(1.8);
                const linearComponent = totalDistanceEnergy.div(3);
                multiplier = logComponent.add(powerComponent).add(linearComponent).add(1);
            } else {
                multiplier = new OmegaNum(2).pow(totalDistanceEnergy.div(10).floor());
            }
            
            // 湮灭距离增益：强化公式增幅距离生成
             if (Game.state.annihilatedDistance && Game.state.annihilatedDistance.gt(0)) {
                 const annihilatedLightYears = Game.state.annihilatedDistance.div(new OmegaNum('9.461e15'));
                 // 极致增量游戏公式：log10(湮灭光年+1) * 100 + (湮灭光年^0.8) * 50 + 1
                 const logComponent = annihilatedLightYears.add(1).log10().mul(100);
                 const powerComponent = annihilatedLightYears.pow(0.8).mul(50);
                 const annihilationBonus = logComponent.add(powerComponent).add(1);
                 baseProduction = baseProduction.mul(annihilationBonus);
             }
            
            // 10光年里程碑：距离生成速度以削弱公式增益
            if (Game.state.maxDistance && Game.state.maxDistance.gte('9.461e16')) {
                // 削弱公式：基于最大距离本身，log10(最大距离+1e15) * 0.6 + (最大距离^0.12) / 1e18 + 1
                const logComponent = Game.state.maxDistance.add(1e15).log10().mul(0.6);
                const powerComponent = Game.state.maxDistance.pow(0.12).div(1e18);
                const distanceBonus = logComponent.add(powerComponent).add(1);
                baseProduction = baseProduction.mul(distanceBonus);
            }
            
            const distanceProductionPerSecond = baseProduction.mul(multiplier).mul(1000);
            
            distanceProductionRateDisplay.textContent = `${formatDistance(distanceProductionPerSecond)}/秒`;
        } else {
            distanceProductionRateDisplay.textContent = '0 毫米/秒';
        }
    }
    
    // 更新四种能量显示（新的x+y格式）
    updateEnergyDisplay('distance', Game.state.distanceEnergyBought, Game.state.distanceEnergyProduced, Game.state.distanceEnergyProduction);
    updateEnergyDisplay('jiexi', Game.state.kuaEnergyBought, Game.state.kuaEnergyProduced, Game.state.kuaEnergyProduction);
    updateEnergyDisplay('qin', Game.state.genQinEnergyBought, Game.state.genQinEnergyProduced, Game.state.genQinEnergyProduction);
    updateEnergyDisplay('zuohe', Game.state.kuoHeEnergyBought, Game.state.kuoHeEnergyProduced, Game.state.kuoHeEnergyProduction);
    
    // 更新倍率显示（使用总数量：购买的+生产的）
    updateMultiplierDisplay('distanceEnergyMultiplier', Game.state.distanceEnergyBought, 'distance');
    updateMultiplierDisplay('kuaEnergyMultiplier', Game.state.kuaEnergyBought, 'kua');
    updateMultiplierDisplay('genQinEnergyMultiplier', Game.state.genQinEnergyBought, 'genQin');
    updateMultiplierDisplay('kuoHeEnergyMultiplier', Game.state.kuoHeEnergyBought, 'kuoHe');
    
    // 更新距离能量效果描述
    const distanceEnergyEffectElement = document.getElementById('distanceEnergyEffect');
    if (distanceEnergyEffectElement) {
        if (Game.state.maxDistance && Game.state.maxDistance.gte(1e9)) {
            distanceEnergyEffectElement.textContent = '(强化增量公式增益)';
            distanceEnergyEffectElement.style.color = '#4CAF50';
        } else {
            distanceEnergyEffectElement.textContent = '(每10个效果×2)';
            distanceEnergyEffectElement.style.color = '#ccc';
        }
    }
    
    // 更新里程碑
    updateDistanceMilestones();
    
    // 更新购买按钮
    updateEnergyButtons();
    
    // 更新湮灭能量折叠按钮
    updateCollapseDistanceButton();
    
    // 更新距离折叠按钮显示
    updateAnnihilationDistanceButton();
}

// 距离格式化函数
function formatDistance(distance) {
    const mm = distance;
    const m = mm.div(1000);
    const km = m.div(1000);
    const lightYear = mm.div(new OmegaNum('9.461e15')); // 1光年 = 9.461e15毫米
    
    if (lightYear.gte(1)) {
        return `${Utils.formatOmegaNum(lightYear)} 光年`;
    } else if (km.gte(1)) {
        return `${Utils.formatOmegaNum(km)} 千米`;
    } else if (m.gte(1)) {
        return `${Utils.formatOmegaNum(m)} 米`;
    } else {
        return `${Utils.formatOmegaNum(mm)} 毫米`;
    }
}

// 更新能量显示（x+y格式）
function updateEnergyDisplay(type, boughtAmount, producedAmount, perSec) {
    // 修正ID映射 - 使用HTML中实际的ID
    const typeMap = {
        'distance': 'distanceEnergyDisplay',
        'jiexi': 'kuaEnergyDisplay', 
        'qin': 'genQinEnergyDisplay',
        'zuohe': 'kuoHeEnergyDisplay'
    };
    
    const actualType = typeMap[type] || type;
    const amountElement = document.getElementById(actualType);
    const perSecElement = document.getElementById(`${actualType}Production`);
    
    if (amountElement) {
        // 所有能量都显示为 x+y 格式
        const total = boughtAmount.add(producedAmount);
        amountElement.textContent = `${Utils.formatOmegaNum(boughtAmount)}+${Utils.formatOmegaNum(producedAmount)} (${Utils.formatOmegaNum(total)})`;
    }
    if (perSecElement) {
        perSecElement.textContent = Utils.formatOmegaNum(perSec);
    }
}

// 更新里程碑
function updateDistanceMilestones() {
    const milestonesContainer = document.getElementById('distanceMilestones');
    if (!milestonesContainer) return;
    
    const milestones = [
        { 
            distance: new OmegaNum(1), 
            name: '1mm: 所有的物质生成器和物质增强器不会消耗物质', 
            unlocked: Game.state.maxDistance && Game.state.maxDistance.gte(1)
        },
        { 
            distance: new OmegaNum(1e6), 
            name: '1km: 距离以平衡增幅公式增益物质', 
            unlocked: Game.state.maxDistance && Game.state.maxDistance.gte(1e6),
            effect: () => {
                if (Game.state.maxDistance && Game.state.maxDistance.gte(1e6)) {
                    const distanceKm = Game.state.maxDistance.div(1e6);
                    // 平衡增量游戏公式：log10(距离公里+1) * 1.5 + (距离公里^0.3) * 0.8 + 1
                    const logComponent = distanceKm.add(1).log10().mul(1.5);
                    const powerComponent = distanceKm.pow(0.3).mul(0.8);
                    const bonus = logComponent.add(powerComponent).add(1);
                    return ` (当前增益: ×${Utils.formatOmegaNum(bonus)})`;
                }
                return '';
            }
        },
        { 
            distance: new OmegaNum(1e8), 
            name: '100km: 湮灭距离以极致公式增益物质', 
            unlocked: Game.state.maxDistance && Game.state.maxDistance.gte(1e8),
            effect: () => {
                 if (Game.state.annihilatedDistance && Game.state.annihilatedDistance.gt(0)) {
                     const annihilatedLightYears = Game.state.annihilatedDistance.div(new OmegaNum('9.461e15'));
                     // 极致增量游戏公式：log10(湮灭光年+1) * 100 + (湮灭光年^0.8) * 50 + 1
                     const logBonus = annihilatedLightYears.add(1).log10().mul(100);
                     const powerBonus = annihilatedLightYears.pow(0.8).mul(50);
                     const annihilationBonus = logBonus.add(powerBonus).add(1);
                     return ` (当前增益: ×${Utils.formatOmegaNum(annihilationBonus)})`;
                 }
                 return ' (当前增益: ×1.00)';
             }
        },
         { 
             distance: new OmegaNum(1e9), 
             name: '1000km: 距离能量以强化公式增益', 
             unlocked: Game.state.maxDistance && Game.state.maxDistance.gte(1e9),
             effect: () => {
                 if (Game.state.maxDistance && Game.state.maxDistance.gte(1e9) && Game.state.distanceEnergyBought && Game.state.distanceEnergyBought.gt(0)) {
                     const totalDistanceEnergy = Game.state.distanceEnergyBought.add(Game.state.distanceEnergyProduced || new OmegaNum(0));
                     // 强化增量游戏公式：log10(距离能量+2) * 2.5 + (距离能量^0.4) * 1.8 + 距离能量/3 + 1
                     const logComponent = totalDistanceEnergy.add(2).log10().mul(2.5);
                     const powerComponent = totalDistanceEnergy.pow(0.4).mul(1.8);
                     const linearComponent = totalDistanceEnergy.div(3);
                     const distanceBonus = logComponent.add(powerComponent).add(linearComponent).add(1);
                     return ` (当前增益: ×${Utils.formatOmegaNum(distanceBonus)})`;
                 }
                 return Game.state.maxDistance && Game.state.maxDistance.gte(1e9) ? ' (当前增益: ×1.00)' : '';
             }
         },
         { 
            distance: new OmegaNum(1e10), 
            name: '10000km: 再次削弱反物质软上限', 
            unlocked: Game.state.maxDistance && Game.state.maxDistance.gte(1e10)
        },
        { 
            distance: new OmegaNum(1e12), 
            name: '1000000km: 跞禼能量以超强公式增益', 
            unlocked: Game.state.maxDistance && Game.state.maxDistance.gte(1e12),
            effect: () => {
                if (Game.state.maxDistance && Game.state.maxDistance.gte(1e12) && Game.state.kuaEnergyBought && Game.state.kuaEnergyBought.gt(0)) {
                    const kuaCount = Game.state.kuaEnergyBought;
                    // 超强增量游戏公式：log10(跞禼能量+3) * 3 + (跞禼能量^0.5) * 2 + 跞禼能量/2 + 1
                    const logComponent = kuaCount.add(3).log10().mul(3);
                    const powerComponent = kuaCount.pow(0.5).mul(2);
                    const linearComponent = kuaCount.div(2);
                    const kuaBonus = logComponent.add(powerComponent).add(linearComponent).add(1);
                    return ` (当前增益: ×${Utils.formatOmegaNum(kuaBonus)})`;
                }
                return Game.state.maxDistance && Game.state.maxDistance.gte(1e12) ? ' (当前增益: ×1.00)' : '';
            }
        },
        { 
            distance: new OmegaNum('9.461e15'), 
            name: '1光年: 物质被物质自身增幅', 
            unlocked: Game.state.maxDistance && Game.state.maxDistance.gte('9.461e15'),
            effect: () => {
                if (Game.state.distance && Game.state.distance.gte('9.461e15') && Game.state.currentMatter && Game.state.currentMatter.gt(1)) {
                    const matterValue = Game.state.currentMatter;
                    const logValue = matterValue.log10();
                    const bonus = logValue.div(3).add(1);
                    return ` (当前增益: ×${Utils.formatOmegaNum(bonus)})`;
                }
                return Game.state.distance && Game.state.distance.gte('9.461e15') ? ' (当前增益: ×1.00)' : '';
            }
        },
        { 
            distance: new OmegaNum('9.461e16'), 
            name: '10光年: 距离生成速度以强化公式增益', 
            unlocked: Game.state.maxDistance && Game.state.maxDistance.gte('9.461e16'),
            effect: () => {
                if (Game.state.maxDistance && Game.state.maxDistance.gte('9.461e16')) {
                    // 削弱公式：基于最大距离本身，log10(最大距离+1e15) * 0.6 + (最大距离^0.12) / 1e18 + 1
                    const logComponent = Game.state.maxDistance.add(1e15).log10().mul(0.6);
                    const powerComponent = Game.state.maxDistance.pow(0.12).div(1e18);
                    const distanceBonus = logComponent.add(powerComponent).add(1);
                    return ` (当前增益: ×${Utils.formatOmegaNum(distanceBonus)})`;
                }
                return '';
            }
        },
        { 
            distance: new OmegaNum('4.7305e17'), 
            name: '50光年: 解锁挑战九', 
            unlocked: Game.state.maxDistance && Game.state.maxDistance.gte('4.7305e17')
        },
        { 
            distance: new OmegaNum('9.461e21'), 
            name: '1e6光年: 解锁自动购买反物质升级', 
            unlocked: Game.state.maxDistance && Game.state.maxDistance.gte('9.461e21')
        },
        { 
            distance: new OmegaNum('9.461e25'), 
            name: '1e10光年: 解锁自动湮灭反物质', 
            unlocked: Game.state.maxDistance && Game.state.maxDistance.gte('9.461e25')
        },
        { 
            distance: new OmegaNum('9.461e35'), 
            name: '1e20光年: 解锁自动购买四种能量', 
            unlocked: Game.state.maxDistance && Game.state.maxDistance.gte('9.461e35')
        },
        { 
            distance: new OmegaNum('9.461e65'), 
            name: '1e50光年: 解锁自动湮灭距离', 
            unlocked: Game.state.maxDistance && Game.state.maxDistance.gte('9.461e65')
        }
    ];
    
    milestonesContainer.innerHTML = '';
    
    milestones.forEach((milestone, index) => {
        const milestoneDiv = document.createElement('div');
        
        // 特殊处理50光年里程碑：未解锁时显示进度条，已解锁时显示普通样式
        if (index === 8) {
            if (!milestone.unlocked) {
                const progress = calculateMilestoneProgress(Game.state.maxDistance || new OmegaNum(0), milestone.distance);
                milestoneDiv.style.cssText = `
                    margin: 4px 0;
                    padding: 8px 12px;
                    color: #9C27B0;
                    font-size: 14px;
                `;
                
                milestoneDiv.innerHTML = `
                    50光年: 解锁挑战九 (进度: ${Utils.formatOmegaNum ? Utils.formatOmegaNum(new OmegaNum(progress * 100), 2) : (progress * 100).toFixed(2)}%)
                    <div style="background: #333; border-radius: 4px; overflow: hidden; height: 8px; margin-top: 4px;">
                        <div style="background: linear-gradient(90deg, #9C27B0, #E91E63); height: 100%; width: ${Math.min(progress * 100, 100)}%; transition: width 0.3s ease;"></div>
                    </div>
                `;
            } else {
                milestoneDiv.style.cssText = `
                    margin: 4px 0;
                    padding: 8px 12px;
                    color: #FFD700;
                    font-size: 14px;
                `;
                milestoneDiv.textContent = milestone.name;
            }
        } else {
            milestoneDiv.style.cssText = `
                margin: 4px 0;
                padding: 8px 12px;
                color: ${milestone.unlocked ? '#FFD700' : '#999'};
                font-size: 14px;
            `;
            
            const effectText = milestone.effect ? milestone.effect() : '';
            milestoneDiv.textContent = milestone.name + effectText;
        }
        
        milestonesContainer.appendChild(milestoneDiv);
    });
}

// 计算里程碑进度（对数进度条）
function calculateMilestoneProgress(current, target) {
    if (current.gte(target)) return 1;
    if (current.lte(0)) return 0;
    
    const currentLog = current.log10();
    const targetLog = target.log10();
    const startLog = 0; // 从0开始
    
    return Math.max(0, Math.min(1, (currentLog - startLog) / (targetLog - startLog)));
}

// 更新能量购买按钮
function updateEnergyButtons() {
    updateEnergyButton('distance', Game.state.distanceEnergyBought, Game.getDistanceEnergyCost());
    updateEnergyButton('jiexi', Game.state.kuaEnergyBought, Game.getKuaEnergyCost());
    updateEnergyButton('qin', Game.state.genQinEnergyBought, Game.getGenQinEnergyCost());
    updateEnergyButton('zuohe', Game.state.kuoHeEnergyBought, Game.getKuoHeEnergyCost());
}

// 更新单个能量按钮
function updateEnergyButton(type, count, cost) {
    // 修正ID映射
    const typeMap = {
        'distance': 'DistanceEnergy',
        'jiexi': 'KuaEnergy',
        'qin': 'GenQinEnergy', 
        'zuohe': 'KuoHeEnergy'
    };
    
    // 能量数量和成本的ID映射
    const countIdMap = {
        'distance': 'distanceEnergyCount',
        'jiexi': 'kuaEnergyCount',
        'qin': 'genQinEnergyCount',
        'zuohe': 'kuoHeEnergyCount'
    };
    
    const costIdMap = {
        'distance': 'distanceEnergyCost',
        'jiexi': 'kuaEnergyCost',
        'qin': 'genQinEnergyCost',
        'zuohe': 'kuoHeEnergyCost'
    };
    
    const actualType = typeMap[type] || type;
    const button = document.getElementById(`buy${actualType}`);
    const countElement = document.getElementById(countIdMap[type]);
    const costElement = document.getElementById(costIdMap[type]);
    
    if (countElement) {
        countElement.textContent = Utils.formatOmegaNum(count);
    }
    
    if (costElement) {
        costElement.textContent = formatDistance(cost);
    }
    
    if (button) {
        const canAfford = Game.state.distance && Game.state.distance.gte(cost);
        button.disabled = !canAfford;
        button.className = canAfford ? 'buy-button affordable' : 'buy-button';
    }
}

// 更新湮灭能量折叠按钮
function updateCollapseDistanceButton() {
    const button = document.getElementById('collapseDistanceBtn');
    const costElement = document.getElementById('collapseDistanceCost');
    
    if (costElement) {
        costElement.textContent = Utils.formatOmegaNum(Game.state.antimatterEnergy);
    }
    
    if (button) {
        const canAfford = Game.state.antimatterEnergy.gt(0);
        button.disabled = !canAfford;
        button.className = canAfford ? 'buy-button affordable' : 'buy-button';
    }
}

// 更新距离折叠按钮显示
function updateAnnihilationDistanceButton() {
    const button = document.getElementById('useAnnihilationForDistance');
    if (!button) return;
    
    let buttonText = '使用1湮灭能量前进1毫米';
    
    // 如果有湮灭距离增益，显示增益效果
    if (Game.state.annihilatedDistance && Game.state.annihilatedDistance.gt(0)) {
        // 削弱公式：基于湮灭距离本身，log10(湮灭距离+1e9) * 1.2 + (湮灭距离^0.2) / 1e15 + 1
        const logComponent = Game.state.annihilatedDistance.add(1e9).log10().mul(1.2);
        const powerComponent = Game.state.annihilatedDistance.pow(0.2).div(1e15);
        const annihilationBonus = logComponent.add(powerComponent).add(1);
        
        if (Game.state.annihilationEnergy && Game.state.annihilationEnergy.gte(1)) {
            const effectiveDistance = Game.state.annihilationEnergy.mul(annihilationBonus);
            buttonText = `使用${Utils.formatOmegaNum(Game.state.annihilationEnergy)}湮灭能量前进${Utils.formatOmegaNum(effectiveDistance)}毫米 (×${Utils.formatOmegaNum(annihilationBonus)}增益)`;
        } else {
            buttonText = `使用1湮灭能量前进${Utils.formatOmegaNum(annihilationBonus)}毫米 (×${Utils.formatOmegaNum(annihilationBonus)}增益)`;
        }
    }
    
    button.textContent = buttonText;
    
    // 更新按钮可用性
    const canAfford = Game.state.annihilationEnergy && Game.state.annihilationEnergy.gte(1);
    button.disabled = !canAfford;
    button.style.opacity = canAfford ? '1' : '0.6';
}

// 更新倍率显示
function updateMultiplierDisplay(elementId, count, energyType) {
    const element = document.getElementById(elementId);
    if (element) {
        // 确保count是OmegaNum对象
        const omegaCount = count instanceof OmegaNum ? count : new OmegaNum(count);
        
        let multiplier;
        
        // 根据能量类型和里程碑状态计算倍率
        if (energyType === 'distance') {
            // 距离能量：1000km里程碑后每5个效果×2，否则每10个效果×2
            if (Game.state.maxDistance && Game.state.maxDistance.gte(1e9)) {
                const divisor = omegaCount.div(5).floor();
                multiplier = new OmegaNum(2).pow(divisor);
            } else {
                const divisor = omegaCount.div(10).floor();
                multiplier = new OmegaNum(2).pow(divisor);
            }
        } else if (energyType === 'kua') {
            // 跞禼能量：1000000km里程碑后每3个效果×2，否则每10个效果×2
            if (Game.state.maxDistance && Game.state.maxDistance.gte(1e12)) {
                const divisor = omegaCount.div(3).floor();
                multiplier = new OmegaNum(2).pow(divisor);
            } else {
                const divisor = omegaCount.div(10).floor();
                multiplier = new OmegaNum(2).pow(divisor);
            }
        } else {
            // 其他能量：每10个效果×2
            const divisor = omegaCount.div(10).floor();
            multiplier = new OmegaNum(2).pow(divisor);
        }
        
        element.textContent = Utils.formatOmegaNum(multiplier);
    }
}

// 将updateDistanceUI添加到全局UI对象
if (window.UI) {
    window.UI.updateDistanceUI = updateDistanceUI;
}

// 更新黑洞状态显示
function updateBlackholeStatus() {
    const statusElement = document.getElementById('blackholeStatus');
    if (!statusElement) return;
    
    // 显示黑洞碎片和时间能量信息
    const blackholeFragments = Game.state.blackholeFragments || new OmegaNum(0);
    const maxBlackholeFragments = Game.state.maxBlackholeFragments || new OmegaNum(0);
    const timeEnergy = Game.state.timeEnergy || new OmegaNum(0);
    const timeEnergyMultiplier = Game.state.timeEnergyMultiplier || new OmegaNum(1);
    
    statusElement.innerHTML = `
        <div style="text-align: center;">
            <h3 style="color: #8a2be2;">🌌 黑洞系统 🌌</h3>
            <p style="color: #ccc; font-size: 16px;">点击黑洞圆圈投喂黑洞</p>
            <p style="color: #999; font-size: 14px;">完成挑战九后可投喂黑洞</p>
            
            <!-- 黑洞碎片和时间能量显示 -->
            <div style="background: rgba(138, 43, 226, 0.1); padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #8a2be2;">
                <h4 style="color: #e0b3ff; margin-bottom: 10px;">⭐ 黑洞资源 ⭐</h4>
                <p style="color: #c9a9dd; margin: 5px 0;">黑洞碎片: <span style="color: #fff; font-weight: bold;">${Utils.formatOmegaNum(blackholeFragments)}</span></p>
                <p style="color: #c9a9dd; margin: 5px 0;">历史最大: <span style="color: #ffd700; font-weight: bold;">${Utils.formatOmegaNum(maxBlackholeFragments)}</span></p>
                <p style="color: #c9a9dd; margin: 5px 0;">时间能量: <span style="color: #4CAF50; font-weight: bold;">${Utils.formatOmegaNum(timeEnergy)}</span></p>
                <p style="color: #c9a9dd; margin: 5px 0;">时间增益: <span style="color: #ff9800; font-weight: bold;">×${Utils.formatOmegaNum(timeEnergyMultiplier)}</span></p>
                <p style="color: #888; font-size: 12px; margin-top: 8px;">黑洞碎片每秒生产等量时间能量</p>
            </div>
        </div>
    `;
}

// 将updateBlackholeStatus添加到全局UI对象
if (window.UI) {
    window.UI.updateBlackholeStatus = updateBlackholeStatus;
}
