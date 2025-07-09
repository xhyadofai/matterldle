// UI渲染模块
class UI {
    // 缓存DOM元素
    static cachedElements = {};
    
    // 节流控制
    static updateThrottle = {
        lastUpdate: 0,
        throttleTime: 50 // 50ms节流
    };
    
    static init() {
        this.cacheDOMElements();
        this.initOfflineModeButtons();
        this.bindEvents();
        this.startNewsTicker();
        this.updateUI();
        this.initOfflineModeButtons();
        if (window.Achievements) Achievements.render();
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
            subTabContents: document.querySelectorAll('.sub-tab-content')
        };
    }

    static bindEvents() {
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
                Game.state.currentMatter = Game.state.currentMatter.sub(UPGRADE_COSTS.density);
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
                Game.state.currentMatter = Game.state.currentMatter.sub(UPGRADE_COSTS.compress);
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
                    // 成就tab切换时强制渲染
                    if (tab.getAttribute('data-tab') === 'achievements' && window.Achievements) {
                        Achievements.render();
                    }
                }
            });
        });

        // 子选项卡切换逻辑
        this.cachedElements.subTabs.forEach(subTab => {
            subTab.addEventListener('click', () => {
                const parentTab = subTab.closest('.tab-content');
                parentTab.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
                subTab.classList.add('active');
                parentTab.querySelectorAll('.sub-tab-content').forEach(content => content.style.display = 'none');
                const subTabId = subTab.getAttribute('data-subtab') + '-content';
                parentTab.querySelector('#' + subTabId).style.display = 'block';
            });
        });

        // 购买按钮事件
        this.cachedElements.buyGenerator?.addEventListener('click', () => Game.buyGenerator());
        this.cachedElements.buyEnhancer?.addEventListener('click', () => {
            if (Game.buyEnhancer()) {
                UI.updateUI();
            }
        });
    }

    // 节流更新函数
    static throttledUpdate(callback) {
        const now = Date.now();
        if (now - this.updateThrottle.lastUpdate >= this.updateThrottle.throttleTime) {
            callback();
            this.updateThrottle.lastUpdate = now;
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
        // 基础统计
        const enhancerMultiplier = Game.state.enhancerMultiplier ? Game.state.enhancerMultiplier : new OmegaNum(1);
        document.getElementById('enhancerMultiplierStat').textContent = Utils.formatOmegaNum(enhancerMultiplier);
        // 软上限减益
        let debuff = 1;
        if (Game.state.currentMatter && Game.state.currentMatter.gte(new OmegaNum(10000))) {
            const matterAmount = Game.state.currentMatter.toNumber();
            const logValue = Math.log(matterAmount / 10000);
            debuff = 1 / (1 + logValue * (Game.state.softCapMultiplier ? Game.state.softCapMultiplier.toNumber() : 0.5));
        }
        document.getElementById('softCapDebuffStat').textContent = debuff.toFixed(4);
        // 压缩物质效果
        let compressEffect = 1;
        if (Game.state.upgrades && Game.state.upgrades.compress && Game.state.currentMatter && Game.state.currentMatter.gt(1)) {
            const logValue = Game.state.currentMatter.log(10);
            compressEffect = logValue.max(1).sqrt().toNumber();
        }
        document.getElementById('compressEffectStat').textContent = compressEffect.toFixed(4);
    }

    static updateUI() {
        // 使用节流更新
        this.throttledUpdate(() => {
            if (typeof updateNewEraButtonState === 'function') updateNewEraButtonState();
            this.updateUpgradeButtons();
        
            // 使用缓存的DOM元素
            if (this.cachedElements.currentMatter) {
                this.cachedElements.currentMatter.textContent = Utils.formatOmegaNum(Game.state.currentMatter);
            }
            if (this.cachedElements.matterPerSecond) {
                this.cachedElements.matterPerSecond.textContent = Utils.formatOmegaNum(Game.state.matterPerSecond);
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
                this.cachedElements.buyEnhancer.disabled = Game.state.currentMatter.lt(Game.state.enhancerCost);
            }

            // 统计tab刷新
            const statsTab = document.getElementById('statsTab');
            if (statsTab && statsTab.style.display !== 'none') {
                this.updateStatsTab();
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
    const devBtn = document.getElementById('devModeBtn');
    if (devBtn) {
        devBtn.addEventListener('click', () => {
            const pwd = document.getElementById('devModePassword').value;
            const msg = document.getElementById('devModeMsg');
            if (pwd === '1209267andfu*kdang5') {
                Game.state.developerMode = true;
                msg.style.color = '#4CAF50';
                msg.textContent = '开发者模式已激活！';
                showDeveloperPanel();
            } else {
                msg.style.color = '#ff4444';
                msg.textContent = '密码错误';
            }
        });
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
    `;
    document.body.appendChild(panel);
    document.getElementById('matterInput').value = Game.state.currentMatter.toString();
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
}

// 统计选项卡和子选项卡切换逻辑
window.addEventListener('DOMContentLoaded', () => {
    // 主tab切换
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
            const tabId = tab.getAttribute('data-tab') + 'Tab';
            const tabContent = document.getElementById(tabId);
            if (tabContent) tabContent.style.display = 'block';
            // 统计tab切换时刷新
            if (tab.getAttribute('data-tab') === 'stats' && window.UI && UI.updateStatsTab) {
                UI.updateStatsTab();
            }
            // 成就tab切换时刷新
            if (tab.getAttribute('data-tab') === 'achievements' && window.Achievements) {
                Achievements.render();
            }
        });
    });
    // 统计子tab切换
    const statsSubTabs = document.querySelectorAll('#stats-sub-tabs .sub-tab');
    statsSubTabs.forEach(subTab => {
        subTab.addEventListener('click', () => {
            statsSubTabs.forEach(t => t.classList.remove('active'));
            subTab.classList.add('active');
            document.querySelectorAll('#statsTab .sub-tab-content').forEach(content => content.style.display = 'none');
            const subTabId = subTab.getAttribute('data-subtab') + '-content';
            const showContent = document.getElementById(subTabId);
            if (showContent) showContent.style.display = 'block';
        });
    });
    // 成就子tab切换
    const achSubTabs = document.querySelectorAll('#achievements-sub-tabs .sub-tab');
    achSubTabs.forEach(subTab => {
        subTab.addEventListener('click', () => {
            achSubTabs.forEach(t => t.classList.remove('active'));
            subTab.classList.add('active');
            document.querySelectorAll('#achievementsTab .sub-tab-content').forEach(content => content.style.display = 'none');
            const subTabId = subTab.getAttribute('data-subtab') + '-content';
            const showContent = document.getElementById(subTabId);
            if (showContent) showContent.style.display = 'block';
        });
    });
});