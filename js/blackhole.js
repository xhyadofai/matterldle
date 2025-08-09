// 黑洞系统 - 极简版本
const BlackholeSystem = {
    
    // 初始化
    init() {
        console.log('初始化黑洞系统...');
        
        // 确保Game.state存在
        if (!window.Game || !window.Game.state) {
            console.warn('Game.state未初始化，延迟初始化黑洞系统');
            setTimeout(() => this.init(), 100);
            return;
        }
        
        // 初始化黑洞相关状态
        if (!Game.state.blackholeFragments) {
            Game.state.blackholeFragments = new OmegaNum(0);
        }
        if (!Game.state.maxBlackholeFragments) {
            Game.state.maxBlackholeFragments = new OmegaNum(0);
        }
        if (!Game.state.timeEnergy) {
            Game.state.timeEnergy = new OmegaNum(0);
        }
        if (!Game.state.blackholeMass) {
            Game.state.blackholeMass = new OmegaNum(0); // 黑洞质量，单位：克
        }
        
        this.bindEvents();
        this.updateUI();
        console.log('黑洞系统初始化完成');
    },

    // 绑定事件
    bindEvents() {
        // 黑洞圆圈点击
        const circle = document.getElementById('blackholeCircle');
        if (circle) {
            circle.onclick = () => {
                this.enter();
            };
        }

        // 子选项卡
        const tabs = document.querySelectorAll('#blackhole-sub-tabs .sub-tab');
        tabs.forEach(tab => {
            tab.onclick = () => this.switchTab(tab.dataset.subtab);
        });
    },

    // 投喂黑洞
    enter() {
        if (!Game.state.blackHoleUnlocked) {
            Game.state.blackHoleUnlocked = true;
        }

        // 检查物质数量是否达到投喂要求
        const currentMatter = Game.state.currentMatter || new OmegaNum(0);
        const minRequiredMatter = new OmegaNum('1e40');
        
        if (currentMatter.lt(minRequiredMatter)) {
            Utils.showNotification(`需要至少${Utils.formatOmegaNum(minRequiredMatter)}物质才能投喂黑洞！`, 'warning');
            return;
        }

        // 计算投喂会增加的质量
        const feedData = this.calculateFeedMass();
        
        // 显示投喂确认对话框
        this.showFeedConfirmDialog(feedData);
    },

    // 计算投喂质量
    calculateFeedMass() {
        // 确保所有变量都是OmegaNum对象
        let matter = Game.state.currentMatter || new OmegaNum(0);
        if (!(matter instanceof OmegaNum)) {
            matter = new OmegaNum(matter);
        }
        
        let antimatter = Game.state.currentAntimatter || new OmegaNum(0);
        if (!(antimatter instanceof OmegaNum)) {
            antimatter = new OmegaNum(antimatter);
        }
        
        let distance = Game.state.currentDistance || new OmegaNum(0);
        if (!(distance instanceof OmegaNum)) {
            distance = new OmegaNum(distance);
        }
        
        // 增强质量获得公式（后期优化版）：
        // 物质：log10(物质 + 1)^1.2 / 0.5 (后期指数增长)
        // 反物质：log10(反物质 + 1)^1.15 / 5 (后期指数增长)
        // 距离：log10(log10(距离 + 10) + 1)^1.3 / 50 (后期大幅增强)
        const matterLog = matter.add(1).log10();
        const antimatterLog = antimatter.add(1).log10();
        const distanceLog = distance.add(10).log10().add(1).log10();
        
        const matterMass = matterLog.pow(1.2).div(0.5);
        const antimatterMass = antimatterLog.pow(1.15).div(5);
        const distanceMass = distanceLog.pow(1.3).div(50);
        
        const totalMass = matterMass.add(antimatterMass).add(distanceMass);
        
        return {
            matterMass,
            antimatterMass, 
            distanceMass,
            totalMass,
            matter,
            antimatter,
            distance
        };
    },

    // 显示投喂确认对话框
    showFeedConfirmDialog(feedData) {
        const { totalMass, matterMass, antimatterMass } = feedData;
        
        if (totalMass.lte(0)) {
            Utils.showNotification('没有可投喂的物质！', 'warning');
            return;
        }
        
        // 格式化质量显示
        const massText = this.formatMass(totalMass);
        const currentBlackholeMass = this.formatMass(Game.state.blackholeMass || new OmegaNum(0));
        const newBlackholeMass = this.formatMass((Game.state.blackholeMass || new OmegaNum(0)).add(totalMass));
        
        // 计算本次能获得的黑洞碎片数量
        const fragmentsGain = this.calculateFragmentsFromMass(totalMass);
        
        const detailText = `
            <div style="text-align: left; margin: 15px 0;">
                <h4 style="color: #e0b3ff; margin-bottom: 10px;">投喂详情：</h4>
                <p style="margin: 5px 0;">• 总质量：${this.formatMass(totalMass)}</p>
                <hr style="border: 1px solid #8a2be2; margin: 10px 0;">
                <p style="margin: 5px 0; font-weight: bold; color: #4CAF50;">总质量增加：${massText}</p>
                <p style="margin: 5px 0;">黑洞质量：${currentBlackholeMass} → ${newBlackholeMass}</p>
                <p style="margin: 5px 0; font-weight: bold; color: #8a2be2;">获得黑洞碎片：${Utils.formatOmegaNum(fragmentsGain)}</p>
            </div>
        `;
        
        Utils.createCustomDialog({
            title: '投喂黑洞确认',
            content: `将把你的一切都投入黑洞，重置所有进度，但黑洞会变得更大！${detailText}确定投喂吗？`,
            titleBgColor: '#4a0e4e',
            bgColor: '#1a0d2e',
            contentColor: '#e0b3ff',
            width: '500px',
            height: '400px',
            buttons: [
                {
                    text: '确定投喂',
                    color: '#ffffff',
                    bgColor: '#8a2be2',
                    onClick: () => this.start(feedData)
                },
                {
                    text: '取消',
                    color: '#ffffff',
                    bgColor: '#666666'
                }
            ]
        });
    },

    // 格式化质量显示
    formatMass(mass) {
        if (mass.lt(1000)) {
            return `${Utils.formatOmegaNum(mass)}g`;
        } else if (mass.lt(1000000)) {
            return `${Utils.formatOmegaNum(mass.div(1000))}kg`;
        } else if (mass.lt(1000000000)) {
            return `${Utils.formatOmegaNum(mass.div(1000000))}t`;
        } else if (mass.lt(new OmegaNum('1e12'))) {
            return `${Utils.formatOmegaNum(mass.div(1000000000))}kt`;
        } else if (mass.lt(new OmegaNum('1e15'))) {
            return `${Utils.formatOmegaNum(mass.div(new OmegaNum('1e12')))}Mt`;
        } else if (mass.lt(new OmegaNum('1e18'))) {
            return `${Utils.formatOmegaNum(mass.div(new OmegaNum('1e15')))}Gt`;
        } else if (mass.lt(new OmegaNum('1e21'))) {
            return `${Utils.formatOmegaNum(mass.div(new OmegaNum('1e18')))}Tt`;
        } else if (mass.lt(new OmegaNum('1e24'))) {
            return `${Utils.formatOmegaNum(mass.div(new OmegaNum('1e21')))}Pt`;
        } else if (mass.lt(new OmegaNum('1e27'))) {
            return `${Utils.formatOmegaNum(mass.div(new OmegaNum('1e24')))}Et`;
        } else if (mass.lt(new OmegaNum('1e30'))) {
            return `${Utils.formatOmegaNum(mass.div(new OmegaNum('1e27')))}Zt`;
        } else if (mass.lt(new OmegaNum('1e33'))) {
            return `${Utils.formatOmegaNum(mass.div(new OmegaNum('1e30')))}Yt`;
        } else {
            return `${Utils.formatOmegaNum(mass.div(new OmegaNum('1e33')))}Rt`;
        }
    },

    // 根据质量计算黑洞碎片（后期优化版）
    calculateFragmentsFromMass(mass) {
        if (!mass || mass.lte(0)) return new OmegaNum(0);
        
        // 优化公式：log10(质量 + 1)^1.25 * 15（后期指数增长，提升50%基础获取量）
        const logMass = mass.add(1).log10();
        return logMass.pow(1.25).mul(15);
    },

    // 执行投喂
    start(feedData) {
        if (feedData) {
            // 消耗资源
            Game.state.currentMatter = new OmegaNum(0);
            Game.state.currentAntimatter = new OmegaNum(0);
            Game.state.currentDistance = new OmegaNum(0);
            
            // 应用黑洞膨胀升级增益
            let massToAdd = feedData.totalMass;
            if (typeof BlackholeUpgrades !== 'undefined') {
                const expansionMultiplier = BlackholeUpgrades.getBlackholeExpansionMultiplier();
                if (expansionMultiplier.gt(1)) {
                    massToAdd = massToAdd.mul(expansionMultiplier);
                }
            }
            
            // 应用黑洞路径三：吞噬效果增幅质量获得
            if (typeof BlackholeUpgrades !== 'undefined') {
                const blackholeDevourMultiplier = BlackholeUpgrades.getBlackholeDevourMultiplier();
                if (blackholeDevourMultiplier.gt(1)) {
                    massToAdd = massToAdd.mul(blackholeDevourMultiplier);
                }
            }
            
            // 更新黑洞质量
            const oldMass = Game.state.blackholeMass || new OmegaNum(0);
            Game.state.blackholeMass = oldMass.add(massToAdd);
            
            // 计算获得的黑洞碎片（基于增益后的质量）
            let newFragments = this.calculateFragmentsFromMass(massToAdd);
            
            // 应用黑洞路径三：吞噬效果增幅碎片获得
            if (typeof BlackholeUpgrades !== 'undefined') {
                const blackholeDevourMultiplier = BlackholeUpgrades.getBlackholeDevourMultiplier();
                if (blackholeDevourMultiplier.gt(1)) {
                    newFragments = newFragments.mul(blackholeDevourMultiplier);
                }
            }
            Game.state.blackholeFragments = (Game.state.blackholeFragments || new OmegaNum(0)).add(newFragments);
            
            // 更新最大黑洞碎片记录
            if (!Game.state.maxBlackholeFragments || Game.state.blackholeFragments.gt(Game.state.maxBlackholeFragments)) {
                Game.state.maxBlackholeFragments = Game.state.blackholeFragments;
            }
            
            // 生成时间能量（等于黑洞碎片数量）
            const timeEnergyGain = newFragments;
            Game.state.timeEnergy = (Game.state.timeEnergy || new OmegaNum(0)).add(timeEnergyGain);
            
            Utils.showNotification(`黑洞质量增加${this.formatMass(massToAdd)}！获得${Utils.formatOmegaNum(newFragments)}黑洞碎片和${Utils.formatOmegaNum(timeEnergyGain)}时间能量！`, 'success');
        }
        
        // 重置游戏状态
        this.reset();
        
        this.updateUI();
        
        Utils.showNotification('投喂完成！', 'success');
    },

    // 重置游戏状态（等同于距离重置函数）
    reset() {
        performBlackholeReset();
    },



    // 检查第一次退出
    checkFirstExit() {
        if (Utils.oneTimeDialogs && !Utils.oneTimeDialogs.has('singulon_first_exit')) {
            this.showSingulonDialog();
        }
    },

    // Singulon对话
    showSingulonDialog() {
        const dialogs = [
            {
                title: 'Singulon',
                content: '诶？！你…你怎么从里面出来了？！等下…操作手册说，长按这个界面就能安全地吸收重置并获得\'时间微粒\'啊？',
                titleBgColor: '#4a0e4e',
                width: '450px',
                height: '300px',
                waitTime: 1
            },
            {
                title: 'Singulon', 
                content: '哪里出了问题？<br><br>（他疑惑地尝试长按黑洞界面。）',
                titleBgColor: '#4a0e4e',
                width: '450px',
                height: '250px',
                waitTime: 1
            },
            {
                title: '系统错误',
                content: '<span style="color: #ff4444; font-family: monospace;">[错误！黑洞长按协议失效。错误代码：0xC0SM1C_L0CK]</span>',
                titleBgColor: '#1a1a1a',
                titleColor: '#ff4444',
                width: '500px',
                height: '200px',
                waitTime: 1
            },
            {
                title: 'Singulon',
                content: '哈！又是这破错误码！见鬼了！我都修了快一万个平行世界里的这个Bug了！',
                titleBgColor: '#4a0e4e',
                width: '450px',
                height: '250px',
                waitTime: 1
            },
            {
                title: 'Singulon',
                content: '你好，我是Singulon！抱歉让你意外开始了黑洞投喂程序。<br><br>这绝对是系统Bug！我得去处理另一个更糟的时空撕裂了…回头再聊！',
                titleBgColor: '#4a0e4e',
                width: '450px',
                height: '300px',
                waitTime: 1
            },
            {
                title: 'Singulon',
                content: '对了！继续投喂黑洞试试看？黑洞会变得越来越大，你会获得更多时间能量！当作补偿啦！',
                titleBgColor: '#4a0e4e',
                width: '450px',
                height: '250px',
                waitTime: 1
            }
        ];

        if (Utils.oneTimeDialogs) {
            Utils.oneTimeDialogs.add('singulon_first_exit');
        }

        if (Utils.showDialogSequence) {
            Utils.showDialogSequence(dialogs, () => {
                Utils.showNotification('Singulon已离开，黑洞碎片系统激活！', 'info');
            });
        }
    },

    // 切换子选项卡
    switchTab(subtab) {
        // 隐藏所有内容
        const contents = document.querySelectorAll('.blackhole-subtab-content');
        contents.forEach(content => content.style.display = 'none');
        
        // 移除所有激活状态
        const tabs = document.querySelectorAll('#blackhole-sub-tabs .sub-tab');
        tabs.forEach(tab => tab.classList.remove('active'));
        
        // 显示选中内容
        const targetContent = document.getElementById(`${subtab}-content`);
        if (targetContent) targetContent.style.display = 'block';
        
        // 激活选中选项卡
        const targetTab = document.querySelector(`[data-subtab="${subtab}"]`);
        if (targetTab) targetTab.classList.add('active');
        
        // 如果切换到升级选项卡，更新升级UI
        if (subtab === 'blackhole-upgrades' && typeof BlackholeUpgrades !== 'undefined') {
            BlackholeUpgrades.updateUI();
        }
    },



    // 更新UI
    updateUI() {
        this.updateStatus();
        this.updateButtons();
        this.updateResources();
        this.checkSingulonTrigger();
        
        // 更新黑洞升级UI
        if (typeof BlackholeUpgrades !== 'undefined') {
            BlackholeUpgrades.updateUI();
        }
    },
    
    // 检查Singulon对话触发条件
    checkSingulonTrigger() {
        const blackholeMass = Game.state.blackholeMass || new OmegaNum(0);
        const oneKg = new OmegaNum(1000); // 1kg = 1000g
        
        // 检查是否已经触发过对话
        if (!Game.state.singulonDialogTriggered && blackholeMass.gte(oneKg)) {
            Game.state.singulonDialogTriggered = true;
            this.showSingulonMassDialog();
        }
    },
    
    // Singulon质量对话
    showSingulonMassDialog() {
        const dialogs = [
            {
                title: 'Singulon',
                content: '唉？你为什么要把你所有的东西拿去喂黑洞啊？我记得黑洞不是每秒生成一个时间微粒，然后扔进去提供增益吗',
                titleBgColor: '#4a0e4e',
                bgColor: '#1a0d2e',
                contentColor: '#e0b3ff'
            },
            {
                title: 'Singulon',
                content: '（拿出兜里自己存的时间微粒丢进黑洞）',
                titleBgColor: '#4a0e4e',
                bgColor: '#1a0d2e',
                contentColor: '#e0b3ff'
            },
            {
                title: 'SystemError',
                content: '䁁䁮䁴䁩䁭䁡䁲ꋦꈪ躆Ꜭ꓍轜瀂',
                titleBgColor: '#330000',
                bgColor: '#1a0000',
                contentColor: '#ffaaaa'
            },
            {
                title: 'Singulon',
                content: '怎么又是这个错误码，一堆鬼画符！算了算了，有个更糟糕的宇宙撕裂等着我处理呢，我先走了！！',
                titleBgColor: '#4a0e4e',
                bgColor: '#1a0d2e',
                contentColor: '#e0b3ff'
            }
        ];
        
        Utils.showDialogSequence(dialogs, null, 'singulon_mass_dialog');
    },
    


    // 更新状态显示
    updateStatus() {
        const statusEl = document.getElementById('blackholeStatus');
        if (!statusEl) return;

        // 缓存上次的状态，避免不必要的DOM更新
        if (!this.lastStatusCache) {
            this.lastStatusCache = { content: '' };
        }

        const fragments = Game.state.blackholeFragments || new OmegaNum(0);
        const maxFragments = Game.state.maxBlackholeFragments || new OmegaNum(0);
        // 确保blackholeMass是OmegaNum对象
        let blackholeMass = Game.state.blackholeMass || new OmegaNum(0);
        if (!(blackholeMass instanceof OmegaNum)) {
            blackholeMass = new OmegaNum(blackholeMass);
        }
        
        const newContent = `
            <div style="background: linear-gradient(135deg, #2a1a3e, #3d2b5f); border: 2px solid #8a2be2; padding: 20px; border-radius: 12px; margin: 20px 0;">
                <h3 style="color: #e0b3ff; margin-bottom: 15px;">黑洞系统</h3>
                <p style="color: #c9a9dd; margin: 5px 0;">黑洞质量: ${this.formatMass(blackholeMass)}</p>
                <p style="color: #c9a9dd; margin: 5px 0;">当前碎片: ${Utils.formatOmegaNum(fragments)}</p>
                <p style="color: #c9a9dd; margin: 5px 0;">历史最大: ${Utils.formatOmegaNum(maxFragments)}</p>
                <p style="color: #4CAF50; margin: 10px 0;">点击黑洞投喂物质</p>
            </div>
        `;

        // 只有内容真正改变时才更新DOM
        if (this.lastStatusCache.content !== newContent) {
            statusEl.innerHTML = newContent;
            this.lastStatusCache.content = newContent;
        }
    },

    // 更新按钮
    updateButtons() {
        const circle = document.getElementById('blackholeCircle');
        if (circle) {
            circle.title = '点击投喂黑洞';
        }
    },

    // 更新资源显示
    updateResources() {
        const fragmentsEl = document.getElementById('blackholeFragmentsAmount');
        if (fragmentsEl) {
            const fragments = Game.state.blackholeFragments || new OmegaNum(0);
            fragmentsEl.textContent = Utils.formatOmegaNum(fragments);
        }

        const maxFragmentsEl = document.getElementById('maxBlackholeFragments');
        if (maxFragmentsEl) {
            const maxFragments = Game.state.maxBlackholeFragments || new OmegaNum(0);
            maxFragmentsEl.textContent = Utils.formatOmegaNum(maxFragments);
        }
        
        // 更新黑洞质量显示
        const blackholeMassElement = document.getElementById('blackholeMassAmount');
        if (blackholeMassElement) {
            blackholeMassElement.textContent = this.formatMass(Game.state.blackholeMass || new OmegaNum(0));
        }
        
        // 更新时间能量显示
        const timeEnergyElement = document.getElementById('timeEnergyAmount');
        const timeEnergyRateElement = document.getElementById('timeEnergyRate');
        
        if (timeEnergyElement) {
            timeEnergyElement.textContent = Utils.formatOmegaNum(Game.state.timeEnergy || new OmegaNum(0));
        }
        
        if (timeEnergyRateElement) {
            // 时间能量生产速率等于黑洞碎片数量
            const rate = Game.state.blackholeFragments || new OmegaNum(0);
            timeEnergyRateElement.textContent = Utils.formatOmegaNum(rate);
        }
    },







    // 保存状态
    saveState() {
        return {
            blackholeFragments: Game.state.blackholeFragments ? Game.state.blackholeFragments.toString() : '0',
            maxBlackholeFragments: Game.state.maxBlackholeFragments ? Game.state.maxBlackholeFragments.toString() : '0',
            blackholeMass: Game.state.blackholeMass ? Game.state.blackholeMass.toString() : '0'
        };
    },

    // 加载状态
    loadState(data) {
        if (data.blackholeFragments !== undefined) {
            Game.state.blackholeFragments = new OmegaNum(data.blackholeFragments);
        }
        if (data.maxBlackholeFragments !== undefined) {
            Game.state.maxBlackholeFragments = new OmegaNum(data.maxBlackholeFragments);
        }
        if (data.blackholeMass !== undefined) {
            Game.state.blackholeMass = new OmegaNum(data.blackholeMass);
        }
        
        this.updateUI();
    }
};

// 黑洞重置函数（独立函数，方便调用）
function performBlackholeReset() {
    // 保存重要数据
    const saved = {
        blackholeFragments: Game.state.blackholeFragments,
        timeEnergy: Game.state.timeEnergy,
        blackholeMass: Game.state.blackholeMass,
        challenge9Reward: Game.state.challenge9Reward // 保留挑战9奖励
    };
    
    // 执行距离折叠重置逻辑
    if (typeof Game.distanceFoldReset === 'function') {
        Game.distanceFoldReset();
    }
    
    // 重置距离相关
    Game.state.distance = new OmegaNum(0);
    Game.state.maxDistance = new OmegaNum(0);
    Game.state.annihilatedDistance = new OmegaNum(0);
    Game.state.annihilationDistance = new OmegaNum(0);
    Game.state.annihilationEnergy = new OmegaNum(0);
    
    // 重置四种能量
    Game.state.energy = new OmegaNum(0);
    Game.state.darkEnergy = new OmegaNum(0);
    Game.state.voidEnergy = new OmegaNum(0);
    Game.state.quantumEnergy = new OmegaNum(0);
    
    // 重置距离能量系统
    Game.state.distanceEnergyBought = new OmegaNum(0);
    Game.state.distanceEnergyProduced = new OmegaNum(0);
    Game.state.distanceEnergyProduction = new OmegaNum(0);
    Game.state.distanceEnergyCost = new OmegaNum('1e6');
    
    Game.state.kuaEnergyBought = new OmegaNum(0);
    Game.state.kuaEnergyProduced = new OmegaNum(0);
    Game.state.kuaEnergyProduction = new OmegaNum(0);
    Game.state.kuaEnergyCost = new OmegaNum('1e10');
    Game.state.kuaEnergyGenerators = 0;
    
    Game.state.genQinEnergyBought = new OmegaNum(0);
    Game.state.genQinEnergyProduced = new OmegaNum(0);
    Game.state.genQinEnergyProduction = new OmegaNum(0);
    Game.state.genQinEnergyCost = new OmegaNum('1e15');
    Game.state.genQinEnergyGenerators = 0;
    
    Game.state.kuoHeEnergyBought = new OmegaNum(0);
    Game.state.kuoHeEnergyProduced = new OmegaNum(0);
    Game.state.kuoHeEnergyProduction = new OmegaNum(0);
    Game.state.kuoHeEnergyCost = new OmegaNum('9.461e18');
    Game.state.kuoHeEnergyGenerators = 0;
    
    // 重置距离里程碑
    if (Game.state.distanceMilestones) {
        Game.state.distanceMilestones = {};
    }
    
    // 注意：不重置距离系统相关的对话框状态，保持一次性对话框的状态
    // Game.state.euclidarDialogShown = false;
    // Game.state.firstSoftCapDialogShown = false;
    // Game.state.secondSoftCapDialogShown = false;
    // Game.state.hardCapDialogShown = false;
    
    // 重置所有挑战状态（除了挑战9）
    if (window.challengeState) {
        challengeState.inChallenge = false;
        challengeState.challengeId = null;
        for (let i = 1; i <= 8; i++) { // 只重置挑战1-8
            challengeState.completed[i] = false;
        }
    }
    
    // 重置挑战奖励状态（除了挑战9）
    Game.state.challenge1Reward = false;
    Game.state.challenge2Reward = false;
    Game.state.challenge3Reward = false;
    Game.state.challenge4Reward = false;
    Game.state.challenge5Reward = false;
    Game.state.challenge6Reward = false;
    Game.state.challenge7Reward = false;
    Game.state.challenge8Reward = false;
    // 不重置challenge9Reward
    
    // 恢复重要数据
    Game.state.blackholeFragments = saved.blackholeFragments;
    Game.state.timeEnergy = saved.timeEnergy;
    Game.state.blackholeMass = saved.blackholeMass;
    Game.state.challenge9Reward = saved.challenge9Reward;
    
    // 更新挑战UI（除了挑战9）
    if (window.updateChallengeTabUI) {
        updateChallengeTabUI();
    }
    
    // 强制刷新挑战按钮状态
    setTimeout(() => {
        if (window.updateChallengeTabUI) {
            updateChallengeTabUI();
        }
    }, 100);
    
    // 更新UI
    if (window.UI && UI.updateUI) UI.updateUI();
    if (window.UI && UI.updateUpgradeButtons) UI.updateUpgradeButtons();
    
    // 显示自动化选项卡（如果已解锁）
    const automationTabBtn = document.getElementById('automationTabBtn');
    if (automationTabBtn && Game.state.automationUnlocked) {
        automationTabBtn.style.display = '';
    }
    
    // 显示升级选项卡
    const upgradesTab = document.querySelector('.tab[data-tab="upgrades"]');
    if (upgradesTab) {
        upgradesTab.style.display = '';
    }
}

// 黑洞升级系统
const BlackholeUpgrades = {
    // 初始化升级状态
    init() {
        // 确保Game.state存在
        if (!window.Game || !window.Game.state) {
            console.warn('Game.state未初始化，延迟初始化黑洞升级系统');
            setTimeout(() => this.init(), 100);
            return;
        }
        
        if (!Game.state.blackholeUpgrades) {
            Game.state.blackholeUpgrades = {
                matterBoost: false, // 物质增益强化升级
                matterDevour: false, // 吞噬物质转化升级
                antimatterExplosion: false // 反物质爆炸升级
            };
        }
        
        // 初始化路线选择状态
        if (!Game.state.selectedPath) {
            Game.state.selectedPath = null; // null表示未选择路线
        }
        
        this.updateUI();
    },
    
    // 显示路线选择对话框
    showPathSelection() {
        const dialogHTML = `
            <div style="text-align: center; padding: 20px;">
                <h3 style="color: #e0b3ff; margin-bottom: 20px;">选择你的升级路线</h3>
                <p style="color: #c9a9dd; margin-bottom: 25px; font-size: 14px;">选择路线后将执行一次无奖励的黑洞重置，但你可以专注于该路线的升级</p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
                    <button onclick="BlackholeUpgrades.selectPath('matter')" style="background: linear-gradient(135deg, #8a2be2, #6a1b9a); color: white; border: none; padding: 15px; border-radius: 8px; font-size: 14px; cursor: pointer; font-weight: bold;">
                        物质路线
                        <div style="font-size: 12px; margin-top: 5px; opacity: 0.8;">专注物质获取增强</div>
                    </button>
                    
                    <button onclick="BlackholeUpgrades.selectPath('antimatter')" style="background: linear-gradient(135deg, #e22b8a, #c21975); color: white; border: none; padding: 15px; border-radius: 8px; font-size: 14px; cursor: pointer; font-weight: bold;">
                        反物质路线
                        <div style="font-size: 12px; margin-top: 5px; opacity: 0.8;">专注反物质爆发</div>
                    </button>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <button onclick="BlackholeUpgrades.selectPath('blackhole')" style="background: linear-gradient(135deg, #9c27b0, #7b1fa2); color: white; border: none; padding: 15px 30px; border-radius: 8px; font-size: 14px; cursor: pointer; font-weight: bold;">
                        黑洞路线
                        <div style="font-size: 12px; margin-top: 5px; opacity: 0.8;">专注黑洞质量增强</div>
                    </button>
                </div>
                
                <button onclick="BlackholeUpgrades.closePathDialog()" style="background: #666; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-size: 14px; cursor: pointer;">
                    取消
                </button>
            </div>
        `;
        
        // 创建对话框
        const dialog = document.createElement('div');
        dialog.id = 'path-selection-dialog';
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        const dialogContent = document.createElement('div');
        dialogContent.style.cssText = `
            background: linear-gradient(135deg, #1a0d2e, #2d1b69);
            border: 2px solid #8a2be2;
            border-radius: 12px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        `;
        dialogContent.innerHTML = dialogHTML;
        
        dialog.appendChild(dialogContent);
        document.body.appendChild(dialog);
    },
    
    // 选择路线
    selectPath(path) {
        // 计算需要退还的质量
        let refundAmount = new OmegaNum(0);
        if (Game.state.upgradeCosts) {
            // 遍历所有已购买的升级，计算总退还金额
            for (const upgradeName in Game.state.upgradeCosts) {
                if (Game.state.blackholeUpgrades && Game.state.blackholeUpgrades[upgradeName]) {
                    refundAmount = refundAmount.add(Game.state.upgradeCosts[upgradeName]);
                }
            }
        }
        
        // 退还质量
        if (refundAmount.gt(0)) {
            Game.state.blackholeMass = (Game.state.blackholeMass || new OmegaNum(0)).add(refundAmount);
            Utils.showNotification(`路线切换：退还了${Utils.formatOmegaNum(refundAmount)}g黑洞质量！`, 'info');
        }
        
        Game.state.selectedPath = path;
        
        // 执行无奖励黑洞重置
        this.performPathReset();
        
        // 关闭对话框
        this.closePathDialog();
        
        const pathNames = {
            'matter': '物质路线',
            'antimatter': '反物质路线',
            'blackhole': '黑洞路线'
        };
        
        Utils.showNotification(`已选择${pathNames[path]}！执行了一次无奖励重置，现在可以专注于该路线的升级。`, 'success');
    },
    
    // 执行路线重置（无奖励的黑洞重置）
    performPathReset() {
        // 保存重要数据（但不保存升级状态）
        const saved = {
            blackholeFragments: Game.state.blackholeFragments,
            timeEnergy: Game.state.timeEnergy,
            blackholeMass: Game.state.blackholeMass,
            selectedPath: Game.state.selectedPath
        };
        
        // 重置游戏状态（类似黑洞重置但不给奖励）
        Game.collapseReset();
        
        // 恢复重要数据（不恢复升级状态）
        Game.state.blackholeFragments = saved.blackholeFragments;
        Game.state.timeEnergy = saved.timeEnergy;
        Game.state.blackholeMass = saved.blackholeMass;
        Game.state.selectedPath = saved.selectedPath;
        Game.state.blackHoleUnlocked = true;
        
        // 重置所有升级状态和成本记录
        Game.state.blackholeUpgrades = {};
        Game.state.upgradeCosts = {};
        
        // 更新UI
        this.updateUI();
    },
    
    // 关闭路线选择对话框
    closePathDialog() {
        const dialog = document.getElementById('path-selection-dialog');
        if (dialog) {
            dialog.remove();
        }
    },
    
    // 购买物质增益强化升级
    buyMatterBoost() {
        // 检查是否已选择路线
        if (!Game.state.selectedPath) {
            Utils.showNotification('请先选择一个升级路线！', 'warning');
            return;
        }
        
        // 检查路线限制
        if (Game.state.selectedPath !== 'matter') {
            Utils.showNotification('你选择的路线无法购买此升级！请选择物质路线。', 'warning');
            return;
        }
        
        const cost = new OmegaNum(100); // 100g黑洞质量
        const currentMass = Game.state.blackholeMass || new OmegaNum(0);
        
        // 检查是否已购买
        if (Game.state.blackholeUpgrades && Game.state.blackholeUpgrades.matterBoost) {
            Utils.showNotification('已经购买过此升级！', 'warning');
            return;
        }
        
        // 检查是否有足够的黑洞质量
        if (currentMass.lt(cost)) {
            Utils.showNotification(`需要至少${cost}g黑洞质量才能购买此升级！`, 'warning');
            return;
        }
        
        // 购买升级并扣除黑洞质量
        Game.state.blackholeMass = currentMass.sub(cost);
        if (!Game.state.blackholeUpgrades) {
            Game.state.blackholeUpgrades = {};
        }
        Game.state.blackholeUpgrades.matterBoost = true;
        
        // 记录消耗的质量用于路线切换时退还
        if (!Game.state.upgradeCosts) {
            Game.state.upgradeCosts = {};
        }
        Game.state.upgradeCosts.matterBoost = cost;
        
        // 购买成功，静默更新
        this.updateUI();
    },
    
    // 购买吞噬物质转化升级
    buyMatterDevour() {
        // 检查是否已选择路线
        if (!Game.state.selectedPath) {
            Utils.showNotification('请先选择一个升级路线！', 'warning');
            return;
        }
        
        // 检查路线限制
        if (Game.state.selectedPath !== 'matter') {
            Utils.showNotification('你选择的路线无法购买此升级！请选择物质路线。', 'warning');
            return;
        }
        
        const cost = new OmegaNum(1000); // 1000g黑洞质量
        const currentMass = Game.state.blackholeMass || new OmegaNum(0);
        
        // 检查是否已购买
        if (Game.state.blackholeUpgrades && Game.state.blackholeUpgrades.matterDevour) {
            Utils.showNotification('已经购买过此升级！', 'warning');
            return;
        }
        
        // 检查是否有足够的黑洞质量
        if (currentMass.lt(cost)) {
            Utils.showNotification(`需要至少${cost}g黑洞质量才能购买此升级！`, 'warning');
            return;
        }
        
        // 购买升级并扣除黑洞质量
        Game.state.blackholeMass = currentMass.sub(cost);
        if (!Game.state.blackholeUpgrades) {
            Game.state.blackholeUpgrades = {};
        }
        Game.state.blackholeUpgrades.matterDevour = true;
        
        // 记录消耗的质量用于路线切换时退还
        if (!Game.state.upgradeCosts) {
            Game.state.upgradeCosts = {};
        }
        Game.state.upgradeCosts.matterDevour = cost;
        
        // 购买成功，静默更新
        this.updateUI();
    },
    
    // 购买反物质爆炸升级
    buyAntimatterExplosion() {
        // 检查是否已选择路线
        if (!Game.state.selectedPath) {
            Utils.showNotification('请先选择一个升级路线！', 'warning');
            return;
        }
        
        // 检查路线限制
        if (Game.state.selectedPath !== 'antimatter') {
            Utils.showNotification('你选择的路线无法购买此升级！请选择反物质路线。', 'warning');
            return;
        }
        
        const cost = new OmegaNum(1000); // 1000g黑洞质量
        const currentMass = Game.state.blackholeMass || new OmegaNum(0);
        
        // 检查是否已购买
        if (Game.state.blackholeUpgrades && Game.state.blackholeUpgrades.antimatterExplosion) {
            Utils.showNotification('已经购买过此升级！', 'warning');
            return;
        }
        
        // 检查是否有足够的黑洞质量
        if (currentMass.lt(cost)) {
            Utils.showNotification(`需要至少${cost}g黑洞质量才能购买此升级！`, 'warning');
            return;
        }
        
        // 购买升级并扣除黑洞质量
        Game.state.blackholeMass = currentMass.sub(cost);
        if (!Game.state.blackholeUpgrades) {
            Game.state.blackholeUpgrades = {};
        }
        Game.state.blackholeUpgrades.antimatterExplosion = true;
        
        // 记录消耗的质量用于路线切换时退还
        if (!Game.state.upgradeCosts) {
            Game.state.upgradeCosts = {};
        }
        Game.state.upgradeCosts.antimatterExplosion = cost;
        
        // 购买成功，静默更新
        this.updateUI();
    },
    
    // 购买反物质升级2：打破质量守恒
    buyAntimatterUpgrade2() {
        // 检查是否已选择路线
        if (!Game.state.selectedPath) {
            Utils.showNotification('请先选择一个升级路线！', 'warning');
            return;
        }
        
        // 检查路线限制
        if (Game.state.selectedPath !== 'antimatter') {
            Utils.showNotification('你选择的路线无法购买此升级！请选择反物质路线。', 'warning');
            return;
        }
        
        const cost = new OmegaNum(10000); // 10000g黑洞质量
        const currentMass = Game.state.blackholeMass || new OmegaNum(0);
        
        // 检查是否已购买
        if (Game.state.blackholeUpgrades && Game.state.blackholeUpgrades.antimatterUpgrade2) {
            Utils.showNotification('已经购买过此升级！', 'warning');
            return;
        }
        
        // 检查是否有足够的黑洞质量
        if (currentMass.lt(cost)) {
            Utils.showNotification(`需要至少${Utils.formatOmegaNum(cost)}g黑洞质量才能购买此升级！`, 'warning');
            return;
        }
        
        // 购买升级并扣除黑洞质量
        Game.state.blackholeMass = currentMass.sub(cost);
        if (!Game.state.blackholeUpgrades) {
            Game.state.blackholeUpgrades = {};
        }
        Game.state.blackholeUpgrades.antimatterUpgrade2 = true;
        
        // 记录消耗的质量用于路线切换时退还
        if (!Game.state.upgradeCosts) {
            Game.state.upgradeCosts = {};
        }
        Game.state.upgradeCosts.antimatterUpgrade2 = cost;
        
        // 购买成功，静默更新
        this.updateUI();
    },
    
    // 购买黑洞膨胀升级
    buyBlackholeExpansion() {
        // 检查是否已选择路线
        if (!Game.state.selectedPath) {
            Utils.showNotification('请先选择一个升级路线！', 'warning');
            return;
        }
        
        // 检查路线限制
        if (Game.state.selectedPath !== 'blackhole') {
            Utils.showNotification('你选择的路线无法购买此升级！请选择黑洞路线。', 'warning');
            return;
        }
        
        const cost = new OmegaNum(1000); // 1000g黑洞质量
        const currentMass = Game.state.blackholeMass || new OmegaNum(0);
        
        // 检查是否已购买
        if (Game.state.blackholeUpgrades && Game.state.blackholeUpgrades.blackholeExpansion) {
            Utils.showNotification('已经购买过此升级！', 'warning');
            return;
        }
        
        // 检查是否有足够的黑洞质量
        if (currentMass.lt(cost)) {
            Utils.showNotification(`需要至少${Utils.formatOmegaNum(cost)}g黑洞质量才能购买此升级！`, 'warning');
            return;
        }
        
        // 购买升级并扣除黑洞质量
        Game.state.blackholeMass = currentMass.sub(cost);
        if (!Game.state.blackholeUpgrades) {
            Game.state.blackholeUpgrades = {};
        }
        Game.state.blackholeUpgrades.blackholeExpansion = true;
        
        // 记录消耗的质量用于路线切换时退还
        if (!Game.state.upgradeCosts) {
            Game.state.upgradeCosts = {};
        }
        Game.state.upgradeCosts.blackholeExpansion = cost;
        
        // 购买成功，静默更新
        this.updateUI();
    },
    
    // 购买黑洞升级2：时间加速
    buyBlackholeUpgrade2() {
        // 检查是否已选择路线
        if (!Game.state.selectedPath) {
            Utils.showNotification('请先选择一个升级路线！', 'warning');
            return;
        }
        
        // 检查路线限制
        if (Game.state.selectedPath !== 'blackhole') {
            Utils.showNotification('你选择的路线无法购买此升级！请选择黑洞路线。', 'warning');
            return;
        }
        
        const cost = new OmegaNum('1e13'); // 10t时间能量
        const currentTimeEnergy = Game.state.timeEnergy || new OmegaNum(0);
        
        // 检查是否已购买
        if (Game.state.blackholeUpgrades && Game.state.blackholeUpgrades.blackholeUpgrade2) {
            Utils.showNotification('已经购买过此升级！', 'warning');
            return;
        }
        
        // 检查是否有足够的时间能量
        if (currentTimeEnergy.lt(cost)) {
            Utils.showNotification(`需要至少${Utils.formatOmegaNum(cost)}时间能量才能购买此升级！`, 'warning');
            return;
        }
        
        // 购买升级并扣除时间能量
        Game.state.timeEnergy = currentTimeEnergy.sub(cost);
        if (!Game.state.blackholeUpgrades) {
            Game.state.blackholeUpgrades = {};
        }
        Game.state.blackholeUpgrades.blackholeUpgrade2 = true;
        
        // 记录消耗的时间能量用于路线切换时退还
        if (!Game.state.upgradeCosts) {
            Game.state.upgradeCosts = {};
        }
        Game.state.upgradeCosts.blackholeUpgrade2 = cost;
        
        // 购买成功，静默更新
        this.updateUI();
    },
    
    // 购买物质路径三：时间加速
    buyMatterTimeAcceleration() {
        // 检查是否已选择路线
        if (!Game.state.selectedPath) {
            Utils.showNotification('请先选择一个升级路线！', 'warning');
            return;
        }
        
        // 检查路线限制
        if (Game.state.selectedPath !== 'matter') {
            Utils.showNotification('你选择的路线无法购买此升级！请选择物质路线。', 'warning');
            return;
        }
        
        const cost = new OmegaNum(10000); // 10kg黑洞质量
        const currentMass = Game.state.blackholeMass || new OmegaNum(0);
        
        // 检查是否已购买
        if (Game.state.blackholeUpgrades && Game.state.blackholeUpgrades.matterTimeAcceleration) {
            Utils.showNotification('你已经购买过这个升级了！', 'warning');
            return;
        }
        
        // 检查黑洞质量是否足够
        if (currentMass.lt(cost)) {
            Utils.showNotification(`黑洞质量不足！需要${Utils.formatOmegaNum(cost)}g`, 'error');
            return;
        }
        
        // 扣除黑洞质量
        Game.state.blackholeMass = currentMass.sub(cost);
        
        // 购买升级
        if (!Game.state.blackholeUpgrades) {
            Game.state.blackholeUpgrades = {};
        }
        Game.state.blackholeUpgrades.matterTimeAcceleration = true;
        
        // 更新UI
        this.updateUI();
    },
    
    // 购买反物质路径三：湮灭一切
    buyAntimatterAnnihilateAll() {
        // 检查是否已选择路线
        if (!Game.state.selectedPath) {
            Utils.showNotification('请先选择一个升级路线！', 'warning');
            return;
        }
        
        // 检查路线限制
        if (Game.state.selectedPath !== 'antimatter') {
            Utils.showNotification('你选择的路线无法购买此升级！请选择反物质路线。', 'warning');
            return;
        }
        
        const cost = new OmegaNum(100000); // 100kg黑洞质量
        const currentMass = Game.state.blackholeMass || new OmegaNum(0);
        
        // 检查是否已购买
        if (Game.state.blackholeUpgrades && Game.state.blackholeUpgrades.antimatterAnnihilateAll) {
            Utils.showNotification('你已经购买过这个升级了！', 'warning');
            return;
        }
        
        // 检查黑洞质量是否足够
        if (currentMass.lt(cost)) {
            Utils.showNotification(`黑洞质量不足！需要${Utils.formatOmegaNum(cost)}g`, 'error');
            return;
        }
        
        // 扣除黑洞质量
        Game.state.blackholeMass = currentMass.sub(cost);
        
        // 购买升级
        if (!Game.state.blackholeUpgrades) {
            Game.state.blackholeUpgrades = {};
        }
        Game.state.blackholeUpgrades.antimatterAnnihilateAll = true;
        
        // 更新UI
        this.updateUI();
    },
    
    // 购买黑洞路径三：吞噬
    buyBlackholeDevour() {
        // 检查是否已选择路线
        if (!Game.state.selectedPath) {
            Utils.showNotification('请先选择一个升级路线！', 'warning');
            return;
        }
        
        // 检查路线限制
        if (Game.state.selectedPath !== 'blackhole') {
            Utils.showNotification('你选择的路线无法购买此升级！请选择黑洞路线。', 'warning');
            return;
        }
        
        const cost = new OmegaNum('100000000'); // 100t黑洞质量
        const currentMass = Game.state.blackholeMass || new OmegaNum(0);
        
        // 检查是否已购买
        if (Game.state.blackholeUpgrades && Game.state.blackholeUpgrades.blackholeDevour) {
            Utils.showNotification('你已经购买过这个升级了！', 'warning');
            return;
        }
        
        // 检查黑洞质量是否足够
        if (currentMass.lt(cost)) {
            Utils.showNotification(`黑洞质量不足！需要${Utils.formatOmegaNum(cost)}g`, 'error');
            return;
        }
        
        // 扣除黑洞质量
        Game.state.blackholeMass = currentMass.sub(cost);
        
        // 购买升级
        if (!Game.state.blackholeUpgrades) {
            Game.state.blackholeUpgrades = {};
        }
        Game.state.blackholeUpgrades.blackholeDevour = true;
        
        // 更新UI
        this.updateUI();
    },
    
    // 获取物质增益倍率
    getMatterBoostMultiplier() {
        if (!Game.state.blackholeUpgrades || !Game.state.blackholeUpgrades.matterBoost) {
            return new OmegaNum(1);
        }
        
        // 确保matter和antimatter是OmegaNum对象
        let matter = Game.state.currentMatter || new OmegaNum(0);
        let antimatter = Game.state.currentAntimatter || new OmegaNum(0);
        
        if (!(matter instanceof OmegaNum)) {
            matter = new OmegaNum(matter);
        }
        if (!(antimatter instanceof OmegaNum)) {
            antimatter = new OmegaNum(antimatter);
        }
        
        // 计算 log(物质) × log(反物质)，但确保最小值为1
        const matterLog = matter.gt(10) ? matter.log10() : new OmegaNum(1);
        const antimatterLog = antimatter.gt(10) ? antimatter.log10() : new OmegaNum(1);
        
        const result = matterLog.mul(antimatterLog);
        return result.max(new OmegaNum(1)); // 确保增益至少为1
    },
    
    // 获取吞噬物质转化增益倍率
    getMatterDevourMultiplier() {
        if (!Game.state.blackholeUpgrades || !Game.state.blackholeUpgrades.matterDevour) {
            return new OmegaNum(1);
        }
        
        // 确保blackholeMass是OmegaNum对象
        let blackholeMass = Game.state.blackholeMass || new OmegaNum(0);
        
        if (!(blackholeMass instanceof OmegaNum)) {
            blackholeMass = new OmegaNum(blackholeMass);
        }
        
        // 计算 log(黑洞质量+1) * 2 + (黑洞质量^0.3) / 100，确保最小值为1
        const logComponent = blackholeMass.add(1).log10().mul(2);
        const powerComponent = blackholeMass.pow(0.3).div(100);
        
        const result = logComponent.add(powerComponent).add(1);
        return result.max(new OmegaNum(1)); // 确保增益至少为1
    },
    
    // 获取反物质增益倍率
     getAntimatterBoostMultiplier() {
         if (!Game.state.blackholeUpgrades || !Game.state.blackholeUpgrades.antimatterExplosion) {
             return new OmegaNum(1);
         }
         
         // 反物质获取×10000
         return new OmegaNum(10000);
     },
     
     // 获取黑洞膨胀增益倍率
     getBlackholeExpansionMultiplier() {
         if (!Game.state.blackholeUpgrades || !Game.state.blackholeUpgrades.blackholeExpansion) {
             return new OmegaNum(1);
         }
         
         // 确保物质和反物质是OmegaNum对象
         let matter = Game.state.currentMatter || new OmegaNum(0);
         let antimatter = Game.state.currentAntimatter || new OmegaNum(0);
         
         if (!(matter instanceof OmegaNum)) {
             matter = new OmegaNum(matter);
         }
         if (!(antimatter instanceof OmegaNum)) {
             antimatter = new OmegaNum(antimatter);
         }
         
         // 计算 log10(物质 + 反物质 + 1) * 2 + 10，确保最小值为10
         const totalMatter = matter.add(antimatter);
         const logComponent = totalMatter.add(1).log10().mul(2);
         const result = logComponent.add(10);
         return result.max(new OmegaNum(10)); // 确保增益至少为10
     },
     
     // 获取黑洞升级2：时间加速增益倍率
     getBlackholeUpgrade2Multiplier() {
         if (!Game.state.blackholeUpgrades || !Game.state.blackholeUpgrades.blackholeUpgrade2) {
             return new OmegaNum(1);
         }
         
         // 确保物质是OmegaNum对象
         let matter = Game.state.currentMatter || new OmegaNum(0);
         
         if (!(matter instanceof OmegaNum)) {
             matter = new OmegaNum(matter);
         }
         
         // 计算 log10(物质+1) * 0.1 + 1，物质略微增幅时间能量获取
         const logComponent = matter.add(1).log10().mul(0.1);
         const result = logComponent.add(1);
         return result.max(new OmegaNum(1)); // 确保增益至少为1
     },
     
     // 获取物质路径三：时间加速增益倍率
     getMatterTimeAccelerationMultiplier() {
         if (!Game.state.blackholeUpgrades || !Game.state.blackholeUpgrades.matterTimeAcceleration) {
             return new OmegaNum(1);
         }
         
         // 物质获取^1.1的效果
         return new OmegaNum(1.1);
     },
     
     // 获取反物质路径三：湮灭一切增益倍率
     getAntimatterAnnihilateAllMultiplier() {
         if (!Game.state.blackholeUpgrades || !Game.state.blackholeUpgrades.antimatterAnnihilateAll) {
             return new OmegaNum(1);
         }
         
         // 增幅湮灭能量增益公式：基于当前湮灭能量的增益
         let annihilationEnergy = Game.state.annihilationEnergy || new OmegaNum(0);
         if (!(annihilationEnergy instanceof OmegaNum)) {
             annihilationEnergy = new OmegaNum(annihilationEnergy);
         }
         
         // 增益公式：log10(湮灭能量 + 1)^1.2 + 1
         const logEnergy = annihilationEnergy.add(1).log10();
         return logEnergy.pow(1.2).add(1);
     },
     
     // 获取黑洞路径三：吞噬增益倍率
     getBlackholeDevourMultiplier() {
         if (!Game.state.blackholeUpgrades || !Game.state.blackholeUpgrades.blackholeDevour) {
             return new OmegaNum(1);
         }
         
         // 增幅黑洞质量和碎片获得公式：基于当前黑洞质量的增益
         let blackholeMass = Game.state.blackholeMass || new OmegaNum(0);
         if (!(blackholeMass instanceof OmegaNum)) {
             blackholeMass = new OmegaNum(blackholeMass);
         }
         
         // 增益公式：log10(黑洞质量 + 1)^1.3 + 1
         const logMass = blackholeMass.add(1).log10();
         return logMass.pow(1.3).add(1);
     },
    
    // 更新升级UI
    updateUI() {
        // 更新路线选择按钮文本
        const choosePathBtn = document.getElementById('choose-path-btn');
        if (choosePathBtn) {
            const pathNames = {
                'matter': '物质路线',
                'antimatter': '反物质路线',
                'blackhole': '黑洞路线'
            };
            
            if (Game.state.selectedPath) {
                choosePathBtn.textContent = `当前路线: ${pathNames[Game.state.selectedPath]}`;
                choosePathBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
            } else {
                choosePathBtn.textContent = '选择路线';
                choosePathBtn.style.background = 'linear-gradient(135deg, #8a2be2, #6a1b9a)';
            }
        }
        
        // 更新物质增益升级UI
        const matterBoostElement = document.getElementById('matter-boost-upgrade');
        const matterBoostStatus = document.getElementById('matter-boost-status');
        const matterBoostCurrent = document.getElementById('matter-boost-current');
        
        if (matterBoostElement && matterBoostStatus && matterBoostCurrent) {
            // 更新当前增益显示
            const matterMultiplier = this.getMatterBoostMultiplier();
            matterBoostCurrent.textContent = `当前增益: ×${Utils.formatOmegaNum(matterMultiplier)}`;
            
            // 检查路线限制
            const isLocked = Game.state.selectedPath && Game.state.selectedPath !== 'matter';
            
            if (Game.state.blackholeUpgrades && Game.state.blackholeUpgrades.matterBoost) {
                matterBoostElement.style.background = 'linear-gradient(135deg, #2a2a2a, #3a3a3a)';
                matterBoostElement.style.border = '2px solid #666';
                matterBoostElement.style.cursor = 'default';
                matterBoostStatus.textContent = '已购买';
                matterBoostStatus.style.color = '#4CAF50';
            } else if (isLocked) {
                matterBoostElement.style.background = 'linear-gradient(135deg, #1a1a1a, #2a2a2a)';
                matterBoostElement.style.border = '2px solid #444';
                matterBoostElement.style.cursor = 'not-allowed';
                matterBoostElement.style.opacity = '0.5';
                matterBoostStatus.textContent = '路线锁定';
                matterBoostStatus.style.color = '#888';
            } else {
                matterBoostElement.style.opacity = '1';
                matterBoostElement.style.cursor = 'pointer';
                matterBoostStatus.textContent = '未购买';
                matterBoostStatus.style.color = '#ff6b6b';
            }
        }
        
        // 更新吞噬物质转化升级UI
        const matterDevourElement = document.getElementById('matter-devour-upgrade');
        const matterDevourStatus = document.getElementById('matter-devour-status');
        const matterDevourCurrent = document.getElementById('matter-devour-current');
        
        if (matterDevourElement && matterDevourStatus && matterDevourCurrent) {
            // 更新当前增益显示
            const matterDevourMultiplier = this.getMatterDevourMultiplier();
            matterDevourCurrent.textContent = `当前增益: ×${Utils.formatOmegaNum(matterDevourMultiplier)}`;
            
            // 检查路线限制
            const isDevourLocked = Game.state.selectedPath && Game.state.selectedPath !== 'matter';
            
            if (Game.state.blackholeUpgrades && Game.state.blackholeUpgrades.matterDevour) {
                matterDevourElement.style.background = 'linear-gradient(135deg, #2a2a2a, #3a3a3a)';
                matterDevourElement.style.border = '2px solid #666';
                matterDevourElement.style.cursor = 'default';
                matterDevourStatus.textContent = '已购买';
                matterDevourStatus.style.color = '#4CAF50';
            } else if (isDevourLocked) {
                matterDevourElement.style.background = 'linear-gradient(135deg, #1a1a1a, #2a2a2a)';
                matterDevourElement.style.border = '2px solid #444';
                matterDevourElement.style.cursor = 'not-allowed';
                matterDevourElement.style.opacity = '0.5';
                matterDevourStatus.textContent = '路线锁定';
                matterDevourStatus.style.color = '#888';
            } else {
                matterDevourElement.style.opacity = '1';
                matterDevourElement.style.cursor = 'pointer';
                matterDevourStatus.textContent = '未购买';
                matterDevourStatus.style.color = '#ff6b6b';
            }
        }
        
        // 更新反物质爆炸升级UI
        const antimatterExplosionElement = document.getElementById('antimatter-explosion-upgrade');
        const antimatterExplosionStatus = document.getElementById('antimatter-explosion-status');
        const antimatterExplosionCurrent = document.getElementById('antimatter-explosion-current');
        
        if (antimatterExplosionElement && antimatterExplosionStatus && antimatterExplosionCurrent) {
            // 更新当前增益显示
            const antimatterMultiplier = this.getAntimatterBoostMultiplier();
            antimatterExplosionCurrent.textContent = `当前增益: ×${Utils.formatOmegaNum(antimatterMultiplier)}`;
            
            // 检查路线限制
            const isAntimatterLocked = Game.state.selectedPath && Game.state.selectedPath !== 'antimatter';
            
            if (Game.state.blackholeUpgrades && Game.state.blackholeUpgrades.antimatterExplosion) {
                antimatterExplosionElement.style.background = 'linear-gradient(135deg, #2a2a2a, #3a3a3a)';
                antimatterExplosionElement.style.border = '2px solid #666';
                antimatterExplosionElement.style.cursor = 'default';
                antimatterExplosionStatus.textContent = '已购买';
                antimatterExplosionStatus.style.color = '#4CAF50';
            } else if (isAntimatterLocked) {
                antimatterExplosionElement.style.background = 'linear-gradient(135deg, #1a1a1a, #2a2a2a)';
                antimatterExplosionElement.style.border = '2px solid #444';
                antimatterExplosionElement.style.cursor = 'not-allowed';
                antimatterExplosionElement.style.opacity = '0.5';
                antimatterExplosionStatus.textContent = '路线锁定';
                antimatterExplosionStatus.style.color = '#888';
            } else {
                antimatterExplosionElement.style.opacity = '1';
                antimatterExplosionElement.style.cursor = 'pointer';
                antimatterExplosionStatus.textContent = '未购买';
                antimatterExplosionStatus.style.color = '#ff6b6b';
            }
        }
        
        // 更新黑洞膨胀升级UI
        const blackholeExpansionElement = document.getElementById('blackhole-expansion-upgrade');
        const blackholeExpansionStatus = document.getElementById('blackhole-expansion-status');
        const blackholeExpansionCurrent = document.getElementById('blackhole-expansion-current');
        
        if (blackholeExpansionElement && blackholeExpansionStatus && blackholeExpansionCurrent) {
            // 更新当前增益显示
            const blackholeMultiplier = this.getBlackholeExpansionMultiplier();
            blackholeExpansionCurrent.textContent = `投喂增益: ×${Utils.formatOmegaNum(blackholeMultiplier)}`;
            
            // 检查路线限制
            const isBlackholeLocked = Game.state.selectedPath && Game.state.selectedPath !== 'blackhole';
            
            if (Game.state.blackholeUpgrades && Game.state.blackholeUpgrades.blackholeExpansion) {
                blackholeExpansionElement.style.background = 'linear-gradient(135deg, #2a2a2a, #3a3a3a)';
                blackholeExpansionElement.style.border = '2px solid #666';
                blackholeExpansionElement.style.cursor = 'default';
                blackholeExpansionStatus.textContent = '已购买';
                blackholeExpansionStatus.style.color = '#4CAF50';
            } else if (isBlackholeLocked) {
                blackholeExpansionElement.style.background = 'linear-gradient(135deg, #1a1a1a, #2a2a2a)';
                blackholeExpansionElement.style.border = '2px solid #444';
                blackholeExpansionElement.style.cursor = 'not-allowed';
                blackholeExpansionElement.style.opacity = '0.5';
                blackholeExpansionStatus.textContent = '路线锁定';
                blackholeExpansionStatus.style.color = '#888';
            } else {
                blackholeExpansionElement.style.opacity = '1';
                blackholeExpansionElement.style.cursor = 'pointer';
                blackholeExpansionStatus.textContent = '未购买';
                blackholeExpansionStatus.style.color = '#ff6b6b';
            }
        }
        
        // 更新反物质升级2UI
        const antimatterUpgrade2Element = document.getElementById('antimatter-upgrade2');
        const antimatterUpgrade2Status = document.getElementById('antimatter-upgrade2-status');
        const antimatterUpgrade2Current = document.getElementById('antimatter-upgrade2-current');
        
        if (antimatterUpgrade2Element && antimatterUpgrade2Status && antimatterUpgrade2Current) {
            // 检查路线限制
            const isAntimatter2Locked = Game.state.selectedPath && Game.state.selectedPath !== 'antimatter';
            
            if (Game.state.blackholeUpgrades && Game.state.blackholeUpgrades.antimatterUpgrade2) {
                antimatterUpgrade2Element.style.background = 'linear-gradient(135deg, #2a2a2a, #3a3a3a)';
                antimatterUpgrade2Element.style.border = '2px solid #666';
                antimatterUpgrade2Element.style.cursor = 'default';
                antimatterUpgrade2Status.textContent = '已购买';
                antimatterUpgrade2Status.style.color = '#4CAF50';
            } else if (isAntimatter2Locked) {
                antimatterUpgrade2Element.style.background = 'linear-gradient(135deg, #1a1a1a, #2a2a2a)';
                antimatterUpgrade2Element.style.border = '2px solid #444';
                antimatterUpgrade2Element.style.cursor = 'not-allowed';
                antimatterUpgrade2Element.style.opacity = '0.5';
                antimatterUpgrade2Status.textContent = '路线锁定';
                antimatterUpgrade2Status.style.color = '#888';
            } else {
                antimatterUpgrade2Element.style.opacity = '1';
                antimatterUpgrade2Element.style.cursor = 'pointer';
                antimatterUpgrade2Status.textContent = '未购买';
                antimatterUpgrade2Status.style.color = '#ff6b6b';
            }
        }
        
        // 更新黑洞升级2UI
        const blackholeUpgrade2Element = document.getElementById('blackhole-upgrade2');
        const blackholeUpgrade2Status = document.getElementById('blackhole-upgrade2-status');
        const blackholeUpgrade2Current = document.getElementById('blackhole-upgrade2-current');
        
        if (blackholeUpgrade2Element && blackholeUpgrade2Status && blackholeUpgrade2Current) {
            // 更新当前增益显示
            const blackhole2Multiplier = this.getBlackholeUpgrade2Multiplier();
            blackholeUpgrade2Current.textContent = `当前增益: ×${Utils.formatOmegaNum(blackhole2Multiplier)}`;
            
            // 检查路线限制
            const isBlackhole2Locked = Game.state.selectedPath && Game.state.selectedPath !== 'blackhole';
            
            if (Game.state.blackholeUpgrades && Game.state.blackholeUpgrades.blackholeUpgrade2) {
                blackholeUpgrade2Element.style.background = 'linear-gradient(135deg, #2a2a2a, #3a3a3a)';
                blackholeUpgrade2Element.style.border = '2px solid #666';
                blackholeUpgrade2Element.style.cursor = 'default';
                blackholeUpgrade2Status.textContent = '已购买';
                blackholeUpgrade2Status.style.color = '#4CAF50';
            } else if (isBlackhole2Locked) {
                blackholeUpgrade2Element.style.background = 'linear-gradient(135deg, #1a1a1a, #2a2a2a)';
                blackholeUpgrade2Element.style.border = '2px solid #444';
                blackholeUpgrade2Element.style.cursor = 'not-allowed';
                blackholeUpgrade2Element.style.opacity = '0.5';
                blackholeUpgrade2Status.textContent = '路线锁定';
                blackholeUpgrade2Status.style.color = '#888';
            } else {
                blackholeUpgrade2Element.style.opacity = '1';
                blackholeUpgrade2Element.style.cursor = 'pointer';
                blackholeUpgrade2Status.textContent = '未购买';
                blackholeUpgrade2Status.style.color = '#ff6b6b';
            }
        }
        
        // 更新物质路径三：时间加速UI
        const matterTimeAccelerationElement = document.getElementById('matter-time-acceleration');
        const matterTimeAccelerationStatus = document.getElementById('matter-time-acceleration-status');
        const matterTimeAccelerationCurrent = document.getElementById('matter-time-acceleration-current');
        
        if (matterTimeAccelerationElement && matterTimeAccelerationStatus && matterTimeAccelerationCurrent) {
            // 更新当前增益显示
            const matterTimeMultiplier = this.getMatterTimeAccelerationMultiplier();
            matterTimeAccelerationCurrent.textContent = `当前增益: ^${Utils.formatOmegaNum(matterTimeMultiplier)}`;
            
            // 检查路线限制
            const isMatterTime3Locked = Game.state.selectedPath && Game.state.selectedPath !== 'matter';
            
            if (Game.state.blackholeUpgrades && Game.state.blackholeUpgrades.matterTimeAcceleration) {
                matterTimeAccelerationElement.style.background = 'linear-gradient(135deg, #2a2a2a, #3a3a3a)';
                matterTimeAccelerationElement.style.border = '2px solid #666';
                matterTimeAccelerationElement.style.cursor = 'default';
                matterTimeAccelerationStatus.textContent = '已购买';
                matterTimeAccelerationStatus.style.color = '#4CAF50';
            } else if (isMatterTime3Locked) {
                matterTimeAccelerationElement.style.background = 'linear-gradient(135deg, #1a1a1a, #2a2a2a)';
                matterTimeAccelerationElement.style.border = '2px solid #444';
                matterTimeAccelerationElement.style.cursor = 'not-allowed';
                matterTimeAccelerationElement.style.opacity = '0.5';
                matterTimeAccelerationStatus.textContent = '路线锁定';
                matterTimeAccelerationStatus.style.color = '#888';
            } else {
                matterTimeAccelerationElement.style.opacity = '1';
                matterTimeAccelerationElement.style.cursor = 'pointer';
                matterTimeAccelerationStatus.textContent = '未购买';
                matterTimeAccelerationStatus.style.color = '#ff6b6b';
            }
        }
        
        // 更新反物质路径三：湮灭一切UI
        const antimatterAnnihilateAllElement = document.getElementById('antimatter-annihilate-all');
        const antimatterAnnihilateAllStatus = document.getElementById('antimatter-annihilate-all-status');
        const antimatterAnnihilateAllCurrent = document.getElementById('antimatter-annihilate-all-current');
        
        if (antimatterAnnihilateAllElement && antimatterAnnihilateAllStatus && antimatterAnnihilateAllCurrent) {
            // 更新当前增益显示
            const antimatterAnnihilateMultiplier = this.getAntimatterAnnihilateAllMultiplier();
            antimatterAnnihilateAllCurrent.textContent = `当前增益: ×${Utils.formatOmegaNum(antimatterAnnihilateMultiplier)}`;
            
            // 检查路线限制
            const isAntimatter3Locked = Game.state.selectedPath && Game.state.selectedPath !== 'antimatter';
            
            if (Game.state.blackholeUpgrades && Game.state.blackholeUpgrades.antimatterAnnihilateAll) {
                antimatterAnnihilateAllElement.style.background = 'linear-gradient(135deg, #2a2a2a, #3a3a3a)';
                antimatterAnnihilateAllElement.style.border = '2px solid #666';
                antimatterAnnihilateAllElement.style.cursor = 'default';
                antimatterAnnihilateAllStatus.textContent = '已购买';
                antimatterAnnihilateAllStatus.style.color = '#4CAF50';
            } else if (isAntimatter3Locked) {
                antimatterAnnihilateAllElement.style.background = 'linear-gradient(135deg, #1a1a1a, #2a2a2a)';
                antimatterAnnihilateAllElement.style.border = '2px solid #444';
                antimatterAnnihilateAllElement.style.cursor = 'not-allowed';
                antimatterAnnihilateAllElement.style.opacity = '0.5';
                antimatterAnnihilateAllStatus.textContent = '路线锁定';
                antimatterAnnihilateAllStatus.style.color = '#888';
            } else {
                antimatterAnnihilateAllElement.style.opacity = '1';
                antimatterAnnihilateAllElement.style.cursor = 'pointer';
                antimatterAnnihilateAllStatus.textContent = '未购买';
                antimatterAnnihilateAllStatus.style.color = '#ff6b6b';
            }
        }
        
        // 更新黑洞路径三：吞噬UI
        const blackholeDevourElement = document.getElementById('blackhole-devour');
        const blackholeDevourStatus = document.getElementById('blackhole-devour-status');
        const blackholeDevourCurrent = document.getElementById('blackhole-devour-current');
        
        if (blackholeDevourElement && blackholeDevourStatus && blackholeDevourCurrent) {
            // 更新当前增益显示
            const blackholeDevourMultiplier = this.getBlackholeDevourMultiplier();
            blackholeDevourCurrent.textContent = `当前增益: ×${Utils.formatOmegaNum(blackholeDevourMultiplier)}`;
            
            // 检查路线限制
            const isBlackhole3Locked = Game.state.selectedPath && Game.state.selectedPath !== 'blackhole';
            
            if (Game.state.blackholeUpgrades && Game.state.blackholeUpgrades.blackholeDevour) {
                blackholeDevourElement.style.background = 'linear-gradient(135deg, #2a2a2a, #3a3a3a)';
                blackholeDevourElement.style.border = '2px solid #666';
                blackholeDevourElement.style.cursor = 'default';
                blackholeDevourStatus.textContent = '已购买';
                blackholeDevourStatus.style.color = '#4CAF50';
            } else if (isBlackhole3Locked) {
                blackholeDevourElement.style.background = 'linear-gradient(135deg, #1a1a1a, #2a2a2a)';
                blackholeDevourElement.style.border = '2px solid #444';
                blackholeDevourElement.style.cursor = 'not-allowed';
                blackholeDevourElement.style.opacity = '0.5';
                blackholeDevourStatus.textContent = '路线锁定';
                blackholeDevourStatus.style.color = '#888';
            } else {
                blackholeDevourElement.style.opacity = '1';
                blackholeDevourElement.style.cursor = 'pointer';
                blackholeDevourStatus.textContent = '未购买';
                blackholeDevourStatus.style.color = '#ff6b6b';
            }
        }
    }
};

// 导出到全局
window.BlackholeSystem = BlackholeSystem;
window.BlackholeUpgrades = BlackholeUpgrades;

// 初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        BlackholeSystem.init();
        BlackholeUpgrades.init();
    });
} else {
    BlackholeSystem.init();
    BlackholeUpgrades.init();
}